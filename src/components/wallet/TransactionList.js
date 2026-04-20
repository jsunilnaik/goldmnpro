'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  TrendingUp,
  ArrowDownToLine,
  Pickaxe,
  CreditCard,
  Gift,
  Filter,
  ChevronDown,
  Loader2,
  Search,
  Calendar,
  Clock,
  X,
} from 'lucide-react';

const typeConfig = {
  plan_purchase: {
    icon: CreditCard,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    label: 'Plan Purchase',
  },
  mining_reward: {
    icon: Pickaxe,
    color: 'text-gold-400',
    bg: 'bg-gold-500/10',
    label: 'Mining Reward',
  },
  referral_bonus: {
    icon: Gift,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    label: 'Referral Bonus',
  },
  withdrawal: {
    icon: ArrowDownToLine,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    label: 'Withdrawal',
  },
  bonus: {
    icon: Gift,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    label: 'Bonus',
  },
  refund: {
    icon: TrendingUp,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    label: 'Refund',
  },
  adjustment: {
    icon: History,
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    label: 'Adjustment',
  },
};

export default function TransactionList({
  transactions = [],
  loading = false,
  showFilter = true,
  showSearch = false,
  maxItems,
  emptyMessage = 'No transactions found',
  onLoadMore,
  hasMore = false,
}) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'mining_reward', label: 'Mining' },
    { value: 'plan_purchase', label: 'Plans' },
    { value: 'referral_bonus', label: 'Referral' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'bonus', label: 'Bonus' },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        tx.description?.toLowerCase().includes(q) ||
        tx.type?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const displayedTransactions = maxItems
    ? filteredTransactions.slice(0, maxItems)
    : filteredTransactions;

  const handleLoadMore = async () => {
    setLoadingMore(true);
    if (onLoadMore) await onLoadMore();
    setLoadingMore(false);
  };

  // Group by date
  const groupedTransactions = displayedTransactions.reduce((groups, tx) => {
    const date = new Date(tx.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(tx);
    return groups;
  }, {});

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-3.5 animate-pulse flex items-center gap-3">
            <div className="w-9 h-9 bg-dark-700 rounded-xl shrink-0" />
            <div className="flex-1">
              <div className="h-3.5 bg-dark-700 rounded w-3/4 mb-1.5" />
              <div className="h-2.5 bg-dark-700 rounded w-1/2" />
            </div>
            <div className="h-4 bg-dark-700 rounded w-14" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search & Filter */}
      {(showFilter || showSearch) && (
        <div className="space-y-2">
          {showSearch && (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-8 py-2 text-xs outline-none focus:border-gold-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {showFilter && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                    filter === f.value
                      ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                      : 'bg-dark-800 text-dark-400 border border-dark-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transaction Groups */}
      {Object.keys(groupedTransactions).length > 0 ? (
        Object.entries(groupedTransactions).map(([date, txs]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <Calendar size={10} className="text-dark-500" />
              <span className="text-[10px] text-dark-500 font-medium uppercase tracking-wider">
                {date}
              </span>
              <div className="flex-1 h-px bg-dark-700/50" />
            </div>

            {/* Transactions */}
            <div className="space-y-1.5">
              {txs.map((tx, i) => {
                const config = typeConfig[tx.type] || typeConfig.adjustment;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={tx._id || i}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-card p-3 flex items-center gap-3 hover:bg-dark-800/60 transition-colors group"
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={16} className={config.color} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={9} className="text-dark-500" />
                        <span className="text-[10px] text-dark-500">{formatTime(tx.createdAt)}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded capitalize font-medium ${
                          tx.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                          tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-mono font-semibold ${
                        tx.category === 'credit' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {tx.category === 'credit' ? '+' : '-'}₹{tx.amount?.toFixed(2)}
                      </p>
                      {tx.points > 0 && (
                        <p className="text-[9px] text-dark-500 font-mono">
                          {tx.points?.toFixed(2)} pts
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <div className="glass-card p-8 text-center">
          <History className="w-8 h-8 text-dark-600 mx-auto mb-2" />
          <p className="text-dark-400 text-sm">{emptyMessage}</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="w-full py-3 rounded-xl bg-dark-800 border border-dark-600 text-xs font-semibold text-dark-300 hover:text-white hover:border-dark-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loadingMore ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <>Load More</>
          )}
        </motion.button>
      )}
    </div>
  );
}