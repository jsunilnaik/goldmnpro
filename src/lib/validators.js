import { z } from 'zod';
import { PATTERNS } from './constants';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
  referralCode: z.string().optional().nullable(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).optional(),
  newPassword: z.string().min(8).optional(),
  action: z.enum(['send_otp', 'verify_otp', 'reset_password']),
});

export const otpSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().length(6).optional(),
  action: z.enum(['verify', 'resend']).optional(),
});

// Profile Schemas
export const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(50).optional(),
  action: z.string().optional(),
});

export const paymentMethodSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('upi'),
    upiId: z.string().regex(/^[\w.-]+@[\w]+$/, 'Invalid UPI ID'),
  }),
  z.object({
    type: z.literal('bank_account'),
    bankName: z.string().min(2, 'Bank name required'),
    accountNumber: z.string().min(8, 'Invalid account number').max(18),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
    accountHolderName: z.string().min(2, 'Account holder name required'),
  }),
]);

export const kycSchema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  aadharNumber: z.string().regex(/^\d{12}$/, 'Aadhar must be 12 digits'),
});

// Plan Schema
export const planSchema = z.object({
  name: z.enum(['Bronze', 'Silver', 'Gold', 'Diamond', 'Platinum']),
  price: z.number().positive(),
  duration: z.number().int().positive(),
  miningRate: z.number().positive(),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
});

// Withdrawal Schema
export const withdrawalSchema = z.object({
  amount: z.number()
    .min(500, 'Minimum withdrawal is ₹500')
    .max(500000, 'Maximum withdrawal is ₹5,00,000'),
  paymentMethodId: z.union([z.string(), z.number()]),
});

// Validation Helpers
export function validateEmail(email) {
  return PATTERNS.email.test(email);
}

export function validatePhone(phone) {
  return PATTERNS.phone.test(phone);
}

export function validatePAN(pan) {
  return PATTERNS.pan.test(pan);
}

export function validateAadhar(aadhar) {
  return PATTERNS.aadhar.test(aadhar);
}

export function validateIFSC(ifsc) {
  return PATTERNS.ifsc.test(ifsc);
}

export function validateUPI(upi) {
  return PATTERNS.upi.test(upi);
}

export function validatePassword(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;

  return {
    valid: checks.length && (strength >= 3),
    checks,
    strength,
    label: strength <= 1 ? 'Weak' : strength <= 2 ? 'Fair' : strength <= 3 ? 'Good' : 'Strong',
  };
}

// Safe parse wrapper
export function safeParse(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data, errors: null };
  }
  return {
    success: false,
    data: null,
    errors: result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  };
}