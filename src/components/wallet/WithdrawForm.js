'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowDownToLine,
  CheckCircle,
  AlertCircle,
  Building2,
  Smartphone,
  Loader2,
  Info,
  Calendar,
  Calculator,
} from 'lucide-react';

export default function WithdrawForm({
  wallet,
  paymentMethods = [],
  onSubmit,
  withdrawalDate = 15,
  minAmount = 500,
  tdsPercentage = 30,
  processingFee = 10,
}) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const today = new Date();
  const windowEnd = withdrawalDate + 3;
  const isWithdrawalWindow = today.getDate() >= withdrawalDate && today.getDate() <= windowEnd;

  const parsedAmount = parseFloat(amount) || 0;
  const tdsAmount = (parsedAmount * tdsPercentage) / 100;
  const netAmount = Math.max(0, parsedAmount - tdsAmount - processingFee);
  const isValidAmount = parsedAmount >= minAmount && parsedAmount <= (wallet?.cashBalance || 0);

  const quickAmounts = useMemo(() => {
    const balance = wallet?.cashBalance || 0;
    const amounts = [500, 1000, 2000, 5000, 10000].filter(a => a <= balance);
    if (balance > 0 && !amounts.includes(Math.floor(balance))) {
      amounts.push(Math.floor(balance));
    }
    return amounts.slice(0, 4);
  }, [wallet?.cashBalance]);

  const handleSubmit = async () => {
    if (!isValidAmount) {
      toast.error(parsedAmount < minAmount ? `Minimum ₹${minAmount}` : 'Insufficient balance');
      return;
    }
    if (selectedMethod === null) {
      toast.error('Select a payment method');
      return;
    }
    if (!isWithdrawalWindow) {
      toast.error(`Withdrawals open on ${withdrawalDate}th of each month`);
      return;
    }

    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          amount: parsedAmount,
          paymentMethodId: selectedMethod,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Withdrawal Window Status */}
      <div className={`glass-card p-3.5 flex items-start gap-3 ${
        isWithdrawalWindow
          ? 'border border-green-500/20 bg-green-500/5'
          : 'border border-yellow-500/20 bg-yellow-500/5'
      }`}>
        {isWithdrawalWindow ? (
          <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />
        ) : (
          <Calendar size={16} className="text-yellow-400 shrink-0 mt-0.5" />
        )}
        <div>
          <p className={`text-xs font-semibold ${isWithdrawalWindow ? 'text-green-300' : 'text-yellow-300'}`}>
            {isWithdrawalWindow
              ? 'Withdrawal window is open!'
              : `Withdrawals open on ${withdrawalDate}th`}
          </p>
          <p className="text-[10px] text-dark-400 mt-0.5">
            {isWithdrawalWindow
              ? `Submit before ${withdrawalDate + 3}th to process this month`
              : `Next window: ${withdrawalDate}th - ${withdrawalDate + 3}th of this month`}
          </p>
        </div>
      </div>

      {/* Amount Input */}
      <div className="glass-card p-4 space-y-3">
        <label className="text-xs text-dark-300 font-medium block">Amount to Withdraw</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400 font-bold text-lg">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min={minAmount}
            max={wallet?.cashBalance || 0}
            className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-4 py-3.5 text-xl font-mono font-bold focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-dark-500">
            Min: ₹{minAmount.toLocaleString('en-IN')}
          </span>
          <span className="text-dark-500">
            Available: <span className="text-gold-400 font-mono">₹{wallet?.cashBalance?.toLocaleString('en-IN') || '0'}</span>
          </span>
        </div>

        {/* Quick Amounts */}
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(amt.toString())}
              className={`py-2 rounded-lg text-xs font-medium transition-all haptic-button ${
                amount === amt.toString()
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                  : 'bg-dark-800 text-dark-300 border border-dark-600 hover:border-dark-500'
              }`}
            >
              ₹{amt >= 1000 ? `${(amt / 1000).toFixed(amt % 1000 === 0 ? 0 : 1)}K` : amt}
            </button>
          ))}
        </div>
      </div>

      {/* Amount Breakdown */}
      {parsedAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card p-4 space-y-2"
        >
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="flex items-center justify-between w-full text-xs text-dark-300"
          >
            <span className="flex items-center gap-1.5">
              <Calculator size={13} className="text-dark-400" />
              Amount Breakdown
            </span>
            <span className="text-gold-400 font-mono font-bold">
              ₹{netAmount.toFixed(2)}
            </span>
          </button>

          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-1.5 pt-2 border-t border-dark-700/50 text-xs"
            >
              <div className="flex justify-between">
                <span className="text-dark-400">Withdrawal Amount</span>
                <span className="font-mono">₹{parsedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>TDS ({tdsPercentage}%)</span>
                <span className="font-mono">-₹{tdsAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>Processing Fee</span>
                <span className="font-mono">-₹{processingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-dark-700/50">
                <span className="text-green-400">You'll Receive</span>
                <span className="font-mono text-green-400">₹{netAmount.toFixed(2)}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Payment Method */}
      <div className="glass-card p-4 space-y-3">
        <p className="text-xs text-dark-300 font-medium">Payment Method</p>
        {paymentMethods.length > 0 ? (
          paymentMethods.map((method, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMethod(i)}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all haptic-button text-left ${
                selectedMethod === i
                  ? 'bg-gold-500/10 border border-gold-500/30'
                  : 'bg-dark-800 border border-dark-600 hover:border-dark-500'
              }`}
            >
              {method.type === 'upi' ? (
                <Smartphone size={18} className="text-purple-400 shrink-0" />
              ) : (
                <Building2 size={18} className="text-blue-400 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {method.type === 'upi' ? method.upiId : method.bankName}
                </p>
                <p className="text-[10px] text-dark-400 capitalize">
                  {method.type === 'upi' ? 'UPI' : `A/C: ****${method.accountNumber?.slice(-4)}`}
                </p>
              </div>
              {selectedMethod === i && (
                <CheckCircle size={16} className="text-gold-400 shrink-0" />
              )}
            </motion.button>
          ))
        ) : (
          <div className="text-center py-3">
            <p className="text-dark-400 text-xs">No payment methods</p>
            <a href="/profile" className="text-gold-400 text-[10px] font-semibold">
              Add in Profile →
            </a>
          </div>
        )}
      </div>

      {/* Submit */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        disabled={!isWithdrawalWindow || submitting || !isValidAmount || selectedMethod === null}
        className="w-full bg-gold-gradient text-dark-900 font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all haptic-button flex items-center justify-center gap-2"
      >
        {submitting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <ArrowDownToLine size={18} />
            Withdraw ₹{parsedAmount > 0 ? parsedAmount.toLocaleString('en-IN') : '0'}
          </>
        )}
      </motion.button>

      {/* Info */}
      <div className="flex items-start gap-2 px-1">
        <Info size={12} className="text-dark-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-dark-500 leading-relaxed">
          TDS of {tdsPercentage}% will be deducted as per Income Tax regulations.
          Processing may take 2-3 business days after approval.
        </p>
      </div>
    </div>
  );
}