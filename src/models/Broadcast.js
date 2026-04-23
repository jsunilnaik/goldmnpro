import mongoose from 'mongoose';

const BroadcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'video', 'image'],
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
  excludedStates: {
    type: [String],
    default: [],
  },
  excludedCities: {
    type: [String],
    default: [],
  },
  includedCities: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

// Index for fast targeting
BroadcastSchema.index({ isActive: 1, targetType: 1, targetCity: 1 });

// Clear model cache in development to pick up schema changes
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Broadcast;
}

export default mongoose.models.Broadcast || mongoose.model('Broadcast', BroadcastSchema);
