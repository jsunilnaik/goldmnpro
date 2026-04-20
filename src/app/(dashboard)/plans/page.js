'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  Crown,
  Check,
  Star,
  Zap,
  Shield,
  TrendingUp,
  Loader2,
  X,
  Copy,
  QrCode,
  Smartphone,
  Clock,
  AlertCircle,
  CreditCard,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || 'goldminepro@ibl';

export default function PlansPage() {
  const { user, fetchUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  // Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [utrInput, setUtrInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: scan, 2: enter UTR, 3: result
  const [paymentResult, setPaymentResult] = useState(null); // { status, message }
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [showMissingPaymentModal, setShowMissingPaymentModal] = useState(false);

  // P2P Matching state
  const [initiating, setInitiating] = useState(false);
  const [activeMatches, setActiveMatches] = useState([]);
  const [currentSubscriptionId, setCurrentSubscriptionId] = useState(null);
  const [adminRemainder, setAdminRemainder] = useState(0);

  const qrCanvasRef = useRef(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      setPlans(data.plans);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  // Generate QR code on canvas using UPI deep link
  useEffect(() => {
    if (showPaymentModal && selectedPlan && qrCanvasRef.current) {
      generateQR();
    }
  }, [showPaymentModal, selectedPlan, paymentStep]);

  const getUpiLink = (upiId, amount) => {
    if (!selectedPlan) return '';
    return `upi://pay?pa=${upiId}&pn=GoldMine%20Pro&am=${amount}&cu=INR&tn=Plan%20${encodeURIComponent(selectedPlan.name)}`;
  };

  const QRCodeCanvas = ({ text, size = 180 }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
      if (canvasRef.current && text) {
        import('qrcode').then((QRCode) => {
          QRCode.default.toCanvas(canvasRef.current, text, {
            width: size,
            margin: 2,
            color: {
              dark: '#1a1a2e',
              light: '#ffffff',
            },
          });
        });
      }
    }, [text, size]);
    return <canvas ref={canvasRef} className="rounded-lg shadow-sm" />;
  };

  const openPaymentModal = async (plan) => {
    // 1. Check if user has payment methods setup
    if (!user?.paymentMethods || user.paymentMethods.length === 0) {
      setShowMissingPaymentModal(true);
      return;
    }

    setSubscribing(plan._id);
    setInitiating(true);
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan._id })
      });
      const data = await res.json();

      if (res.ok) {
        setSelectedPlan(plan);
        setActiveMatches(data.matches || []);
        setCurrentSubscriptionId(data.subscriptionId);
        setAdminRemainder(data.remainder);
        setShowPaymentModal(true);
        setPaymentStep(1);
        setUtrInput('');
        setPaymentResult(null);
        setScreenshot(null);
        setScreenshotPreview(null);
      } else {
        toast.error(data.message || 'Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setInitiating(false);
      setSubscribing(null);
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setUtrInput('');
    setPaymentResult(null);
    setScreenshot(null);
    setScreenshotPreview(null);
    setSubscribing(null);
    setSubmitting(false);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    toast.success('UPI ID copied!', {
      icon: '📋',
      style: {
        borderRadius: '16px',
        background: '#1a1a2e',
        color: '#fff',
        fontSize: '13px',
        fontWeight: 'bold',
      },
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size too large (max 2MB)');
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitUtr = async () => {
    const cleanUtr = utrInput.trim();
    if (!/^\d{12}$/.test(cleanUtr)) {
      toast.error('Please enter a valid 12-digit UTR number');
      return;
    }

    if (!screenshotPreview) {
      toast.error('Please upload a screenshot of your payment proof');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/payments/submit-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan._id,
          subscriptionId: currentSubscriptionId,
          utr: cleanUtr,
          screenshot: screenshotPreview,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPaymentStep(3);
        setPaymentResult({
          status: data.status,
          message: data.message,
        });

        if (data.status === 'active') {
          fetchUser();
        }
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const planIcons = {
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Diamond: '💎',
  };

  const planGradients = {
    Bronze: 'from-amber-700 to-amber-900',
    Silver: 'from-gray-300 to-gray-500',
    Gold: 'from-gold-400 to-gold-600',
    Diamond: 'from-cyan-300 to-blue-500',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-dark-50">Choose Your Plan</h1>
        <p className="text-dark-500 text-sm mt-1 font-medium">Select a mining plan to start earning rewards</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan, index) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative glass-card overflow-hidden border-dark-800 shadow-sm ${plan.isPopular ? 'ring-2 ring-gold-500/20' : ''
              }`}
          >
            {/* Popular Badge */}
            {plan.isPopular && (
              <div className="absolute top-0 right-0 bg-gold-500 text-dark-50 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">
                Most Popular
              </div>
            )}

            {/* Plan Header */}
            <div className={`p-6 bg-gradient-to-br ${planGradients[plan.name] || 'from-slate-100 to-slate-200'} bg-opacity-10 border-b border-dark-900/5`}>
              <span className="text-3xl filter drop-shadow-sm">{planIcons[plan.name] || '⛏️'}</span>
              <h3 className="text-xl font-display font-bold mt-2 text-dark-50">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                {plan.originalPrice && (
                  <span className="text-xs text-dark-400 line-through">
                    ₹{plan.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold font-mono text-dark-50">₹{plan.price.toLocaleString('en-IN')}</span>
                  <span className="text-dark-500 text-xs font-medium ml-1">/{plan.duration} days</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="p-5 space-y-3.5 bg-white/50">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0">
                  <Zap size={10} className="text-gold-600" />
                </div>
                <span className="text-dark-200 font-medium">Mining Rate: <strong className="text-gold-600">{plan.miningRate} pts/hr</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp size={10} className="text-green-600" />
                </div>
                <span className="text-dark-200 font-medium">Est. Return: <strong className="text-green-600">₹{plan.estimatedMonthlyReturn?.toLocaleString('en-IN')}</strong>/mo</span>
              </div>

              <div className="h-px bg-dark-900/5 my-2" />

              {plan.features?.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check
                    size={14}
                    className={`shrink-0 ${feature.included ? 'text-green-600' : 'text-dark-400'}`}
                  />
                  <span className={`font-medium ${feature.included ? 'text-dark-100' : 'text-dark-500 line-through'}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Subscribe Button */}
            <div className="p-5 pt-0">
              {user?.currentPlan?.plan?._id === plan._id ? (
                <div className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border-2 ${
                  user.currentPlan.status === 'active'
                    ? 'bg-green-500/10 border-green-500/20 text-green-600'
                    : user.currentPlan.status === 'exhausted'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                }`}>
                  {user.currentPlan.status === 'active' ? (
                    <>
                      <CheckCircle size={16} />
                      Current Plan
                    </>
                  ) : user.currentPlan.status === 'exhausted' ? (
                    <>
                      <AlertCircle size={16} />
                      Limit Reached (2X)
                    </>
                  ) : (
                    <>
                      <Clock size={16} className="animate-pulse" />
                      Pending Verification
                    </>
                  )}
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openPaymentModal(plan)}
                  disabled={subscribing === plan._id}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all haptic-button ${plan.isPopular
                      ? 'bg-gold-gradient text-dark-50 hover:shadow-lg hover:shadow-gold-500/30'
                      : 'bg-white text-dark-50 hover:bg-slate-50 border border-dark-800 shadow-sm'
                    } disabled:opacity-50`}
                >
                  {initiating && subscribing === plan._id ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Subscribe Now'
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════
          UPI PAYMENT MODAL — Horizontal Rectangle
         ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPaymentModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-dark-950/95 backdrop-blur-xl mt-0"
            onClick={(e) => {
              if (e.target === e.currentTarget && paymentStep !== 3) closePaymentModal();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-none md:rounded-3xl w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-3xl shadow-2xl overflow-hidden flex flex-col relative"
            >
              {/* Global Close Button */}
              <button
                onClick={closePaymentModal}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white md:bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors z-[1000] text-dark-50 md:text-dark-500 backdrop-blur-md shadow-lg"
              >
                <X size={20} />
              </button>

              {paymentStep !== 3 && (
                <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden no-scrollbar">
                  {/* ═══ LEFT PANEL — QR & UPI ═══ */}
                  <div className="md:w-[340px] shrink-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gold-500/5 rounded-full blur-[80px] pointer-events-none" />

                    <div className="relative z-10 w-full">
                      {/* Plan badge */}
                      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 mb-5 border border-white/10">
                        <span className="text-lg">{planIcons[selectedPlan.name] || '⛏️'}</span>
                        <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{selectedPlan.name} Plan</span>
                      </div>

                      {/* Amount */}
                      <p className="text-2xl md:text-3xl font-bold font-mono text-white mb-0.5">₹{selectedPlan.price.toLocaleString('en-IN')}</p>
                      <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4 md:mb-6">{selectedPlan.duration} days subscription</p>

                      {/* Dynamic Payment Details (P2P) */}
                      <div className="w-full space-y-4 mb-4">
                        {/* 1. P2P Match Card */}
                        {activeMatches.map((match, idx) => (
                          <div key={`user-${idx}`} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-left">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Pay to User</span>
                              <span className="text-sm font-bold text-gold-400">₹{match.amount}</span>
                            </div>
                            <p className="text-sm font-bold text-white mb-2">{match.withdrawerName}</p>

                            {match.paymentMethod ? (
                              <div className="space-y-3">
                                <div className="bg-white p-1.5 rounded-xl flex justify-center shadow-inner">
                                  <QRCodeCanvas 
                                    text={`upi://pay?pa=${match.paymentMethod.upiId}&pn=${encodeURIComponent(match.withdrawerName)}&am=${match.amount}&cu=INR&tn=GoldMine%20Plan`} 
                                    size={120}
                                  />
                                </div>

                                <div
                                  onClick={() => {
                                    navigator.clipboard.writeText(match.paymentMethod.upiId);
                                    toast.success('UPI ID copied!');
                                  }}
                                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all font-mono"
                                >
                                  <div className="flex items-center gap-2">
                                    <Smartphone size={12} className="text-gold-400" />
                                    <span className="text-[11px] text-white/80">{match.paymentMethod.upiId}</span>
                                  </div>
                                  <Copy size={12} className="text-white/30" />
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-red-400">Payment details missing</p>
                            )}
                          </div>
                        ))}

                        {/* 2. Admin Remainder Card (if any) or Full Admin Fallback */}
                        {(adminRemainder > 0 || activeMatches.length === 0) && (
                          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-left">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Pay to Company</span>
                              <span className="text-sm font-bold text-gold-400">₹{adminRemainder > 0 ? adminRemainder : selectedPlan.price}</span>
                            </div>
                            <div className="bg-white p-1.5 rounded-xl inline-block mb-3 mx-auto w-full flex justify-center">
                              <QRCodeCanvas 
                                text={`upi://pay?pa=${UPI_ID}&pn=GoldMine%20Pro&am=${adminRemainder > 0 ? adminRemainder : selectedPlan.price}&cu=INR&tn=Plan%20Upgrade`} 
                                size={120}
                              />
                            </div>
                            <div
                              onClick={copyUpiId}
                              className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <Smartphone size={12} className="text-gold-400" />
                                <span className="text-[11px] font-mono text-white/80">{UPI_ID}</span>
                              </div>
                              <Copy size={12} className="text-white/30" />
                            </div>
                          </div>
                        )}

                        {/* Mobile Pay Button */}
                        <div className="md:hidden pt-2">
                          <button
                            onClick={() => {
                              const targetUpiId = activeMatches.length === 1 && activeMatches[0].paymentMethod?.upiId
                                ? activeMatches[0].paymentMethod.upiId
                                : UPI_ID;
                              const targetAmount = activeMatches.length === 1
                                ? activeMatches[0].amount
                                : (adminRemainder > 0 ? adminRemainder : selectedPlan.price);

                              window.location.href = getUpiLink(targetUpiId, targetAmount);
                              toast.loading('Opening UPI Apps...', { id: 'upi-redirect', duration: 2000 });
                            }}
                            className="w-full py-3.5 rounded-2xl bg-gold-gradient text-dark-950 font-black text-[13px] shadow-xl shadow-gold-500/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                          >
                            <Smartphone size={18} />
                            PAY VIA ANY UPI APP
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ═══ RIGHT PANEL — Instructions & UTR ═══ */}
                  <div className="flex-1 p-5 md:p-8 flex flex-col relative bg-white pb-24 md:pb-8">

                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 mb-4 md:mb-6 pr-12 md:pr-8">
                      {[1, 2].map((step) => (
                        <div key={step} className="flex items-center gap-1.5 flex-1">
                          <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold shrink-0 transition-all ${paymentStep >= step
                              ? 'bg-gold-500 text-white shadow-sm shadow-gold-500/30'
                              : 'bg-slate-100 text-dark-400'
                            }`}>
                            {paymentStep > step ? <Check size={10} /> : step}
                          </div>
                          <div className={`h-1 rounded-full flex-1 transition-all duration-300 ${paymentStep >= step ? 'bg-gold-500' : 'bg-slate-100'
                            }`} />
                        </div>
                      ))}
                    </div>

                    {/* Step 1: Instructions */}
                    {paymentStep === 1 && (
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-3 md:space-y-4">
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-dark-50 font-display mb-0.5 md:mb-1">Complete Payment</h3>
                            <p className="text-[11px] md:text-sm text-dark-400 font-medium leading-tight">Follow the steps below to activate your plan</p>
                          </div>

                          {/* Step instructions */}
                          <div className="space-y-2 md:space-y-3">
                            <div className="flex items-start gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-xl bg-slate-50 border border-dark-900/5">
                              <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0">
                                <QrCode size={12} className="text-gold-600" />
                              </div>
                              <div>
                                <p className="text-[11px] md:text-sm font-bold text-dark-100">Scan QR or Copy UPI ID</p>
                                <p className="text-[9px] md:text-xs text-dark-400 font-medium mt-0.5">Pay <strong className="text-gold-600">₹{selectedPlan.price.toLocaleString('en-IN')}</strong> from any UPI app</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-xl bg-slate-50 border border-dark-900/5">
                              <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Shield size={12} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="text-[11px] md:text-sm font-bold text-dark-100">Note the UTR Number</p>
                                <p className="text-[9px] md:text-xs text-dark-400 font-medium mt-0.5">You will need the 12-digit transaction ID</p>
                              </div>
                            </div>
                          </div>

                          {/* Warning */}
                          <div className="flex items-start gap-2 p-2.5 md:p-3 rounded-xl bg-amber-50 border border-amber-200/50">
                            <AlertCircle size={12} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] md:text-xs text-amber-800 font-medium leading-relaxed">
                              Stay on this screen until you've submitted your UTR.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setPaymentStep(2)}
                          className="w-full py-3.5 rounded-2xl bg-gold-gradient text-dark-50 font-bold text-sm shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                          I've Made the Payment
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    )}

                    {/* Step 2: Enter UTR */}
                    {paymentStep === 2 && (
                      <div className="flex-1 flex flex-col justify-between overflow-hidden">
                        <div className="space-y-3 md:space-y-4 overflow-hidden flex flex-col">
                          <div className="shrink-0">
                            <h3 className="text-lg md:text-xl font-bold text-dark-50 font-display mb-0.5">Enter UTR Number</h3>
                            <p className="text-[11px] md:text-sm text-dark-400 font-medium">Verify your payment with the 12-digit ID</p>
                          </div>

                          {/* UTR Input */}
                          <div className="space-y-1.5 shrink-0">
                            <label className="text-[10px] text-dark-500 uppercase tracking-widest font-bold px-1">
                              UTR Number
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={12}
                              value={utrInput}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                setUtrInput(val);
                               }}
                              placeholder="000000000000"
                              className="w-full bg-slate-50 border border-dark-900/10 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-lg md:text-xl font-mono font-bold text-center text-dark-50 outline-none focus:border-gold-500/50 focus:ring-2 focus:ring-gold-500/10 shadow-sm transition-all tracking-[0.15em] md:tracking-[0.25em] placeholder:text-dark-300/30"
                              autoFocus
                            />
                          </div>

                          {/* Screenshot Upload */}
                          <div className="space-y-1.5 flex-1 min-h-0">
                            <label className="text-[10px] text-dark-500 uppercase tracking-widest font-bold px-1">
                              Payment Screenshot
                            </label>
                            <div
                              onClick={() => document.getElementById('screenshot-upload').click()}
                              className={`relative h-20 md:h-32 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${screenshotPreview
                                  ? 'border-green-500/50 bg-green-50/30'
                                  : 'border-dark-900/10 bg-slate-50 hover:bg-slate-100'
                                }`}
                            >
                              {screenshotPreview ? (
                                <>
                                  <img src={screenshotPreview} alt="Payment Proof" className="w-full h-full object-cover opacity-60" />
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[2px]">
                                    <CheckCircle size={20} className="text-green-600 mb-1" />
                                    <p className="text-[9px] font-bold text-green-700 uppercase">Change</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Smartphone size={20} className="text-dark-300 mb-1" />
                                  <p className="text-[10px] font-bold text-dark-400 uppercase tracking-wider text-center">
                                    Upload Proof
                                  </p>
                                </>
                              )}
                              <input
                                id="screenshot-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </div>
                          </div>

                          {/* Simplified UTR Hint */}
                          <div className="hidden md:flex p-3 rounded-xl bg-blue-50 border border-blue-200/50 space-y-1.5 flex-col shrink-0">
                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">💡 Where to find UTR</p>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { app: 'GPay', path: 'UPI Ref No.' },
                                { app: 'PhonePe', path: 'UTR' },
                                { app: 'Paytm', path: 'UTR No.' },
                              ].map((item) => (
                                <div key={item.app} className="text-center p-2 rounded-lg bg-white/60">
                                  <p className="text-[10px] font-bold text-blue-800">{item.app}</p>
                                  <p className="text-[9px] text-blue-500 font-medium">{item.path}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-4 shrink-0">
                          <button
                            onClick={() => setPaymentStep(1)}
                            className="px-5 md:px-6 py-3 rounded-2xl bg-white border border-dark-900/10 text-dark-400 text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleSubmitUtr}
                            disabled={utrInput.length !== 12 || submitting}
                            className="flex-1 py-3 rounded-2xl bg-gold-gradient text-dark-50 text-sm font-bold shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30 transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
                          >
                            {submitting ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <>
                                Verify
                                <Shield size={14} />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Result (Full Width) ── */}
              {paymentStep === 3 && paymentResult && (
                <div className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Icon */}
                    <div className="shrink-0">
                      {paymentResult.status === 'active' ? (
                        <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center border-2 border-green-500/20">
                          <CheckCircle size={48} className="text-green-500" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center border-2 border-blue-500/20">
                          <Clock size={48} className="text-blue-500" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-2xl font-bold text-dark-50 font-display">
                        {paymentResult.status === 'active' ? 'Plan Activated! 🎉' : 'Payment Submitted!'}
                      </h4>
                      <p className="text-sm text-dark-400 mt-2 font-medium max-w-md">
                        {paymentResult.status === 'active'
                          ? `Your ${selectedPlan.name} plan is now active. Start mining to earn rewards!`
                          : paymentResult.message}
                      </p>

                      {/* UTR Reference */}
                      <div className="mt-4 inline-flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-dark-900/10">
                        <span className="text-[10px] text-dark-400 uppercase tracking-widest font-bold">UTR</span>
                        <span className="text-sm font-mono font-bold text-dark-50 tracking-widest">{utrInput}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="shrink-0 w-full md:w-auto">
                      <button
                        onClick={closePaymentModal}
                        className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-gold-gradient text-dark-50 font-bold text-sm shadow-lg shadow-gold-500/20 hover:shadow-xl hover:shadow-gold-500/30 transition-all whitespace-nowrap"
                      >
                        {paymentResult.status === 'active' ? 'Start Mining →' : 'Done'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════
          MISSING PAYMENT METHOD MODAL
         ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {showMissingPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[11000] flex items-center justify-center bg-dark-950/90 backdrop-blur-md p-4"
            onClick={() => setShowMissingPaymentModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-amber-600" />
              </div>
              
              <h3 className="text-xl font-bold text-dark-50 mb-2">Payment Method Required</h3>
              <p className="text-dark-500 text-sm mb-8 leading-relaxed">
                To purchase a plan and receive mining returns, you must first add a payout method (UPI or Bank Account) to your profile.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/profile'}
                  className="w-full py-3.5 rounded-2xl bg-gold-gradient text-dark-50 font-bold text-sm shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2"
                >
                  <ArrowRight size={18} />
                  Go to Profile Settings
                </button>
                <button
                  onClick={() => setShowMissingPaymentModal(false)}
                  className="w-full py-3 text-dark-400 font-bold text-sm"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}