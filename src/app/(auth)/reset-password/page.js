'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !id) {
      toast.error('Invalid reset link');
      return;
    }

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
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, id, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Password reset successful!');
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !id) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-dark-50 mb-4">Invalid Link</h1>
        <p className="text-dark-500 mb-8">This password reset link is invalid or has expired.</p>
        <Link href="/forgot-password" size="sm" className="text-gold-600 font-bold hover:text-gold-500">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-dark-50 mb-2">Password Reset!</h2>
        <p className="text-dark-500 text-sm mb-8">
          Your password has been updated successfully. Redirecting you to login...
        </p>
        <Link href="/login" className="bg-gold-gradient text-dark-50 px-8 py-3 rounded-xl font-bold shadow-md">
          Login Now
        </Link>
      </motion.div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20">
          <Lock className="w-8 h-8 text-dark-50" />
        </div>
        <h1 className="text-2xl font-display font-bold text-dark-50">Set New Password</h1>
        <p className="text-dark-500 text-sm mt-1 font-medium">Create a strong password for your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 p-1"
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
            placeholder="Confirm New Password"
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
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
        </motion.button>
      </form>

      <p className="text-center text-sm text-dark-500 mt-8 font-medium">
        <Link href="/login" className="text-gold-600 font-bold flex items-center justify-center gap-2 hover:text-gold-500 transition-colors">
          <ArrowLeft size={14} />
          Back to Login
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
