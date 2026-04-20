'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import {
  Gift,
  Copy,
  Share2,
  Users,
  TrendingUp,
  CheckCircle,
  Link2,
  Network,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Zap,
} from 'lucide-react';

export default function ReferralsPage() {
  const { user, wallet } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('network');

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${user?.referralCode}`;

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const res = await fetch('/api/referrals');
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
      return true;
    } else {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        return false;
      }
    }
  };

  const copyCode = () => {
    const success = copyToClipboard(user?.referralCode || '');
    if (success) {
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy. Please copy manually.');
    }
  };

  const copyLink = () => {
    const success = copyToClipboard(referralLink);
    if (success) {
      toast.success('Referral link copied!');
    } else {
      toast.error('Failed to copy link.');
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join GoldMine Pro',
          text: `Join GoldMine Pro and start mining digital gold! Use my referral code: ${user?.referralCode}`,
          url: referralLink,
        });
      } catch (error) {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const networkStats = data?.networkStats || {};
  const levelBreakdown = networkStats.levelBreakdown || [];
  const downline = networkStats.downline || [];
  const directReferrals = data?.directReferrals || [];
  const recentCommissions = data?.recentCommissions || [];
  const totalNetworkSize = networkStats.totalNetworkSize || 0;
  const totalEarnings = networkStats.totalEarnings || 0;

  // Level colors for the tree
  const levelColors = [
    { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', bar: 'bg-blue-500' },
    { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/20', bar: 'bg-violet-500' },
    { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', bar: 'bg-emerald-500' },
    { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', bar: 'bg-amber-500' },
    { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', bar: 'bg-rose-500' },
  ];

  const getLevelColor = (level) => levelColors[(level - 1) % levelColors.length];

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-dark-50">Referral Network</h1>
        <p className="text-dark-500 text-sm mt-1 font-medium">Build your network, earn at every level</p>
      </div>

      {/* Network Overview Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center border-dark-800 shadow-sm">
          <Network size={18} className="text-blue-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-dark-50">{totalNetworkSize}</p>
          <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">Network</p>
        </div>
        <div className="glass-card p-4 text-center border-dark-800 shadow-sm">
          <TrendingUp size={18} className="text-green-500 mx-auto mb-2" />
          <p className="text-xl font-bold font-mono text-dark-50">₹{totalEarnings.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">Earned</p>
        </div>
        <div className="glass-card p-4 text-center border-dark-800 shadow-sm">
          <Users size={18} className="text-gold-600 mx-auto mb-2" />
          <p className="text-xl font-bold text-dark-50">{directReferrals.length}</p>
          <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">Direct</p>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="glass-card p-5 border-gold-500/30 shadow-sm">
        <p className="text-[10px] text-dark-500 uppercase tracking-widest mb-3 font-bold">Your Referral Code</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-100 rounded-xl px-4 py-3 font-mono text-xl font-bold text-gold-600 tracking-widest text-center border border-dark-900/5">
            {user?.referralCode}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyCode}
            className="p-3.5 rounded-xl bg-gold-500/10 text-gold-600 haptic-button border border-gold-500/20"
          >
            {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
          </motion.button>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={copyLink}
          className="glass-card p-4 flex items-center justify-center gap-2 text-sm font-bold haptic-button border-dark-800 shadow-sm"
        >
          <Link2 size={16} className="text-blue-600" />
          <span className="text-dark-50">Copy Link</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={shareReferral}
          className="bg-gold-gradient text-dark-50 p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-gold-500/20 haptic-button"
        >
          <Share2 size={16} />
          Share
        </motion.button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-dark-900/5 rounded-xl p-1">
        {[
          { key: 'network', label: 'Network', icon: Network },
          { key: 'referrals', label: 'Referrals', icon: Users },
          { key: 'earnings', label: 'Earnings', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-dark-50 shadow-sm'
                : 'text-dark-500'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'network' && (
          <motion.div
            key="network"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Level-wise Breakdown */}
            <div className="glass-card p-5 border-dark-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-dark-50">Level Breakdown</h3>
              </div>

              {levelBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {levelBreakdown.map((level) => {
                    const color = getLevelColor(level.level);
                    const maxCount = Math.max(...levelBreakdown.map((l) => l.count), 1);
                    const barWidth = (level.count / maxCount) * 100;

                    return (
                      <div key={level.level} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${color.bg} ${color.text} ${color.border} border`}>
                              L{level.level}
                            </span>
                            <span className="text-xs text-dark-300 font-medium">
                              {level.count} {level.count === 1 ? 'user' : 'users'}
                            </span>
                          </div>
                          <span className="text-xs font-bold font-mono text-dark-100">
                            ₹{level.earnings.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="h-1.5 bg-dark-900/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barWidth}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${color.bar}`}
                            style={{ opacity: 0.7 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-dark-500 text-center py-4">No network data yet. Start referring!</p>
              )}
            </div>

            {/* Your Downline Tree */}
            {downline.length > 0 && (
              <div className="glass-card p-5 border-dark-800 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ChevronDown size={16} className="text-violet-500" />
                  <h3 className="text-sm font-bold text-dark-50">Your Downline</h3>
                  <span className="text-[10px] ml-auto px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-500 font-bold border border-violet-500/20">
                    {downline.reduce((sum, l) => sum + l.users.length, 0)} users
                  </span>
                </div>
                <div className="space-y-3">
                  {downline.map((levelGroup) => {
                    const color = getLevelColor(levelGroup.level);
                    return (
                      <div key={levelGroup.level} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${color.bg} ${color.text} ${color.border} border`}>
                            Level {levelGroup.level}
                          </span>
                          <span className="text-[10px] text-dark-500 font-bold">
                            {levelGroup.users.length} {levelGroup.users.length === 1 ? 'user' : 'users'}
                          </span>
                        </div>
                        <div className="space-y-1.5 pl-3 border-l-2 border-dark-900/10">
                          {levelGroup.users.map((u, j) => (
                            <div key={j} className="flex items-center gap-2.5 py-1.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${color.bg} ${color.text} ${color.border} border`}>
                                {u.fullName?.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-dark-100 truncate">{u.fullName}</p>
                                <p className="text-[10px] text-dark-500 font-medium">
                                  {u.referralCode}{u.referralCount > 0 ? ` • +${u.referralCount} refs` : ''}
                                </p>
                              </div>
                              <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${u.hasActivePlan ? 'bg-green-500/10 text-green-500 border border-green-500/10' : 'bg-dark-900/5 text-dark-400 border border-dark-900/10'}`}>
                                {u.planName || 'Free'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* How Multi-Level Works */}
            <div className="glass-card p-5 border-dark-800 shadow-sm">
              <h3 className="text-sm font-bold mb-4 text-dark-50">How Multi-Level Referral Works</h3>
              <div className="space-y-4">
                {[
                  { step: '1', text: 'Share your referral code with friends', icon: '🔗' },
                  { step: '2', text: 'They sign up and join your Level 1 network', icon: '👋' },
                  { step: '3', text: 'When they refer others, those users join your Level 2', icon: '🌳' },
                  { step: '4', text: 'You earn commissions from ALL levels: 5% → 3% → 1% → 0.5%...', icon: '💰' },
                  { step: '5', text: 'Your network grows exponentially — and so do your earnings!', icon: '🚀' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center shrink-0 border border-gold-500/20">
                      <span className="text-sm">{item.icon}</span>
                    </div>
                    <p className="text-sm text-dark-200 font-medium">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'referrals' && (
          <motion.div
            key="referrals"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-bold text-dark-50">Direct Referrals (Level 1)</h3>
            <div className="space-y-2.5">
              {directReferrals.map((ref, i) => (
                <div key={i} className="glass-card p-4 flex items-center gap-4 border-dark-800 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 text-sm font-bold border border-blue-500/20">
                    {ref.fullName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-dark-50 truncate">{ref.fullName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider">
                        {new Date(ref.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {(ref.referralCount || 0) > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-500 font-bold border border-violet-500/10">
                          +{ref.referralCount} sub-referrals
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider ${
                    ref.currentPlan ? 'bg-green-500/10 text-green-600 border border-green-500/10' : 'bg-slate-100 text-dark-400 border border-dark-900/5'
                  }`}>
                    {ref.currentPlan ? 'Active' : 'Free'}
                  </span>
                </div>
              ))}
              {directReferrals.length === 0 && (
                <div className="glass-card p-8 text-center border-dark-800 shadow-sm">
                  <Users size={32} className="text-dark-700 mx-auto mb-3" />
                  <p className="text-dark-500 text-sm font-medium">No referrals yet. Start sharing your code!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'earnings' && (
          <motion.div
            key="earnings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-bold text-dark-50">Recent Commissions</h3>
            <div className="space-y-2">
              {recentCommissions.map((tx, i) => {
                const level = tx.metadata?.level || 1;
                const color = getLevelColor(level);

                return (
                  <div key={i} className="glass-card p-4 border-dark-800 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${color.bg} ${color.text} ${color.border} border`}>
                          <span className="text-[10px] font-bold">L{level}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-dark-100 truncate">{tx.description}</p>
                          <p className="text-[10px] text-dark-500 font-bold mt-0.5">
                            {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold font-mono text-green-500 shrink-0 ml-2">
                        +₹{tx.amount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
              {recentCommissions.length === 0 && (
                <div className="glass-card p-8 text-center border-dark-800 shadow-sm">
                  <TrendingUp size={32} className="text-dark-700 mx-auto mb-3" />
                  <p className="text-dark-500 text-sm font-medium">No commissions yet. They&apos;ll appear here when your network grows!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}