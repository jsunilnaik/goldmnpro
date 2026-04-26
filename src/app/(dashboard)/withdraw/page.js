export const runtime = 'edge';
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowDownToLine,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Banknote,
  Smartphone,
  Building2,
  Loader2,
  Info,
} from 'lucide-react';

export default function WithdrawPage() {
  const { user, wallet, refreshWallet } = useAuth();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const withdrawalDateConfig = process.env.NEXT_PUBLIC_WITHDRAWAL_DATE || '15';
  const MIN_WITHDRAWAL = parseInt(process.env.NEXT_PUBLIC_MIN_WITHDRAWAL || '500');

  const today = new Date();
  const dayOfMonth = today.getDate();
  let isWithdrawalWindow = false;

  if (withdrawalDateConfig === 'daily') {
    isWithdrawalWindow = true;
  } else {
    const allowedDays = withdrawalDateConfig.toString().split(',').map(d => parseInt(d.trim()));
    const windowDays = 2; // Fixed 3-day window including start day
    for (const startDay of allowedDays) {
      if (dayOfMonth >= startDay && dayOfMonth <= (startDay + windowDays)) {
        isWithdrawalWindow = true;
        break;
      }
    }
  }

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch('/api/withdrawals');
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal is ₹${MIN_WITHDRAWAL}`);
      return;
    }

    if (parseFloat(amount) > (wallet?.cashBalance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (!isWithdrawalWindow) {
      toast.error(`Withdrawals are only available on the ${withdrawalDateConfig}th of each month`);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethodId: selectedMethod,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Withdrawal request submitted!');
        setAmount('');
        refreshWallet();
        fetchWithdrawals();
      } else {
        toast.error(data.message || 'Withdrawal failed');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = {
    pending: 'text-amber-600 bg-amber-500/10 border border-amber-500/10',
    approved: 'text-blue-600 bg-blue-500/10 border border-blue-500/10',
    processing: 'text-purple-600 bg-purple-500/10 border border-purple-500/10',
    completed: 'text-green-600 bg-green-500/10 border border-green-500/10',
    rejected: 'text-red-600 bg-red-500/10 border border-red-500/10',
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-dark-50">Withdraw</h1>
        <p className="text-dark-500 text-sm mt-1 font-medium">Transfer earnings to your bank</p>
      </div>

      {/* Balance Card */}
      <div className="glass-card p-6 text-center border-gold-500/30 shadow-sm bg-white">
        <p className="text-dark-500 text-xs uppercase tracking-wider font-bold">Available Balance</p>
        <p className="text-3xl font-mono font-bold text-gold-600 mt-1">
          ₹{wallet?.cashBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
        </p>
        {wallet?.pendingWithdrawal > 0 && (
          <p className="text-xs text-amber-600 font-medium mt-2 bg-amber-500/5 py-1 px-3 rounded-full inline-block">
            ₹{wallet.pendingWithdrawal.toLocaleString('en-IN')} pending withdrawal
          </p>
        )}
      </div>

      {/* Withdrawal Window Notice */}
      {/* Withdrawal Window Notice */}
      <div className={`glass-card p-4 flex items-start gap-3 shadow-sm ${
        isWithdrawalWindow
          ? 'border-green-500/20 bg-green-500/5'
          : 'border-amber-500/20 bg-amber-500/5'
      }`}>
        {isWithdrawalWindow ? (
          <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
        ) : (
          <Calendar size={18} className="text-amber-600 shrink-0 mt-0.5" />
        )}
        <div>
          <p className={`text-sm font-bold ${isWithdrawalWindow ? 'text-green-700' : 'text-amber-700'}`}>
            {isWithdrawalWindow
              ? 'Withdrawal window is open!'
              : `Next withdrawal: ${withdrawalDateConfig}${withdrawalDateConfig === 'daily' ? '' : 'th of this month'}`
            }
          </p>
          <p className="text-xs text-dark-500 mt-1 font-medium leading-relaxed">
            {withdrawalDateConfig === 'daily' 
              ? 'Withdrawals are currently enabled daily for all users.'
              : `Withdrawals are processed on the ${withdrawalDateConfig}th of every month. Requests must be submitted within the 3-day window.`
            }
          </p>
        </div>
      </div>

      {/* KYC Warning */}
      {!user?.isKYCVerified && (
        <div className="glass-card p-4 flex items-start gap-3 border-red-500/20 bg-red-500/5 shadow-sm">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700">KYC Verification Required</p>
            <p className="text-xs text-dark-500 mt-1 font-medium">
              You must verify your identity before making a withdrawal. 
              Please upload your PAN and Aadhar card in your profile.
            </p>
            <a href="/profile" className="text-red-600 text-[10px] font-bold mt-2 inline-block uppercase tracking-wider">
              Verify KYC Now →
            </a>
          </div>
        </div>
      )}

      {/* Amount Input */}
      <div className="glass-card p-5 space-y-4 border-dark-800 shadow-sm">
        <label className="block">
          <span className="text-[10px] text-dark-500 mb-2 block uppercase font-bold tracking-wider">Withdrawal Amount</span>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-bold">₹</span>
            <input
              type="text"
              readOnly
              value={amount ? amount.toLocaleString('en-IN') : ''}
              placeholder="Select amount below"
              className="w-full bg-slate-50 border border-dark-800 rounded-xl pl-8 pr-4 py-3 text-lg font-mono font-bold text-dark-100 shadow-sm outline-none transition-all cursor-not-allowed"
            />
          </div>
          <p className="text-[10px] text-dark-400 mt-1.5 font-bold uppercase tracking-wider text-right italic">Fixed amounts only for secure P2P matching</p>
        </label>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {[1000, 2000, 3000, 4999, 9999, 19999].map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt)}
              className={`py-3 rounded-lg text-xs font-bold transition-all haptic-button border ${
                amount === amt
                  ? 'bg-gold-500/10 text-gold-600 border-gold-500/30 shadow-sm'
                  : 'bg-white text-dark-500 border-dark-800 hover:border-dark-400'
              }`}
            >
              ₹{amt.toLocaleString('en-IN')}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="glass-card p-5 space-y-4 border-dark-800 shadow-sm">
        <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">Select Payment Method</p>

        {user?.paymentMethods?.filter(m => m.type === 'upi').length > 0 ? (
          <div className="space-y-2">
            {user.paymentMethods
              .filter(m => m.type === 'upi')
              .map((method, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMethod(method._id || i)}
                  className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all haptic-button ${
                    selectedMethod === (method._id || i)
                      ? 'bg-gold-500/5 border border-gold-500/40 shadow-sm'
                      : 'bg-white border border-dark-800 hover:border-dark-400'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Smartphone size={18} className="text-purple-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-dark-100">{method.upiId}</p>
                    <p className="text-[11px] text-dark-500 font-medium">UPI ID (Primary)</p>
                  </div>
                  {selectedMethod === (method._id || i) && (
                    <CheckCircle size={18} className="text-gold-600" />
                  )}
                </motion.button>
              ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-dark-900/5 rounded-2xl border-2 border-dashed border-dark-800">
            <Smartphone size={32} className="mx-auto text-dark-700 mb-2 opacity-30" />
            <p className="text-dark-500 text-sm font-bold">No UPI ID Found</p>
            <p className="text-[10px] text-dark-600 mt-1 mb-4">You must add a UPI ID to receive P2P payments.</p>
            <a href="/profile" className="inline-block bg-dark-950 text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg">
              Add UPI Now
            </a>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleWithdraw}
        disabled={!isWithdrawalWindow || submitting || !amount || !selectedMethod || !user?.isKYCVerified}
        className="w-full bg-gold-gradient text-dark-50 font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all haptic-button shadow-md"
      >
        {submitting ? (
          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
        ) : !user?.isKYCVerified ? (
          'Complete KYC to Withdraw'
        ) : !selectedMethod ? (
          'Select Payment Method'
        ) : (
          `Withdraw ₹${amount || '0'}`
        )}
      </motion.button>

      {/* TDS Notice */}
      <div className="glass-card p-4 flex items-start gap-3 border-dark-800 shadow-sm bg-blue-50/30">
        <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
          <Info size={14} className="text-blue-600" />
        </div>
        <p className="text-[11px] text-dark-500 leading-relaxed font-medium">
          TDS of 30% will be deducted as per Income Tax regulations. Processing fee of ₹10
          may apply for bank transfers.
        </p>
      </div>

      {/* Incoming P2P Payments for Confirmation */}
      <IncomingPayments fetchWithdrawals={fetchWithdrawals} />

      {/* Withdrawal History */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock size={16} className="text-dark-400" />
          Withdrawal History
        </h3>

        <div className="space-y-2.5">
          {withdrawals.map((wd) => (
            <div key={wd._id} className="glass-card p-4 flex items-center gap-4 border-dark-800 shadow-sm hover:translate-x-1 transition-transform">
              <div className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${statusColors[wd.status]}`}>
                {wd.status}
              </div>
              <div className="flex-1">
                <p className="text-sm font-mono font-bold text-dark-100">₹{wd.amount?.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider mt-0.5">
                  {new Date(wd.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                {wd.status === 'rejected' && wd.rejectionReason && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 italic">
                    Reason: {wd.rejectionReason}
                  </p>
                )}
              </div>
              {wd.netAmount && (
                <div className="text-right">
                  <p className="text-[9px] text-dark-500 font-bold uppercase tracking-wider">Net Amount</p>
                  <p className="text-sm font-mono font-bold text-green-600">₹{wd.netAmount?.toLocaleString('en-IN')}</p>
                </div>
              )}
            </div>
          ))}

          {withdrawals.length === 0 && (
            <div className="glass-card p-6 text-center">
              <p className="text-dark-400 text-sm">No withdrawals yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IncomingPayments({ fetchWithdrawals }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/withdrawals/matches');
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error('Fetch matches error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (matchId) => {
    if (!window.confirm('Have you received this payment in your bank?')) return;
    
    setConfirmingId(matchId);
    try {
      const res = await fetch('/api/withdrawals/confirm-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Payment confirmed!');
        fetchMatches();
        fetchWithdrawals();
      } else {
        toast.error(data.message || 'Confirmation failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) return null;
  if (matches.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2 text-dark-50">
        <Banknote size={16} className="text-green-500" />
        Incoming P2P Payments
      </h3>
      <div className="space-y-2">
        {matches.map((match) => (
          <div key={match._id} className="glass-card p-4 border-green-500/20 bg-green-500/5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">Incoming Payment</p>
                <p className="text-sm font-bold text-dark-50">{match.subscriber?.fullName || 'User'}</p>
                <p className="text-lg font-mono font-bold text-green-700">₹{match.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                  match.status === 'paid' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {match.status === 'paid' ? 'Paid - Confirm Now' : 'Pending Payment'}
                </span>
                <p className="text-[9px] text-dark-400 mt-1 font-medium italic">
                  Matched {new Date(match.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {match.status === 'paid' && (
              <div className="mt-3 pt-3 border-t border-green-500/10">
                <p className="text-[10px] text-dark-500 mb-2">
                  <span className="font-bold">UTR:</span> {match.proof?.utr}
                </p>
                <button
                  onClick={() => handleConfirm(match._id)}
                  disabled={confirmingId === match._id}
                  className="w-full py-2 rounded-lg bg-green-600 text-white text-[11px] font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {confirmingId === match._id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      Confirm Receipt
                    </>
                  )}
                </button>
              </div>
            )}
            
            {match.status === 'matched' && (
              <p className="text-[10px] text-dark-400 mt-2 flex items-center gap-1">
                <Clock size={10} /> Waiting for subscriber to pay and upload proof...
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}