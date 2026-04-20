'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  AlertCircle,
  Pickaxe,
  Sparkles,
} from 'lucide-react';

export default function LoginForm({ onSuccess, redirectUrl }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  // Field validation
  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const passwordValid = password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ email: true, password: true });

    if (!emailValid || !passwordValid) {
      setError('Please fill in all fields correctly');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <motion.div
          animate={{
            rotate: [0, -5, 5, -5, 0],
            y: [0, -3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold-500/20"
        >
          <Pickaxe className="w-8 h-8 text-dark-900" />
        </motion.div>
        <h1 className="text-2xl font-display font-bold text-gold-shimmer">
          Welcome Back
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          Login to continue mining gold
        </p>
      </div>

      {/* Error Message */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="text-xs text-dark-400 font-medium pl-1">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={18}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                touched.email && !emailValid
                  ? 'text-red-400'
                  : email
                  ? 'text-gold-400'
                  : 'text-dark-400'
              }`}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, email: true }))
              }
              placeholder="name@example.com"
              required
              autoComplete="email"
              className={`w-full bg-dark-800 border rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none transition-all placeholder:text-dark-500 ${
                touched.email && !emailValid
                  ? 'border-red-500/50 focus:border-red-500/70'
                  : 'border-dark-600 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20'
              }`}
            />
            {touched.email && email && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
              >
                {emailValid ? (
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Sparkles size={10} className="text-green-400" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle size={10} className="text-red-400" />
                  </div>
                )}
              </motion.div>
            )}
          </div>
          {touched.email && !emailValid && email && (
            <p className="text-[10px] text-red-400 pl-1">
              Please enter a valid email address
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label className="text-xs text-dark-400 font-medium pl-1">
            Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                touched.password && !passwordValid
                  ? 'text-red-400'
                  : password
                  ? 'text-gold-400'
                  : 'text-dark-400'
              }`}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              onBlur={() =>
                setTouched((prev) => ({ ...prev, password: true }))
              }
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className={`w-full bg-dark-800 border rounded-xl pl-11 pr-12 py-3.5 text-sm outline-none transition-all placeholder:text-dark-500 ${
                touched.password && !passwordValid
                  ? 'border-red-500/50 focus:border-red-500/70'
                  : 'border-dark-600 focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors p-0.5"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {touched.password && !passwordValid && password && (
            <p className="text-[10px] text-red-400 pl-1">
              Password must be at least 8 characters
            </p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-gold-400 hover:text-gold-300 transition-colors font-medium"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gold-gradient text-dark-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed haptic-button shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transition-shadow"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Login</span>
              <ArrowRight size={18} />
            </>
          )}
        </motion.button>
      </form>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-dark-400 mt-6">
        Don't have an account?{' '}
        <Link
          href="/signup"
          className="text-gold-400 font-semibold hover:text-gold-300 transition-colors"
        >
          Create Account
        </Link>
      </p>

      {/* Demo Credentials */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 rounded-xl bg-dark-800/50 border border-dark-700/50">
          <p className="text-[10px] text-dark-500 text-center mb-2 uppercase tracking-wider">
            Demo Credentials
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@goldminepro.com');
                setPassword('admin123456');
              }}
              className="flex-1 text-[10px] text-dark-400 bg-dark-800 py-1.5 rounded-lg hover:text-white transition-colors"
            >
              Admin Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}