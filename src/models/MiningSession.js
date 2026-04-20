import mongoose from 'mongoose';

const miningSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'completed', 'claimed'],
        default: 'active',
    },
    startedAt: {
        type: Date,
        default: Date.now,
    },
    endedAt: Date,
    // Mining Results
    pointsEarned: {
        type: Number,
        default: 0,
    },
    goldEarned: {
        type: Number, // grams
        default: 0,
    },
    valueEarned: {
        type: Number, // rupees
        default: 0,
    },
    // Mining rate applied
    miningRate: {
        type: Number,
        required: true,
    },
    // Duration in minutes
    duration: {
        type: Number,
        default: 0,
    },
    // Bonus multipliers
    bonusMultiplier: {
        type: Number,
        default: 1,
    },
    bonusReason: String,
    // Is claimed to wallet
    isClaimed: {
        type: Boolean,
        default: false,
    },
    claimedAt: Date,
}, {
    timestamps: true,
});

// Critical indexes for million-user scalability
miningSessionSchema.index({ user: 1, status: 1, startedAt: -1 });
// Partial unique index: ensures only ONE 'active' session per user EVER
miningSessionSchema.index(
    { user: 1 },
    { 
        unique: true, 
        partialFilterExpression: { status: 'active' } 
    }
);
miningSessionSchema.index({ status: 1, createdAt: -1 });
miningSessionSchema.index({ claimedAt: -1 });

export default mongoose.models.MiningSession || mongoose.model('MiningSession', miningSessionSchema);