import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Bronze', 'Silver', 'Gold', 'Diamond'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number, // For showing discount
  },
  duration: {
    type: Number,
    required: true,
    default: 30, // days
  },
  // Mining Configuration
  miningRate: {
    type: Number, // points per hour
    required: true,
  },
  maxDailyMiningHours: {
    type: Number,
    default: 24,
  },
  dailySessionLimit: {
    type: Number,
    default: 1,
  },
  maxSessionMinutes: {
    type: Number,
    default: 8, // 8 minutes (Tiered mining)
  },
  totalSessionsLimit: {
    type: Number, // Total sessions to reach 2X cap
  },
  goldPerPoint: {
    type: Number, // grams of gold per point
    required: true,
  },
  estimatedMonthlyReturn: {
    type: Number, // estimated monthly return in rupees
  },
  // Features
  features: [{
    text: String,
    included: { type: Boolean, default: true },
  }],
  // Referral Bonus
  referralBonus: {
    type: Number,
    default: 0, // percentage
  },
  // Badge/Icon
  icon: {
    type: String,
    default: '⛏️',
  },
  color: {
    type: String,
    default: '#FFD700',
  },
  gradientFrom: String,
  gradientTo: String,
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Plan || mongoose.model('Plan', planSchema);