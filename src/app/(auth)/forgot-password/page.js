'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Phone, ArrowLeft, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Reset link sent!');
        setSubmitted(true);
      } else {
        toast.error(data.message || 'Failed to send reset link');
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
        {!submitted ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20">
                <KeyRound className="w-8 h-8 text-dark-50" />
              </div>
              <h1 className="text-2xl font-display font-bold text-dark-50">Forgot Password</h1>
              <p className="text-dark-500 text-sm mt-1 font-medium">
                Enter your email or phone number to receive a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                {identifier.includes('@') ? (
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                ) : (
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                )}
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Email or Phone Number"
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
              </motion.button>
            </form>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-dark-50 mb-2">Check your Inbox</h2>
            <p className="text-dark-500 text-sm mb-8 leading-relaxed">
              If an account exists for <span className="font-bold text-dark-100">{identifier}</span>, 
              you will receive a password reset link shortly.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-gold-600 font-bold text-sm hover:text-gold-500 transition-colors"
            >
              Didn't receive it? Try again
            </button>
          </motion.div>
        )}

        <p className="text-center text-sm text-dark-500 mt-8 font-medium">
          <Link href="/login" className="text-gold-600 font-bold flex items-center justify-center gap-2 hover:text-gold-500 transition-colors">
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}