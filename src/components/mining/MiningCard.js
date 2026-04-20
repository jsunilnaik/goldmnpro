'use client';

import { motion } from 'framer-motion';
import { Zap, Clock, TrendingUp, Sparkles, Crown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MiningCard({ subscription, isMining, todayEarnings = 0, onStartMining }) {
  if (!subscription) {
    return (
      <Link href="/plans">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="glass-card p-5 border border-dashed border-gold-500/30 text-center haptic-button"
        >
          <Crown size={32} className="text-gold-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gold-400">No Active Plan</h3>
          <p className="text-xs text-dark-400 mt-1">Subscribe to a plan to start mining gold</p>
          <div className="flex items-center justify-center gap-1 mt-3 text-gold-400 text-sm font-semibold">
            View Plans <ChevronRight size={16} />
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <div className="glass-card p-5 border border-gold-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center">
            <Crown size={16} className="text-gold-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gold-400">{subscription.planName} Plan</p>
            <p className="text-[10px] text-dark-400">{subscription.daysRemaining} days remaining</p>
          </div>
        </div>
        {isMining && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-[10px] text-green-400 font-semibold">Mining</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dark-800/50 rounded-xl p-2.5 text-center">
          <Zap size={14} className="text-gold-400 mx-auto mb-1" />
          <p className="text-xs font-mono font-bold">{subscription.miningRate}</p>
          <p className="text-[8px] text-dark-500">pts/hr</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl p-2.5 text-center">
          <TrendingUp size={14} className="text-green-400 mx-auto mb-1" />
          <p className="text-xs font-mono font-bold text-green-400">₹{todayEarnings.toFixed(2)}</p>
          <p className="text-[8px] text-dark-500">today</p>
        </div>
        <div className="bg-dark-800/50 rounded-xl p-2.5 text-center">
          <Clock size={14} className="text-blue-400 mx-auto mb-1" />
          <p className="text-xs font-mono font-bold">{subscription.daysRemaining}</p>
          <p className="text-[8px] text-dark-500">days left</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-[9px] text-dark-500 mb-1">
          <span>Plan Progress</span>
          <span>{Math.max(0, 100 - (subscription.daysRemaining / 30) * 100).toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, 100 - (subscription.daysRemaining / 30) * 100)}%` }}
            className="h-full bg-gold-gradient rounded-full"
          />
        </div>
      </div>
    </div>
  );
}