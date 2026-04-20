'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';

export default function EarningsChart({ transactions = [] }) {
  const [period, setPeriod] = useState('7d');

  const chartData = useMemo(() => {
    const now = new Date();
    let days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayEarnings = transactions
        .filter(tx => {
          const txDate = new Date(tx.createdAt);
          return tx.category === 'credit' && txDate >= date && txDate < nextDate;
        })
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);

      data.push({
        date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        shortDate: date.toLocaleDateString('en-IN', { day: 'numeric' }),
        amount: dayEarnings,
      });
    }

    return data;
  }, [transactions, period]);

  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);
  const totalEarnings = chartData.reduce((sum, d) => sum + d.amount, 0);
  const avgDaily = totalEarnings / chartData.length;

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 size={16} className="text-green-400" />
            Earnings
          </h3>
          <p className="text-xs text-dark-400 mt-0.5">
            Total: <span className="text-green-400 font-mono">₹{totalEarnings.toFixed(2)}</span>
            {' • '}
            Avg: <span className="text-dark-300 font-mono">₹{avgDaily.toFixed(2)}/day</span>
          </p>
        </div>
        <div className="flex gap-1 bg-dark-800/50 p-0.5 rounded-lg">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                period === p
                  ? 'bg-gold-500/20 text-gold-400'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-32 flex items-end gap-[2px] md:gap-1">
        {chartData.map((item, i) => {
          const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
          const showLabel = chartData.length <= 14 || i % Math.ceil(chartData.length / 7) === 0;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-dark-800 border border-dark-600 rounded-lg px-2 py-1 text-[9px] text-center whitespace-nowrap shadow-lg">
                  <p className="text-dark-400">{item.date}</p>
                  <p className="text-gold-400 font-mono font-bold">₹{item.amount.toFixed(2)}</p>
                </div>
              </div>

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 2)}%` }}
                transition={{ delay: i * 0.02, duration: 0.4, ease: 'easeOut' }}
                className={`w-full rounded-t-sm transition-colors cursor-pointer ${
                  item.amount > 0
                    ? 'bg-gradient-to-t from-green-500/40 to-green-400/70 group-hover:from-green-500/60 group-hover:to-green-400/90'
                    : 'bg-dark-700/30'
                }`}
              />

              {/* Label */}
              {showLabel && (
                <span className="text-[8px] text-dark-500 mt-1 truncate w-full text-center">
                  {item.shortDate}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* No data message */}
      {totalEarnings === 0 && (
        <div className="text-center mt-4">
          <p className="text-dark-500 text-xs">No earnings data for this period</p>
        </div>
      )}
    </div>
  );
}