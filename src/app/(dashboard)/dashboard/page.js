export const runtime = 'edge';
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Pickaxe,
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  Crown,
  ChevronRight,
  Clock,
  Gift,
  Zap,
  Calendar,
  BarChart3,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, wallet } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setLoading(false);
      return;
    }

    try {
      const [statsRes, txRes] = await Promise.all([
        fetch('/api/mining/status'),
        fetch('/api/wallet/history?limit=5'),
      ]);
      const statsData = await statsRes.json();
      const txData = await txRes.json();
      setStats(statsData);
      setRecentTx(txData.transactions || []);
    } catch (error) {
      // Silently handle network errors
      if (error.name === 'TypeError' && (error.message === 'Failed to fetch' || error.message?.includes('network'))) return;

      if (typeof navigator !== 'undefined' && navigator.onLine) {
        console.error('Dashboard data error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick Actions
  const quickActions = [
    { href: '/mining', icon: Pickaxe, label: 'Start Mining', color: 'text-gold-600', bg: 'bg-gold-500/10' },
    { href: '/plans', icon: Crown, label: 'Buy Plan', color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { href: '/withdraw', icon: ArrowDownToLine, label: 'Withdraw', color: 'text-green-600', bg: 'bg-green-500/10' },
    { href: '/referrals', icon: Gift, label: 'Refer & Earn', color: 'text-blue-600', bg: 'bg-blue-500/10' },
  ];

  // Withdrawal Date Info
  const withdrawalDateConfig = process.env.NEXT_PUBLIC_WITHDRAWAL_DATE || '15';
  const now = new Date();
  let daysUntilWithdrawal = 0;
  let nextWithdrawalDate = new Date();

  if (withdrawalDateConfig === 'daily') {
    daysUntilWithdrawal = 0;
    nextWithdrawalDate = now;
  } else {
    const withdrawalDate = parseInt(withdrawalDateConfig.split(',')[0]);
    nextWithdrawalDate = new Date(now.getFullYear(), now.getMonth(), withdrawalDate);
    if (nextWithdrawalDate < now) {
      nextWithdrawalDate.setMonth(nextWithdrawalDate.getMonth() + 1);
    }
    daysUntilWithdrawal = Math.ceil((nextWithdrawalDate - now) / (1000 * 60 * 60 * 24));
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl font-display font-bold truncate">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
          <span className="text-gold-shimmer">{user?.fullName?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-dark-400 text-sm mt-1">Here's your mining overview</p>
      </motion.div>

      {/* Wallet Overview Card */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-white border border-gold-500/30 p-5 shadow-sm"
      >
        {/* Decorative Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <p className="text-dark-500 text-xs uppercase tracking-wider font-semibold">Total Balance</p>
          <h2 className="text-3xl font-mono font-bold text-dark-50 mt-1">
            ₹{wallet?.cashBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="min-w-0">
              <p className="text-[10px] text-dark-400 uppercase font-bold truncate">Points</p>
              <p className="text-sm font-mono font-bold text-dark-100 truncate">{wallet?.pointsBalance?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-dark-400 uppercase font-bold truncate">Gold (g)</p>
              <p className="text-sm font-mono font-bold text-gold-600 truncate">{wallet?.goldBalance?.toFixed(4) || '0.0000'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-dark-400 uppercase font-bold truncate">Withdrawn</p>
              <p className="text-sm font-mono font-bold text-green-600 truncate">₹{wallet?.totalWithdrawn?.toLocaleString('en-IN') || '0'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-dark-400 uppercase font-bold truncate">Total Invested</p>
              <p className="text-sm font-mono font-bold text-indigo-500 truncate">₹{wallet?.totalInvestment?.toLocaleString('en-IN') || '0'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <motion.div
                whileTap={{ scale: 0.93 }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl glass-card haptic-button"
              >
                <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center`}>
                  <Icon size={20} className={action.color} />
                </div>
                <span className="text-[10px] text-dark-300 font-medium text-center leading-tight">
                  {action.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>

      {/* Withdrawal Countdown */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-4 flex items-center gap-3 border border-blue-500/10"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <Calendar size={20} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-dark-50 truncate">Next Withdrawal Window</p>
          <p className="text-xs text-dark-400 truncate">
            {nextWithdrawalDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-blue-600">{daysUntilWithdrawal}</p>
          <p className="text-[10px] text-dark-400 font-bold uppercase tracking-tighter">days left</p>
        </div>
      </motion.div>

      {/* Active Plan */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold flex items-center gap-2 text-dark-50">
            <Crown size={16} className="text-gold-600" />
            Active Plan
          </h3>
          <Link href="/plans" className="text-xs text-gold-600 font-bold flex items-center gap-1">
            Upgrade <ChevronRight size={14} />
          </Link>
        </div>

        {user?.currentPlan ? (
          <div className="glass-card p-4 border border-gold-500/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-gold-600">
                  {user.currentPlan.plan?.name || 'Active'} Plan
                </p>
                <p className="text-xs text-dark-400 mt-1">
                  Expires: {new Date(user.currentPlan.endDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-dark-400 uppercase font-bold">Mining Rate</p>
                <p className="text-sm font-mono font-bold text-dark-100">
                  {user.currentPlan.plan?.miningRate || 0} pts/hr
                </p>
              </div>
            </div>


            {/* Sessions Progress */}
            <div className="mb-4 grid grid-cols-3 gap-2 bg-slate-50 border border-dark-100/10 rounded-2xl p-3 shadow-sm">
               <div className="text-center">
                  <p className="text-[9px] text-dark-500 uppercase font-black tracking-tighter mb-1">Daily</p>
                  <p className="text-sm font-black text-gold-600">{stats?.sessionsToday || 0} / {stats?.dailySessionLimit || 1}</p>
               </div>
               <div className="w-[1px] h-8 bg-dark-100/10 mx-auto" />
               <div className="text-center">
                  <p className="text-[9px] text-dark-500 uppercase font-black tracking-tighter mb-1">Plan Total</p>
                  <p className="text-sm font-black text-dark-200">{stats?.sessionsCompleted || 0} / {stats?.totalSessionsLimit || 0}</p>
               </div>
            </div>

            {/* Earning Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-[10px] text-dark-400 uppercase font-bold">Earning Progress (2X Cap)</p>
                <p className="text-xs font-mono font-bold text-gold-600">
                  {Math.min(100, ((stats?.subscription?.totalValueEarned || 0) / ((stats?.subscription?.amountPaid || 1) * 2)) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden border border-dark-700 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((stats?.subscription?.totalValueEarned || 0) / ((stats?.subscription?.amountPaid || 1) * 2)) * 100)}%` }}
                  className="h-full bg-gold-gradient shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                />
              </div>
              <div className="flex justify-between text-[10px] text-dark-500 font-bold uppercase tracking-wider">
                <span>Earned: ₹{(stats?.subscription?.totalValueEarned || 0).toFixed(2)}</span>
                <span>Potential: ₹{((stats?.subscription?.amountPaid || 0) * 2).toFixed(2)}</span>
              </div>
            </div>

          </div>
        ) : (
          <Link href="/plans">
            <div className="glass-card p-4 border border-dashed border-dark-700 text-center">
              <p className="text-dark-500 text-sm">No active plan</p>
              <p className="text-gold-600 text-xs font-bold mt-1">Subscribe to start mining →</p>
            </div>
          </Link>
        )}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold flex items-center gap-2 text-dark-50">
            <BarChart3 size={16} className="text-blue-600" />
            Recent Activity
          </h3>
          <Link href="/transactions" className="text-xs text-blue-600 font-bold flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="space-y-2">
          {recentTx.length > 0 ? (
            recentTx.map((tx) => (
              <div key={tx._id} className="glass-card p-3 flex items-center gap-3 border border-dark-800">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tx.category === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {tx.category === 'credit' ? (
                    <TrendingUp size={16} className="text-green-600" />
                  ) : (
                    <ArrowDownToLine size={16} className="text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-dark-100 truncate">{tx.description}</p>
                  <p className="text-[10px] text-dark-400">
                    {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <p className={`text-sm font-mono font-bold ${
                  tx.category === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.category === 'credit' ? '+' : '-'}₹{tx.amount?.toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <div className="glass-card p-6 text-center border border-dashed border-dark-700">
              <p className="text-dark-400 text-sm italic">No transactions yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}