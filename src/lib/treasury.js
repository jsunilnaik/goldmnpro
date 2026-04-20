import connectDB from '@/lib/mongodb';
import Treasury from '@/models/Treasury';
import AdminConfig from '@/models/AdminConfig';

/**
 * Treasury Service — Atomic Fund Pool Operations
 * 
 * Every financial event in the platform MUST go through this service.
 * All operations use MongoDB atomic $inc to prevent race conditions
 * at scale (1M+ concurrent users).
 */

// ─── Helper: Get today's date string ─────────────
function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ═════════════════════════════════════════════════
//  RECORD INFLOW — Called on subscription activation
// ═════════════════════════════════════════════════
export async function recordInflow(amount, planName = 'other') {
  await connectDB();

  const tier = (planName || 'other').toLowerCase();
  const breakdownKey = ['bronze', 'silver', 'gold', 'diamond'].includes(tier)
    ? `inflowBreakdown.${tier}`
    : 'inflowBreakdown.other';

  const result = await Treasury.findOneAndUpdate(
    { key: 'main' },
    {
      $inc: {
        totalInflow: amount,
        [breakdownKey]: amount,
        totalSubscriptions: 1,
      },
      $set: {
        lastInflowAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  return result;
}

// ═════════════════════════════════════════════════
//  RESERVE FUNDS — Called when withdrawal is requested
//  Money is earmarked but not yet paid out
// ═════════════════════════════════════════════════
export async function reserveFunds(amount) {
  await connectDB();

  const result = await Treasury.findOneAndUpdate(
    { key: 'main' },
    {
      $inc: { reservedFunds: amount },
    },
    { upsert: true, new: true }
  );

  return result;
}

// ═════════════════════════════════════════════════
//  RELEASE RESERVED — Called when withdrawal is rejected
//  Unreserve the funds back into available pool
// ═════════════════════════════════════════════════
export async function releaseFunds(amount) {
  await connectDB();

  const result = await Treasury.findOneAndUpdate(
    { key: 'main' },
    {
      $inc: { reservedFunds: -amount },
    },
    { upsert: true, new: true }
  );

  return result;
}

// ═════════════════════════════════════════════════
//  RECORD OUTFLOW — Called when withdrawal is completed
//  Actually moves money out of the pool
// ═════════════════════════════════════════════════
export async function recordOutflow(amount, type = 'withdrawals', tdsAmount = 0, feeAmount = 0) {
  await connectDB();
  const today = getTodayStr();

  const outflowKey = ['withdrawals', 'referralBonuses', 'refunds'].includes(type)
    ? `outflowBreakdown.${type}`
    : 'outflowBreakdown.withdrawals';

  // Reset daily counter if new day
  const treasury = await Treasury.findOne({ key: 'main' });
  const resetDaily = treasury && treasury.todayDate !== today;

  const update = {
    $inc: {
      totalOutflow: amount,
      [outflowKey]: amount,
      reservedFunds: -amount, // Move from reserved to outflow
      totalTdsRetained: tdsAmount,
      totalFeesRetained: feeAmount,
      todayOutflow: resetDaily ? amount : amount,
      todayWithdrawalCount: 1,
    },
    $set: {
      lastOutflowAt: new Date(),
      todayDate: today,
    },
  };

  // If new day, reset daily counters first
  if (resetDaily) {
    await Treasury.findOneAndUpdate(
      { key: 'main' },
      { $set: { todayOutflow: 0, todayWithdrawalCount: 0, todayDate: today } }
    );
  }

  const result = await Treasury.findOneAndUpdate(
    { key: 'main' },
    update,
    { upsert: true, new: true }
  );

  // Auto-pause check after every outflow
  await checkAndUpdatePoolHealth();

  return result;
}

// ═════════════════════════════════════════════════
//  RECORD REFERRAL BONUS OUTFLOW
// ═════════════════════════════════════════════════
export async function recordReferralOutflow(amount) {
  await connectDB();

  const result = await Treasury.findOneAndUpdate(
    { key: 'main' },
    {
      $inc: {
        totalOutflow: amount,
        'outflowBreakdown.referralBonuses': amount,
      },
      $set: { lastOutflowAt: new Date() },
    },
    { upsert: true, new: true }
  );

  return result;
}

// ═════════════════════════════════════════════════
//  GET POOL HEALTH — Returns snapshot + status
// ═════════════════════════════════════════════════
export async function getPoolHealth() {
  await connectDB();
  const snapshot = await Treasury.getSnapshot();

  if (!snapshot) {
    return {
      totalInflow: 0,
      totalOutflow: 0,
      reservedFunds: 0,
      availablePool: 0,
      healthPercent: 100,
      poolStatus: 'healthy',
      isWithdrawalPaused: false,
      todayOutflow: 0,
      dailyCapReached: false,
    };
  }

  // Get daily cap config
  const dailyCap = await AdminConfig.getConfig('daily_payout_cap', 5000000); // Default ₹50L
  const today = getTodayStr();
  const todayOutflow = snapshot.todayDate === today ? snapshot.todayOutflow : 0;

  return {
    ...snapshot,
    dailyCap,
    todayOutflow,
    dailyCapReached: todayOutflow >= dailyCap,
    dailyCapPercent: dailyCap > 0 ? Math.round((todayOutflow / dailyCap) * 100) : 0,
  };
}

// ═════════════════════════════════════════════════
//  CAN PROCESS WITHDRAWAL — Pre-flight check
//  Returns { allowed: boolean, reason: string }
// ═════════════════════════════════════════════════
export async function canProcessWithdrawal(amount) {
  await connectDB();
  const treasury = await Treasury.getInstance();
  const configs = await AdminConfig.getAllConfigs();

  const today = getTodayStr();

  // 1. Check if withdrawals are paused
  if (treasury.isWithdrawalPaused) {
    return {
      allowed: false,
      reason: treasury.pauseReason || 'Withdrawals are temporarily paused by the system.',
      code: 'PAUSED',
    };
  }

  // 2. Check pool health
  const available = treasury.totalInflow - treasury.totalOutflow - treasury.reservedFunds;
  const health = treasury.totalInflow > 0
    ? (available / treasury.totalInflow) * 100
    : 100;

  const reserveRatio = parseFloat(configs.treasury_reserve_ratio || '20');

  if (health < reserveRatio) {
    return {
      allowed: false,
      reason: 'Withdrawals temporarily paused due to high demand. Please try again later.',
      code: 'LOW_POOL',
    };
  }

  // 3. Check if amount exceeds available pool
  if (amount > available) {
    return {
      allowed: false,
      reason: 'Withdrawal amount exceeds available funds. Please try a smaller amount.',
      code: 'INSUFFICIENT_POOL',
    };
  }

  // 4. Check daily payout cap
  const dailyCap = parseFloat(configs.daily_payout_cap || '5000000');
  const todayOutflow = treasury.todayDate === today ? treasury.todayOutflow : 0;

  if (todayOutflow + amount > dailyCap) {
    return {
      allowed: false,
      reason: 'Daily payout limit reached. Please try again tomorrow.',
      code: 'DAILY_CAP',
    };
  }

  // 5. Throttle if pool health is between 20-40%
  const maxSmallWithdrawal = parseFloat(configs.throttled_max_withdrawal || '10000');
  if (health < 40 && amount > maxSmallWithdrawal) {
    return {
      allowed: false,
      reason: `Due to high demand, withdrawals are limited to ₹${maxSmallWithdrawal.toLocaleString('en-IN')} right now.`,
      code: 'THROTTLED',
    };
  }

  return { allowed: true, reason: '', code: 'OK' };
}

// ═════════════════════════════════════════════════
//  CHECK COOLDOWNS — Per-user withdrawal timing
// ═════════════════════════════════════════════════
export async function checkUserCooldown(userId, Subscription, Withdrawal, User) {
  await connectDB();
  const configs = await AdminConfig.getAllConfigs();

  const now = new Date();

  // 0. Administrative Lock
  if (User) {
    const user = await User.findById(userId).lean();
    if (user && user.withdrawalLockUntil && new Date(user.withdrawalLockUntil) > now) {
      return {
        allowed: false,
        reason: `Your withdrawals are restricted by admin until ${new Date(user.withdrawalLockUntil).toLocaleDateString('en-IN')}.`,
        code: 'ADMIN_LOCK',
      };
    }
  }
  const newSubCooldownDays = parseInt(configs.new_subscriber_cooldown_days || '15');
  const latestSub = await Subscription.findOne({
    user: userId,
    status: 'active',
  }).sort({ startDate: -1 }).lean();

  if (latestSub && latestSub.startDate) {
    const daysSinceSub = Math.floor((now - new Date(latestSub.startDate)) / (1000 * 60 * 60 * 24));
    if (daysSinceSub < newSubCooldownDays) {
      return {
        allowed: false,
        reason: `Withdrawals are available ${newSubCooldownDays - daysSinceSub} days after plan activation.`,
        code: 'NEW_SUB_COOLDOWN',
      };
    }
  }

  // 2. Post-withdrawal cooldown
  const postWithdrawCooldownDays = parseInt(configs.withdrawal_cooldown_days || '7');
  const lastWithdrawal = await Withdrawal.findOne({
    user: userId,
    status: { $in: ['completed', 'approved', 'processing'] },
  }).sort({ createdAt: -1 }).lean();

  if (lastWithdrawal) {
    const daysSinceLastWithdrawal = Math.floor((now - new Date(lastWithdrawal.createdAt)) / (1000 * 60 * 60 * 24));
    if (daysSinceLastWithdrawal < postWithdrawCooldownDays) {
      return {
        allowed: false,
        reason: `You can request another withdrawal in ${postWithdrawCooldownDays - daysSinceLastWithdrawal} days.`,
        code: 'POST_WITHDRAW_COOLDOWN',
      };
    }
  }

  return { allowed: true, reason: '', code: 'OK' };
}

// ═════════════════════════════════════════════════
//  VELOCITY CHECK — Lifetime withdrawal cap
// ═════════════════════════════════════════════════
export async function checkVelocity(userId, requestedAmount, Wallet) {
  await connectDB();
  const configs = await AdminConfig.getAllConfigs();

  const maxPercent = parseFloat(configs.max_withdrawal_percent_of_earnings || '80');

  const wallet = await Wallet.findOne({ user: userId }).lean();
  if (!wallet) return { allowed: true, reason: '', code: 'OK' };

  const lifetimeEarnings = wallet.totalCashEarned || 0;
  const lifetimeWithdrawn = wallet.totalWithdrawn || 0;

  if (lifetimeEarnings > 0) {
    const afterWithdrawal = lifetimeWithdrawn + requestedAmount;
    const percentUsed = (afterWithdrawal / lifetimeEarnings) * 100;

    if (percentUsed > maxPercent) {
      const maxAllowed = Math.floor(lifetimeEarnings * (maxPercent / 100)) - lifetimeWithdrawn;
      return {
        allowed: false,
        reason: `You can withdraw up to ₹${Math.max(0, maxAllowed).toLocaleString('en-IN')} based on your total earnings.`,
        code: 'VELOCITY_LIMIT',
      };
    }
  }

  return { allowed: true, reason: '', code: 'OK' };
}

// ═════════════════════════════════════════════════
//  AUTO-HEALTH CHECK — Updates pause status
// ═════════════════════════════════════════════════
async function checkAndUpdatePoolHealth() {
  const treasury = await Treasury.findOne({ key: 'main' });
  if (!treasury) return;

  const available = treasury.totalInflow - treasury.totalOutflow - treasury.reservedFunds;
  const health = treasury.totalInflow > 0
    ? (available / treasury.totalInflow) * 100
    : 100;

  const configs = await AdminConfig.getAllConfigs();
  const reserveRatio = parseFloat(configs.treasury_reserve_ratio || '20');

  const update = {
    lastHealthCheck: new Date(),
    lastHealthPercent: Math.round(health * 100) / 100,
  };

  // Auto-pause if below reserve ratio
  if (health < reserveRatio && !treasury.isWithdrawalPaused) {
    update.isWithdrawalPaused = true;
    update.pauseReason = `Auto-paused: Pool health dropped to ${health.toFixed(1)}% (below ${reserveRatio}% threshold)`;
    update.pausedAt = new Date();
    update.pausedBy = 'system';
    console.warn(`[TREASURY] ⚠️ AUTO-PAUSE: Pool health ${health.toFixed(1)}%`);
  }

  // Auto-resume if back above threshold + 10% buffer
  if (health >= (reserveRatio + 10) && treasury.isWithdrawalPaused && treasury.pausedBy === 'system') {
    update.isWithdrawalPaused = false;
    update.pauseReason = '';
    update.pausedBy = '';
    console.log(`[TREASURY] ✅ AUTO-RESUME: Pool health recovered to ${health.toFixed(1)}%`);
  }

  await Treasury.findOneAndUpdate({ key: 'main' }, { $set: update });
}

// ═════════════════════════════════════════════════
//  ADMIN: MANUAL PAUSE/RESUME
// ═════════════════════════════════════════════════
export async function pauseWithdrawals(adminEmail, reason = 'Manually paused by admin') {
  await connectDB();
  return Treasury.findOneAndUpdate(
    { key: 'main' },
    {
      $set: {
        isWithdrawalPaused: true,
        pauseReason: reason,
        pausedAt: new Date(),
        pausedBy: adminEmail,
      },
    },
    { upsert: true, new: true }
  );
}

export async function resumeWithdrawals() {
  await connectDB();
  return Treasury.findOneAndUpdate(
    { key: 'main' },
    {
      $set: {
        isWithdrawalPaused: false,
        pauseReason: '',
        pausedBy: '',
      },
    },
    { upsert: true, new: true }
  );
}
