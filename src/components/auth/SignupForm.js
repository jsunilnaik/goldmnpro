'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Gift,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Shield,
  MapPin,
} from 'lucide-react';
import { getAllStates, getCitiesForState, getCityTier } from '@/lib/india-cities';

export default function SignupForm({ onSuccess }) {
  const { signup } = useAuth();
  const searchParams = useSearchParams();
  const refCode = searchParams?.get('ref') || '';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    referralCode: refCode,
    state: '',
    city: '',
    tier: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(1); // 1: details, 2: security
  const [touched, setTouched] = useState({});

  // Validation
  const validations = {
    fullName: formData.fullName.length >= 2,
    email: /^\S+@\S+\.\S+$/.test(formData.email),
    phone: /^[6-9]\d{9}$/.test(formData.phone),
    password: formData.password.length >= 8,
    city: formData.city.length > 0,
  };

  const passwordStrength = (() => {
    let s = 0;
    const p = formData.password;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strengthTextColors = ['', 'text-red-400', 'text-yellow-400', 'text-blue-400', 'text-green-400'];

  const step1Valid = validations.fullName && validations.email && validations.phone && validations.city;
  const step2Valid = validations.password && agreed;
  const allValid = step1Valid && step2Valid;

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // When state changes, reset city and tier
      if (field === 'state') {
        next.city = '';
        next.tier = null;
      }
      // When city changes, auto-detect tier
      if (field === 'city' && next.state) {
        next.tier = getCityTier(value, next.state);
      }
      return next;
    });
    setError('');
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleNext = () => {
    setTouched({ fullName: true, email: true, phone: true });
    if (step1Valid) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
    });

    if (!allValid) {
      setError('Please fill all fields correctly and accept terms');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(formData);
      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(result.message || 'Signup failed');
        // Go back to step 1 if it's an email/phone issue
        if (
          result.message?.includes('email') ||
          result.message?.includes('phone')
        ) {
          setStep(1);
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    icon: Icon,
    field,
    type = 'text',
    placeholder,
    maxLength,
    autoCapitalize,
    inputMode,
  }) => {
    const isValid = validations[field];
    const isTouched = touched[field];
    const value = formData[field];

    return (
      <div className="space-y-1.5">
        <div className="relative">
          <Icon
            size={18}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              isTouched && !isValid && value
                ? 'text-red-400'
                : value
                ? 'text-gold-400'
                : 'text-dark-400'
            }`}
          />
          <input
            type={type}
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            placeholder={placeholder}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            inputMode={inputMode}
            required
            className={`w-full bg-dark-800 border rounded-xl pl-11 pr-10 py-3.5 text-sm outline-none transition-all placeholder:text-dark-500 ${
              isTouched && !isValid && value
                ? 'border-red-500/50'
                : 'border-dark-600 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20'
            }`}
          />
          {isTouched && value && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              {isValid ? (
                <CheckCircle size={16} className="text-green-400" />
              ) : (
                <AlertCircle size={16} className="text-red-400" />
              )}
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-3 shadow-lg shadow-gold-500/20">
          <Shield className="w-7 h-7 text-dark-900" />
        </div>
        <h1 className="text-2xl font-display font-bold text-gold-shimmer">
          Create Account
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          Join the gold mining revolution
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s
                  ? 'bg-gold-500 text-dark-900'
                  : 'bg-dark-700 text-dark-400'
              }`}
            >
              {step > s ? <CheckCircle size={14} /> : s}
            </div>
            <span
              className={`text-xs hidden xs:inline ${
                step >= s ? 'text-gold-400' : 'text-dark-500'
              }`}
            >
              {s === 1 ? 'Details' : 'Security'}
            </span>
            {s === 1 && (
              <div
                className={`w-8 h-0.5 rounded-full transition-colors ${
                  step > 1 ? 'bg-gold-500' : 'bg-dark-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Details */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3.5"
            >
              <InputField
                icon={User}
                field="fullName"
                placeholder="Full Name"
                autoCapitalize="words"
              />
              <InputField
                icon={Mail}
                field="email"
                type="email"
                placeholder="Email Address"
              />
              <InputField
                icon={Phone}
                field="phone"
                type="tel"
                placeholder="Phone Number"
                maxLength={10}
                inputMode="numeric"
              />

              {/* State & City Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <MapPin
                    size={18}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      formData.state ? 'text-gold-400' : 'text-dark-400'
                    }`}
                  />
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className={`w-full bg-dark-800 border border-dark-600 rounded-xl pl-11 pr-3 py-3.5 text-sm outline-none transition-all appearance-none cursor-pointer ${
                      formData.state ? 'text-dark-50' : 'text-dark-500'
                    } focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20`}
                  >
                    <option value="">State</option>
                    {getAllStates().map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <MapPin
                    size={18}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      formData.city ? 'text-gold-400' : 'text-dark-400'
                    }`}
                  />
                  <select
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    disabled={!formData.state}
                    className={`w-full bg-dark-800 border border-dark-600 rounded-xl pl-11 pr-3 py-3.5 text-sm outline-none transition-all appearance-none cursor-pointer ${
                      formData.city ? 'text-dark-50' : 'text-dark-500'
                    } focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 disabled:opacity-50`}
                  >
                    <option value="">City</option>
                    {formData.state && getCitiesForState(formData.state).map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Referral Code */}
              <div className="relative">
                <Gift
                  size={18}
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    formData.referralCode
                      ? 'text-purple-400'
                      : 'text-dark-400'
                  }`}
                />
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) =>
                    handleChange(
                      'referralCode',
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Referral Code (Optional)"
                  maxLength={8}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:border-purple-500/50 outline-none transition-all placeholder:text-dark-500 uppercase font-mono"
                />
              </div>

              {/* Next Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleNext}
                className="w-full bg-gold-gradient text-dark-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 haptic-button shadow-lg shadow-gold-500/20"
              >
                Continue
                <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Security */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3.5"
            >
              {/* Password */}
              <div className="space-y-1.5">
                <div className="relative">
                  <Lock
                    size={18}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      formData.password
                        ? 'text-gold-400'
                        : 'text-dark-400'
                    }`}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      handleChange('password', e.target.value)
                    }
                    onBlur={() => handleBlur('password')}
                    placeholder="Create Password (8+ chars)"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-11 pr-12 py-3.5 text-sm focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 outline-none transition-all placeholder:text-dark-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors p-0.5"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength
                              ? strengthColors[passwordStrength]
                              : 'bg-dark-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p
                        className={`text-[10px] font-medium ${
                          strengthTextColors[passwordStrength] ||
                          'text-dark-500'
                        }`}
                      >
                        {strengthLabels[passwordStrength] || 'Too short'}
                      </p>
                      <div className="flex gap-2 text-[9px] text-dark-500">
                        <span
                          className={
                            /[A-Z]/.test(formData.password)
                              ? 'text-green-400'
                              : ''
                          }
                        >
                          A-Z
                        </span>
                        <span
                          className={
                            /[0-9]/.test(formData.password)
                              ? 'text-green-400'
                              : ''
                          }
                        >
                          0-9
                        </span>
                        <span
                          className={
                            /[^A-Za-z0-9]/.test(formData.password)
                              ? 'text-green-400'
                              : ''
                          }
                        >
                          @#$
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-dark-800/30 border border-dark-700/50 hover:border-dark-600 transition-colors">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-gold-500 focus:ring-gold-500/20 cursor-pointer"
                  />
                </div>
                <span className="text-xs text-dark-400 leading-relaxed">
                  I agree to the{' '}
                  <a
                    href="#"
                    className="text-gold-400 hover:text-gold-300"
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="#"
                    className="text-gold-400 hover:text-gold-300"
                  >
                    Privacy Policy
                  </a>
                  . I understand that mining rewards are subject to market
                  conditions.
                </span>
              </label>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3.5 rounded-xl bg-dark-800 border border-dark-600 text-sm font-medium text-dark-300 hover:text-white hover:border-dark-500 transition-all"
                >
                  Back
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading || !agreed || !validations.password}
                  className="flex-1 bg-gold-gradient text-dark-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed haptic-button shadow-lg shadow-gold-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Create Account</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Login Link */}
      <p className="text-center text-sm text-dark-400 mt-6">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-gold-400 font-semibold hover:text-gold-300 transition-colors"
        >
          Login
        </Link>
      </p>
    </div>
  );
}