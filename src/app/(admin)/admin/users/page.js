'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Mail,
  Phone,
  Calendar,
  Download,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Wallet,
  Zap,
  Activity,
  UserCheck,
  UserX,
  Clock,
  Coins,
  Gem,
  MapPin,
  Copy,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { getAllStates, getCitiesForState, getCityTier } from '@/lib/india-cities';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, edit, admin
  const [isEditMode, setIsEditMode] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [distinctStates, setDistinctStates] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');

  const [dbLocations, setDbLocations] = useState([]);
  const [dbStates, setDbStates] = useState([]);
  const [seedingLocations, setSeedingLocations] = useState(false);
  const [locationsLoaded, setLocationsLoaded] = useState(false);
  const [impersonating, setImpersonating] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Admin control states
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [adjustment, setAdjustment] = useState({ cash: 0, points: 0, gold: 0, reason: 'Admin adjustment' });
  const [lockDate, setLockDate] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    kyc: { panNumber: '', aadharNumber: '' },
    isKYCVerified: false,
    state: '',
    city: '',
    tier: null,
  });

  useEffect(() => {
    fetchUsers();
  }, [page, filter, search, stateFilter, cityFilter, tierFilter, planFilter, roleFilter]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const [autoRepair, setAutoRepair] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/admin/locations');
      const data = await res.json();
      if (res.ok) {
        setDbLocations(data.locations || []);
        setDbStates(data.states || []);
        setLocationsLoaded(true);
      }
    } catch (err) {
      // Locations not seeded yet — fallback to static data
      setLocationsLoaded(false);
    }
  };

  const handleSeedLocations = async () => {
    setSeedingLocations(true);
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoRepair })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        if (data.unsetCount > 0 && !autoRepair) {
          toast(
            `Note: ${data.unsetCount} users still have missing location data. Enable 'Auto-Repair' to fix this.`,
            { icon: '⚠️', duration: 6000 }
          );
        }
        fetchLocations();
      } else {
        toast.error(data.message || 'Seed failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSeedingLocations(false);
    }
  };

  const handleImpersonate = async (userId) => {
    setImpersonating(userId);
    try {
      const res = await fetch(`/api/admin/impersonate?userId=${userId}&action=start`);
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Impersonation started');
        window.location.href = data.redirect || '/dashboard';
      } else {
        toast.error(data.message || 'Failed to start impersonation');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setImpersonating(null);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        filter,
        search,
      });
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (stateFilter) params.set('state', stateFilter);
      if (cityFilter) params.set('city', cityFilter);
      if (tierFilter) params.set('tier', tierFilter);
      if (planFilter) params.set('plan', planFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        if (data.availablePlans) setAvailablePlans(data.availablePlans);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async (action, payload) => {
    setFormLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          action,
          ...payload
        }),
      });
      const data = await res.json();
      if (res.ok) {
        let successMessage = data.message || 'Action completed';

        // Custom message for plan assignment
        if (action === 'assign_plan') {
          const planName = availablePlans.find(p => p._id === payload.planId)?.name || 'New';
          successMessage = `✅ ${planName} Plan assigned successfully!`;
          setSelectedPlanId('');
        }

        toast.success(successMessage);

        // SYNC: Update the local selected user state with the fresh data from API
        if (data.user) {
          setSelectedUser(data.user);
        }

        if (action === 'adjust_wallet') setAdjustment({ cash: 0, points: 0, gold: 0, reason: 'Admin adjustment' });

        // Refresh the list in the background
        fetchUsers();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    handleAdminAction('update_details', { userData: formData });
    setIsEditMode(false);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    handleAdminAction(currentStatus ? 'deactivate' : 'activate', {});
  };

  const verifyKYC = async (userId, action) => {
    handleAdminAction(action === 'approve' ? 'verify_kyc' : 'reject_kyc', {});
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('PERMANENT DELETE: This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('User deleted permanently');
        fetchUsers();
        setShowModal(false);
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('User created successfully');
        setShowCreateModal(false);
        fetchUsers();
      } else {
        toast.error(data.message || 'Creation failed');
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">User Command Center</h1>
          <p className="text-dark-500 text-sm mt-1 font-medium">Platform oversight and account management</p>
        </div>
        <div className="flex items-center gap-2">
          {!locationsLoaded && (
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleSeedLocations}
                disabled={seedingLocations}
                className="flex items-center gap-1.5 bg-amber-500 px-3 py-2 rounded-xl text-xs font-bold text-white hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {seedingLocations ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                {autoRepair ? 'Repair & Seed' : 'Seed Locations'}
              </button>
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={autoRepair}
                  onChange={(e) => setAutoRepair(e.target.checked)}
                  className="w-3 h-3 accent-amber-500 rounded"
                />
                <span className="text-[9px] font-black uppercase text-dark-400 group-hover:text-amber-600 transition-colors tracking-tighter">Auto-Repair Users</span>
              </label>
            </div>
          )}
          <button
            onClick={() => {
              setFormData({ fullName: '', email: '', phone: '', password: '', role: 'user', kyc: { panNumber: '', aadharNumber: '' }, isKYCVerified: false, state: '', city: '', tier: null });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-red-600 px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
          >
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white border border-dark-900/10 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:border-red-500/50 outline-none shadow-sm transition-all"
          />
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          {['all', 'active', 'inactive', 'kyc_pending'].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-dark-50 shadow-sm' : 'text-dark-400 hover:text-dark-200'
                }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          {['all', 'admin', 'user'].map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${roleFilter === r ? 'bg-indigo-500 text-white shadow-sm' : 'text-dark-400 hover:text-dark-200'
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${showFilters || stateFilter || cityFilter || tierFilter || planFilter
              ? 'bg-red-50 text-red-600 border-red-200'
              : 'bg-white text-dark-400 border-dark-900/10'
            }`}
        >
          <Filter size={14} />
          Filters
          {(stateFilter || cityFilter || tierFilter || planFilter) && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
              {[stateFilter, cityFilter, tierFilter, planFilter].filter(Boolean).length}
            </span>
          )}
        </button>
        {(stateFilter || cityFilter || tierFilter || planFilter) && (
          <button
            onClick={() => { setStateFilter(''); setCityFilter(''); setTierFilter(''); setPlanFilter(''); setPage(1); }}
            className="text-[10px] text-red-500 font-bold hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-dark-900/10 shadow-sm"
        >
          {/* 1. State — always enabled */}
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-dark-400 tracking-widest pl-1 flex items-center gap-1"><MapPin size={10} /> State</label>
            <select
              value={stateFilter}
              onChange={(e) => { setStateFilter(e.target.value); setCityFilter(''); setTierFilter(''); setPlanFilter(''); setPage(1); }}
              className="w-full bg-slate-50 border border-dark-900/10 rounded-xl px-3 py-2.5 text-xs font-bold outline-none"
            >
              <option value="">Select State</option>
              <option value="none">Unset / Missing</option>
              {(locationsLoaded && dbStates.length > 0 ? dbStates : getAllStates()).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* 2. City — enabled after state */}
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-dark-400 tracking-widest pl-1 flex items-center gap-1"><MapPin size={10} /> City</label>
            <select
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setTierFilter(''); setPlanFilter(''); setPage(1); }}
              disabled={!stateFilter}
              className={`w-full bg-slate-50 border border-dark-900/10 rounded-xl px-3 py-2.5 text-xs font-bold outline-none ${!stateFilter ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <option value="">{stateFilter ? 'All Cities' : 'Select State First'}</option>
              {stateFilter && <option value="none">Unset / Missing</option>}
              {stateFilter && (
                locationsLoaded
                  ? dbLocations.filter(l => l.state === stateFilter).map(l => <option key={l._id} value={l.city}>{l.city} ({l.userCount} users)</option>)
                  : getCitiesForState(stateFilter).map(c => <option key={c.name} value={c.name}>{c.name}</option>)
              )}
            </select>
          </div>
          {/* 3. Tier — enabled after city */}
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-dark-400 tracking-widest pl-1">Tier</label>
            <select
              value={tierFilter}
              onChange={(e) => { setTierFilter(e.target.value); setPlanFilter(''); setPage(1); }}
              disabled={!cityFilter}
              className={`w-full bg-slate-50 border border-dark-900/10 rounded-xl px-3 py-2.5 text-xs font-bold outline-none ${!cityFilter ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <option value="">{cityFilter ? 'Select Tier' : 'Select city first'}</option>
              {cityFilter && <option value="none">Unset / Missing</option>}
              <option value="1">Tier 1 — Megacities</option>
              <option value="2">Tier 2 — Regional Hubs</option>
              <option value="3">Tier 3 — Emerging</option>
              <option value="4">Tier 4 — Semi-Urban</option>
            </select>
          </div>
          {/* 4. Plan — enabled after tier */}
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-dark-400 tracking-widest pl-1">Plan</label>
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              disabled={!tierFilter}
              className={`w-full bg-slate-50 border border-dark-900/10 rounded-xl px-3 py-2.5 text-xs font-bold outline-none ${!tierFilter ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <option value="">{tierFilter ? 'Select Plan' : 'Select tier first'}</option>
              {availablePlans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white border border-dark-900/10 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-dark-900/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark-400">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark-400 hidden lg:table-cell">State</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark-400 hidden lg:table-cell">City</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark-400 hidden lg:table-cell">Capital</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark-400 hidden lg:table-cell">Revenue</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark-400 hidden md:table-cell">Plan Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-dark-400">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-900/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-6 py-4"><div className="h-10 bg-slate-50 rounded-xl" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-dark-400 text-sm font-medium">No users found matching your criteria.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="group hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => { setSelectedUser(u); setShowModal(true); setIsEditMode(false); }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-dark-50 font-bold border border-dark-900/5 group-hover:border-red-500/20 group-hover:bg-red-50 transition-all">
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-dark-50">{u.fullName}</p>
                          <p className="text-[10px] text-dark-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${!u.state ? 'text-amber-500' : 'text-dark-400'}`}>
                        {u.state || 'Unset'}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className={`text-xs font-bold flex items-center gap-1 ${!u.city ? 'text-amber-500' : 'text-dark-100'}`}>
                        <MapPin size={10} className={!u.city ? 'text-amber-500' : 'text-red-500'} /> {u.city || 'Unset'}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-sm font-bold text-dark-100 font-mono">₹{u.stats?.totalInvestment?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <p className="text-sm font-bold text-green-600 font-mono">₹{u.stats?.totalEarnings?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-xs font-bold text-dark-100">{u.currentPlan?.plan?.name || 'FREE'}</p>
                      {u.currentPlan?.endDate && <p className="text-[9px] text-dark-400 font-medium">{new Date(u.currentPlan.endDate) < new Date() ? 'Expired' : 'Active'}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase w-fit ${u.isActive ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase w-fit ${u.isKYCVerified ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                          {u.isKYCVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg bg-slate-100 text-dark-400 opacity-0 group-hover:opacity-100 transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination bar */}
        <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
          <p className="text-[10px] text-dark-400 font-black uppercase tracking-widest">Page {page} / {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl bg-white border disabled:opacity-30"><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-xl bg-white border disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Control Center Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-50/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: isMobile ? '100%' : 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isMobile ? '100%' : 20 }}
              className="bg-white border-t md:border border-dark-900/10 rounded-t-[2.5rem] md:rounded-[2rem] w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col self-end md:self-center"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 border-b p-4 md:p-6 flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-red-600 flex items-center justify-center text-white text-lg md:text-xl font-bold border-2 md:border-4 border-white shadow-lg">
                    {selectedUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base md:text-xl font-bold text-dark-50 flex items-center gap-2 truncate">
                      {selectedUser.fullName}
                      {selectedUser.isActive ? <CheckCircle size={16} className="text-blue-500 shrink-0" /> : <Ban size={16} className="text-red-500 shrink-0" />}
                    </h3>
                    <p className="text-[10px] md:text-sm font-medium text-dark-400 truncate">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={() => handleImpersonate(selectedUser._id)}
                    disabled={impersonating === selectedUser._id}
                    title="Login as this user"
                    className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all disabled:opacity-50"
                  >
                    {impersonating === selectedUser._id ? <RefreshCw size={18} className="animate-spin" /> : <UserCheck size={18} />}
                  </button>
                  <button
                    onClick={() => { setFormData({ fullName: selectedUser.fullName, email: selectedUser.email, phone: selectedUser.phone, role: selectedUser.role, kyc: selectedUser.kyc, isKYCVerified: selectedUser.isKYCVerified, state: selectedUser.state || '', city: selectedUser.city || '', tier: selectedUser.tier || null }); setIsEditMode(!isEditMode); }}
                    className={`p-2 md:p-2.5 rounded-lg md:rounded-xl border transition-all ${isEditMode ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-dark-400 border-dark-900/10'}`}
                  >
                    {isEditMode ? <XCircle size={18} /> : <Edit2 size={18} />}
                  </button>
                  <button onClick={() => setShowModal(false)} className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-dark-50 text-white hover:bg-black transition-all">
                    <XCircle size={18} />
                  </button>
                </div>
              </div>

              {/* Financial Quick View (Sticky) */}
              <div className="bg-white px-4 md:px-8 py-3 md:py-4 border-b grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 shadow-sm z-10">
                <div className="flex flex-col bg-slate-50/50 p-2 md:p-0 rounded-xl md:bg-transparent">
                  <span className="text-[8px] md:text-[10px] font-black uppercase text-dark-400 tracking-widest flex items-center gap-1.5"><Coins size={10} /> Cash Balance</span>
                  <span className="text-sm md:text-lg font-mono font-bold text-dark-50">₹{selectedUser.stats?.totalInvestment?.toLocaleString()}</span>
                </div>
                <div className="flex flex-col bg-slate-50/50 p-2 md:p-0 rounded-xl md:bg-transparent">
                  <span className="text-[8px] md:text-[10px] font-black uppercase text-dark-400 tracking-widest flex items-center gap-1.5"><TrendingUp size={10} className="text-green-500" /> Revenue</span>
                  <span className="text-sm md:text-lg font-mono font-bold text-green-600">₹{selectedUser.stats?.totalEarnings?.toLocaleString()}</span>
                </div>
                <div className="flex flex-col bg-slate-50/50 p-2 md:p-0 rounded-xl md:bg-transparent">
                  <span className="text-[8px] md:text-[10px] font-black uppercase text-dark-400 tracking-widest flex items-center gap-1.5"><Zap size={10} className="text-amber-500" /> Points</span>
                  <span className="text-sm md:text-lg font-mono font-bold text-dark-100">{selectedUser.stats?.pointsBalance?.toLocaleString()}</span>
                </div>
                <div className="flex flex-col bg-slate-50/50 p-2 md:p-0 rounded-xl md:bg-transparent">
                  <span className="text-[8px] md:text-[10px] font-black uppercase text-dark-400 tracking-widest flex items-center gap-1.5"><Gem size={10} className="text-blue-500" /> Gold</span>
                  <span className="text-sm md:text-lg font-mono font-bold text-dark-100">{selectedUser.stats?.goldBalance?.toFixed(4)} gr</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 space-y-4 md:space-y-6">
                <div className="grid grid-cols-12 gap-4 md:gap-6">
                  {/* Left Column: Management */}
                  <div className="col-span-12 lg:col-span-7 space-y-6">
                    {isEditMode ? (
                      <motion.form initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleUpdateDetails} className="bg-white p-6 rounded-3xl border border-red-500/10 shadow-xl space-y-4">
                        <h4 className="font-bold text-red-600 text-sm flex items-center gap-2 mb-4"><Shield size={16} /> Edit Operational Records</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1">Name</label>
                            <input type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1">Phone</label>
                            <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1">Email Authority</label>
                          <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1 flex items-center gap-1"><MapPin size={10} /> State</label>
                            <select value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value, city: '', tier: null })} className="w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-sm font-bold appearance-none cursor-pointer">
                              <option value="">Select State</option>
                              {getAllStates().map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1 flex items-center gap-1"><MapPin size={10} /> City</label>
                            <select value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value, tier: getCityTier(e.target.value, formData.state) })} disabled={!formData.state} className="w-full bg-slate-50 border rounded-xl px-3 py-2.5 text-sm font-bold appearance-none cursor-pointer disabled:opacity-50">
                              <option value="">Select City</option>
                              {formData.state && getCitiesForState(formData.state).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                          <button type="submit" disabled={formLoading} className="bg-red-600 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-lg flex-1">
                            {formLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Commit Changes'}
                          </button>
                          <button type="button" onClick={() => setIsEditMode(false)} className="bg-slate-100 text-dark-400 px-6 py-3 rounded-2xl text-sm font-bold">Discard</button>
                        </div>
                      </motion.form>
                    ) : (
                      <>
                        {/* Plan Assignment Card */}
                        <div className="bg-white p-4 md:p-6 rounded-3xl border border-dark-900/5 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-dark-50 text-sm flex items-center gap-2"><CreditCard size={16} className="text-blue-500" /> Subscription</h4>
                            <span className={`text-[8px] md:text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${selectedUser.currentPlan ? 'bg-green-500 text-white' : 'bg-slate-200 text-dark-400'}`}>
                              {selectedUser.currentPlan ? 'Active' : 'Unsubscribed'}
                            </span>
                          </div>
                          <div className="flex flex-col md:flex-row gap-3 bg-slate-50 p-4 rounded-2xl border border-dashed border-dark-900/10">
                            <div className="flex-1">
                              <p className="text-[8px] md:text-[10px] font-black uppercase text-dark-400 tracking-widest mb-1">Current Active Plan</p>
                              <p className="text-base md:text-lg font-bold text-dark-50">{selectedUser.currentPlan?.plan?.name || 'Standard Tier'}</p>
                              {selectedUser.currentPlan?.endDate && (
                                <p className="text-[9px] md:text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
                                  <Clock size={10} /> Ends {new Date(selectedUser.currentPlan.endDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="hidden md:block w-[1px] bg-dark-900/5" />
                            <div className="flex-1 flex flex-col justify-center pt-2 md:pt-0 border-t md:border-t-0 border-dark-900/5">
                              <p className="text-[8px] md:text-[10px] font-black uppercase text-dark-400 tracking-widest mb-2">Upgrade/Override</p>
                              <div className="flex gap-2">
                                <select value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)} className="flex-1 bg-white border border-dark-900/10 rounded-xl px-2 py-2 text-xs font-bold outline-none shadow-sm">
                                  <option value="">Select Plan...</option>
                                  {availablePlans.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                                <button onClick={() => handleAdminAction('assign_plan', { planId: selectedPlanId })} disabled={!selectedPlanId || formLoading} className="bg-red-600 text-white px-3 md:px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-lg">
                                  {formLoading ? <Loader2 size={12} className="animate-spin" /> : 'Assign'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Wallet Adjustment Card */}
                        <div className="bg-white p-4 md:p-6 rounded-3xl border border-dark-900/5 shadow-sm space-y-4">
                          <h4 className="font-bold text-dark-50 text-sm flex items-center gap-2"><DollarSign size={16} className="text-amber-500" /> Wallet Balances</h4>
                          <div className="grid grid-cols-3 gap-2 md:gap-3">
                            <div className="space-y-1">
                              <label className="text-[8px] md:text-[9px] font-bold text-dark-400 uppercase tracking-tighter pl-1">Cash ₹</label>
                              <input type="number" value={adjustment.cash} onChange={e => setAdjustment({ ...adjustment, cash: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border rounded-xl px-2 md:px-3 py-2 text-xs font-bold font-mono" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] md:text-[9px] font-bold text-dark-400 uppercase tracking-tighter pl-1">Points</label>
                              <input type="number" value={adjustment.points} onChange={e => setAdjustment({ ...adjustment, points: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border rounded-xl px-2 md:px-3 py-2 text-xs font-bold font-mono" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] md:text-[9px] font-bold text-dark-400 uppercase tracking-tighter pl-1">Gold gr</label>
                              <input type="number" step="0.0001" value={adjustment.gold} onChange={e => setAdjustment({ ...adjustment, gold: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border rounded-xl px-2 md:px-3 py-2 text-xs font-bold font-mono" />
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row gap-2">
                            <input type="text" placeholder="Adjustment reason..." value={adjustment.reason} onChange={e => setAdjustment({ ...adjustment, reason: e.target.value })} className="flex-1 bg-slate-50 border rounded-xl px-4 py-2.5 text-xs md:text-sm font-medium focus:bg-white transition-all shadow-inner" />
                            <button onClick={() => handleAdminAction('adjust_wallet', adjustment)} disabled={formLoading} className="bg-dark-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-black transition-all">
                              Apply
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right Column: Status & Security */}
                  <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* KYC Actions */}
                    <div className="bg-white p-6 rounded-3xl border border-dark-900/5 shadow-sm space-y-4">
                      <h4 className="font-bold text-dark-50 text-sm flex items-center gap-2"><Shield size={16} className="text-green-500" /> Identity Verification</h4>
                      <div className="space-y-3">
                        <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-dark-400 tracking-widest">KYC Status</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedUser.isKYCVerified ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>
                            {selectedUser.isKYCVerified ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono font-bold text-dark-100 p-2">
                          <div>PAN: {selectedUser.kyc?.panNumber || 'N/A'}</div>
                          <div>AADHAR: {selectedUser.kyc?.aadharNumber || 'N/A'}</div>
                        </div>
                        {selectedUser.kyc?.status === 'submitted' && !selectedUser.isKYCVerified && (
                          <div className="flex gap-2">
                            <button onClick={() => verifyKYC(selectedUser._id, 'approve')} className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-bold shadow-lg shadow-green-500/20">Approve</button>
                            <button onClick={() => verifyKYC(selectedUser._id, 'reject')} className="flex-1 bg-white border border-red-500/20 text-red-500 py-2 rounded-xl text-xs font-bold">Reject</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white p-6 rounded-3xl border border-dark-900/5 shadow-sm space-y-4">
                      <h4 className="font-bold text-dark-50 text-sm flex items-center gap-2"><CreditCard size={16} className="text-orange-500" /> Payment Methods</h4>
                      <div className="space-y-3">
                        {selectedUser.paymentMethods && selectedUser.paymentMethods.length > 0 ? (
                          selectedUser.paymentMethods.map((method, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-dark-900/5 group relative">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${method.isPrimary ? 'bg-orange-500 text-white' : 'bg-slate-200 text-dark-400'}`}>
                                    {method.type === 'upi' ? 'UPI Instance' : 'Bank Node'}
                                  </span>
                                  {method.isPrimary && (
                                    <span className="text-[8px] font-bold text-orange-600 uppercase tracking-tighter">Primary</span>
                                  )}
                                </div>
                                {method.isVerified && <CheckCircle size={12} className="text-blue-500" />}
                              </div>

                              {method.type === 'upi' ? (
                                <div className="flex items-center justify-between">
                                  <p className="font-mono text-xs font-bold text-dark-50 truncate mr-8">{method.upiId}</p>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(method.upiId); toast.success('UPI Copied'); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white border border-dark-900/10 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-50 hover:border-orange-200 text-dark-400 hover:text-orange-600"
                                  >
                                    <Copy size={12} />
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-[10px] text-dark-400 font-bold uppercase tracking-tight">{method.bankName}</p>
                                      <p className="font-mono text-xs font-bold text-dark-50">****{method.accountNumber?.slice(-4)}</p>
                                      <p className="text-[10px] text-dark-400 font-mono mt-0.5">{method.ifscCode}</p>
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(method.accountNumber); toast.success('A/C Copied'); }}
                                      className="p-2 rounded-xl bg-white border border-dark-900/10 shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-50"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-dark-900/10">
                            <p className="text-dark-400 text-[10px] font-bold uppercase tracking-widest">No Payment Interface Connected</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Security Controls */}
                    <div className="bg-white p-6 rounded-3xl border border-dark-900/5 shadow-sm space-y-4">
                      <h4 className="font-bold text-dark-50 text-sm flex items-center gap-2"><Activity size={16} className="text-red-500" /> Administrative Status</h4>
                      <div className="space-y-4">
                        <button onClick={() => toggleUserStatus(selectedUser._id, selectedUser.isActive)} className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${selectedUser.isActive ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-green-500 text-white shadow-green-500/20'}`}>
                          {selectedUser.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          {selectedUser.isActive ? 'Suspend Network Access' : 'Restore Functional Access'}
                        </button>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-dark-900/5 space-y-3">
                          <p className="text-[10px] font-black uppercase text-dark-400 tracking-widest">Withdrawal Lock</p>
                          <div className="flex gap-2">
                            <input type="date" value={lockDate} onChange={e => setLockDate(e.target.value)} className="flex-1 bg-white border rounded-xl px-3 py-2 text-xs font-bold" />
                            <button onClick={() => handleAdminAction('set_withdrawal_lock', { lockUntil: lockDate })} className="bg-dark-50 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Lock</button>
                          </div>
                          {selectedUser.withdrawalLockUntil && (
                            <button onClick={() => handleAdminAction('set_withdrawal_lock', { lockUntil: null })} className="text-[10px] text-red-600 font-bold hover:underline">Clear current lock</button>
                          )}
                        </div>

                        <button onClick={() => handleDeleteUser(selectedUser._id)} className="w-full py-3 text-red-600 text-[10px] font-black uppercase tracking-widest border border-red-100 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                          <Trash2 size={14} /> Wipe User Instance
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-dark-50/20 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white border rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
                <h3 className="font-bold text-dark-50 text-sm uppercase tracking-widest">Register Global Entity</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-dark-400 hover:text-dark-50 transition-all"><XCircle size={20} /></button>
              </div>
              <form onSubmit={handleCreateUser} className="p-8 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1">Full Legal Name</label>
                  <input type="text" required placeholder="User name" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold shadow-inner" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1">Network Email</label>
                    <input type="email" required placeholder="email@address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold shadow-inner" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1">Mobile Interface</label>
                    <input type="tel" required placeholder="10-digit phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold shadow-inner" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1">Initial Access Cipher</label>
                  <input type="text" required placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-mono font-bold shadow-inner" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1 flex items-center gap-1"><MapPin size={10} /> State</label>
                    <select value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value, city: '', tier: null })} className="w-full bg-slate-50 border rounded-xl px-3 py-3 text-sm font-bold appearance-none cursor-pointer">
                      <option value="">Select State</option>
                      {getAllStates().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1 flex items-center gap-1"><MapPin size={10} /> City</label>
                    <select value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value, tier: getCityTier(e.target.value, formData.state) })} disabled={!formData.state} className="w-full bg-slate-50 border rounded-xl px-3 py-3 text-sm font-bold appearance-none cursor-pointer disabled:opacity-50">
                      <option value="">Select City</option>
                      {formData.state && getCitiesForState(formData.state).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <button disabled={formLoading} className="w-full bg-red-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all mt-4">
                  {formLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Initialize Account'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
