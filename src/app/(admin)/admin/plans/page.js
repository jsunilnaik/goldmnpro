'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Crown,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Save,
  X,
  Zap,
  TrendingUp,
  Check,
} from 'lucide-react';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    originalPrice: '',
    duration: 30,
    miningRate: '',
    goldPerPoint: 0.00001,
    estimatedMonthlyReturn: '',
    referralBonus: 5,
    isActive: true,
    isPopular: false,
    dailySessionLimit: 4,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editingPlan ? 'PUT' : 'POST';
      const body = editingPlan
        ? { ...formData, planId: editingPlan._id }
        : formData;

      const res = await fetch('/api/admin/mining-config', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_plan', ...body }),
      });

      if (res.ok) {
        toast.success(editingPlan ? 'Plan updated!' : 'Plan created!');
        setShowForm(false);
        setEditingPlan(null);
        fetchPlans();
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

  const togglePlanStatus = async (planId, isActive) => {
    try {
      const res = await fetch('/api/admin/mining-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_plan',
          planId,
          isActive: !isActive,
        }),
      });
      if (res.ok) {
        toast.success(`Plan ${isActive ? 'deactivated' : 'activated'}`);
        fetchPlans();
      }
    } catch (error) {
      toast.error('Failed');
    }
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      price: plan.price,
      originalPrice: plan.originalPrice || '',
      duration: plan.duration,
      miningRate: plan.miningRate,
      goldPerPoint: plan.goldPerPoint,
      estimatedMonthlyReturn: plan.estimatedMonthlyReturn || '',
      referralBonus: plan.referralBonus,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      dailySessionLimit: plan.dailySessionLimit || 4,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">Manage Plans</h1>
          <p className="text-dark-500 text-sm mt-1 font-medium">Create and manage subscription plans</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setFormData({
              name: '', slug: '', price: '', originalPrice: '', duration: 30,
              miningRate: '', goldPerPoint: 0.00001, estimatedMonthlyReturn: '',
              referralBonus: 5, isActive: true, isPopular: false, dailySessionLimit: 4,
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-gold-gradient text-dark-50 font-bold px-5 py-2.5 rounded-xl text-sm shadow-md haptic-button border border-gold-500/10"
        >
          <Plus size={16} />
          Add Plan
        </button>
      </div>

      {/* Plans Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-5 relative border-dark-900/10 shadow-sm ${!plan.isActive ? 'opacity-60' : 'hover:shadow-md'}`}
          >
            {plan.isPopular && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-lg border border-white/20">
                POPULAR
              </div>
            )}

            <div className="text-3xl mb-3 flex items-center justify-between">
              <span>{plan.icon || '⛏️'}</span>
              <Crown size={20} className={plan.isPopular ? 'text-gold-500' : 'text-slate-200'} />
            </div>
            <h3 className="text-lg font-bold text-dark-50">{plan.name}</h3>
            <p className="text-2xl font-mono font-bold text-gold-600 mt-1">
              ₹{plan.price?.toLocaleString('en-IN')}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-dark-500 font-bold uppercase tracking-wider">{plan.duration} Days</span>
              <span className="w-1 h-1 rounded-full bg-dark-900/20" />
              <span className="text-xs text-dark-500 font-bold uppercase tracking-wider">{plan.referralBonus}% Bonus</span>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-dark-900/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-dark-400 uppercase tracking-tight">
                  <Zap size={12} className="text-gold-500" />
                  Mining Speed
                </div>
                <span className="text-xs font-bold text-dark-50">{plan.miningRate} pt/h</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-dark-400 uppercase tracking-tight">
                  <TrendingUp size={12} className="text-green-500" />
                  Est. Return
                </div>
                <span className="text-xs font-bold text-dark-50">₹{plan.estimatedMonthlyReturn?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => openEdit(plan)}
                className="flex-1 py-2.5 rounded-xl bg-white border border-dark-900/10 text-dark-100 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Edit size={14} className="text-blue-500" />
                Edit
              </button>
              <button
                onClick={() => togglePlanStatus(plan._id, plan.isActive)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${
                  plan.isActive
                    ? 'bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/10'
                    : 'bg-green-500/5 border-green-500/20 text-green-600 hover:bg-green-500/10'
                }`}
              >
                {plan.isActive ? 'Disable' : 'Enable'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Plan Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-50/20 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-dark-900/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-dark-900/5 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-dark-50 text-lg">{editingPlan ? 'Edit Mining Plan' : 'Create New Plan'}</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center text-dark-400 hover:text-dark-50 hover:bg-slate-200 transition-all">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Plan Name */}
               <div>
                <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Plan Teir</label>
                <select
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase() })}
                  className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
                >
                  <option value="">Select Level</option>
                  <option value="Bronze">Bronze (Tier 1)</option>
                  <option value="Silver">Silver (Tier 2)</option>
                  <option value="Gold">Gold (Tier 3)</option>
                  <option value="Diamond">Diamond (Tier 4)</option>
                  <option value="Platinum">Platinum (Tier 5)</option>
                </select>
              </div>

               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Original Price</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
                    placeholder="3000"
                  />
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Duration (days)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Rate (pts/hr)</label>
                  <input
                    type="number"
                    value={formData.miningRate}
                    onChange={(e) => setFormData({ ...formData, miningRate: e.target.value })}
                    className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
                  />
                </div>
              </div>

               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Monthly (₹)</label>
                  <input
                    type="number"
                    value={formData.estimatedMonthlyReturn}
                    onChange={(e) => setFormData({ ...formData, estimatedMonthlyReturn: e.target.value })}
                    className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Ref Bonus (%)</label>
                  <input
                    type="number"
                    value={formData.referralBonus}
                    onChange={(e) => setFormData({ ...formData, referralBonus: parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-4 py-3 text-sm font-bold text-dark-50 outline-none focus:border-red-500/50 shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Day Session Limit with Threshold logic */}
              <div className="p-4 bg-gold-500/5 rounded-2xl border border-gold-500/10 mb-2">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] text-gold-700 uppercase font-black tracking-widest">Mining Sessions / Day</label>
                  <span className="bg-gold-500 text-dark-50 text-[10px] font-black px-2 py-0.5 rounded-md">{formData.dailySessionLimit} Sessions</span>
                </div>
                <input
                  type="range"
                  min={formData.price >= 10000 ? 4 : 2}
                  max="6"
                  step="1"
                  value={formData.dailySessionLimit}
                  onChange={(e) => setFormData({ ...formData, dailySessionLimit: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gold-500"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-[8px] font-bold text-dark-400">MIN: {formData.price >= 10000 ? '4 (High Value)' : '2'}</span>
                  <span className="text-[8px] font-bold text-dark-400">MAX: 6</span>
                </div>
                {formData.price >= 10000 && formData.dailySessionLimit < 4 && (
                    <p className="text-[9px] text-red-500 font-bold mt-2">⚠️ High-value plans require at least 4 sessions.</p>
                )}
              </div>

              <div className="flex gap-6 p-4 bg-slate-50 rounded-2xl border border-dark-900/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-dark-900/10 text-red-500 focus:ring-red-500/20 transition-all cursor-pointer"
                  />
                  <span className="text-sm font-bold text-dark-100 group-hover:text-dark-50">Active Status</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-dark-900/10 text-red-500 focus:ring-red-500/20 transition-all cursor-pointer"
                  />
                  <span className="text-sm font-bold text-dark-100 group-hover:text-dark-50">Popular Badge</span>
                </label>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/20 haptic-button border border-red-500/20 mt-4 transition-all hover:bg-red-700"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {editingPlan ? 'Update Plan Configuration' : 'Create Mining Plan'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}