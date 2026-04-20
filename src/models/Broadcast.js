import mongoose from 'mongoose';

const BroadcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'video'],
    default: 'text',
  },
  content: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    enum: ['global', 'city'],
    default: 'global',
  },
  targetCity: {
    type: String,
    default: '',
  },
  targetState: {
    type: String,
    default: '',
  },
  buttonText: {
    type: String,
    default: '',
  },
  buttonUrl: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for fast targeting
BroadcastSchema.index({ isActive: 1, targetType: 1, targetCity: 1 });

export default mongoose.models.Broadcast || mongoose.model('Broadcast', BroadcastSchema);
