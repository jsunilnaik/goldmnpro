import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'plan_purchase',
      'mining_reward',
      'referral_bonus',
      'withdrawal',
      'bonus',
      'adjustment',
      'refund',
    ],
    required: true,
  },
  category: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  gold: {
    type: Number,  // grams
    default: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed',
  },
  description: {
    type: String,
    required: true,
  },
  // References
  referenceId: String, // UTR number, mining session ID, etc.
  referenceType: {
    type: String,
    enum: ['payment', 'mining', 'referral', 'withdrawal', 'system'],
  },
  // Balance after transaction
  balanceAfter: {
    points: Number,
    gold: Number,
    cash: Number,
  },
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Index for faster queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);