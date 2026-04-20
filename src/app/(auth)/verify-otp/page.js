'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Smartphone, Loader2, CheckCircle } from 'lucide-react';

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit
    if (value && index === 5) {
      const fullOtp = newOtp.join('');
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    if (pasted.length === 6) {
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otpCode) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setVerified(true);
        toast.success('Phone verified successfully! 🎉');
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        toast.error(data.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, action: 'resend' }),
      });

      if (res.ok) {
        toast.success('New OTP sent!');
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error('Failed to resend');
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="text-xl font-bold text-green-700">Verified!</h2>
          <p className="text-dark-500 text-sm mt-1">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold-500/20">
          <Smartphone className="w-8 h-8 text-dark-50" />
        </div>

        <h1 className="text-2xl font-display font-bold text-dark-50">Verify Phone</h1>
        <p className="text-dark-500 text-sm mt-2 font-medium">
          We've sent a 6-digit code to
        </p>
        <p className="text-dark-100 font-mono font-bold mt-1 tracking-wider text-lg">+91 {phone}</p>

        {/* OTP Input */}
        <div className="flex justify-center gap-2.5 mt-8" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-mono font-bold rounded-xl border outline-none transition-all shadow-sm ${
                digit
                  ? 'bg-gold-500/10 border-gold-500/50 text-gold-600'
                  : 'bg-white border-dark-200 text-dark-900'
              } focus:border-gold-500/70 focus:ring-1 focus:ring-gold-500/20`}
            />
          ))}
        </div>

        {/* Verify Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleVerify(otp.join(''))}
          disabled={loading || otp.join('').length !== 6}
          className="w-full mt-8 bg-gold-gradient text-dark-50 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-md transition-all haptic-button border border-gold-500/10"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
        </motion.button>

        {/* Resend */}
        <div className="mt-4">
          {resendTimer > 0 ? (
            <p className="text-dark-500 text-xs font-medium">
              Resend in <span className="text-gold-600 font-mono font-bold">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-gold-600 text-sm font-semibold"
            >
              Resend OTP
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}