export const runtime = 'edge';
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  Pickaxe,
  Gift,
  Eye,
  EyeOff,
  ChevronRight,
  Loader2,
} from 'lucide-react';

export default function WalletPage() {
  const { wallet, refreshWallet } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTransactions();
    refreshWallet();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      const res = await fetch('/api/wallet/history?limit=10');
      const data = await res.json();
      if (res.ok) {
        setRecentTx(data.transactions || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-gold-shimmer">My Wallet</h1>
        <p className="text-dark-400 text-sm mt-1">Your earnings and balance</p>
      </div>

      {/* Main Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-gold-500/30 p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="flex items-center justify-between mb-2">
          <p className="text-dark-500 text-xs uppercase tracking-widest font-bold">Total Balance</p>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-dark-400 hover:text-dark-200 p-1.5 rounded-lg bg-dark-900 border border-dark-800 transition-colors"
          >
            {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        <h2 className="text-4xl font-mono font-bold text-dark-50 relative z-10">
          {showBalance
            ? `₹${wallet?.cashBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`
            : '₹ ****.**'
          }
        </h2>

        <div className="grid grid-cols-3 gap-4 mt-8 relative z-10 border-t border-dark-800 pt-6">
          <div>
            <p className="text-[10px] text-dark-500 uppercase font-bold">Points</p>
            <p className="text-sm font-mono font-bold text-dark-100">
              {showBalance ? wallet?.pointsBalance?.toFixed(2) || '0.00' : '****'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-dark-500 uppercase font-bold">Gold (g)</p>
            <p className="text-sm font-mono font-bold text-gold-600">
              {showBalance ? wallet?.goldBalance?.toFixed(4) || '0.0000' : '****'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-dark-500 uppercase font-bold">Pending</p>
            <p className="text-sm font-mono font-bold text-amber-600">
              {showBalance ? `₹${wallet?.pendingWithdrawal || 0}` : '****'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/mining">
          <motion.div whileTap={{ scale: 0.95 }} className="glass-card p-4 text-center haptic-button border-dark-800">
            <Pickaxe size={20} className="text-gold-600 mx-auto mb-2" />
            <span className="text-xs text-dark-500 font-bold">Mine</span>
          </motion.div>
        </Link>
        <Link href="/withdraw">
          <motion.div whileTap={{ scale: 0.95 }} className="glass-card p-4 text-center haptic-button border-dark-800">
            <ArrowDownToLine size={20} className="text-green-600 mx-auto mb-2" />
            <span className="text-xs text-dark-500 font-bold">Withdraw</span>
          </motion.div>
        </Link>
        <Link href="/referrals">
          <motion.div whileTap={{ scale: 0.95 }} className="glass-card p-4 text-center haptic-button border-dark-800">
            <Gift size={20} className="text-blue-600 mx-auto mb-2" />
            <span className="text-xs text-dark-500 font-bold">Refer</span>
          </motion.div>
        </Link>
      </div>

      {/* Lifetime Stats */}
      <div className="glass-card p-6 border-dark-800">
        <h3 className="text-sm font-bold mb-4 text-dark-50 uppercase tracking-wider">Lifetime Stats</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] text-dark-500 uppercase font-bold">Total Earned</p>
            <p className="text-lg font-mono font-bold text-green-600">
              ₹{wallet?.totalCashEarned?.toLocaleString('en-IN') || '0'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-dark-500 uppercase font-bold">Total Withdrawn</p>
            <p className="text-lg font-mono font-bold text-blue-600">
              ₹{wallet?.totalWithdrawn?.toLocaleString('en-IN') || '0'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-dark-500 uppercase font-bold">Total Points</p>
            <p className="text-lg font-mono font-bold text-dark-100">
              {wallet?.totalPointsEarned?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-dark-500 uppercase font-bold">Referral Earnings</p>
            <p className="text-lg font-mono font-bold text-purple-600">
              ₹{wallet?.totalReferralEarnings?.toLocaleString('en-IN') || '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-sm font-bold text-dark-50">Recent Transactions</h3>
          <Link href="/transactions" className="text-xs text-gold-600 font-bold flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="space-y-2">
          {recentTx.map((tx) => (
            <div key={tx._id} className="glass-card p-3 flex items-center gap-3 border-dark-800">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
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
                <p className="text-[10px] text-dark-500 font-medium">
                  {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <p className={`text-sm font-mono font-bold ${
                tx.category === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {tx.category === 'credit' ? '+' : '-'}₹{tx.amount?.toFixed(2)}
              </p>
            </div>
          ))}
          {recentTx.length === 0 && (
            <div className="glass-card p-6 text-center">
              <p className="text-dark-400 text-sm">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}