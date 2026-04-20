'use client';

import { motion } from 'framer-motion';
import { Sparkles, Timer, Zap, TrendingUp, Award, Target } from 'lucide-react';

export default function MiningStats({
  points = 0,
  elapsed = 0,
  miningRate = 0,
  todayEarnings = 0,
  isMining = false,
  maturity = { pendingValue: 0, lastReleaseAt: null }
}) {
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const stats = [
    {
      label: 'Points Earned',
      value: points.toFixed(4),
      icon: Sparkles,
      color: 'text-gold-400',
      bg: 'bg-gold-500/10',
      border: 'border-gold-500/20',
      animate: isMining,
    },
    {
      label: 'Gold Reserves',
      value: `₹${(maturity?.pendingValue || 0).toFixed(2)}`,
      icon: Award,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      animate: (maturity?.pendingValue || 0) > 0,
    },
    {
      label: 'Mining Rate',
      value: `${miningRate}/hr`,
      icon: Zap,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      animate: false,
    },
    {
      label: "Today's Earnings",
      value: `₹${todayEarnings.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      animate: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-card p-3.5 text-center border ${stat.border} ${
              stat.animate ? 'animate-pulse-gold' : ''
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <Icon size={13} className={stat.color} />
              <span className="text-[10px] text-dark-400 uppercase tracking-wider font-medium">
                {stat.label}
              </span>
            </div>
            <p className={`text-lg font-mono font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}