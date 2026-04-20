import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    avatar: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    isKYCVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    // KYC Details
    kyc: {
        panNumber: { type: String, default: null },
        aadharNumber: { type: String, default: null },
        panImage: { type: String, default: null },
        aadharFrontImage: { type: String, default: null },
        aadharBackImage: { type: String, default: null },
        status: {
            type: String,
            enum: ['pending', 'submitted', 'verified', 'rejected'],
            default: 'pending',
        },
    },
    // Payment Methods
    paymentMethods: [{
        type: {
            type: String,
            enum: ['upi', 'bank_account'],
        },
        upiId: String,
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String,
        isPrimary: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
    }],
    // Location
    city: {
        type: String,
        default: null,
        trim: true,
    },
    state: {
        type: String,
        default: null,
        trim: true,
    },
    tier: {
        type: Number,
        enum: [1, 2, 3, 4],
        default: null,
    },
    // Referral System
    referralCode: {
        type: String,
        unique: true,
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    referralCount: {
        type: Number,
        default: 0,
    },
    referralEarnings: {
        type: Number,
        default: 0,
    },
    // Subscription
    currentPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        default: null,
    },
    // Device & Security
    lastLogin: Date,
    lastLoginIP: String,
    deviceTokens: [String], // For push notifications
    otp: {
        code: String,
        expiresAt: Date,
        attempts: { type: Number, default: 0 },
    },
    loginAttempts: {
        count: { type: Number, default: 0 },
        lastAttempt: Date,
        lockedUntil: Date,
    },
    withdrawalLockUntil: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Generate unique referral code before saving
userSchema.pre('save', async function (next) {
    if (this.isNew && !this.referralCode) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = 'GM';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.referralCode = code;
    }

    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
    if (this.loginAttempts.lockedUntil && this.loginAttempts.lockedUntil > new Date()) {
        return true;
    }
    return false;
};

userSchema.methods.generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        attempts: 0,
    };
    return otp;
};

// Indexes for high-volume traffic
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ currentPlan: 1 });
userSchema.index({ referredBy: 1, createdAt: -1 });

export default mongoose.models.User || mongoose.model('User', userSchema);