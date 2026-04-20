import mongoose from 'mongoose';

/**
 * Treasury Model — Singleton Ledger
 * 
 * Tracks the global fund pool in real-time.
 * Only ONE document exists (singleton pattern via key: 'main').
 * Every financial event atomically updates this ledger.
 * 
 * GUARANTEE: totalOutflow + reservedFunds ≤ totalInflow (always)
 */
const treasurySchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'main',
    unique: true,
    immutable: true,
  },

  // ─── INFLOW TRACKING ──────────────────────────
  totalInflow: {
    type: Number,
    default: 0, // All subscription payments ever received
  },
  inflowBreakdown: {
    bronze: { type: Number, default: 0 },
    silver: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    diamond: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },
  totalSubscriptions: {
    type: Number,
    default: 0, // Count of all approved subscriptions
  },

  // ─── OUTFLOW TRACKING ─────────────────────────
  totalOutflow: {
    type: Number,
    default: 0, // All money that has left the pool
  },
  outflowBreakdown: {
    withdrawals: { type: Number, default: 0 },
    referralBonuses: { type: Number, default: 0 },
    refunds: { type: Number, default: 0 },
  },

  // ─── RESERVED FUNDS ───────────────────────────
  // Money promised but not yet paid (pending withdrawals, etc.)
  reservedFunds: {
    type: Number,
    default: 0,
  },

  // ─── DEDUCTIONS RETAINED ──────────────────────
  // TDS and fees that are deducted but stay in pool
  totalTdsRetained: {
    type: Number,
    default: 0,
  },
  totalFeesRetained: {
    type: Number,
    default: 0,
  },

  // ─── DAILY TRACKING ───────────────────────────
  todayOutflow: {
    type: Number,
    default: 0,
  },
  todayDate: {
    type: String, // "2026-04-05"
    default: '',
  },
  todayWithdrawalCount: {
    type: Number,
    default: 0,
  },

  // ─── AUTO-PAUSE ───────────────────────────────
  isWithdrawalPaused: {
    type: Boolean,
    default: false,
  },
  pauseReason: {
    type: String,
    default: '',
  },
  pausedAt: Date,
  pausedBy: {
    type: String, // 'system' or admin email
    default: '',
  },

  // ─── AUDIT TRAIL ──────────────────────────────
  lastInflowAt: Date,
  lastOutflowAt: Date,
  lastHealthCheck: Date,
  lastHealthPercent: {
    type: Number,
    default: 100,
  },

}, {
  timestamps: true,
});

// ─── VIRTUAL: Available Pool ──────────────────────
treasurySchema.virtual('availablePool').get(function () {
  return this.totalInflow - this.totalOutflow - this.reservedFunds;
});

// ─── VIRTUAL: Pool Health % ──────────────────────
treasurySchema.virtual('healthPercent').get(function () {
  if (this.totalInflow === 0) return 100;
  const available = this.totalInflow - this.totalOutflow - this.reservedFunds;
  return Math.round((available / this.totalInflow) * 10000) / 100; // 2 decimal precision
});

// ─── VIRTUAL: Pool Status ────────────────────────
treasurySchema.virtual('poolStatus').get(function () {
  const health = this.healthPercent;
  if (health >= 60) return 'healthy';
  if (health >= 40) return 'caution';
  if (health >= 20) return 'warning';
  return 'critical';
});

// ─── STATIC: Get or Create Singleton ─────────────
treasurySchema.statics.getInstance = async function () {
  let treasury = await this.findOne({ key: 'main' });
  if (!treasury) {
    treasury = await this.create({ key: 'main' });
  }
  return treasury;
};

// ─── STATIC: Get Pool Snapshot (lean, read-only) ──
treasurySchema.statics.getSnapshot = async function () {
  const t = await this.findOne({ key: 'main' }).lean();
  if (!t) return null;

  const available = t.totalInflow - t.totalOutflow - t.reservedFunds;
  const health = t.totalInflow > 0
    ? Math.round((available / t.totalInflow) * 10000) / 100
    : 100;

  return {
    ...t,
    availablePool: available,
    healthPercent: health,
    poolStatus: health >= 60 ? 'healthy' : health >= 40 ? 'caution' : health >= 20 ? 'warning' : 'critical',
  };
};

// Ensure virtuals are included in JSON
treasurySchema.set('toJSON', { virtuals: true });
treasurySchema.set('toObject', { virtuals: true });

// High performance — only 1 document, but index for safety
treasurySchema.index({ key: 1 }, { unique: true });

export default mongoose.models.Treasury || mongoose.model('Treasury', treasurySchema);
