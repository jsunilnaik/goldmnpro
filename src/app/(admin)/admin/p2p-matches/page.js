export const runtime = 'edge';
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Copy,
  Zap,
  ArrowRight,
  Search,
  ExternalLink,
  ShieldAlert,
  ArrowDownToLine,
  Smartphone,
} from 'lucide-react';

export default function AdminP2PMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal state for force confirm/cancel
  const [actionModal, setActionModal] = useState(null); // { matchId, action }
  const [actionReason, setActionReason] = useState('');
  const [upiModal, setUpiModal] = useState(null); // { matchId, currentUpi }
  const [newUpi, setNewUpi] = useState('');

  useEffect(() => {
    fetchMatches();
  }, [filter, page]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: filter,
        page: page.toString(),
        limit: '20',
      });
      const res = await fetch(`/api/admin/p2p-matches?${params}`);
      const data = await res.json();
      if (res.ok) {
        setMatches(data.matches || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      toast.error('Failed to load P2P matches');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAction = async () => {
    if (!actionModal) return;
    if (!actionReason.trim()) {
      toast.error('Please provide a reason for this audit action');
      return;
    }

    const { matchId, action } = actionModal;
    setProcessing(matchId);
    
    try {
      const res = await fetch('/api/admin/p2p-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, action, reason: actionReason }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setActionModal(null);
        setActionReason('');
        fetchMatches();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateUpi = async () => {
    if (!upiModal || !newUpi.trim()) return;

    setProcessing(upiModal.matchId);
    try {
      const res = await fetch('/api/admin/p2p-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          matchId: upiModal.matchId, 
          action: 'update-upi', 
          upiId: newUpi 
        }),
      });

      if (res.ok) {
        toast.success('UPI ID updated');
        setUpiModal(null);
        setNewUpi('');
        fetchMatches();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setProcessing(null);
    }
  };

  const statusColors = {
    matched: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    paid: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    confirmed: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    completed: 'bg-green-500/10 text-green-600 border-green-500/20',
    cancelled: 'bg-slate-200/50 text-dark-400 border-dark-900/10',
    disputed: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const filterTabs = [
    { key: 'all', label: 'All Matches', icon: Users },
    { key: 'confirmed', label: 'Needs Finalize', icon: Clock },
    { key: 'paid', label: 'Paid (Proof Uploaded)', icon: ShieldAlert },
    { key: 'matched', label: 'Initial (Matched)', icon: Zap },
    { key: 'completed', label: 'Completed', icon: CheckCircle },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50">P2P Match Management</h1>
          <p className="text-dark-500 text-sm mt-1 font-medium">Monitor and audit direct user-to-user payments</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-dark-900/10 shadow-sm">
          <div className="flex items-center gap-2 px-3 text-dark-400">
            <Search size={14} />
            <input 
              type="text" 
              placeholder="Search Matches..." 
              className="bg-transparent border-none text-xs font-bold outline-none w-32 md:w-48 text-dark-50"
            />
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setFilter(key); setPage(1); }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${
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

      {/* Stats Summary */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 border-dark-900/5 bg-white">
            <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest">Total Matches</p>
            <p className="text-2xl font-mono font-bold text-dark-50 mt-1">{total}</p>
          </div>
          <div className="glass-card p-4 border-amber-500/10 bg-amber-50/30">
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Pending Confirmation</p>
            <p className="text-2xl font-mono font-bold text-amber-600 mt-1">
              {matches.filter(m => m.status === 'paid').length}
            </p>
          </div>
          <div className="glass-card p-4 border-red-500/10 bg-red-50/30">
            <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">Average Settlement Time</p>
            <p className="text-2xl font-mono font-bold text-red-600 mt-1">2.4 hrs</p>
          </div>
        </div>
      )}

      {/* Matches List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
             <div key={i} className="glass-card p-8 animate-pulse border-dark-900/10 shadow-sm h-32" />
          ))
        ) : matches.length > 0 ? (
          matches.map((match) => (
            <motion.div
              key={match._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden border-dark-900/10 shadow-sm hover:shadow-md transition-shadow bg-white w-full"
            >
              {/* Header Status Bar */}
              <div className="bg-slate-50 border-b border-dark-900/5 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider shadow-sm border ${statusColors[match.status]}`}>
                    {match.status}
                  </span>
                  <p className="text-[10px] text-dark-400 font-bold uppercase tracking-widest">
                    ID: {match._id.slice(-8)} • Created: {new Date(match.createdAt).toLocaleString()}
                  </p>
                </div>
                {match.status === 'paid' && (
                  <div className="flex items-center gap-1 text-amber-600 font-bold animate-pulse">
                    <Clock size={12} />
                    <span className="text-[10px] uppercase tracking-tighter">Needs Review</span>
                  </div>
                )}
              </div>

              <div className="p-4 md:p-6 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8">
                {/* Subscriber */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20 mb-2">
                    <Users size={20} />
                  </div>
                  <p className="text-[10px] text-dark-400 font-bold uppercase tracking-widest">Subscriber (Sender)</p>
                  <p className="text-sm font-bold text-dark-50 mt-0.5 truncate w-full px-2">{match.subscriber?.fullName}</p>
                  <p className="text-[10px] text-dark-500 font-medium truncate max-w-[150px] md:max-w-none">{match.subscriber?.phone || match.subscriber?.email}</p>
                </div>

                <div className="flex flex-col items-center gap-2">
                   <div className="flex items-center gap-1.5">
                     <div className="h-px w-8 md:w-16 bg-dark-900/10" />
                     <div className="px-4 py-2 rounded-2xl bg-dark-50 text-white font-mono font-bold text-lg shadow-lg">
                       ₹{match.amount.toLocaleString()}
                     </div>
                     <div className="h-px w-8 md:w-16 bg-dark-900/10" />
                   </div>
                   <ArrowRight size={16} className="text-dark-400" />
                </div>

                {/* Withdrawer */}
                <div className="flex-1 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 border border-green-500/20 mb-2">
                    <ArrowDownToLine size={20} />
                  </div>
                  <p className="text-[10px] text-dark-400 font-bold uppercase tracking-widest">Withdrawer (Receiver)</p>
                  <p className="text-sm font-bold text-dark-50 mt-0.5 truncate w-full px-2">{match.withdrawer?.fullName}</p>
                  <p className="text-[10px] text-dark-500 font-medium truncate max-w-[150px] md:max-w-none">{match.withdrawer?.phone || match.withdrawer?.email}</p>
                </div>

                {/* Audit & Actions */}
                <div className="w-full lg:w-64 p-4 bg-slate-50 rounded-2xl border border-dark-900/5 space-y-3">
                   {match.proof?.utr ? (
                     <div className="space-y-1">
                       <p className="text-[10px] text-dark-400 font-bold uppercase tracking-widest">Transaction UTR</p>
                       <div className="flex items-center justify-between text-sm font-mono font-bold text-dark-50 bg-white p-2 rounded-xl border border-dark-900/5">
                         {match.proof.utr}
                         <button onClick={() => {
                           navigator.clipboard.writeText(match.proof.utr);
                           toast.success('UTR Copied');
                         }}>
                           <Copy size={12} className="text-dark-400 hover:text-dark-50" />
                         </button>
                       </div>
                     </div>
                   ) : (
                     <div className="text-center py-2">
                       <p className="text-[10px] text-dark-400 font-medium italic">No proof uploaded yet</p>
                     </div>
                   )}

                    {match.proof?.screenshot && (
                      <button 
                        onClick={() => window.open(match.proof.screenshot, '_blank')}
                        className="w-full py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={12} />
                        View Screenshot
                      </button>
                    )}

                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          setUpiModal({ matchId: match._id, currentUpi: match.customUpiId || match.withdrawer?.paymentMethods?.find(m => m.isPrimary)?.upiId });
                          setNewUpi(match.customUpiId || match.withdrawer?.paymentMethods?.find(m => m.isPrimary)?.upiId || '');
                        }}
                        className="w-full py-2 bg-white border border-dark-900/10 text-dark-500 text-[10px] font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Smartphone size={12} />
                        {match.customUpiId ? 'Edit Custom UPI' : 'Set Custom UPI'}
                      </button>
                      {match.status === 'confirmed' && (
                        <button 
                          onClick={() => setActionModal({ matchId: match._id, action: 'finalize' })}
                          className="w-full py-2 bg-green-600 text-white text-[10px] font-bold rounded-xl shadow-sm hover:translate-y-[-1px] transition-all"
                        >
                          Finalize & Activate
                        </button>
                      )}
                      {(match.status === 'matched' || match.status === 'paid') && (
                        <button 
                          onClick={() => setActionModal({ matchId: match._id, action: 'cancel' })}
                          className="w-full py-2 bg-white border border-red-500/20 text-red-500 text-[10px] font-bold rounded-xl shadow-sm"
                        >
                          Cancel/Reset Match
                        </button>
                      )}
                   </div>
                </div>
              </div>

              {match.adminNotes && (
                <div className="px-6 py-3 bg-blue-50/50 border-t border-dark-900/5">
                  <p className="text-[10px] text-dark-500 italic">
                    <span className="font-bold text-dark-400 uppercase">Admin Note:</span> {match.adminNotes}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="glass-card p-12 text-center border-dark-900/10 shadow-sm bg-white">
             <AlertCircle size={48} className="text-dark-200 mx-auto mb-4" />
             <p className="text-dark-500 font-bold">No matches found for this filter</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-3 rounded-2xl bg-white border border-dark-900/10 hover:bg-slate-50 disabled:opacity-30 shadow-sm"
          >
            <ChevronLeft size={20} className="text-dark-50" />
          </button>
          <span className="text-[10px] text-dark-500 uppercase tracking-widest font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-3 rounded-2xl bg-white border border-dark-900/10 hover:bg-slate-50 disabled:opacity-30 shadow-sm"
          >
            <ChevronRight size={20} className="text-dark-50" />
          </button>
        </div>
      )}

      {/* Action Modal */}
      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-50/20 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-dark-900/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  actionModal.action === 'finalize' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'
                }`}>
                  <ShieldAlert size={20} />
                </div>
                <h3 className="font-bold text-lg capitalize">
                  {actionModal.action.replace('_', ' ')}
                </h3>
              </div>

              <p className="text-xs text-dark-500 mb-4 font-medium">
                Please provide a reason for this override. This action will be logged in the audit trail.
              </p>

              <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">Audit Note / Reason</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Reason for audit action..."
                rows={3}
                className="w-full bg-slate-50 border border-dark-900/10 rounded-2xl px-4 py-4 text-sm font-medium outline-none focus:border-red-500/50 shadow-sm transition-all text-dark-50 resize-none"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setActionModal(null); setActionReason(''); }}
                  className="flex-1 py-3.5 rounded-2xl bg-white border border-dark-900/10 text-dark-400 text-sm font-bold"
                >
                   Close
                </button>
                <button
                  onClick={handleAdminAction}
                  disabled={processing}
                  className={`flex-1 py-3.5 rounded-2xl text-white text-sm font-bold shadow-lg transition-all ${
                    actionModal.action === 'finalize' ? 'bg-green-600 shadow-green-500/20' : 'bg-red-600 shadow-red-500/20'
                  }`}
                >
                  {processing ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Confirm Action'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPI Update Modal */}
      <AnimatePresence>
        {upiModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-50/20 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-dark-900/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Smartphone size={20} />
                </div>
                <h3 className="font-bold text-lg">Update Payment UPI</h3>
              </div>

              <p className="text-xs text-dark-500 mb-4 font-medium">
                Set a custom UPI ID for this match. The subscriber will see this UPI instead of the withdrawer's primary one.
              </p>

              <label className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-widest px-1">New UPI ID</label>
              <input
                type="text"
                value={newUpi}
                onChange={(e) => setNewUpi(e.target.value)}
                placeholder="example@upi"
                className="w-full bg-slate-50 border border-dark-900/10 rounded-2xl px-4 py-4 text-sm font-bold outline-none focus:border-purple-500/50 shadow-sm transition-all text-dark-50"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setUpiModal(null); setNewUpi(''); }}
                  className="flex-1 py-3.5 rounded-2xl bg-white border border-dark-900/10 text-dark-400 text-sm font-bold"
                >
                   Close
                </button>
                <button
                  onClick={handleUpdateUpi}
                  disabled={processing}
                  className="flex-1 py-3.5 rounded-2xl bg-purple-600 text-white text-sm font-bold shadow-lg shadow-purple-500/20 transition-all font-display"
                >
                  {processing ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Update UPI ID'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
