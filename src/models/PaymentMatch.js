import mongoose from 'mongoose';

const paymentMatchSchema = new mongoose.Schema({
  subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  withdrawer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
  },
  withdrawal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Withdrawal',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'matched',           // Initial match
      'paid',              // Subscriber uploaded proof
      'confirmed',         // Withdrawer confirmed receipt (waiting for Admin)
      'completed',         // Admin finalized & activated plan
      'cancelled',         // Cancelled by system/timeout
      'disputed',          // Reported by either party
    ],
    default: 'matched',
  },
  proof: {
    utr: String,
    screenshot: String,
    updatedAt: Date,
  },
  customUpiId: String,
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 60 * 60 * 1000), // Default 1 hour
  },
  adminNotes: String,
  disputeReason: String,
  disputedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
paymentMatchSchema.index({ subscriber: 1, status: 1 });
paymentMatchSchema.index({ withdrawer: 1, status: 1 });
paymentMatchSchema.index({ status: 1 });
paymentMatchSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-expire matched entries if not paid? 
// Note: TTL might not be ideal if we want to manual cancel, but okay for matches.

export default mongoose.models.PaymentMatch || mongoose.model('PaymentMatch', paymentMatchSchema);
