export const runtime = 'edge';
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { playMiningSound } from '@/lib/sounds';
import {
  Pickaxe,
  Play,
  Pause,
  Zap,
  Clock,
  TrendingUp,
  Gift,
  ChevronRight,
  Sparkles,
  Timer,
  LayoutGrid,
  Loader2,
  Award,
} from 'lucide-react';
import { useMiningContext } from '@/context/MiningContext';

export default function MiningPage() {
  const { 
    isMining, 
    miningRate, 
    points,
    elapsed,
    startMining: contextStartMining,
    claimRewards: contextClaimRewards,
    sessionsToday,
    dailySessionLimit,
    maxSessionMinutes,
    todayEarnings,
    actionLoading,
    remainingToCap,
    subscription,
    fetchStatus,
    maturity,
    claimMaturity,
    isSessionAvailable,
    daysUntilNextSession
  } = useMiningContext();
  
  const [particles, setParticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize
  useEffect(() => {
    const init = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setLoading(false);
        return;
      }
      await fetchStatus();
      setLoading(false);
    };
    init();
  }, [fetchStatus]);

  const addParticle = () => {
    const id = Date.now() + Math.random();
    const particle = {
      id,
      x: 30 + Math.random() * 40,
      y: 50,
      emoji: ['✨', '💎', '⭐', '🪙'][Math.floor(Math.random() * 4)],
    };
    setParticles(prev => [...prev, particle]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  const startMining = async () => {
    playMiningSound('start');
    const res = await contextStartMining();
    
    if (res.success) {
      toast.success('⛏️ Mining started!');
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFD700', '#FFA500', '#FF8C00'],
      });
    } else {
      playMiningSound('error');
      toast.error(res.message);
    }
  };

  const claimRewards = async () => {
    const res = await contextClaimRewards();
    if (res.success) {
      playMiningSound('claim');
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF8C00', '#FFE680'],
      });
      toast.success(`🎉 Claimed rewards! Value stored in Gold Reserves.`);
    } else {
      playMiningSound('error');
      toast.error(res.message);
    }
  };

  const handleClaimMaturity = async () => {
    const res = await claimMaturity();
    if (res.success) {
      playMiningSound('success');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFFFFF', '#00FF00'],
      });
      toast.success(res.message);
    } else {
      playMiningSound('error');
      toast.error(res.message);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      {/* Page Title & Status */}
      <div className="text-center space-y-4">
        {/* Daily Progress Status */}
        {!isMining && (
          <div className="flex flex-col items-center gap-2">
             <div className="bg-gold-500/10 border border-gold-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-gold-600 shadow-sm">
                Daily: {sessionsToday} / {dailySessionLimit}
             </div>
             {subscription && (
               <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 shadow-sm">
                  Plan Total: {subscription.sessionsCompleted || 0} / {subscription.totalSessionsExpected || 30}
               </div>
             )}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-display font-bold text-dark-50 tracking-tight">Gold Mining</h1>
          <p className="text-dark-500 text-sm mt-1 font-medium">Mine digital gold & earn rewards</p>
        </div>

        {/* Profit Progress Bar */}
        {subscription && (
          <div className="max-w-xs mx-auto pt-2">
            <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold mb-1.5">
              <span className="text-dark-500">Plan Progress</span>
              <span className="text-gold-500">
                ₹{(subscription.totalValueEarned || 0).toFixed(0)} / ₹{((subscription.totalValueEarned || 0) + remainingToCap).toFixed(0)}
              </span>
            </div>
            <div className="h-1.5 w-full bg-dark-900/40 rounded-full overflow-hidden border border-dark-950/20">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((subscription.totalValueEarned || 0) / ((subscription.totalValueEarned || 0) + remainingToCap || 1)) * 100)}%` }}
                className="h-full bg-gold-gradient shadow-[0_0_8px_rgba(212,175,55,0.4)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mining Circle Area */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative flex items-center justify-center w-64 h-64">
          {/* Outer Ring */}
          <motion.div
            animate={isMining ? { rotate: 360 } : {}}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className={`absolute w-64 h-64 rounded-full border-2 border-dashed ${
              isMining ? 'border-gold-500/40' : 'border-dark-100'
            }`}
          />

          {/* Middle Ring */}
          <motion.div
            animate={isMining ? { rotate: -360 } : {}}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className={`absolute w-52 h-52 rounded-full border ${
              isMining ? 'border-gold-400/30' : 'border-dark-100'
            }`}
          />

          {/* Mining Button */}
          <motion.button
            whileTap={(actionLoading) ? {} : { scale: 0.95 }}
            disabled={actionLoading}
            onClick={() => {
              if (isMining) {
                claimRewards();
              } else if (isSessionAvailable) {
                startMining();
              } else {
                // Feedback for multiple taps on locked button
                playMiningSound('error');
                toast.error(daysUntilNextSession > 0 
                  ? `Hold on! Next session in ${daysUntilNextSession} day${daysUntilNextSession > 1 ? 's' : ''}.`
                  : 'Daily quota reached. Please return later!');
              }
            }}
            className={`relative z-10 w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-500 haptic-button ${
              isMining
                ? 'bg-gold-gradient mining-pulse shadow-lg shadow-gold-500/30'
                : !isSessionAvailable 
                  ? 'bg-slate-100 border border-slate-200 opacity-80 grayscale cursor-pointer'
                  : 'bg-white border border-dark-800 hover:border-gold-500/50 shadow-sm'
            } ${actionLoading ? 'opacity-80' : ''}`}
          >
            {actionLoading ? (
              <div className="relative flex items-center justify-center">
                {/* Premium Rotating Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-14 h-14 rounded-full border-4 border-gold-500/10 border-t-gold-600 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                />
                {/* Pulsing Core */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute flex items-center justify-center"
                >
                  <Sparkles className="text-gold-600 drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" size={24} />
                </motion.div>
              </div>
            ) : isMining ? (
              <>
                <Pickaxe className="w-10 h-10 text-dark-50 animate-mining" />
                <span className="text-dark-50 font-bold text-xs uppercase tracking-wider">
                  Mining...
                </span>
                <span className="text-dark-50/80 text-[10px]">Tap to claim</span>
              </>
            ) : (
              <>
                <Play className="w-10 h-10 text-gold-600 ml-1" />
                <span className="text-gold-600 font-bold text-xs uppercase tracking-wider">
                  Start Mining
                </span>
              </>
            )}
          </motion.button>
        </div>

        {/* Status Message (Outside the ring container) */}
        {!isMining && !isSessionAvailable && (
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] text-dark-500 font-bold uppercase tracking-widest mt-6 text-center"
          >
            {daysUntilNextSession === 1 
              ? 'Next session available Tomorrow'
              : daysUntilNextSession > 1 
                ? `Next session: ${new Date(Date.now() + daysUntilNextSession * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                : 'Quota Reached. Next session pending...'}
          </motion.p>
        )}

        {/* Floating Particles */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              initial={{ x: `${particle.x}%`, y: `${particle.y}%`, scale: 1, opacity: 1 }}
              animate={{ y: '-50%', scale: 0.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute text-lg pointer-events-none"
            >
              {particle.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Mining Stats */}
      <div className="grid grid-cols-2 gap-3">
        {/* Points Earned */}
        <motion.div
          animate={isMining ? { borderColor: ['rgba(212,175,55,0.2)', 'rgba(212,175,55,0.5)', 'rgba(212,175,55,0.2)'] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="glass-card p-4 text-center border-dark-800 shadow-sm"
        >
          <div className="flex items-center justify-center gap-1 mb-2">
            <Sparkles size={14} className="text-gold-600" />
            <span className="text-xs text-dark-500 uppercase tracking-wider font-bold">Points</span>
          </div>
          <p className="text-2xl font-mono font-bold text-gold-600">
            {points.toFixed(4)}
          </p>
        </motion.div>

        {/* Time Elapsed */}
        <div className="glass-card p-4 text-center border-dark-800 shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Timer size={14} className="text-blue-600" />
            <span className="text-xs text-dark-500 uppercase tracking-wider font-bold">Duration</span>
          </div>
          <p className="text-2xl font-mono font-bold text-dark-50">
            {formatTime(elapsed)}
          </p>
        </div>

        {/* Mining Rate */}
        <div className="glass-card p-4 text-center border-dark-800 shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Zap size={14} className="text-yellow-600" />
            <span className="text-xs text-dark-500 uppercase tracking-wider font-bold">Rate</span>
          </div>
          <p className="text-lg font-mono font-bold text-dark-50">
            {miningRate}<span className="text-xs text-dark-500">/hr</span>
          </p>
        </div>

        {/* Today's Earnings */}
        <div className="glass-card p-4 text-center border-dark-800 shadow-sm">
          <div className="flex items-center justify-center gap-1 mb-2">
            <TrendingUp size={14} className="text-green-600" />
            <span className="text-xs text-dark-500 uppercase tracking-wider font-bold">Today</span>
          </div>
          <p className="text-lg font-mono font-bold text-green-600">
            {todayEarnings.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Gold Reserves Maturity Section */}
      {maturity?.pendingValue > 0 && (
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="glass-card p-5 border-amber-500/30 bg-amber-500/5 relative overflow-hidden group shadow-lg"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-all duration-700" />
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shadow-inner">
                  <Award className="w-6 h-6 text-amber-500" />
               </div>
               <div>
                  <h3 className="text-sm font-bold text-dark-50">Gold Reserves</h3>
                  <p className="text-xl font-mono font-bold text-amber-500">₹{maturity.pendingValue.toFixed(2)}</p>
                  <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider mt-0.5">Ready to move to wallet</p>
               </div>
            </div>

            <button
               onClick={handleClaimMaturity}
               disabled={actionLoading}
               className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-md ${
                 actionLoading 
                   ? 'bg-dark-800 text-dark-400 cursor-not-allowed' 
                   : 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-amber-500/30 active:scale-95'
               }`}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Release to Wallet'
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Boost Banner */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="glass-card p-4 flex items-center gap-3 border border-purple-500/10 bg-purple-500/5 cursor-pointer shadow-sm hover:bg-purple-500/10 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-purple-900">Boost your mining speed</p>
          <p className="text-xs text-dark-500 font-medium">Upgrade plan for 3x faster rewards</p>
        </div>
        <ChevronRight size={18} className="text-dark-400" />
      </motion.div>

      {/* Mining Tips */}
      <div className="glass-card p-5 border-dark-800 shadow-sm">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-dark-50">
          <Gift size={16} className="text-gold-600" />
          Mining Tips
        </h3>
        <ul className="space-y-2.5 text-xs text-dark-500 font-medium">
          <li className="flex items-start gap-2">
            <span className="text-gold-600 mt-0.5">•</span>
            Keep the app open for continuous mining rewards
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-600 mt-0.5">•</span>
            Claim your rewards before starting a new session
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-600 mt-0.5">•</span>
            Higher plans = faster mining rate & more gold
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-600 mt-0.5">•</span>
            Refer friends to earn bonus mining points
          </li>
        </ul>
      </div>
    </div>
  );
}