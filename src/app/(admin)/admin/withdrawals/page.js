'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowDownToLine,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [globalLockDisabled, setGlobalLockDisabled] = useState(false);
  const [processingLock, setProcessingLock] = useState(false);

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
    fetchWithdrawals();
    fetchGlobalLockStatus();
  }, [filter, page]);

  const fetchGlobalLockStatus = async () => {
    try {
      const res = await fetch('/api/admin/mining-config');
      const data = await res.json();
      if (res.ok && data.configs) {
        setGlobalLockDisabled(data.configs.withdrawals_enabled_globally === false);
      }
    } catch (err) {
      console.error('Failed to fetch lock status', err);
    }
  };

  const toggleGlobalLock = async () => {
    setProcessingLock(true);
    try {
      const res = await fetch('/api/admin/mining-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_config',
          key: 'withdrawals_enabled_globally',
          value: globalLockDisabled ? true : false
        })
      });
      
      if (res.ok) {
        setGlobalLockDisabled(!globalLockDisabled);
        toast.success(`Withdrawals globally ${!globalLockDisabled ? 'disabled' : 'enabled'}`);
      }
    } catch (err) {
      toast.error('Failed to update global lock');
    } finally {
      setProcessingLock(false);
    }
  };

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: filter,
        page: page.toString(),
        limit: '20',
      });
      const res = await fetch(`/api/admin/approve-withdrawal?${params}`);
      const data = await res.json();
      if (res.ok) {
        setWithdrawals(data.withdrawals || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId) => {
    setProcessing(withdrawalId);
    try {
      const res = await fetch('/api/admin/approve-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId,
          action: 'approve',
        }),
      });

      if (res.ok) {
        toast.success('Withdrawal approved!');
        fetchWithdrawals();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to approve');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (withdrawalId) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setProcessing(withdrawalId);
    try {
      const res = await fetch('/api/admin/approve-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId,
          action: 'reject',
          reason: rejectReason,
        }),
      });

      if (res.ok) {
        toast.success('Withdrawal rejected');
        setShowRejectModal(null);
        setRejectReason('');
        fetchWithdrawals();
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const handleComplete = async (withdrawalId, transactionRef) => {
    setProcessing(withdrawalId);
    try {
      const res = await fetch('/api/admin/approve-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId,
          action: 'complete',
          transactionRef: transactionRef || `TXN${Date.now()}`,
        }),
      });

      if (res.ok) {
        toast.success('Withdrawal marked as completed!');
        fetchWithdrawals();
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    approved: 'bg-blue-500/10 text-blue-400',
    processing: 'bg-purple-500/10 text-purple-400',
    completed: 'bg-green-500/10 text-green-400',
    rejected: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">Withdrawals Management</h1>
          <p className="text-dark-500 text-sm mt-1 font-medium">Review, approve, and process withdrawal requests</p>
        </div>

        {/* Global Withdrawal Lock Toggle */}
        <div className="glass-card px-4 py-3 flex items-center gap-4 border-dark-900/10 shadow-sm min-w-[240px]">
           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${globalLockDisabled ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
              <AlertCircle size={20} className={globalLockDisabled ? 'text-red-600' : 'text-green-600'} />
           </div>
           <div className="flex-1">
              <p className="text-[10px] text-dark-400 font-bold uppercase tracking-widest">Global Status</p>
              <p className={`text-sm font-black ${globalLockDisabled ? 'text-red-600' : 'text-green-600'}`}>
                {globalLockDisabled ? 'DISABLED' : 'ACTIVE'}
              </p>
           </div>
           <button 
             onClick={toggleGlobalLock}
             disabled={processingLock}
             className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
               globalLockDisabled 
               ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
               : 'bg-red-600 text-white shadow-lg shadow-red-600/20'
             }`}
           >
             {processingLock ? '...' : (globalLockDisabled ? 'Enable' : 'Disable')}
           </button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {['pending', 'approved', 'processing', 'completed', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => { setFilter(status); setPage(1); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all capitalize whitespace-nowrap shadow-sm border ${
              filter === status
                ? 'bg-red-500 text-white border-red-500 shadow-red-500/20'
                : 'bg-white text-dark-400 border-dark-900/10 hover:border-dark-900/20'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Withdrawals List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse border-dark-900/10 shadow-sm">
              <div className="h-6 bg-slate-100 rounded-xl w-32 mb-3" />
              <div className="h-4 bg-slate-100 rounded-xl w-48" />
            </div>
          ))
        ) : withdrawals.length > 0 ? (
          withdrawals.map((wd) => (
            <motion.div
              key={wd._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 md:p-6 border-dark-900/10 shadow-sm hover:shadow-md transition-shadow w-full overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                {/* User & Amount Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20 shadow-sm">
                    <ArrowDownToLine size={24} className="text-gold-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-2xl font-mono font-bold text-dark-50">
                        ₹{wd.amount?.toLocaleString('en-IN')}
                      </p>
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider shadow-sm ${statusColors[wd.status]}`}>
                        {wd.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-dark-100 truncate">{wd.user?.fullName || 'Unknown User'}</p>
                    <p className="text-[10px] md:text-xs text-dark-500 font-medium truncate max-w-[180px] md:max-w-none">{wd.user?.email} • {wd.user?.phone}</p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="text-xs text-dark-500 space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-dark-900/5 w-full md:min-w-[200px] md:w-auto">
                  <p className="flex justify-between font-bold uppercase tracking-tight group cursor-pointer" onClick={() => copyToClipboard(wd.paymentMethod?.type === 'upi' ? wd.paymentMethod?.upiId : wd.paymentMethod?.bankName, 'Details')}>
                    <span className="text-dark-400">Method</span> 
                    <span className="text-dark-50 capitalize flex items-center gap-1.5">
                      {wd.paymentMethod?.type || 'N/A'}
                      <Copy size={10} className="text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </p>
                  {wd.paymentMethod?.type === 'upi' && (
                    <p className="flex justify-between font-bold uppercase tracking-tight group cursor-pointer" onClick={() => copyToClipboard(wd.paymentMethod?.upiId, 'UPI ID')}>
                      <span className="text-dark-400">UPI ID</span> 
                      <span className="text-dark-50 font-mono tracking-tight flex items-center gap-1.5 truncate max-w-[140px] md:max-w-none">
                        {wd.paymentMethod?.upiId}
                        <Copy size={10} className="text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </p>
                  )}
                  {wd.paymentMethod?.type === 'bank_account' && (
                    <>
                      <p className="flex justify-between font-bold uppercase tracking-tight group cursor-pointer" onClick={() => copyToClipboard(wd.paymentMethod?.bankName, 'Bank Name')}>
                        <span className="text-dark-400">Bank</span> 
                        <span className="text-dark-50 flex items-center gap-1.5">
                          {wd.paymentMethod?.bankName}
                          <Copy size={10} className="text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </p>
                      <p className="flex justify-between font-bold uppercase tracking-tight group cursor-pointer" onClick={() => copyToClipboard(wd.paymentMethod?.accountNumber, 'Account Number')}>
                        <span className="text-dark-400">A/C No</span> 
                        <span className="text-dark-50 font-mono flex items-center gap-1.5">
                          ****{wd.paymentMethod?.accountNumber?.slice(-4)}
                          <Copy size={10} className="text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </p>
                      <p className="flex justify-between font-bold uppercase tracking-tight group cursor-pointer" onClick={() => copyToClipboard(wd.paymentMethod?.ifscCode, 'IFSC Source')}>
                        <span className="text-dark-400">IFSC</span> 
                        <span className="text-dark-50 font-mono flex items-center gap-1.5">
                          {wd.paymentMethod?.ifscCode}
                          <Copy size={10} className="text-dark-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </p>
                    </>
                  )}
                  <div className="pt-1.5 border-t border-dark-900/5 mt-1">
                    <p className="text-[10px] text-dark-400 font-bold uppercase tracking-widest text-center">
                      Requested: {new Date(wd.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {wd.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(wd._id)}
                        disabled={processing === wd._id}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white text-sm font-bold shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all disabled:opacity-50"
                      >
                        {processing === wd._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        Approve Request
                      </button>
                      <button
                        onClick={() => setShowRejectModal(wd._id)}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-red-500/20 text-red-500 text-sm font-bold hover:bg-red-50 shadow-sm transition-all"
                      >
                        <XCircle size={16} />
                        Reject Request
                      </button>
                    </>
                  )}
                  {wd.status === 'approved' && (
                    <button
                      onClick={() => handleComplete(wd._id)}
                      disabled={processing === wd._id}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                      {processing === wd._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      Complete Payout
                    </button>
                  )}
                </div>
              </div>

              {/* Rejection reason */}
              {wd.status === 'rejected' && wd.rejectionReason && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <p className="text-xs text-red-400">Rejection Reason: {wd.rejectionReason}</p>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="glass-card p-12 text-center border-dark-900/10 shadow-sm bg-white">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-dark-900/5">
              <AlertCircle size={32} className="text-dark-400" />
            </div>
            <p className="text-dark-500 font-bold">No {filter} withdrawals found</p>
            <p className="text-dark-400 text-xs mt-1">Check other categories or wait for new requests</p>
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
              <h3 className="font-bold text-lg">Reject Request</h3>
            </div>
            
            <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Incomplete profile or suspicious activity..."
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
                {processing === showRejectModal ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}