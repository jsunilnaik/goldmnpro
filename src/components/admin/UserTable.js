'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Download,
  MoreVertical,
  Shield,
  Crown,
  Loader2,
  ArrowUpDown,
  Copy,
  ExternalLink,
} from 'lucide-react';

export default function UserTable({
  users = [],
  loading = false,
  page = 1,
  totalPages = 1,
  onPageChange,
  onSearch,
  onFilterChange,
  onToggleStatus,
  onViewUser,
  onVerifyKYC,
  currentFilter = 'all',
}) {
  const [searchValue, setSearchValue] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedRow, setExpandedRow] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    // Debounce search
    clearTimeout(window.__searchTimeout);
    window.__searchTimeout = setTimeout(() => {
      if (onSearch) onSearch(value);
    }, 300);
  };

  const handleToggleStatus = async (userId, isActive) => {
    setActionLoading(userId);
    try {
      if (onToggleStatus) await onToggleStatus(userId, isActive);
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const filters = [
    { value: 'all', label: 'All Users', count: null },
    { value: 'active', label: 'Active', count: null },
    { value: 'inactive', label: 'Inactive', count: null },
    { value: 'kyc_pending', label: 'KYC Pending', count: null },
  ];

  const getStatusBadge = (user) => {
    if (!user.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
        Active
      </span>
    );
  };

  const getKYCBadge = (user) => {
    if (user.isKYCVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400">
          <Shield size={10} />
          Verified
        </span>
      );
    }
    if (user.kyc?.status === 'submitted') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/10 text-yellow-400 animate-pulse">
          <Shield size={10} />
          Pending
        </span>
      );
    }
    if (user.kyc?.status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400">
          <Shield size={10} />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-dark-700 text-dark-400">
        <Shield size={10} />
        Not Done
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, phone or referral code..."
            value={searchValue}
            onChange={handleSearch}
            className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all placeholder:text-dark-500"
          />
          {searchValue && (
            <button
              onClick={() => {
                setSearchValue('');
                if (onSearch) onSearch('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
            >
              <XCircle size={14} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange && onFilterChange(f.value)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                currentFilter === f.value
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-dark-800 text-dark-400 border border-dark-600 hover:border-dark-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Export Button */}
        <button className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-800 border border-dark-600 text-xs text-dark-300 hover:text-white hover:border-dark-500 transition-all whitespace-nowrap">
          <Download size={12} />
          Export
        </button>
      </div>

      {/* Table Container */}
      <div className="glass-card overflow-hidden border border-dark-700/30">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-800/50">
                <th className="text-left text-[10px] text-dark-400 uppercase tracking-wider px-4 py-3 font-semibold">
                  User
                </th>
                <th className="text-left text-[10px] text-dark-400 uppercase tracking-wider px-4 py-3 font-semibold">
                  Contact
                </th>
                <th className="text-left text-[10px] text-dark-400 uppercase tracking-wider px-4 py-3 font-semibold">
                  Plan
                </th>
                <th className="text-left text-[10px] text-dark-400 uppercase tracking-wider px-4 py-3 font-semibold">
                  KYC
                </th>
                <th className="text-left text-[10px] text-dark-400 uppercase tracking-wider px-4 py-3 font-semibold">
                  Status
                </th>
                <th className="text-left text-[10px] text-dark-400 uppercase tracking-wider px-4 py-3 font-semibold">
                  Referral
                </th>
                <th className="text-left text-[10px] text-dark-400 uppercase tracking-wider px-4 py-3 font-semibold">
                  Joined
                </th>
                <th className="text-right text-[10px] text-dark-400 uppercase tracking-wider px-4 py-3 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/30">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-dark-700 rounded-full animate-pulse" />
                          <div>
                            <div className="h-4 bg-dark-700 rounded w-28 mb-1.5 animate-pulse" />
                            <div className="h-3 bg-dark-700 rounded w-36 animate-pulse" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                : users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-dark-800/30 transition-colors"
                    >
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {user.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[150px]">
                              {user.fullName}
                            </p>
                            <p className="text-[10px] text-dark-400 truncate max-w-[150px]">
                              ID: {user._id?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="text-xs text-dark-300 flex items-center gap-1">
                            <Mail size={10} className="text-dark-500" />
                            {user.email}
                          </p>
                          <p className="text-xs text-dark-300 flex items-center gap-1">
                            <Phone size={10} className="text-dark-500" />
                            {user.phone}
                          </p>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3">
                        {user.currentPlan?.plan?.name ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gold-500/10 text-gold-400 text-xs font-medium">
                            <Crown size={10} />
                            {user.currentPlan.plan.name}
                          </span>
                        ) : (
                          <span className="text-xs text-dark-500">None</span>
                        )}
                      </td>

                      {/* KYC */}
                      <td className="px-4 py-3">{getKYCBadge(user)}</td>

                      {/* Status */}
                      <td className="px-4 py-3">{getStatusBadge(user)}</td>

                      {/* Referral */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono text-dark-300">
                            {user.referralCode}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(user.referralCode)
                            }
                            className="text-dark-500 hover:text-dark-300"
                          >
                            <Copy size={10} />
                          </button>
                        </div>
                        <p className="text-[10px] text-dark-500">
                          {user.referralCount || 0} referrals
                        </p>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-dark-400">
                          {new Date(user.createdAt).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              onViewUser && onViewUser(user)
                            }
                            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye size={13} />
                          </motion.button>

                          {/* KYC Action */}
                          {user.kyc?.status === 'submitted' &&
                            !user.isKYCVerified && (
                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() =>
                                  onVerifyKYC &&
                                  onVerifyKYC(user._id, 'approve')
                                }
                                className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                                title="Verify KYC"
                              >
                                <Shield size={13} />
                              </motion.button>
                            )}

                          {/* Toggle Status */}
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() =>
                              handleToggleStatus(
                                user._id,
                                user.isActive
                              )
                            }
                            disabled={actionLoading === user._id}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.isActive
                                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                                : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                            } disabled:opacity-50`}
                            title={
                              user.isActive ? 'Deactivate' : 'Activate'
                            }
                          >
                            {actionLoading === user._id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : user.isActive ? (
                              <Ban size={13} />
                            ) : (
                              <CheckCircle size={13} />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>

          {!loading && users.length === 0 && (
            <div className="py-12 text-center">
              <Users className="w-10 h-10 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400 text-sm">No users found</p>
              <p className="text-dark-500 text-xs mt-1">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-dark-700/30">
          {loading
            ? [...Array(3)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-dark-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-dark-700 rounded w-28 mb-1" />
                      <div className="h-3 bg-dark-700 rounded w-40" />
                    </div>
                  </div>
                </div>
              ))
            : users.map((user) => (
                <div key={user._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.fullName}
                        </p>
                        <p className="text-[10px] text-dark-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {getStatusBadge(user)}
                      <button
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === user._id ? null : user._id
                          )
                        }
                        className="p-1.5 text-dark-400"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedRow === user._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-dark-700/30 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-dark-400">Phone</span>
                            <span>{user.phone}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-dark-400">Plan</span>
                            <span>
                              {user.currentPlan?.plan?.name || 'None'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-dark-400">KYC</span>
                            {getKYCBadge(user)}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-dark-400">
                              Referral Code
                            </span>
                            <span className="font-mono">
                              {user.referralCode}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-dark-400">Joined</span>
                            <span>
                              {new Date(
                                user.createdAt
                              ).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() =>
                                onViewUser && onViewUser(user)
                              }
                              className="flex-1 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() =>
                                handleToggleStatus(
                                  user._id,
                                  user.isActive
                                )
                              }
                              className={`flex-1 py-2 rounded-lg text-xs font-semibold ${
                                user.isActive
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-green-500/10 text-green-400'
                              }`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

          {!loading && users.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-dark-400 text-sm">No users found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-dark-700/30 bg-dark-800/30">
            <p className="text-[10px] text-dark-400">
              Page {page} of {totalPages} •{' '}
              {users.length} users shown
            </p>
            <div className="flex gap-1.5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  onPageChange && onPageChange(Math.max(1, page - 1))
                }
                disabled={page === 1}
                className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </motion.button>

              {/* Page Numbers */}
              {Array.from(
                { length: Math.min(5, totalPages) },
                (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() =>
                        onPageChange && onPageChange(pageNum)
                      }
                      className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-dark-800 text-dark-400 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() =>
                  onPageChange &&
                  onPageChange(Math.min(totalPages, page + 1))
                }
                disabled={page === totalPages}
                className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}