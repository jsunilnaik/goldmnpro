import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.local') });

let MONGODB_URI = process.env.MONGODB_URI;

// Manual SRV Resolution
async function resolveSrvToStandardUri(srvUri) {
    if (!srvUri.startsWith('mongodb+srv://')) return srvUri;
    try {
        const url = new URL(srvUri.replace('mongodb+srv', 'http'));
        const srvHostname = `_mongodb._tcp.${url.hostname}`;
        const addresses = await dns.resolveSrv(srvHostname);
        const nodes = addresses.map(a => `${a.name}:${a.port}`).join(',');
        const auth = url.username && url.password ? `${url.username}:${url.password}@` : '';
        const search = url.search || '';
        const pathname = url.pathname || '/';
        return `mongodb://${auth}${nodes}${pathname}${search}${search ? '&' : '?'}directConnection=false&retryWrites=true`;
    } catch (e) {
        return srvUri;
    }
}

const subscriptionSchema = new mongoose.Schema({
  status: String,
  amountPaid: Number,
}, { collection: 'subscriptions' });

const transactionSchema = new mongoose.Schema({
  type: String,
  status: String,
  amount: Number,
}, { collection: 'transactions' });

const withdrawalSchema = new mongoose.Schema({
  status: String,
  amount: Number,
}, { collection: 'withdrawals' });

const treasurySchema = new mongoose.Schema({
  isSingleton: { type: Boolean, default: true },
  totalInflow: { type: Number, default: 0 },
  totalOutflow: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  reservedFunds: { type: Number, default: 0 },
  dailyPayouts: { date: { type: String, default: '' }, totalAmount: { type: Number, default: 0 } },
  version: { type: Number, default: 1 }
}, { collection: 'treasuries' });

async function run() {
  console.log('Connecting to MongoDB...');
  
  try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
      console.log('SRV connect failed, trying fallback...');
      MONGODB_URI = await resolveSrvToStandardUri(MONGODB_URI);
      await mongoose.connect(MONGODB_URI);
  }
  
  console.log('Connected to Database successfully!');

  const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
  const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
  const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);
  const Treasury = mongoose.models.Treasury || mongoose.model('Treasury', treasurySchema);

  // 1. Calculate Total Inflow
  const subs = await Subscription.find({ status: { $in: ['active', 'expired'] } }).lean();
  const totalInflow = subs.reduce((sum, sub) => sum + (sub.amountPaid || 0), 0);
  console.log(`Found ${subs.length} active/expired subscriptions. Total Inflow: ₹${totalInflow}`);

  // 2. Calculate Referral Outflows
  const referralTxs = await Transaction.find({ type: 'referral_bonus', status: 'completed' }).lean();
  const totalReferrals = referralTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  console.log(`Found ${referralTxs.length} completed referral bonuses. Total: ₹${totalReferrals}`);

  // 3. Calculate Withdrawal Outflows
  const withdrawals = await Withdrawal.find({ status: 'completed' }).lean();
  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
  console.log(`Found ${withdrawals.length} completed withdrawals. Total: ₹${totalWithdrawals}`);

  const totalOutflow = totalReferrals + totalWithdrawals;
  const currentBalance = totalInflow - totalOutflow;

  console.log(`\n=== FINAL CALCULATION ===`);
  console.log(`Total Inflow  : ₹${totalInflow}`);
  console.log(`Total Outflow : ₹${totalOutflow}`);
  console.log(`Calculated Current Balance: ₹${currentBalance}\n`);

  // Update Treasury
  let treasury = await Treasury.findOne({ isSingleton: true });
  if (!treasury) {
    treasury = new Treasury({ isSingleton: true });
  }

  treasury.totalInflow = totalInflow;
  treasury.totalOutflow = totalOutflow;
  treasury.currentBalance = currentBalance;
  
  await treasury.save();
  console.log('✅ Treasury singleton updated successfully!');
  console.log({
     inflow: treasury.totalInflow,
     outflow: treasury.totalOutflow,
     balance: treasury.currentBalance
  });

  process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
