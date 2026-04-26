export const runtime = 'edge';
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    CreditCard,
    Pickaxe,
    ArrowDownToLine,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    AlertCircle,
    CheckCircle,
    Clock,
    BarChart3,
    MapPin,
    Filter,
    XCircle,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { getAllStates, getCitiesForState } from '@/lib/india-cities';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);

    const [stateFilter, setStateFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [dbStates, setDbStates] = useState([]);
    const [dbLocations, setDbLocations] = useState([]);
    const [locationsLoaded, setLocationsLoaded] = useState(false);

    useEffect(() => {
        fetchLocations();
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [stateFilter, cityFilter]);

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
            setLocationsLoaded(false);
        }
    };

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (stateFilter) params.append('state', stateFilter);
            if (cityFilter) params.append('city', cityFilter);

            const res = await fetch(`/api/admin/dashboard?${params.toString()}`);
            const data = await res.json();
            if (res.ok) {
                setStats(data.stats);
                setRecentUsers(data.recentUsers || []);
                setPendingWithdrawals(data.pendingWithdrawals || []);
            }
        } catch (error) {
            console.error('Admin data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.totalUsers || 0,
            change: `+${stats?.newUsersToday || 0} today`,
            icon: Users,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
        },
        {
            title: 'Active Subscriptions',
            value: stats?.activeSubscriptions || 0,
            change: `${stats?.subscriptionRate || 0}% conversion`,
            icon: CreditCard,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
        },
        {
            title: 'Total Revenue',
            value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
            change: `+₹${(stats?.revenueToday || 0).toLocaleString('en-IN')} today`,
            icon: DollarSign,
            color: 'text-gold-400',
            bg: 'bg-gold-500/10',
        },
        {
            title: 'Active Mining',
            value: stats?.activeMining || 0,
            change: 'sessions right now',
            icon: Pickaxe,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
        },
        {
            title: 'Pending Withdrawals',
            value: stats?.pendingWithdrawals || 0,
            change: `₹${(stats?.pendingAmount || 0).toLocaleString('en-IN')} total`,
            icon: ArrowDownToLine,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
        },
        {
            title: 'Total Withdrawn',
            value: `₹${(stats?.totalWithdrawn || 0).toLocaleString('en-IN')}`,
            change: 'all time',
            icon: TrendingUp,
            color: 'text-cyan-400',
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="glass-card p-6 animate-pulse">
                        <div className="h-4 bg-slate-100 rounded w-24 mb-3" />
                        <div className="h-8 bg-slate-100 rounded w-32" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-dark-50">Admin Dashboard</h1>
                    <p className="text-dark-500 text-sm mt-1 font-medium">Platform overview and management</p>
                </div>

                {/* Regional Filters */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-dark-900/5 shadow-sm">
                    <div className="relative min-w-[160px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
                           <MapPin size={14} />
                        </span>
                        <select
                            value={stateFilter}
                            onChange={(e) => { setStateFilter(e.target.value); setCityFilter(''); }}
                            className="w-full bg-slate-50 border border-dark-900/10 rounded-xl pl-9 pr-8 py-2 text-xs font-bold outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-all"
                        >
                            <option value="">All States</option>
                            {(locationsLoaded && dbStates.length > 0 ? dbStates : getAllStates()).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark-300">
                           <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>

                    <div className="relative min-w-[160px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
                           <MapPin size={14} />
                        </span>
                        <select
                            value={cityFilter}
                            onChange={(e) => setCityFilter(e.target.value)}
                            disabled={!stateFilter}
                            className={`w-full bg-slate-50 border border-dark-900/10 rounded-xl pl-9 pr-8 py-2 text-xs font-bold outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-all ${!stateFilter ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        >
                            <option value="">{stateFilter ? 'All Cities' : 'Select State'}</option>
                            {stateFilter && (
                                locationsLoaded
                                    ? dbLocations.filter(l => l.state === stateFilter).map(l => (
                                        <option key={l._id} value={l.city}>{l.city} ({l.userCount})</option>
                                    ))
                                    : getCitiesForState(stateFilter).map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                    ))
                            )}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark-300">
                           <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>

                    {(stateFilter || cityFilter) && (
                        <button
                            onClick={() => { setStateFilter(''); setCityFilter(''); }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Clear Filters"
                        >
                            <XCircle size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card p-4 md:p-5 border-dark-900/10 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] text-dark-500 uppercase tracking-widest font-bold">{stat.title}</span>
                                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center border border-current opacity-80`}>
                                    <Icon size={16} className={stat.color} />
                                </div>
                            </div>
                            <p className="text-xl md:text-2xl font-bold font-mono text-dark-100">{stat.value}</p>
                            <p className="text-[10px] text-dark-500 mt-1 font-bold">{stat.change}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="glass-card p-5 border-dark-900/10 shadow-sm">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-dark-50">
                        <Users size={16} className="text-blue-500" />
                        Recent Signups
                    </h3>
                    <div className="space-y-3">
                        {recentUsers.map((u, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-dark-900/5">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 text-xs font-bold border border-blue-500/20">
                                    {u.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate text-dark-100">{u.fullName}</p>
                                    <p className="text-[10px] text-dark-500 font-medium">{u.email}</p>
                                </div>
                                <span className="text-[10px] text-dark-500 font-bold">
                                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        ))}
                        {recentUsers.length === 0 && (
                            <p className="text-dark-500 text-sm text-center py-8 font-medium">No recent signups</p>
                        )}
                    </div>
                </div>

                {/* Pending Withdrawals */}
                <div className="glass-card p-5 border-dark-900/10 shadow-sm">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-dark-50">
                        <AlertCircle size={16} className="text-yellow-600" />
                        Pending Withdrawals
                    </h3>
                    <div className="space-y-3">
                        {pendingWithdrawals.map((wd, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-dark-900/5">
                                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 text-xs font-bold border border-yellow-500/20">
                                    ₹
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-mono font-bold text-dark-100">
                                        ₹{wd.amount?.toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-[10px] text-dark-500 font-medium">{wd.user?.fullName || 'User'}</p>
                                </div>
                                <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-yellow-500/10 text-yellow-600 border border-yellow-500/10">
                                    Pending
                                </span>
                            </div>
                        ))}
                        {pendingWithdrawals.length === 0 && (
                            <p className="text-dark-500 text-sm text-center py-8 font-medium">No pending withdrawals</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}