'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Loader2, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'send_otp' }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('OTP sent to your email!');
        setStep(2);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, action: 'verify_otp' }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('OTP verified!');
        setStep(3);
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword, action: 'reset_password' }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Password reset successful! Please login.');
        window.location.href = '/login';
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20">
            <KeyRound className="w-8 h-8 text-dark-50" />
          </div>
          <h1 className="text-2xl font-display font-bold text-dark-50">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Enter OTP'}
            {step === 3 && 'New Password'}
          </h1>
          <p className="text-dark-500 text-sm mt-1 font-medium">
            {step === 1 && 'Enter your email to receive a reset OTP'}
            {step === 2 && 'Check your email for the 6-digit code'}
            {step === 3 && 'Create your new password'}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-gold-500 w-8' : 'bg-dark-800 w-4'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-white border border-dark-800 rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium text-dark-100 focus:border-gold-500/50 outline-none transition-all placeholder:text-dark-500 shadow-sm"
                />
              </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gold-gradient text-dark-50 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-md haptic-button border border-gold-500/10"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
            </motion.button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="flex justify-center gap-2">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={otp[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d?$/.test(val)) {
                      const newOtp = otp.split('');
                      newOtp[i] = val;
                      setOtp(newOtp.join(''));
                      if (val && e.target.nextSibling) {
                        e.target.nextSibling.focus();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[i] && e.target.previousSibling) {
                      e.target.previousSibling.focus();
                    }
                  }}
                  className="w-11 h-13 text-center text-lg font-mono font-bold bg-white border border-dark-800 rounded-xl focus:border-gold-500/50 outline-none shadow-sm text-dark-100"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleSendOTP}
              className="w-full text-xs text-gold-600 font-bold hover:text-gold-500"
            >
              Didn't receive? Resend OTP
            </button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gold-gradient text-dark-50 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-md haptic-button border border-gold-500/10"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
            </motion.button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
               required
               minLength={8}
               className="w-full bg-white border border-dark-800 rounded-xl pl-10 pr-12 py-3.5 text-sm font-medium text-dark-100 focus:border-gold-500/50 outline-none transition-all placeholder:text-dark-500 shadow-sm"
             />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                 placeholder="Confirm Password"
                 required
                 className="w-full bg-white border border-dark-800 rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium text-dark-100 focus:border-gold-500/50 outline-none transition-all placeholder:text-dark-500 shadow-sm"
               />
            </div>

             <motion.button
               whileTap={{ scale: 0.97 }}
               type="submit"
               disabled={loading}
               className="w-full bg-gold-gradient text-dark-50 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-md haptic-button border border-gold-500/10"
             >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
             </motion.button>
          </form>
        )}

         <p className="text-center text-sm text-dark-500 mt-8 font-medium italic">
           <Link href="/login" className="text-gold-600 font-bold flex items-center justify-center gap-2 hover:text-gold-500 transition-colors">
             <ArrowLeft size={14} />
             Back to Login
           </Link>
         </p>
      </motion.div>
    </div>
  );
}