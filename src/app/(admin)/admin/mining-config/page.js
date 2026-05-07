'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings, Save, Loader2, RefreshCw, Plus, Trash2, Calendar, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    withdrawalWindows: [],
    instantWithdrawalActive: false,
    instantWithdrawalFee: 0,
    withdrawalCooldownDays: 7
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
          new_subscriber_cooldown_days: 'newSubscriberCooldownDays',
          withdrawal_windows: 'withdrawalWindows',
          instant_withdrawal_active: 'instantWithdrawalActive',
          instant_withdrawal_fee: 'instantWithdrawalFee',
          withdrawal_cooldown_days: 'withdrawalCooldownDays'
        };

        const mappedConfig = {};
        Object.entries(data.configs).forEach(([key, value]) => {
          if (dbToState[key]) {
            // Ensure numeric fields don't get NaN/null
            const numericFields = ['goldPricePerGram', 'pointsToGoldRatio', 'maxMiningSessionHours', 'minWithdrawalAmount', 'withdrawalDate', 'withdrawalWindowDays', 'tdsPer', 'processingFee', 'referralBonusDefault', 'bonusMultiplierValue', 'newSubscriberCooldownDays', 'instantWithdrawalFee', 'withdrawalCooldownDays'];
            
            if (numericFields.includes(dbToState[key])) {
              mappedConfig[dbToState[key]] = value === null || isNaN(value) ? 0 : Number(value);
            } else {
              mappedConfig[dbToState[key]] = value;
            }
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
                value={config.goldPricePerGram || 0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setConfig({ ...config, goldPricePerGram: isNaN(val) ? 0 : val });
                }}
                className="w-full bg-white border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-gold-500/50 shadow-md transition-all"
              />
          </div>
          <div>
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Points to Gold Ratio</label>
              <input
                type="number"
                step="0.000001"
                value={config.pointsToGoldRatio || 0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setConfig({ ...config, pointsToGoldRatio: isNaN(val) ? 0 : val });
                }}
                className="w-full bg-white border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-gold-500/50 shadow-md transition-all"
              />
          </div>
          <div>
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Max Session (hours)</label>
              <input
                type="number"
                value={config.maxMiningSessionHours || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setConfig({ ...config, maxMiningSessionHours: isNaN(val) ? 0 : val });
                }}
                className="w-full bg-white border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-gold-500/50 shadow-md transition-all"
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

      {/* Flexible Withdrawal Windows */}
      <div className="glass-card p-6 space-y-6 border-dark-900/10 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2 text-purple-600 uppercase tracking-widest">
            <Calendar size={16} />
            Withdrawal Windows (Modern)
          </h3>
          <button
            onClick={() => setConfig({
              ...config,
              withdrawalWindows: [
                ...config.withdrawalWindows,
                {
                  startTime: new Date().toISOString().slice(0, 16),
                  endTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
                  minAmount: 1000,
                  maxAmount: 50000,
                  allowedAmounts: [1000, 2000, 3000, 4999, 9999, 19999],
                  description: 'New Window'
                }
              ]
            })}
            className="flex items-center gap-1.5 bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-purple-100 transition-all"
          >
            <Plus size={14} /> Add Window
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {config.withdrawalWindows.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-dark-900/10">
                <p className="text-dark-400 text-xs font-bold uppercase tracking-widest">No Active Windows Defined</p>
                <p className="text-dark-400 text-[9px] mt-1 font-medium">System will fallback to legacy monthly date logic</p>
              </div>
            ) : (
              config.withdrawalWindows.map((window, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white border border-dark-900/5 rounded-2xl p-5 relative group shadow-sm hover:shadow-md transition-all"
                >
                  <button
                    onClick={() => {
                      const newWindows = [...config.withdrawalWindows];
                      newWindows.splice(idx, 1);
                      setConfig({ ...config, withdrawalWindows: newWindows });
                    }}
                    className="absolute top-4 right-4 p-2 text-dark-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] text-dark-400 mb-1 block uppercase font-bold tracking-widest">Window Name / Label</label>
                        <input
                          type="text"
                          value={window.description}
                          onChange={(e) => {
                            const newWindows = [...config.withdrawalWindows];
                            newWindows[idx].description = e.target.value;
                            setConfig({ ...config, withdrawalWindows: newWindows });
                          }}
                          className="w-full bg-slate-50 border border-dark-900/5 rounded-xl px-3 py-2 text-xs font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-dark-400 mb-1 block uppercase font-bold tracking-widest flex items-center gap-1"><Clock size={10} /> Start</label>
                          <input
                            type="datetime-local"
                            value={window.startTime ? new Date(window.startTime).toISOString().slice(0, 16) : ''}
                            onChange={(e) => {
                              const newWindows = [...config.withdrawalWindows];
                              newWindows[idx].startTime = e.target.value;
                              setConfig({ ...config, withdrawalWindows: newWindows });
                            }}
                            className="w-full bg-slate-50 border border-dark-900/5 rounded-xl px-2 py-2 text-[10px] font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-dark-400 mb-1 block uppercase font-bold tracking-widest flex items-center gap-1"><Clock size={10} /> End</label>
                          <input
                            type="datetime-local"
                            value={window.endTime ? new Date(window.endTime).toISOString().slice(0, 16) : ''}
                            onChange={(e) => {
                              const newWindows = [...config.withdrawalWindows];
                              newWindows[idx].endTime = e.target.value;
                              setConfig({ ...config, withdrawalWindows: newWindows });
                            }}
                            className="w-full bg-slate-50 border border-dark-900/5 rounded-xl px-2 py-2 text-[10px] font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-dark-400 mb-1 block uppercase font-bold tracking-widest flex items-center gap-1"><DollarSign size={10} /> Min</label>
                          <input
                            type="number"
                            value={window.minAmount}
                            onChange={(e) => {
                              const newWindows = [...config.withdrawalWindows];
                              newWindows[idx].minAmount = parseInt(e.target.value);
                              setConfig({ ...config, withdrawalWindows: newWindows });
                            }}
                            className="w-full bg-slate-50 border border-dark-900/5 rounded-xl px-3 py-2 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] text-dark-400 mb-1 block uppercase font-bold tracking-widest flex items-center gap-1"><DollarSign size={10} /> Max</label>
                          <input
                            type="number"
                            value={window.maxAmount}
                            onChange={(e) => {
                              const newWindows = [...config.withdrawalWindows];
                              newWindows[idx].maxAmount = parseInt(e.target.value);
                              setConfig({ ...config, withdrawalWindows: newWindows });
                            }}
                            className="w-full bg-slate-50 border border-dark-900/5 rounded-xl px-3 py-2 text-xs font-bold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-dark-400 mb-1 block uppercase font-bold tracking-widest">Allowed Amounts (comma separated)</label>
                        <input
                          type="text"
                          value={window.allowedAmounts ? window.allowedAmounts.join(', ') : ''}
                          onChange={(e) => {
                            const newWindows = [...config.withdrawalWindows];
                            newWindows[idx].allowedAmounts = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                            setConfig({ ...config, withdrawalWindows: newWindows });
                          }}
                          placeholder="1000, 2000, 5000..."
                          className="w-full bg-slate-50 border border-dark-900/5 rounded-xl px-3 py-2 text-xs font-bold font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Instant Withdrawal Settings */}
      <div className="glass-card p-6 space-y-6 border-dark-900/10 shadow-sm">
        <h3 className="text-sm font-bold flex items-center gap-2 text-green-600 uppercase tracking-widest">
          <DollarSign size={16} />
          Instant Withdrawal (Admin Controls)
        </h3>

        <div className="border border-dark-900/5 rounded-2xl p-5 bg-slate-50/50">
          <label className="flex items-center gap-3 cursor-pointer mb-4 group">
            <input
              type="checkbox"
              checked={config.instantWithdrawalActive}
              onChange={(e) => setConfig({ ...config, instantWithdrawalActive: e.target.checked })}
              className="w-5 h-5 rounded-lg border-dark-900/10 text-green-500 focus:ring-green-500/20 transition-all cursor-pointer"
            />
            <span className="text-sm font-bold text-dark-100 group-hover:text-dark-50">Enable Global Instant Withdrawals (Bypasses Cooldowns)</span>
          </label>
          
          <AnimatePresence>
            {config.instantWithdrawalActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Instant Withdrawal Surcharge Fee (₹)</label>
                <input
                  type="number"
                  value={config.instantWithdrawalFee || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setConfig({ ...config, instantWithdrawalFee: isNaN(val) ? 0 : val });
                  }}
                  className="w-full bg-white border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-green-500/50 shadow-md transition-all"
                />
                <p className="text-[9px] text-dark-400 mt-2 italic">* This fee is added on top of the standard processing fee for all instant withdrawals.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border border-dark-900/5 rounded-2xl p-5 bg-slate-50/50">
          <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Withdrawal Cooldown (Days)</label>
          <input
            type="number"
            value={config.withdrawalCooldownDays || 0}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setConfig({ ...config, withdrawalCooldownDays: isNaN(val) ? 0 : val });
            }}
            className="w-full bg-white border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-green-500/50 shadow-md transition-all"
          />
          <p className="text-[9px] text-dark-400 mt-2 italic">* Number of days a user must wait between successful withdrawals. Set to 0 to disable cooldown.</p>
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
