'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  Pickaxe,
  CreditCard,
  Gift,
  ArrowDownToLine,
  Loader2,
} from 'lucide-react';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [filter, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        type: filter,
      });
      const res = await fetch(`/api/wallet/history?${params}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `Error ${res.status}: Server returned HTML instead of JSON` }));
        throw new Error(errorData.message || 'Failed to fetch transactions');
      }

      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const typeIcons = {
    plan_purchase: CreditCard,
    mining_reward: Pickaxe,
    referral_bonus: Gift,
    withdrawal: ArrowDownToLine,
    bonus: Gift,
  };

  const typeColors = {
    plan_purchase: 'text-purple-600 bg-purple-500/10 border border-purple-500/10',
    mining_reward: 'text-gold-600 bg-gold-500/10 border border-gold-500/10',
    referral_bonus: 'text-blue-600 bg-blue-500/10 border border-blue-500/10',
    withdrawal: 'text-red-600 bg-red-500/10 border border-red-500/10',
    bonus: 'text-green-600 bg-green-500/10 border border-green-500/10',
  };

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'mining_reward', label: 'Mining' },
    { value: 'plan_purchase', label: 'Plans' },
    { value: 'referral_bonus', label: 'Referral' },
    { value: 'withdrawal', label: 'Withdrawal' },
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold text-dark-50">Transactions</h1>
        <p className="text-dark-500 text-sm mt-1 font-medium italic">Complete transaction history</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all haptic-button ${
              filter === f.value
                ? 'bg-gold-500/10 text-gold-600 border border-gold-500/30 shadow-sm'
                : 'bg-white text-dark-500 border border-dark-800 hover:border-dark-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-dark-700 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-dark-700 rounded w-32 mb-2" />
                  <div className="h-3 bg-dark-700 rounded w-24" />
                </div>
                <div className="h-5 bg-dark-700 rounded w-16" />
              </div>
            </div>
          ))
        ) : transactions.length > 0 ? (
          transactions.map((tx) => {
            const Icon = typeIcons[tx.type] || History;
            const colorClass = typeColors[tx.type] || 'text-dark-400 bg-dark-700';
            const [textColor, bgColor] = colorClass.split(' ');

            return (
              <motion.div
                key={tx._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={textColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-dark-100 truncate">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-dark-500 font-medium">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      tx.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                      tx.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                      'bg-red-500/10 text-red-600'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono font-bold ${
                    tx.category === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.category === 'credit' ? '+' : '-'}₹{tx.amount?.toFixed(2)}
                  </p>
                  {tx.points > 0 && (
                    <p className="text-[10px] text-dark-500 font-medium">{tx.points?.toFixed(2)} pts</p>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="glass-card p-8 text-center">
            <History className="w-10 h-10 text-dark-400 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">No transactions found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 rounded-lg bg-white border border-dark-800 shadow-sm disabled:opacity-30 haptic-button"
          >
            <ChevronLeft size={16} className="text-dark-50" />
          </button>
          <span className="text-sm text-dark-500 font-bold uppercase tracking-widest">Page {page} <span className="text-dark-300">/</span> {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2.5 rounded-lg bg-white border border-dark-800 shadow-sm disabled:opacity-30 haptic-button"
          >
            <ChevronRight size={16} className="text-dark-50" />
          </button>
        </div>
      )}
    </div>
  );
}