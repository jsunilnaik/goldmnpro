import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Wallet from '../src/models/Wallet.js';
import Transaction from '../src/models/Transaction.js';
import Subscription from '../src/models/Subscription.js';
import Referral from '../src/models/Referral.js';
import MiningSession from '../src/models/MiningSession.js';
import PaymentMatch from '../src/models/PaymentMatch.js';
import Withdrawal from '../src/models/Withdrawal.js';
import Review from '../src/models/Review.js';
import Notification from '../src/models/Notification.js';
import Treasury from '../src/models/Treasury.js';

const URI = process.env.MONGODB_URI;

if (!URI) {
  console.error('No MONGODB_URI found in .env.local');
  process.exit(1);
}

import dns from 'dns';
dns.setServers(["8.8.8.8", "8.8.4.4"]);
console.log("[MongoDB] Forcing Google DNS (8.8.8.8)...");

async function wipe() {
  await mongoose.connect(URI);
  console.log('Connected to MongoDB');

  const admins = await User.find({ role: 'admin' });
  const adminIds = admins.map(a => a._id);

  console.log(`Found ${adminIds.length} admin(s). Proceeding to wipe...`);

  if (adminIds.length === 0) {
    console.error('No admin found! Aborting to prevent full lockout.');
    process.exit(1);
  }

  // Delete non-admins
  const usersRes = await User.deleteMany({ _id: { $nin: adminIds } });
  console.log(`Deleted ${usersRes.deletedCount} users.`);

  // Delete wallets
  const walletsRes = await Wallet.deleteMany({ user: { $nin: adminIds } });
  console.log(`Deleted ${walletsRes.deletedCount} wallets.`);

  // Delete transactions
  const txRes = await Transaction.deleteMany({ user: { $nin: adminIds } });
  console.log(`Deleted ${txRes.deletedCount} transactions.`);

  // Delete subscriptions
  const subRes = await Subscription.deleteMany({ user: { $nin: adminIds } });
  console.log(`Deleted ${subRes.deletedCount} subscriptions.`);

  // Delete mining sessions
  const msRes = await MiningSession.deleteMany({ user: { $nin: adminIds } });
  console.log(`Deleted ${msRes.deletedCount} mining sessions.`);

  // Delete withdrawals
  const wdRes = await Withdrawal.deleteMany({ user: { $nin: adminIds } });
  console.log(`Deleted ${wdRes.deletedCount} withdrawals.`);

  // Delete payment matches
  const pmRes = await PaymentMatch.deleteMany({
    $or: [
      { subscriber: { $nin: adminIds } },
      { withdrawer: { $nin: adminIds } }
    ]
  });
  console.log(`Deleted ${pmRes.deletedCount} payment matches.`);

  // Delete referrals
  const refRes = await Referral.deleteMany({
    $or: [
      { referrer: { $nin: adminIds } },
      { referred: { $nin: adminIds } }
    ]
  });
  console.log(`Deleted ${refRes.deletedCount} referrals.`);

  // Delete reviews
  const revRes = await Review.deleteMany({ user: { $nin: adminIds } });
  console.log(`Deleted ${revRes.deletedCount} reviews.`);

  // Delete notifications
  const notifRes = await Notification.deleteMany({ user: { $nin: adminIds } });
  console.log(`Deleted ${notifRes.deletedCount} notifications.`);

  // Reset Treasury
  const treasuryRes = await Treasury.updateMany({}, {
    $set: {
      totalInflow: 0,
      totalOutflow: 0,
      availablePool: 0,
      reservedFunds: 0,
      totalSubscriptions: 0,
      totalWithdrawals: 0,
      todayOutflow: 0,
      todayWithdrawalCount: 0,
      totalTdsRetained: 0,
      totalFeesRetained: 0,
      lastUpdated: new Date()
    }
  });
  console.log(`Reset Treasury stats.`);

  console.log('Wipe complete.');
  process.exit(0);
}

wipe().catch(err => {
  console.error(err);
  process.exit(1);
});
