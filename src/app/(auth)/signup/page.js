'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Eye, EyeOff, Pickaxe, Mail, Lock, User, Phone,
  Gift, Loader2, ArrowRight, CheckCircle, MapPin
} from 'lucide-react';
import { getAllStates, getCitiesForState, getCityTier } from '@/lib/india-cities';

export default function SignupPage() {
  const { signup } = useAuth();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';

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
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'state') {
        next.city = '';
        next.tier = null;
      }
      if (name === 'city' && next.state) {
        next.tier = getCityTier(value, next.state);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);
    await signup(formData);
    setLoading(false);
  };

  const passwordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-3 shadow-lg shadow-gold-500/20">
            <Pickaxe className="w-7 h-7 text-dark-50" />
          </div>
          <h1 className="text-2xl font-display font-bold text-dark-50">Create Account</h1>
          <p className="text-dark-500 text-sm mt-1 font-medium italic">Join the gold mining revolution</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full bg-white border border-dark-800 rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium text-dark-100 focus:border-gold-500/50 outline-none shadow-sm transition-all placeholder:text-dark-400"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              required
              className="w-full bg-white border border-dark-800 rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium text-dark-100 focus:border-gold-500/50 outline-none shadow-sm transition-all placeholder:text-dark-400"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              maxLength={10}
              className="w-full bg-white border border-dark-800 rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium text-dark-100 focus:border-gold-500/50 outline-none shadow-sm transition-all placeholder:text-dark-400"
            />
          </div>

          {/* State & City */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <MapPin size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${formData.state ? 'text-gold-500' : 'text-dark-400'}`} />
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full bg-white border border-dark-800 rounded-xl pl-10 pr-3 py-3.5 text-sm font-medium outline-none shadow-sm transition-all appearance-none cursor-pointer ${formData.state ? 'text-dark-100' : 'text-dark-400'} focus:border-gold-500/50`}
              >
                <option value="">State</option>
                {getAllStates().map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <MapPin size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${formData.city ? 'text-gold-500' : 'text-dark-400'}`} />
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.state}
                className={`w-full bg-white border border-dark-800 rounded-xl pl-10 pr-3 py-3.5 text-sm font-medium outline-none shadow-sm transition-all appearance-none cursor-pointer ${formData.city ? 'text-dark-100' : 'text-dark-400'} focus:border-gold-500/50 disabled:opacity-50`}
              >
                <option value="">City</option>
                {formData.state && getCitiesForState(formData.state).map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (8+ chars)"
                required
                minLength={8}
                className="w-full bg-white border border-dark-800 rounded-xl pl-10 pr-12 py-3.5 text-sm font-medium text-dark-100 focus:border-gold-500/50 outline-none shadow-sm transition-all placeholder:text-dark-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Strength */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i < strength ? strengthColors[strength - 1] : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-dark-500 mt-1 font-bold italic">
                  {strength > 0 ? strengthLabels[strength - 1] : 'Too weak'}
                </p>
              </div>
            )}
          </div>

          {/* Referral Code */}
          <div className="relative">
            <Gift size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="Referral Code (Optional)"
              className="w-full bg-white border border-dark-800 rounded-xl pl-10 pr-4 py-3.5 text-sm font-medium text-dark-100 focus:border-gold-500/50 outline-none shadow-sm placeholder:text-dark-400 uppercase"
            />
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-dark-800 bg-white text-gold-600 focus:ring-gold-500/20"
            />
            <span className="text-xs text-dark-500 font-medium italic">
              I agree to the{' '}
              <a href="#" className="text-gold-600 font-bold underline decoration-gold-500/30 underline-offset-2">Terms of Service</a> and{' '}
              <a href="#" className="text-gold-600 font-bold underline decoration-gold-500/30 underline-offset-2">Privacy Policy</a>
            </span>
          </label>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || !agreed}
            className="w-full bg-gold-gradient text-dark-50 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 haptic-button shadow-md"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        {/* Login & Home Links */}
        <div className="space-y-4 mt-8 text-center">
          <p className="text-sm text-dark-500 font-medium italic">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-600 font-bold hover:text-gold-500 italic pb-1 border-b-2 border-gold-500/20">
              Login
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