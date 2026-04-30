export const runtime = 'edge';
'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Download,
  Loader2,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [period, setPeriod] = useState('30days');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?period=${period}`);
      const data = await res.json();
      if (res.ok) {
        setReport(data.stats);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">Business Analytics</h1>
          <p className="text-dark-500 text-sm mt-1 font-medium">Platform growth and revenue insights</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-dark-900/5 shadow-inner">
          {['7days', '30days', '90days', 'all'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === p
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-dark-400 hover:text-dark-100'
              }`}
            >
              {p === '7days' ? '7D' : p === '30days' ? '30D' : p === '90days' ? '90D' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 glass-card border-dark-900/10 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-red-500 mb-4" />
          <p className="text-dark-500 font-bold uppercase tracking-widest text-[10px]">Compiling report data...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 border-dark-900/10 shadow-sm group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-600">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-[10px] text-dark-500 uppercase font-bold tracking-widest">Total Users</p>
              <p className="text-2xl font-bold font-mono text-dark-50 mt-1">{report?.totalUsers || 0}</p>
            </div>
            
            <div className="glass-card p-5 border-dark-900/10 shadow-sm group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-600">
                  <DollarSign size={20} />
                </div>
              </div>
              <p className="text-[10px] text-dark-500 uppercase font-bold tracking-widest">Total Revenue</p>
              <p className="text-2xl font-bold font-mono text-dark-50 mt-1">₹{(report?.totalRevenue || 0).toLocaleString('en-IN')}</p>
            </div>

            <div className="glass-card p-5 border-dark-900/10 shadow-sm group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20 text-gold-600">
                  <TrendingUp size={20} />
                </div>
              </div>
              <p className="text-[10px] text-dark-500 uppercase font-bold tracking-widest">Active Plans</p>
              <p className="text-2xl font-bold font-mono text-dark-50 mt-1">{report?.activeSubscriptions || 0}</p>
            </div>

            <div className="glass-card p-5 border-dark-900/10 shadow-sm group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-600">
                  <BarChart3 size={20} />
                </div>
              </div>
              <p className="text-[10px] text-dark-500 uppercase font-bold tracking-widest">Withdrawals</p>
              <p className="text-2xl font-bold font-mono text-dark-50 mt-1">₹{(report?.totalWithdrawn || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="glass-card p-12 text-center border-dark-900/10 shadow-sm bg-white border-dashed">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-dark-900/5">
              <BarChart3 size={32} className="text-dark-400" />
            </div>
            <h4 className="text-dark-50 font-bold text-lg">Performance Visualization</h4>
            <p className="text-dark-500 text-sm mt-1">Data-rich charts for {period === 'all' ? 'all-time' : period} will be integrated here</p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="px-3 py-1 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-tight border border-blue-500/10">Growth Trends</div>
              <div className="px-3 py-1 rounded bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-tight border border-green-500/10">Revenue Streams</div>
              <div className="px-3 py-1 rounded bg-purple-500/10 text-purple-600 text-[10px] font-bold uppercase tracking-tight border border-purple-500/10">Mining Activity</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}