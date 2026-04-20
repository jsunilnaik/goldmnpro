'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CreditCard,
  Pickaxe,
  ArrowDownToLine,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  RefreshCw,
  Loader2,
  BarChart3,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';

export default function AdminStats({ stats, loading, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false);
  const [animatedValues, setAnimatedValues] = useState({});

  // Animate numbers on mount/update
  useEffect(() => {
    if (stats) {
      Object.keys(stats).forEach((key) => {
        const value = stats[key];
        if (typeof value === 'number') {
          animateValue(key, 0, value, 1000);
        }
      });
    }
  }, [stats]);

  const animateValue = (key, start, end, duration) => {
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + (end - start) * eased);
      setAnimatedValues((prev) => ({ ...prev, [key]: current }));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) await onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const statCards = [
    {
      id: 'totalUsers',
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      displayValue: animatedValues.totalUsers || 0,
      change: stats?.newUsersToday || 0,
      changeLabel: 'new today',
      changePositive: true,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      gradient: 'from-blue-500/10 to-blue-600/5',
    },
    {
      id: 'activeSubscriptions',
      title: 'Active Plans',
      value: stats?.activeSubscriptions || 0,
      displayValue: animatedValues.activeSubscriptions || 0,
      change: stats?.subscriptionRate || 0,
      changeLabel: '% conversion',
      changePositive: true,
      icon: CreditCard,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      gradient: 'from-green-500/10 to-green-600/5',
    },
    {
      id: 'totalRevenue',
      title: 'Total Revenue',
      value: stats?.totalRevenue || 0,
      displayValue: `₹${(animatedValues.totalRevenue || 0).toLocaleString('en-IN')}`,
      change: stats?.revenueToday || 0,
      changeLabel: `₹${(stats?.revenueToday || 0).toLocaleString('en-IN')} today`,
      changePositive: true,
      icon: DollarSign,
      color: 'text-gold-400',
      bg: 'bg-gold-500/10',
      borderColor: 'border-gold-500/20',
      gradient: 'from-gold-500/10 to-gold-600/5',
      isCurrency: true,
    },
    {
      id: 'activeMining',
      title: 'Active Mining',
      value: stats?.activeMining || 0,
      displayValue: animatedValues.activeMining || 0,
      change: null,
      changeLabel: 'sessions now',
      changePositive: true,
      icon: Pickaxe,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      gradient: 'from-purple-500/10 to-purple-600/5',
      pulse: (stats?.activeMining || 0) > 0,
    },
    {
      id: 'pendingWithdrawals',
      title: 'Pending Withdrawals',
      value: stats?.pendingWithdrawals || 0,
      displayValue: animatedValues.pendingWithdrawals || 0,
      change: stats?.pendingAmount || 0,
      changeLabel: `₹${(stats?.pendingAmount || 0).toLocaleString('en-IN')} pending`,
      changePositive: false,
      icon: ArrowDownToLine,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      gradient: 'from-yellow-500/10 to-yellow-600/5',
      alert: (stats?.pendingWithdrawals || 0) > 0,
    },
    {
      id: 'totalWithdrawn',
      title: 'Total Withdrawn',
      value: stats?.totalWithdrawn || 0,
      displayValue: `₹${(animatedValues.totalWithdrawn || 0).toLocaleString('en-IN')}`,
      change: null,
      changeLabel: 'all time',
      changePositive: true,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      gradient: 'from-cyan-500/10 to-cyan-600/5',
      isCurrency: true,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-dark-700 rounded w-40 animate-pulse" />
          <div className="h-8 bg-dark-700 rounded w-24 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-3 bg-dark-700 rounded w-20" />
                <div className="w-8 h-8 bg-dark-700 rounded-lg" />
              </div>
              <div className="h-8 bg-dark-700 rounded w-24 mb-2" />
              <div className="h-3 bg-dark-700 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-red-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-dark-300">
            Platform Overview
          </h2>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-600 text-xs text-dark-300 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw
            size={12}
            className={refreshing ? 'animate-spin' : ''}
          />
          Refresh
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
              className={`relative overflow-hidden glass-card p-4 md:p-5 border ${stat.borderColor} hover:border-opacity-50 transition-all group`}
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`}
              />

              {/* Alert Pulse for Pending Items */}
              {stat.alert && (
                <div className="absolute top-2 right-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
                  </span>
                </div>
              )}

              {/* Active Pulse */}
              {stat.pulse && (
                <div className="absolute top-2 right-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] md:text-xs text-dark-400 uppercase tracking-wider font-medium">
                    {stat.title}
                  </span>
                  <div
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-lg ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    <Icon size={14} className={stat.color} />
                  </div>
                </div>

                <p className="text-xl md:text-2xl font-bold font-mono">
                  {stat.isCurrency
                    ? stat.displayValue
                    : stat.displayValue.toLocaleString('en-IN')}
                </p>

                {/* Change Indicator */}
                <div className="flex items-center gap-1 mt-1.5">
                  {stat.change !== null && stat.change > 0 && (
                    <div
                      className={`flex items-center gap-0.5 ${
                        stat.changePositive
                          ? 'text-green-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {stat.changePositive ? (
                        <TrendingUp size={10} />
                      ) : (
                        <Clock size={10} />
                      )}
                      <span className="text-[10px] font-medium">
                        +{typeof stat.change === 'number'
                          ? stat.change
                          : stat.change}
                      </span>
                    </div>
                  )}
                  <span className="text-[10px] text-dark-500">
                    {stat.changeLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Summary Bar */}
      <div className="glass-card p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-dark-400">System Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={12} className="text-green-400" />
            <span className="text-dark-400">
              {stats?.activeMining || 0} active sessions
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-dark-500">
          <Clock size={12} />
          <span>
            Updated{' '}
            {new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}