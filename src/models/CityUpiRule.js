import mongoose from 'mongoose';

const cityUpiRuleSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  upis: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one UPI ID is required'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

export default mongoose.models.CityUpiRule || mongoose.model('CityUpiRule', cityUpiRuleSchema);
