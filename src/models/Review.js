import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Review description is required'],
    trim: true,
  },
  screenshotUrl: {
    type: String,
    required: [true, 'Review screenshot is required'],
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
