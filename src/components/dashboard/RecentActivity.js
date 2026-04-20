'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  ArrowDownToLine,
  Pickaxe,
  CreditCard,
  Gift,
  ChevronRight,
  History,
  Clock,
} from 'lucide-react';

const typeIcons = {
  plan_purchase: CreditCard,
  mining_reward: Pickaxe,
  referral_bonus: Gift,
  withdrawal: ArrowDownToLine,
  bonus: Gift,
  refund: TrendingUp,
};

const typeColors = {
  plan_purchase: { text: 'text-purple-400', bg: 'bg-purple-500/10' },
  mining_reward: { text: 'text-gold-400', bg: 'bg-gold-500/10' },
  referral_bonus: { text: 'text-blue-400', bg: 'bg-blue-500/10' },
  withdrawal: { text: 'text-red-400', bg: 'bg-red-500/10' },
  bonus: { text: 'text-green-400', bg: 'bg-green-500/10' },
  refund: { text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
};

export default function RecentActivity({ transactions = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-3.5 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-dark-700 rounded-xl" />
              <div className="flex-1">
                <div className="h-3.5 bg-dark-700 rounded w-32 mb-1.5" />
                <div className="h-2.5 bg-dark-700 rounded w-20" />
              </div>
              <div className="h-4 bg-dark-700 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <History size={16} className="text-blue-400" />
          Recent Activity
        </h3>
        <Link href="/transactions" className="text-xs text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors">
          View All <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-2">
        {transactions.length > 0 ? (
          transactions.map((tx, i) => {
            const Icon = typeIcons[tx.type] || History;
            const colors = typeColors[tx.type] || { text: 'text-dark-400', bg: 'bg-dark-700' };

            return (
              <motion.div
                key={tx._id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-3 flex items-center gap-3 hover:bg-dark-800/60 transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={16} className={colors.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={9} className="text-dark-500" />
                    <span className="text-[10px] text-dark-500">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <p className={`text-sm font-mono font-semibold shrink-0 ${
                  tx.category === 'credit' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tx.category === 'credit' ? '+' : '-'}₹{tx.amount?.toFixed(2)}
                </p>
              </motion.div>
            );
          })
        ) : (
          <div className="glass-card p-8 text-center">
            <History className="w-8 h-8 text-dark-600 mx-auto mb-2" />
            <p className="text-dark-400 text-sm">No recent activity</p>
            <p className="text-dark-500 text-[10px] mt-1">Start mining to see transactions</p>
          </div>
        )}
      </div>
    </div>
  );
}