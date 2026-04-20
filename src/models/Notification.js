import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['system', 'withdrawal', 'referral', 'mining', 'payment'],
      default: 'system',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String, // Optional URL to redirect the user to when clicked
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
