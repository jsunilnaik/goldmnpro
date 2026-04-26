'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Copy,
  Shield,
  User,
  Zap,
  Calendar,
  Trash2,
  Ban,
} from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('pending_verification');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`, {
      style: {
        borderRadius: '16px',
        background: '#1a1a2e',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
      },
      iconTheme: {
        primary: '#f59e0b',
        secondary: '#fff',
      },
    });
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [filter, page]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: filter,
        page: page.toString(),
        limit: '20',
      });
      const res = await fetch(`/api/admin/subscriptions?${params}`);
      const data = await res.json();
      if (res.ok) {
        setSubscriptions(data.subscriptions || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (subscriptionId, action, reason = '') => {
    setProcessing(subscriptionId);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId,
          action,
          reason,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || `${action} successful`);
        if (action === 'reject') setShowRejectModal(null);
        fetchSubscriptions();
      } else {
        toast.error(data.message || `Failed to ${action}`);
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const handleApprove = (subId) => handleAction(subId, 'approve');
  const handleReject = (subId) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    handleAction(subId, 'reject', rejectReason);
  };
  const handleCancel = (subId) => {
    if (confirm('Are you sure you want to cancel this subscription? The user will lose access immediately.')) {
      handleAction(subId, 'cancel');
    }
  };
  const handleDelete = (subId) => {
    if (confirm('PERMANENT DELETE: Are you sure? This cannot be undone.')) {
      handleAction(subId, 'delete');
    }
  };

  const statusColors = {
    pending_verification: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    expired: 'bg-slate-200/50 text-dark-400 border-dark-900/10',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  const statusLabels = {
    pending_verification: 'Pending',
    active: 'Active',
    expired: 'Expired',
    rejected: 'Rejected',
    pending: 'Pending',
    cancelled: 'Cancelled',
  };

  const filterTabs = [
    { key: 'pending_verification', label: 'Pending Verification', icon: Clock, color: 'amber' },
    { key: 'active', label: 'Active', icon: CheckCircle, color: 'green' },
    { key: 'expired', label: 'Expired', icon: Calendar, color: 'slate' },
    { key: 'rejected', label: 'Rejected', icon: XCircle, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-dark-50">Subscriptions</h1>
        <p className="text-dark-500 text-sm mt-1 font-medium">Verify UPI payments and manage user subscriptions</p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => { setFilter(key); setPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all capitalize whitespace-nowrap shadow-sm border ${
              filter === key
                ? 'bg-red-500 text-white border-red-500 shadow-red-500/20'
                : 'bg-white text-dark-400 border-dark-900/10 hover:border-dark-900/20'
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Count Badge */}
      {!loading && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-dark-400 uppercase tracking-widest font-bold">
            {total} {filter.replace('_', ' ')} subscription{total !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse border-dark-900/10 shadow-sm">
              <div className="h-6 bg-slate-100 rounded-xl w-32 mb-3" />
              <div className="h-4 bg-slate-100 rounded-xl w-48" />
            </div>
          ))
        ) : subscriptions.length > 0 ? (
          subscriptions.map((sub) => (
            <motion.div
              key={sub._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 md:p-6 border-dark-900/10 shadow-sm hover:shadow-md transition-shadow w-full overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                {/* User & Plan Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20 shadow-sm">
                    <CreditCard size={24} className="text-gold-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-2xl font-mono font-bold text-dark-50">
                        ₹{sub.amountPaid?.toLocaleString('en-IN')}
                      </p>
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider shadow-sm border ${statusColors[sub.status]}`}>
                        {statusLabels[sub.status] || sub.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-dark-100 truncate">
                      {sub.user?.fullName || 'Unknown User'}
                    </p>
                    <p className="text-[10px] md:text-xs text-dark-500 font-medium truncate max-w-[180px] md:max-w-none">
                      {sub.user?.email} {sub.user?.phone ? `• ${sub.user.phone}` : ''}
                    </p>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="text-xs text-dark-500 space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-dark-900/5 w-full md:min-w-[220px] md:w-auto">
                  <p className="flex justify-between font-bold uppercase tracking-tight">
                    <span className="text-dark-400">Plan</span>
                    <span className="text-dark-50">{sub.plan?.name || 'N/A'}</span>
                  </p>
                  <p className="flex justify-between font-bold uppercase tracking-tight">
                    <span className="text-dark-400">Duration</span>
                    <span className="text-dark-50">{sub.plan?.duration || 'N/A'} days</span>
                  </p>
                  <p className="flex justify-between font-bold uppercase tracking-tight">
                    <span className="text-dark-400">Rate</span>
                    <span className="text-dark-50 flex items-center gap-1">
                      <Zap size={10} className="text-gold-600" />
                      {sub.plan?.miningRate || 'N/A'} pts/hr
                    </span>
                  </p>

                  {/* UTR Number */}
                  {sub.utr && (
                    <div
                      className="flex justify-between font-bold uppercase tracking-tight group cursor-pointer pt-1.5 border-t border-dark-900/5 mt-1"
                      onClick={() => copyToClipboard(sub.utr, 'UTR')}
                    >
                      <span className="text-dark-400">UTR</span>
                      <span className="text-dark-50 font-mono tracking-wider flex items-center gap-1.5 truncate max-w-[140px] md:max-w-none">
                        {sub.utr}
                        <Copy size={10} className="text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </div>
                  )}

                  <div className="pt-1.5 border-t border-dark-900/5 mt-1">
                    <p className="text-[10px] text-dark-400 font-bold uppercase tracking-widest text-center">
                      Submitted: {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {sub.status === 'pending_verification' && (
                    <>
                      <button
                        onClick={() => handleApprove(sub._id)}
                        disabled={processing === sub._id}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white text-sm font-bold shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all disabled:opacity-50"
                      >
                        {processing === sub._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        Approve & Activate
                      </button>
                      <button
                        onClick={() => setShowRejectModal(sub._id)}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-red-500/20 text-red-500 text-sm font-bold hover:bg-red-50 shadow-sm transition-all"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </>
                  )}
                  {sub.status === 'active' && sub.endDate && (
                    <div className="flex flex-col gap-2">
                      <div className="text-center p-3 rounded-xl bg-green-50 border border-green-200/50">
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Expires</p>
                        <p className="text-sm font-bold text-green-700 mt-1">
                          {new Date(sub.endDate).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCancel(sub._id)}
                        disabled={processing === sub._id}
                        className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all border border-red-200/50 disabled:opacity-50"
                      >
                        {processing === sub._id ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
                        Cancel Plan
                      </button>
                    </div>
                  )}

                  {/* Delete Button for Admin (Visible for anything not pending) */}
                  {sub.status !== 'pending_verification' && (
                    <button
                      onClick={() => handleDelete(sub._id)}
                      disabled={processing === sub._id}
                      className="self-end p-2.5 rounded-lg text-dark-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-40 hover:opacity-100"
                      title="Permanently Delete Record"
                    >
                      {processing === sub._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Rejection reason */}
              {sub.status === 'rejected' && sub.rejectionReason && (
                <div className="mt-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <p className="text-xs text-red-500 font-medium">
                    <strong>Rejection Reason:</strong> {sub.rejectionReason}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="glass-card p-12 text-center border-dark-900/10 shadow-sm bg-white">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-dark-900/5">
              <CreditCard size={32} className="text-dark-400" />
            </div>
            <p className="text-dark-500 font-bold">No {filter.replace('_', ' ')} subscriptions found</p>
            <p className="text-dark-400 text-xs mt-1">
              {filter === 'pending_verification'
                ? 'No new payments awaiting verification'
                : 'Check other categories'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-3 rounded-2xl bg-white border border-dark-900/10 hover:bg-slate-50 disabled:opacity-30 shadow-sm transition-all"
          >
            <ChevronLeft size={20} className="text-dark-50" />
          </button>
          <span className="text-[10px] text-dark-500 uppercase tracking-widest font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-3 rounded-2xl bg-white border border-dark-900/10 hover:bg-slate-50 disabled:opacity-30 shadow-sm transition-all"
          >
            <ChevronRight size={20} className="text-dark-50" />
          </button>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-50/20 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-dark-900/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <h3 className="font-bold text-lg">Reject Subscription</h3>
            </div>

            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., UTR not found in bank statement, amount mismatch..."
              rows={3}
              className="w-full bg-slate-50 border border-dark-900/10 rounded-2xl px-4 py-4 text-sm font-medium outline-none focus:border-red-500/50 shadow-sm transition-all text-dark-50 resize-none"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-3.5 rounded-2xl bg-white border border-dark-900/10 text-dark-400 text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
              >
                Go Back
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={processing === showRejectModal}
                className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {processing === showRejectModal ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
