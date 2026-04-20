import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'pending_verification', 'active', 'expired', 'cancelled', 'rejected', 'exhausted'],
    default: 'pending',
  },
  // Payment Details
  utr: {
    type: String,
  },
  screenshot: String,
  paymentId: String,
  orderId: String,
  amountPaid: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    default: 'upi',
  },
  rejectionReason: String,
  // Duration
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  // Mining Stats for this subscription
  totalPointsMined: {
    type: Number,
    default: 0,
  },
  totalGoldEarned: {
    type: Number, // in grams
    default: 0,
  },
  totalValueEarned: {
    type: Number, // in rupees
    default: 0,
  },
  // Auto-renewal
  autoRenew: {
    type: Boolean,
    default: false,
  },
  renewalCount: {
    type: Number,
    default: 0,
  },
  // Maturity tracking
  totalSessionsExpected: {
    type: Number,
    default: 0,
  },
  sessionsCompleted: {
    type: Number,
    default: 0,
  },
  isMatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Virtual: days remaining
subscriptionSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return 0;
  const now = new Date();
  const diff = this.endDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

// Virtual: is expired
subscriptionSchema.virtual('isExpired').get(function() {
  return this.endDate && new Date() > this.endDate;
});

// High performance indexes
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ user: 1, endDate: -1 });
subscriptionSchema.index({ utr: 1 }, { unique: true, sparse: true });

export default mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);