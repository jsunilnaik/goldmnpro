'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Eye,
  EyeOff,
  TrendingUp,
  ArrowDownToLine,
  Sparkles,
  Crown,
  Copy,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function WalletCard({
  wallet,
  user,
  loading = false,
  onRefresh,
  compact = false,
}) {
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) await onRefresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast.success('Referral code copied!');
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-dark-800 border border-dark-700/50 p-6 animate-pulse">
        <div className="h-3 bg-dark-700 rounded w-20 mb-3" />
        <div className="h-10 bg-dark-700 rounded w-40 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-12 bg-dark-700 rounded" />
          <div className="h-12 bg-dark-700 rounded" />
          <div className="h-12 bg-dark-700 rounded" />
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="glass-card p-4 border border-gold-500/20 flex items-center justify-between haptic-button"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
            <Wallet size={20} className="text-dark-900" />
          </div>
          <div>
            <p className="text-[10px] text-dark-400 uppercase tracking-wider">Balance</p>
            <p className="text-lg font-mono font-bold text-gold-400">
              {showBalance
                ? `₹${wallet?.cashBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`
                : '₹ ****.**'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setShowBalance(!showBalance); }}
            className="p-1.5 text-dark-400 hover:text-white transition-colors"
          >
            {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <Link href="/wallet">
            <ChevronRight size={18} className="text-dark-400" />
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800 border border-gold-500/20">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-gold-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gold-500/3 rounded-full" />

      <div className="relative z-10 p-5 md:p-6">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Wallet size={14} className="text-gold-400" />
            <p className="text-dark-400 text-xs uppercase tracking-wider font-medium">
              Total Balance
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleRefresh}
              className="p-1.5 text-dark-400 hover:text-white transition-colors"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            </motion.button>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 text-dark-400 hover:text-white transition-colors"
            >
              {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>
        </div>

        {/* Main Balance */}
        <AnimatePresence mode="wait">
          <motion.h2
            key={showBalance ? 'show' : 'hide'}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-3xl md:text-4xl font-mono font-bold text-gold-400"
          >
            {showBalance
              ? `₹${wallet?.cashBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`
              : '₹ ****.**'}
          </motion.h2>
        </AnimatePresence>

        {/* Pending */}
        {wallet?.pendingWithdrawal > 0 && (
          <p className="text-xs text-yellow-400/80 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            ₹{wallet.pendingWithdrawal.toLocaleString('en-IN')} pending withdrawal
          </p>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          <div>
            <p className="text-[9px] text-dark-500 uppercase tracking-wider">Points</p>
            <p className="text-sm font-mono font-semibold mt-0.5">
              {showBalance ? wallet?.pointsBalance?.toFixed(2) || '0.00' : '****'}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-dark-500 uppercase tracking-wider">Gold (g)</p>
            <p className="text-sm font-mono font-semibold text-gold-400 mt-0.5">
              {showBalance ? wallet?.goldBalance?.toFixed(4) || '0.0000' : '****'}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-dark-500 uppercase tracking-wider">Earned</p>
            <p className="text-sm font-mono font-semibold text-green-400 mt-0.5">
              {showBalance ? `₹${wallet?.totalCashEarned?.toLocaleString('en-IN') || '0'}` : '****'}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-dark-500 uppercase tracking-wider">Withdrawn</p>
            <p className="text-sm font-mono font-semibold text-blue-400 mt-0.5">
              {showBalance ? `₹${wallet?.totalWithdrawn?.toLocaleString('en-IN') || '0'}` : '****'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-5">
          <Link href="/mining" className="flex-1">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gold-gradient text-dark-900 text-xs font-bold haptic-button"
            >
              <Sparkles size={14} />
              Mine Gold
            </motion.button>
          </Link>
          <Link href="/withdraw" className="flex-1">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-dark-700 border border-dark-600 text-white text-xs font-semibold hover:bg-dark-600 transition-colors haptic-button"
            >
              <ArrowDownToLine size={14} />
              Withdraw
            </motion.button>
          </Link>
        </div>

        {/* Referral Code */}
        {user?.referralCode && (
          <div className="mt-4 flex items-center justify-between px-3 py-2 rounded-xl bg-dark-800/50 border border-dark-700/50">
            <div className="flex items-center gap-2">
              <Crown size={12} className="text-gold-400" />
              <span className="text-[10px] text-dark-400">Referral Code:</span>
              <span className="text-xs font-mono font-bold text-gold-400">{user.referralCode}</span>
            </div>
            <button
              onClick={copyReferralCode}
              className="p-1 text-dark-400 hover:text-gold-400 transition-colors"
            >
              <Copy size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}