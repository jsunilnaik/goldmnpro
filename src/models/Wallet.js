import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  // Balances
  pointsBalance: {
    type: Number,
    default: 0,
  },
  goldBalance: {
    type: Number, // in grams
    default: 0,
  },
  cashBalance: {
    type: Number, // in rupees
    default: 0,
  },
  miningBalance: {
    type: Number, // remaining 2X earning potential
    default: 0,
  },
  // Lifetime Stats
  totalPointsEarned: {
    type: Number,
    default: 0,
  },
  totalGoldEarned: {
    type: Number,
    default: 0,
  },
  totalCashEarned: {
    type: Number,
    default: 0,
  },
  totalInvestment: {
    type: Number,
    default: 0,
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
  },
  totalReferralEarnings: {
    type: Number,
    default: 0,
  },
  // Pending
  pendingWithdrawal: {
    type: Number,
    default: 0,
  },
  pendingMaturityValue: {
    type: Number, // Accumulated 2X earnings waiting for plan maturity
    default: 0,
  },
  // Last Updated
  lastMiningCreditAt: Date,
  lastWithdrawalAt: Date,
  lastMaturityReleaseAt: {
    type: Date,
    default: Date.now // Start cycle from wallet creation
  },
}, {
  timestamps: true,
});

export default mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);