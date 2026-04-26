export const runtime = 'edge';
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings, Save, Loader2, RefreshCw } from 'lucide-react';

export default function AdminMiningConfigPage() {
  const [config, setConfig] = useState({
    goldPricePerGram: 6000,
    pointsToGoldRatio: 0.00001,
    maxMiningSessionHours: 24,
    minWithdrawalAmount: 500,
    withdrawalDate: 15,
    withdrawalWindowDays: 3,
    tdsPer: 30,
    processingFee: 10,
    referralBonusDefault: 5,
    bonusMultiplierActive: false,
    bonusMultiplierValue: 1.5,
    newSubscriberCooldownDays: 15,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/mining-config');
      const data = await res.json();
      if (res.ok && data.configs) {
        // Map snake_case from DB to camelCase for state
        const dbToState = {
          gold_price_per_gram: 'goldPricePerGram',
          points_to_gold_ratio: 'pointsToGoldRatio',
          max_mining_session_hours: 'maxMiningSessionHours',
          min_withdrawal_amount: 'minWithdrawalAmount',
          withdrawal_date: 'withdrawalDate',
          withdrawal_window_days: 'withdrawalWindowDays',
          tds_percentage: 'tdsPer',
          processing_fee: 'processingFee',
          referral_bonus_default: 'referralBonusDefault',
          bonus_multiplier_active: 'bonusMultiplierActive',
          bonus_multiplier_value: 'bonusMultiplierValue',
          new_subscriber_cooldown_days: 'newSubscriberCooldownDays'
        };

        const mappedConfig = {};
        Object.entries(data.configs).forEach(([key, value]) => {
          if (dbToState[key]) {
            mappedConfig[dbToState[key]] = value;
          }
        });

        setConfig(prev => ({ ...prev, ...mappedConfig }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/mining-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_configs', configs: config }),
      });

      if (res.ok) {
        toast.success('Configuration saved!');
        fetchConfig(); // Refresh
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to save');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-dark-50">Mining Configuration</h1>
        <p className="text-dark-500 text-sm mt-1 font-medium">Configure mining rates, withdrawal rules, and system settings</p>
      </div>

      {/* Mining Settings */}
      <div className="glass-card p-6 space-y-6 border-dark-900/10 shadow-sm">
        <h3 className="text-sm font-bold flex items-center gap-2 text-red-600 uppercase tracking-widest">
          <Settings size={16} />
          Core Mining Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Gold Price per Gram (₹)</label>
            <input
              type="number"
              value={config.goldPricePerGram}
              onChange={(e) => setConfig({ ...config, goldPricePerGram: parseFloat(e.target.value) })}
              className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Points to Gold Ratio</label>
            <input
              type="number"
              step="0.000001"
              value={config.pointsToGoldRatio}
              onChange={(e) => setConfig({ ...config, pointsToGoldRatio: parseFloat(e.target.value) })}
              className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Max Session (hours)</label>
            <input
              type="number"
              value={config.maxMiningSessionHours}
              onChange={(e) => setConfig({ ...config, maxMiningSessionHours: parseInt(e.target.value) })}
              className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Default Ref Bonus (%)</label>
            <input
              type="number"
              value={config.referralBonusDefault}
              onChange={(e) => setConfig({ ...config, referralBonusDefault: parseInt(e.target.value) })}
              className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Bonus Multiplier */}
        <div className="border border-dark-900/5 rounded-2xl p-5 bg-slate-50/50">
          <label className="flex items-center gap-3 cursor-pointer mb-4 group">
            <input
              type="checkbox"
              checked={config.bonusMultiplierActive}
              onChange={(e) => setConfig({ ...config, bonusMultiplierActive: e.target.checked })}
              className="w-5 h-5 rounded-lg border-dark-900/10 text-red-500 focus:ring-red-500/20 transition-all cursor-pointer"
            />
            <span className="text-sm font-bold text-dark-100 group-hover:text-dark-50">Enable System-wide Bonus Multiplier</span>
          </label>
          {config.bonusMultiplierActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Multiplier Value (e.g., 1.5 = 50% bonus)</label>
              <input
                type="number"
                step="0.1"
                value={config.bonusMultiplierValue}
                onChange={(e) => setConfig({ ...config, bonusMultiplierValue: parseFloat(e.target.value) })}
                className="w-full bg-white border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-md transition-all"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Withdrawal Settings */}
      <div className="glass-card p-6 space-y-6 border-dark-900/10 shadow-sm">
        <h3 className="text-sm font-bold flex items-center gap-2 text-blue-600 uppercase tracking-widest">
          <Settings size={16} />
          Withdrawal Constraints
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Min Withdrawal (₹)</label>
            <input
              type="number"
              value={config.minWithdrawalAmount}
              onChange={(e) => setConfig({ ...config, minWithdrawalAmount: parseInt(e.target.value) })}
              className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Payout Date (Monthly)</label>
            <input
              type="number"
              min="1"
              max="28"
              value={config.withdrawalDate}
              onChange={(e) => setConfig({ ...config, withdrawalDate: parseInt(e.target.value) })}
              className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Payout Window (days)</label>
            <input
              type="number"
              value={config.withdrawalWindowDays}
              onChange={(e) => setConfig({ ...config, withdrawalWindowDays: parseInt(e.target.value) })}
              className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">TDS Multiplier (%)</label>
            <input
              type="number"
              value={config.tdsPer}
              onChange={(e) => setConfig({ ...config, tdsPer: parseInt(e.target.value) })}
              className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Processing Fee (Flat ₹)</label>
            <input
              type="number"
              value={config.processingFee}
              onChange={(e) => setConfig({ ...config, processingFee: parseInt(e.target.value) })}
              className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">New User Activation Lock (days)</label>
            <input
              type="number"
              value={config.newSubscriberCooldownDays}
              onChange={(e) => setConfig({ ...config, newSubscriberCooldownDays: parseInt(e.target.value) })}
              className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/20 haptic-button border border-red-500/20 mt-4 transition-all hover:bg-red-700"
      >
        {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
        Commit System Changes
      </button>
    </div>
  );
}