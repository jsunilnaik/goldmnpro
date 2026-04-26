'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Pickaxe, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (result?.success) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20"
          >
            <Pickaxe className="w-8 h-8 text-dark-50" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-dark-50">Welcome Back</h1>
          <p className="text-dark-500 text-sm mt-1 font-medium">Login to continue mining</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full bg-white border border-dark-800 rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium text-dark-100 focus:border-gold-500/50 shadow-sm outline-none transition-all placeholder:text-dark-400"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-white border border-dark-800 rounded-xl pl-10 pr-12 py-3.5 text-sm font-medium text-dark-100 focus:border-gold-500/50 shadow-sm outline-none transition-all placeholder:text-dark-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 p-1"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-gold-600 font-bold hover:text-gold-500">
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gold-gradient text-dark-50 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 haptic-button shadow-md"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Login <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        {/* Sign Up & Home Links */}
        <div className="space-y-4 mt-8">
          <p className="text-center text-sm text-dark-500 font-medium">
            Don't have an account?{' '}
            <Link href="/signup" className="text-gold-600 font-bold hover:text-gold-500">
              Sign Up
            </Link>
          </p>
          
          <div className="flex items-center justify-center pt-4 border-t border-dark-100">
            <Link 
              href="/" 
              className="text-xs text-dark-400 hover:text-dark-100 font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}