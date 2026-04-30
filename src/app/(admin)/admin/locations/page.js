export const runtime = 'edge';
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  Filter, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Building2, 
  TrendingUp, 
  Users,
  Loader2,
  Database,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, [stateFilter, tierFilter]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        state: stateFilter,
        tier: tierFilter,
        active: 'false' // Show both active and inactive
      });
      const res = await fetch(`/api/admin/locations?${params}`);
      const data = await res.json();
      if (res.ok) {
        setLocations(data.locations);
        setStates(data.states);
      }
    } catch (err) {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/locations', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchLocations();
      } else {
        toast.error(data.message || 'Seed failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSeeding(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setLocations(locations.map(loc => 
          loc._id === id ? { ...loc, isActive: !currentStatus } : loc
        ));
        toast.success(data.message);
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const filteredLocations = locations.filter(loc => 
    loc.city.toLowerCase().includes(search.toLowerCase()) ||
    loc.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">Regional Hubs</h1>
          <p className="text-dark-500 text-sm mt-1 font-medium flex items-center gap-2">
            <Building2 size={14} /> Geographic database and recruitment management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 bg-amber-500/10 text-amber-600 px-4 py-2.5 rounded-xl text-sm font-bold border border-amber-500/20 hover:bg-amber-500/20 transition-all disabled:opacity-50"
          >
            {seeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
            Sync DB Data
          </button>
          <button
            onClick={fetchLocations}
            className="p-2.5 bg-dark-900 border border-dark-800 rounded-xl text-dark-400 hover:text-gold-500 transition-all hover:bg-dark-800"
          >
            <RefreshCcw size={20} className={loading && !seeding ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Cities', value: locations.length, icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Active Regions', value: locations.filter(l => l.isActive).length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Total Users', value: locations.reduce((acc, l) => acc + (l.userCount || 0), 0), icon: Users, color: 'text-gold-500', bg: 'bg-gold-500/10' },
          { label: 'Tier 1 Hubs', value: locations.filter(l => l.tier === 1).length, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-4 border-dark-800/50">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-dark-500 tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-dark-50 font-display">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-gold-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search city, state or region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-900 border border-dark-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-dark-100 outline-none focus:border-gold-500/50 transition-all shadow-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl border transition-all text-sm font-bold shadow-sm ${
            showFilters || stateFilter || tierFilter 
            ? 'bg-gold-500/10 border-gold-500/30 text-gold-600' 
            : 'bg-dark-900 border-dark-800 text-dark-400'
          }`}
        >
          <Filter size={18} />
          Filters {(stateFilter || tierFilter) && '•'}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-dark-900/50 p-4 rounded-3xl border border-dark-800"
          >
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-dark-500 tracking-widest pl-1">State Focus</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 rounded-xl px-4 py-2.5 text-sm font-bold text-dark-100 outline-none"
              >
                <option value="">All States</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-dark-500 tracking-widest pl-1">Tier Classification</label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full bg-dark-900 border border-dark-800 rounded-xl px-4 py-2.5 text-sm font-bold text-dark-100 outline-none"
              >
                <option value="">All Tiers</option>
                <option value="1">Tier 1 — Megacities</option>
                <option value="2">Tier 2 — Regional Hubs</option>
                <option value="3">Tier 3 — Emerging</option>
                <option value="4">Tier 4 — Semi-Urban</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locations Table */}
      <div className="bg-dark-950 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-dark-900/50 border-b border-dark-800">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-dark-500 tracking-widest">Location Info</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-dark-500 tracking-widest">Classification</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-dark-500 tracking-widest">Region</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase text-dark-500 tracking-widest">Subscribers</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase text-dark-500 tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-dark-500 tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/30">
              {loading && filteredLocations.length === 0 ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-dark-900 rounded-full w-2/3" /></td>
                  </tr>
                ))
              ) : filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-3xl bg-dark-900 flex items-center justify-center text-dark-700">
                        <MapPin size={32} />
                      </div>
                      <p className="text-dark-500 font-bold">No locations found</p>
                      <button onClick={handleSeed} className="text-sm text-gold-500 font-bold hover:underline">Click here to seed data</button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => (
                  <tr key={loc._id} className="hover:bg-dark-800/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-sm ${
                          loc.isActive ? 'bg-gold-500/5 border-gold-500/20 text-gold-500' : 'bg-dark-900 border-dark-800 text-dark-600'
                        }`}>
                          {loc.city.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${loc.isActive ? 'text-dark-100' : 'text-dark-500 line-through opacity-50'}`}>
                            {loc.city}
                          </p>
                          <p className="text-[10px] font-black uppercase text-dark-500 tracking-tighter">{loc.state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                          loc.tier === 1 ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' :
                          loc.tier === 2 ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                          loc.tier === 3 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                          'bg-slate-500/10 text-dark-500 border border-dark-800'
                        }`}>
                          Tier {loc.tier}
                        </span>
                        <span className="text-[9px] text-dark-500 font-medium mt-1">
                          {loc.tier === 1 ? 'Megacity' : loc.tier === 2 ? 'Regional Hub' : 'Developing'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-dark-400">{loc.region || 'National'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <p className={`text-sm font-black font-mono ${loc.userCount > 0 ? 'text-gold-500' : 'text-dark-600'}`}>
                          {loc.userCount || 0}
                        </p>
                        {loc.userCount > 100 && (
                          <span className="text-[8px] font-bold text-green-500 flex items-center gap-0.5">
                            <TrendingUp size={8} /> High Density
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => toggleStatus(loc._id, loc.isActive)}
                        className={`mx-auto w-12 h-6 rounded-full p-1 transition-all duration-300 relative ${
                          loc.isActive ? 'bg-gold-500 shadow-lg shadow-gold-500/20' : 'bg-dark-800'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
                          loc.isActive ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-dark-800 text-[10px] font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        LOC_ID: {loc._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Intelligence Info */}
      <div className="bg-dark-900/30 p-6 rounded-[32px] border border-dark-800 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-[24px] bg-gold-500/10 flex items-center justify-center text-gold-500 shrink-0 shadow-inner">
          <ShieldCheck size={32} />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="text-sm font-bold text-dark-100">Location Distribution Intelligence</h4>
          <p className="text-xs text-dark-500 leading-relaxed font-medium">
            Deactivating a location immediately removes it from the user onboarding flow (Signup) and Profile updates. 
            Existing users in that location will remain until their profile is manually updated. Tier classifications affect 
            automated revenue forecasting and growth analytics.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-dark-900 p-4 rounded-2xl border border-dark-800 shadow-sm">
          <AlertCircle size={20} className="text-amber-500" />
          <div className="text-[11px] font-bold text-dark-400">
            Current Tier 1 Presence: <span className="text-gold-500">{locations.filter(l => l.isActive && l.tier === 1).length} Hubs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
