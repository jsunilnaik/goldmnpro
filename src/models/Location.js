import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  tier: {
    type: Number,
    enum: [1, 2, 3, 4],
    required: true,
  },
  region: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  userCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound unique index — one entry per city+state
LocationSchema.index({ city: 1, state: 1 }, { unique: true });
LocationSchema.index({ state: 1 });
LocationSchema.index({ tier: 1 });

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);
