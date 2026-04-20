import connectDB from './mongodb';
import Withdrawal from '@/models/Withdrawal';
import AdminConfig from '@/models/AdminConfig';

/**
 * Auto-approves system-generated (seeded) withdrawals if the pool of 
 * real user withdrawals falls below a certain threshold.
 * This ensures new subscribers always have a counterparty to pay.
 */
export async function autoApproveSeededWithdrawals() {
  try {
    await connectDB();

    // 1. Get thresholds from config
    const configs = await AdminConfig.getAllConfigs();
    const minApprovedPool = parseInt(configs.min_liquidity_threshold || '5'); 
    const autoApproveBatch = parseInt(configs.auto_approve_batch_size || '3');

    // 2. Check current approved pool size (real + seeded)
    const approvedCount = await Withdrawal.countDocuments({ 
      status: 'approved',
      lockedAmount: { $eq: 0 } // Only count fully free ones
    });

    if (approvedCount >= minApprovedPool) {
        // Pool is healthy.
        return { status: 'healthy', count: approvedCount };
    }

    console.log(`[LIQUIDITY] Pool low (${approvedCount}/${minApprovedPool}). Auto-approving seeded logic...`);

    // 3. Find pending system-generated withdrawals
    const seededToApprove = await Withdrawal.find({
        status: 'pending',
        isSystemGenerated: true
    })
    .sort({ createdAt: 1 })
    .limit(autoApproveBatch);

    if (seededToApprove.length === 0) {
        return { status: 'no_seed_available', count: approvedCount };
    }

    // 4. Approve them
    const approvedIds = seededToApprove.map(w => w._id);
    await Withdrawal.updateMany(
        { _id: { $in: approvedIds } },
        { 
            $set: { 
                status: 'approved',
                adminNotes: 'System Auto-Approved for liquidity.'
            } 
        }
    );

    console.log(`[LIQUIDITY] Activated ${approvedIds.length} seeded withdrawals.`);
    return { status: 'liquidity_added', count: approvedIds.length };

  } catch (error) {
    console.error('Auto-Liquidity Error:', error);
    return { error: error.message };
  }
}
