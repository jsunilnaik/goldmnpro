export const runtime = 'edge';
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Landmark, TrendingUp, TrendingDown, Clock, 
  ShieldAlert, ShieldCheck, Activity, BarChart3, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TreasuryDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTreasuryData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/treasury');
      const json = await res.json();
      
      if (res.ok) {
        setData(json);
      } else {
        toast.error(json.message || 'Failed to fetch treasury data');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTreasuryData();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchTreasuryData, 30000);
    return () => clearInterval(interval);
  }, []);

  const togglePause = async (action) => {
    if (!confirm(`Are you sure you want to ${action} withdrawals?`)) return;

    try {
      const res = await fetch('/api/admin/treasury', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: `Manually ${action}d by ${user.email}` }),
      });
      const json = await res.json();

      if (res.ok) {
        toast.success(json.message);
        fetchTreasuryData();
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!data || !data.stats) return <div>Failed to load treasury</div>;

  const { stats, configs } = data;
  const isPaused = stats.isWithdrawalPaused;

  // Format currency
  const formatINR = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <Landmark className="text-indigo-500" />
            Treasury Management
          </h1>
          <p className="text-sm text-dark-400 mt-1">
            Global fund pool tracking and liquidity controls. Zero company capital.
          </p>
        </div>
        <button 
          onClick={fetchTreasuryData}
          disabled={refreshing}
          className="px-4 py-2 bg-white border border-dark-900/10 rounded-xl text-sm font-semibold text-dark-500 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Auto-Pause Alert */}
      {isPaused && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-red-600 border-b border-red-500/10 pb-2 mb-2">WITHDRAWALS PAUSED</h3>
            <p className="text-sm text-red-800 mb-3">{stats.pauseReason || 'Withdrawals are currently paused.'}</p>
            <button 
              onClick={() => togglePause('resume')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition shadow-sm shadow-red-500/20"
            >
              Force Resume Withdrawals
            </button>
          </div>
        </div>
      )}

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Inflow */}
        <div className="bg-white rounded-2xl p-5 border border-dark-900/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp size={64} />
          </div>
          <p className="text-sm font-bold text-dark-400 mb-1">Total Inflow</p>
          <h3 className="text-3xl font-display font-bold text-dark-50">{formatINR(stats.totalInflow)}</h3>
          <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
            ↑ Subscriptions: {stats.totalSubscriptions}
          </p>
        </div>

        {/* Available Pool */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700 shadow-sm relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl"></div>
          <div className="relative">
            <p className="text-sm font-medium text-slate-400 mb-1">Available Pool</p>
            <h3 className="text-3xl font-display font-bold text-white">{formatINR(stats.availablePool)}</h3>
            <p className="text-xs text-indigo-300 font-medium mt-2">
              Liquid funds ready for payout
            </p>
          </div>
        </div>

        {/* Reserved Funds */}
        <div className="bg-white rounded-2xl p-5 border border-dark-900/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Clock size={64} />
          </div>
          <p className="text-sm font-bold text-dark-400 mb-1">Reserved Funds</p>
          <h3 className="text-3xl font-display font-bold text-dark-50">{formatINR(stats.reservedFunds)}</h3>
          <p className="text-xs text-amber-500 font-bold mt-2 flex items-center gap-1">
            Pending withdrawals
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pool Health */}
        <div className="bg-white rounded-2xl p-6 border border-dark-900/10 shadow-sm">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Activity className="text-blue-500" />
            Pool Health Guard
          </h3>
          
          <div className="mb-6 relative">
            <div className="flex justify-between text-xs font-bold text-dark-400 mb-2">
              <span>0%</span>
              <span>Reserve: {configs.reserveRatio}%</span>
              <span>100%</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative border border-dark-900/5">
              {/* Threshold marker */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10" 
                style={{ left: `${configs.reserveRatio}%` }}
              ></div>
              {/* Progress bar */}
              <div 
                className={`h-full transition-all duration-1000 ${
                  stats.healthPercent < configs.reserveRatio ? 'bg-red-500' :
                  stats.healthPercent < 40 ? 'bg-amber-400' : 
                  'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, stats.healthPercent))}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-dark-900/5">
              <p className="text-xs text-dark-400 font-bold mb-1">Current Health</p>
              <p className={`text-2xl font-bold ${
                 stats.healthPercent < configs.reserveRatio ? 'text-red-500' :
                 stats.healthPercent < 40 ? 'text-amber-500' : 
                 'text-emerald-500'
              }`}>{stats.healthPercent}%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-dark-900/5">
              <p className="text-xs text-dark-400 font-bold mb-1">System Status</p>
              <div className="flex items-center gap-1.5 mt-1">
                {isPaused ? (
                  <><ShieldAlert size={18} className="text-red-500" /> <span className="font-bold text-red-500 text-sm">Paused</span></>
                ) : (
                  <><ShieldCheck size={18} className="text-emerald-500" /> <span className="font-bold text-emerald-500 text-sm">Active & Safe</span></>
                )}
              </div>
            </div>
          </div>

          {!isPaused && (
            <button 
              onClick={() => togglePause('pause')}
              className="w-full py-3 bg-white border border-dark-900/10 rounded-xl text-sm font-bold text-dark-400 hover:bg-slate-50 transition shadow-sm"
            >
              Manually Pause Withdrawals
            </button>
          )}
        </div>

        {/* Daily Tracker */}
        <div className="bg-white rounded-2xl p-6 border border-dark-900/10 shadow-sm">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
            <BarChart3 className="text-purple-500" />
            Daily Payout Tracker
          </h3>
          
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-3xl font-display font-bold text-dark-50 tracking-tight">
                  {formatINR(stats.todayOutflow)}
                </p>
                <p className="text-xs font-bold text-dark-400 mt-1">
                  Disbursed Today ({stats.todayWithdrawalCount} payouts)
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-dark-200">
                  Daily Cap: {formatINR(stats.dailyCap)}
                </p>
              </div>
            </div>

            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-dark-900/5 mt-4">
              <div 
                className={`h-full bg-purple-500 transition-all duration-1000 ${stats.dailyCapPercent > 90 ? 'bg-red-500' : ''}`}
                style={{ width: `${Math.min(100, stats.dailyCapPercent)}%` }}
              ></div>
            </div>
            {stats.dailyCapPercent >= 100 && (
              <p className="text-xs text-red-500 font-bold mt-2">Daily cap reached. Further withdrawals automatically blocked.</p>
            )}
          </div>

          <div className="border-t border-dark-900/10 pt-5">
            <h4 className="text-xs font-bold text-dark-300 uppercase tracking-wider mb-4">Total Deductions Retained</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-dark-500 mb-1">TDS Withheld (30%)</p>
                <p className="text-lg font-bold text-slate-700">{formatINR(stats.totalTdsRetained)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-dark-500 mb-1">Processing Fees</p>
                <p className="text-lg font-bold text-slate-700">{formatINR(stats.totalFeesRetained)}</p>
              </div>
            </div>
            <p className="text-[10px] text-dark-400 mt-3 font-medium bg-slate-50 p-2 rounded-lg border border-dark-900/5">
              These funds remain in the pool and are not paid out to users.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
