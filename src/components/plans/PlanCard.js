'use client';

import { motion } from 'framer-motion';
import {
  Crown,
  Zap,
  TrendingUp,
  Check,
  X,
  Star,
  Loader2,
} from 'lucide-react';

const planStyles = {
  Bronze: {
    gradient: 'from-amber-700/20 to-amber-900/10',
    border: 'border-amber-600/30',
    icon: '🥉',
    color: 'text-amber-400',
    buttonBg: 'bg-amber-600 hover:bg-amber-500',
  },
  Silver: {
    gradient: 'from-gray-400/20 to-gray-600/10',
    border: 'border-gray-400/30',
    icon: '🥈',
    color: 'text-gray-300',
    buttonBg: 'bg-gray-500 hover:bg-gray-400',
  },
  Gold: {
    gradient: 'from-gold-500/20 to-gold-700/10',
    border: 'border-gold-500/30',
    icon: '🥇',
    color: 'text-gold-400',
    buttonBg: 'bg-gold-gradient',
  },
  Diamond: {
    gradient: 'from-cyan-400/20 to-blue-600/10',
    border: 'border-cyan-400/30',
    icon: '💎',
    color: 'text-cyan-400',
    buttonBg: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400',
  },
};

export default function PlanCard({
  plan,
  onSubscribe,
  loading = false,
  isCurrentPlan = false,
  featured = false,
  delay = 0,
}) {
  const style = planStyles[plan.name] || planStyles.Gold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative glass-card overflow-hidden ${
        plan.isPopular || featured ? `border-2 ${style.border} ring-1 ring-gold-500/10` : 'border border-dark-700/50'
      }`}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute top-0 right-0">
          <div className="bg-gold-500 text-dark-900 text-[9px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
            <Star size={10} fill="currentColor" />
            Popular
          </div>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute top-0 left-0">
          <div className="bg-green-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-br-xl uppercase tracking-wider">
            Current Plan
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`p-5 bg-gradient-to-br ${style.gradient}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{style.icon}</span>
          <div>
            <h3 className={`text-xl font-display font-bold ${style.color}`}>
              {plan.name}
            </h3>
            <p className="text-[10px] text-dark-400 uppercase tracking-wider">
              {plan.duration} Day Plan
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {plan.originalPrice && plan.originalPrice > plan.price && (
            <span className="text-sm text-dark-500 line-through font-mono">
              ₹{plan.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
          <span className="text-3xl font-bold font-mono text-white">
            ₹{plan.price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Discount Badge */}
        {plan.originalPrice && plan.originalPrice > plan.price && (
          <span className="inline-block mt-2 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-semibold">
            Save ₹{(plan.originalPrice - plan.price).toLocaleString('en-IN')} ({Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}% OFF)
          </span>
        )}
      </div>

      {/* Key Stats */}
      <div className="p-5 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-dark-800/50 rounded-xl p-2.5 text-center">
            <Zap size={14} className="text-gold-400 mx-auto mb-1" />
            <p className="text-sm font-mono font-bold">{plan.miningRate}</p>
            <p className="text-[8px] text-dark-500 uppercase font-bold">Points/Hr</p>
          </div>
          <div className="bg-dark-800/50 rounded-xl p-2.5 text-center">
            <TrendingUp size={14} className="text-green-400 mx-auto mb-1" />
            <p className="text-sm font-mono font-bold text-green-400">
              ₹{(plan.price * 2).toLocaleString('en-IN')}
            </p>
            <p className="text-[8px] text-dark-500 uppercase font-bold">2X Guarantee</p>
          </div>
        </div>

        {/* Features */}
        {plan.features && plan.features.length > 0 && (
          <div className="space-y-2 pt-1">
            {plan.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {feature.included ? (
                  <Check size={13} className="text-green-400 shrink-0" />
                ) : (
                  <X size={13} className="text-dark-600 shrink-0" />
                )}
                <span className={feature.included ? 'text-dark-200' : 'text-dark-500 line-through'}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscribe Button */}
      <div className="p-5 pt-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onSubscribe && onSubscribe(plan._id)}
          disabled={loading || isCurrentPlan}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all haptic-button disabled:opacity-50 disabled:cursor-not-allowed ${
            isCurrentPlan
              ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default'
              : plan.isPopular
              ? 'bg-gold-gradient text-dark-900 shadow-lg shadow-gold-500/20'
              : 'bg-dark-700 text-white hover:bg-dark-600 border border-dark-600'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : isCurrentPlan ? (
            '✓ Current Plan'
          ) : (
            'Subscribe Now'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}