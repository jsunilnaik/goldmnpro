// App Constants
export const APP_NAME = 'GoldMine Pro';
export const APP_VERSION = '1.0.0';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Mining Constants
export const MINING_INTERVAL_SECONDS = 1;
export const BASE_MINING_RATE = 0.001;
export const POINTS_TO_GOLD_RATIO = 0.00001;
export const GOLD_PRICE_PER_GRAM = 6000; // INR
export const MAX_MINING_SESSION_HOURS = 24;
export const AUTO_CLAIM_AFTER_HOURS = 24;

// Withdrawal Constants
export const WITHDRAWAL_DATE = process.env.WITHDRAWAL_DATE || '1';
export const WITHDRAWAL_WINDOW_DAYS = parseInt(process.env.WITHDRAWAL_WINDOW_DAYS || '3');
export const MIN_WITHDRAWAL_AMOUNT = parseInt(process.env.MIN_WITHDRAWAL_AMOUNT || '500');
export const MAX_WITHDRAWAL_AMOUNT = 500000;
export const TDS_PERCENTAGE = 30;
export const PROCESSING_FEE = 10;

// Auth Constants
export const JWT_EXPIRES_IN = '7d';
export const OTP_EXPIRY_MINUTES = 10;
export const MAX_OTP_ATTEMPTS = 5;
export const MAX_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCK_MINUTES = 30;
export const PASSWORD_MIN_LENGTH = 8;

// Referral Constants
export const DEFAULT_REFERRAL_BONUS_PERCENT = 5;
export const REFERRAL_CODE_LENGTH = 8;
export const REFERRAL_CODE_PREFIX = 'GM';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Plans
export const PLAN_NAMES = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Platinum'];
export const PLAN_ICONS = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Diamond: '💎',
  Platinum: '👑',
};
export const PLAN_COLORS = {
  Bronze: { from: '#CD7F32', to: '#8B4513' },
  Silver: { from: '#C0C0C0', to: '#808080' },
  Gold: { from: '#FFD700', to: '#FFA500' },
  Diamond: { from: '#00CED1', to: '#4169E1' },
  Platinum: { from: '#E5E4E2', to: '#B4B4B4' },
};

// Transaction Types
export const TRANSACTION_TYPES = {
  PLAN_PURCHASE: 'plan_purchase',
  MINING_REWARD: 'mining_reward',
  REFERRAL_BONUS: 'referral_bonus',
  WITHDRAWAL: 'withdrawal',
  BONUS: 'bonus',
  ADJUSTMENT: 'adjustment',
  REFUND: 'refund',
};

// Status Labels
export const STATUS_LABELS = {
  pending: { label: 'Pending', color: 'yellow' },
  active: { label: 'Active', color: 'green' },
  completed: { label: 'Completed', color: 'green' },
  approved: { label: 'Approved', color: 'blue' },
  processing: { label: 'Processing', color: 'purple' },
  rejected: { label: 'Rejected', color: 'red' },
  cancelled: { label: 'Cancelled', color: 'red' },
  expired: { label: 'Expired', color: 'gray' },
  failed: { label: 'Failed', color: 'red' },
};

// Regex Patterns
export const PATTERNS = {
  email: /^\S+@\S+\.\S+$/,
  phone: /^[6-9]\d{9}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  aadhar: /^\d{12}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  upi: /^[\w.-]+@[\w]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
};

// Error Messages
export const ERRORS = {
  UNAUTHORIZED: 'Please login to continue',
  FORBIDDEN: 'You do not have permission',
  NOT_FOUND: 'Resource not found',
  VALIDATION: 'Please check your input',
  NETWORK: 'Network error. Please try again',
  SERVER: 'Something went wrong. Please try again later',
  PLAN_REQUIRED: 'Active plan required. Please subscribe first',
  KYC_REQUIRED: 'KYC verification required',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  WITHDRAWAL_WINDOW: 'Withdrawals only available on specific dates',
};