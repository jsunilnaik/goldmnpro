export const runtime = 'edge';
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus, Search, MapPin, CreditCard, Trash2, RefreshCw,
  AlertCircle, Save, Loader2, CheckCircle2, XCircle,
  Users, BarChart2, ChevronDown, X, Info, Zap,
} from 'lucide-react';

const MAX_UPIS = 20;

export default function CityUpiManagement() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(null);
  const [syncResult, setSyncResult] = useState(null); // last sync stats

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  // UPI fields: array of strings, max 20
  const [upiFields, setUpiFields] = useState(['']);
  const [formCity, setFormCity] = useState('');
  const [formActive, setFormActive] = useState(true);

  const [availableCities, setAvailableCities] = useState([]);
  const [citySearch, setCitySearch] = useState('');

  useEffect(() => {
    fetchRules();
    fetchCities();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/city-upis');
      const data = await res.json();
      if (res.ok) setRules(data.rules || []);
      else toast.error(data.message || 'Failed to fetch rules');
    } catch {
      toast.error('Network error fetching rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/admin/locations?active=true');
      const data = await res.json();
      if (res.ok) {
        const cities = [...new Set(data.locations.map(l => l.city))].sort();
        setAvailableCities(cities);
      }
    } catch { /* silent */ }
  };

  // ── Modal helpers ──────────────────────────────────────────
  const openModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormCity(rule.city);
      setCitySearch(rule.city);
      setFormActive(rule.isActive);
      // Pre-fill UPI fields from existing rule (pad to at least 1)
      const existing = rule.upis.length > 0 ? rule.upis : [''];
      setUpiFields(existing.slice(0, MAX_UPIS));
    } else {
      setEditingRule(null);
      setFormCity('');
      setCitySearch('');
      setFormActive(true);
      setUpiFields(['']);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSyncResult(null);
  };

  // ── Individual UPI field handlers ──────────────────────────
  const updateUpi = (index, value) => {
    const next = [...upiFields];
    next[index] = value;
    setUpiFields(next);
  };

  const addUpiField = () => {
    if (upiFields.length < MAX_UPIS) {
      setUpiFields([...upiFields, '']);
    }
  };

  const removeUpiField = (index) => {
    if (upiFields.length === 1) return; // keep at least 1
    setUpiFields(upiFields.filter((_, i) => i !== index));
  };

  // Count valid (non-empty) UPIs
  const validUpis = upiFields.map(u => u.trim()).filter(Boolean);

  // ── Form Submit ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formCity) { toast.error('Please select a city'); return; }
    if (validUpis.length === 0) { toast.error('Enter at least 1 UPI ID'); return; }

    setSubmitLoading(true);
    try {
      const res = await fetch('/api/admin/city-upis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: formCity, upis: validUpis, isActive: formActive }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editingRule ? 'Pool updated!' : 'Pool created!');
        closeModal();
        fetchRules();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch {
      toast.error('Network error saving pool');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (id, city) => {
    if (!confirm(`Delete UPI pool for "${city}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/city-upis?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); fetchRules(); }
      else toast.error(data.message || 'Delete failed');
    } catch {
      toast.error('Network error');
    }
  };

  // ── Bulk Sync (Round-Robin) ────────────────────────────────
  const handleBulkSync = async (city) => {
    const rule = rules.find(r => r.city === city);
    const poolSize = rule?.upis?.length || 0;
    if (!confirm(
      `📍 City: ${city}\n🔢 UPI Pool: ${poolSize} IDs\n\n` +
      `This will OVERWRITE the primary UPI of ALL users in ${city} using round-robin distribution.\n\n` +
      `Are you sure?`
    )) return;

    setSyncLoading(city);
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/city-upis/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Synced ${data.stats?.totalUsers} users!`);
        setSyncResult(data);
      } else {
        toast.error(data.message || 'Sync failed');
      }
    } catch {
      toast.error('Network error during sync');
    } finally {
      setSyncLoading(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-50 tracking-tight">Regional UPI Pools</h1>
          <p className="text-dark-400 text-sm mt-1">
            Create a UPI pool for a city → Sync to distribute them equally across all users (round-robin).
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-gold-500/20"
        >
          <Plus size={18} />
          <span>New UPI Pool</span>
        </button>
      </div>

      {/* ── How it works banner ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex gap-3 items-start">
        <Info size={18} className="text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-700">
          <strong>How Round-Robin Distribution Works:</strong>{' '}
          If you have <strong>20 UPIs</strong> and <strong>100 users</strong> in a city — clicking "Sync" assigns
          UPI #1 to users 1, 21, 41, 61, 81 · UPI #2 to users 2, 22, 42, 62, 82 · …and so on.
          Each UPI gets exactly <strong>5 users</strong>. This replaces ALL users' primary UPI in that city.
        </div>
      </div>

      {/* ── Sync Result Panel ── */}
      <AnimatePresence>
        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-50 border border-green-200 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-600" />
                <h3 className="font-bold text-green-700 text-sm">{syncResult.message}</h3>
              </div>
              <button onClick={() => setSyncResult(null)} className="text-green-400 hover:text-green-700">
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(syncResult.distribution || []).map((d) => (
                <div key={d.slot} className="bg-white border border-green-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold flex items-center justify-center text-[10px]">{d.slot}</span>
                  <span className="font-mono text-dark-300">{d.upi}</span>
                  <span className="bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded text-[10px]">{d.usersAssigned} users</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Rules List ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-gold-500 animate-spin" />
          <p className="text-dark-400 font-medium animate-pulse">Loading pools...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white border border-dark-800 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={24} className="text-dark-400" />
          </div>
          <h3 className="text-lg font-bold text-dark-200">No UPI Pools Found</h3>
          <p className="text-dark-400 text-sm max-w-xs mx-auto mt-2">
            Create a city pool to enable regional UPI distribution for withdrawals.
          </p>
          <button onClick={() => openModal()} className="mt-6 text-gold-600 font-bold hover:underline">
            Create your first pool
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rules.map((rule) => {
            const usersPerUpi = rule._userCount ? Math.ceil(rule._userCount / rule.upis.length) : '—';
            return (
              <motion.div
                layout
                key={rule._id}
                className="bg-white border border-dark-800 rounded-2xl overflow-hidden hover:border-gold-500/30 transition-all shadow-sm"
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  {/* Left: city info */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${rule.isActive ? 'bg-gold-50' : 'bg-dark-900'}`}>
                      <MapPin className={rule.isActive ? 'text-gold-600' : 'text-dark-400'} size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-dark-50">{rule.city}</h3>
                        {!rule.isActive && (
                          <span className="text-[10px] bg-dark-900 text-dark-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Inactive</span>
                        )}
                      </div>
                      <p className="text-dark-400 text-xs font-medium flex items-center gap-1.5">
                        <CreditCard size={11} />
                        <strong className="text-dark-200">{rule.upis.length}</strong>/{MAX_UPIS} UPIs in pool
                      </p>

                      {/* Distribution Pills */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(rule._distribution || []).map((d, idx) => (
                          <div key={idx} className="bg-dark-900 border border-dark-800 rounded-lg px-2 py-1 flex items-center gap-2 group/upi">
                             <span className="text-[10px] font-bold text-gold-500">{idx + 1}</span>
                             <span className="text-[10px] text-dark-300 font-mono">{d.upi}</span>
                             <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${d.count > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                               {d.count} users
                             </span>
                          </div>
                        ))}
                      </div>

                      {/* Balance Progress Bar */}
                      {rule._userCount > 0 && (
                        <div className="mt-4 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-dark-900 rounded-full overflow-hidden flex">
                            {(rule._distribution || []).map((d, idx) => (
                              <div 
                                key={idx} 
                                style={{ width: `${(d.count / rule._userCount) * 100}%` }}
                                className={`h-full border-r border-white/10 ${idx % 2 === 0 ? 'bg-gold-500' : 'bg-gold-400'}`}
                                title={`${d.upi}: ${d.count} users`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-dark-400 font-bold uppercase tracking-wider">Pool Balance</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleBulkSync(rule.city)}
                      disabled={syncLoading === rule.city}
                      className="flex items-center gap-2 bg-dark-50 hover:bg-dark-100 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
                      title="Distribute UPIs to all city users via round-robin"
                    >
                      {syncLoading === rule.city
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Zap size={14} />
                      }
                      <span>Sync City Users</span>
                    </button>
                    <button
                      onClick={() => openModal(rule)}
                      className="flex items-center gap-2 border border-dark-800 hover:border-gold-500 text-dark-200 hover:text-gold-600 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      Edit Pool
                    </button>
                    <button
                      onClick={() => handleDelete(rule._id, rule.city)}
                      className="p-2 rounded-xl text-dark-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete Pool"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-16 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-dark-50/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-dark-900 flex items-center justify-between bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl font-bold text-dark-50">{editingRule ? 'Edit UPI Pool' : 'Create UPI Pool'}</h3>
                  <p className="text-xs text-dark-400 mt-0.5">Up to {MAX_UPIS} UPI IDs per city pool</p>
                </div>
                <button onClick={closeModal} className="text-dark-400 hover:text-dark-50 p-1 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">

                {/* City selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-dark-400 mb-2">City</label>
                  <div className="relative">
                    <input
                      type="text"
                      list="cities-list"
                      required
                      disabled={!!editingRule}
                      value={citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        if (availableCities.includes(e.target.value)) setFormCity(e.target.value);
                      }}
                      onBlur={() => {
                        if (!availableCities.includes(citySearch)) setCitySearch(formCity);
                      }}
                      placeholder="Search or select city..."
                      className="w-full bg-dark-900/50 border border-dark-800 rounded-xl px-4 py-3 text-dark-50 font-medium focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all disabled:opacity-50"
                    />
                    <datalist id="cities-list">
                      {availableCities.map(c => <option key={c} value={c} />)}
                    </datalist>
                    <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
                  </div>
                </div>

                {/* UPI Fields */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-dark-400">
                      UPI IDs — {validUpis.length}/{MAX_UPIS} added
                    </label>
                    {upiFields.length < MAX_UPIS && (
                      <button
                        type="button"
                        onClick={addUpiField}
                        className="text-gold-600 hover:text-gold-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Plus size={14} /> Add UPI
                      </button>
                    )}
                  </div>

                  {/* Distribution Preview */}
                  {validUpis.length > 0 && (
                    <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
                      <BarChart2 size={16} className="text-blue-500 shrink-0" />
                      <p className="text-xs text-blue-600 font-medium">
                        With <strong>{validUpis.length} UPIs</strong>, each UPI is assigned to ~<strong>N users</strong> equally
                        when you click &quot;Sync City Users&quot;. 100 users ÷ {validUpis.length} UPIs = <strong>{Math.ceil(100 / validUpis.length)} users per UPI</strong> (example).
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {upiFields.map((upi, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {/* Slot number badge */}
                        <div className="w-7 h-7 rounded-lg bg-dark-900 flex items-center justify-center text-[11px] font-black text-gold-500 shrink-0">
                          {idx + 1}
                        </div>
                        <input
                          type="text"
                          value={upi}
                          onChange={(e) => updateUpi(idx, e.target.value)}
                          placeholder={`UPI ID #${idx + 1}  e.g. name@upi`}
                          className="flex-1 bg-dark-900/50 border border-dark-800 rounded-xl px-4 py-2.5 text-dark-50 font-mono text-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all placeholder:text-dark-500"
                        />
                        {upiFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeUpiField(idx)}
                            className="p-2 rounded-xl text-dark-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                            title="Remove this UPI"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {upiFields.length < MAX_UPIS && (
                    <button
                      type="button"
                      onClick={addUpiField}
                      className="mt-3 w-full border-2 border-dashed border-dark-800 hover:border-gold-500 text-dark-400 hover:text-gold-600 rounded-xl py-2.5 text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add UPI Slot ({upiFields.length}/{MAX_UPIS})
                    </button>
                  )}
                  {upiFields.length >= MAX_UPIS && (
                    <p className="mt-2 text-xs text-amber-600 font-bold text-center">Maximum {MAX_UPIS} UPI IDs reached</p>
                  )}
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3 py-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-4 h-4 rounded border-dark-800 text-gold-600 focus:ring-gold-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-dark-100 cursor-pointer">
                    Pool is active (used during P2P matching)
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitLoading || validUpis.length === 0}
                  className="w-full bg-gold-gradient text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  <span>{editingRule ? 'Save Changes' : `Create Pool with ${validUpis.length} UPIs`}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
