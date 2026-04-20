import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [500, 'Minimum withdrawal is ₹500'],
  },
  goldGrams: {
    type: Number,
    default: 0,
  },
  lockedAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'completed', 'rejected'],
    default: 'pending',
  },
  // Payment Details
  paymentMethod: {
    type: {
      type: String,
      enum: ['upi', 'bank_account'],
    },
    upiId: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
  },
  // Processing
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  processedAt: Date,
  transactionRef: String,
  // Withdrawal Window
  withdrawalMonth: {
    type: String, // Format: "2024-03"
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  isSystemGenerated: {
    type: Boolean,
    default: false,
  },
  // Notes
  adminNotes: String,
  rejectionReason: String,
  // Fees
  processingFee: {
    type: Number,
    default: 0,
  },
  tdsDeducted: {
    type: Number,
    default: 0,
  },
  netAmount: {
    type: Number,
  },
}, {
  timestamps: true,
});

// Indexes for high-volume traffic and P2P matching
withdrawalSchema.index({ status: 1, amount: 1, isSystemGenerated: 1, createdAt: 1 });
withdrawalSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Withdrawal || mongoose.model('Withdrawal', withdrawalSchema);