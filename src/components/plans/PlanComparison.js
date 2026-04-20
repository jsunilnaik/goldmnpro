'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronDown, ChevronUp, Crown, Zap, Info } from 'lucide-react';

const comparisonFeatures = [
  { key: 'miningRate', label: 'Mining Speed', unit: 'pts/hr' },
  { key: 'estimatedMonthlyReturn', label: 'Est. Monthly Return', prefix: '₹', format: 'currency' },
  { key: 'referralBonus', label: 'Referral Bonus', suffix: '%' },
  { key: 'maxDailyMiningHours', label: 'Daily Mining Hours', suffix: 'hrs' },
  { key: 'duration', label: 'Plan Duration', suffix: ' days' },
];

const featuresList = [
  'Basic Mining',
  'Monthly Withdrawal',
  'Email Support',
  'Chat Support',
  'Priority Support',
  'Dedicated Manager',
  'Auto-Mining',
  'Mining Boost',
  'Early Withdrawal',
  'Analytics Dashboard',
];

export default function PlanComparison({ plans = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState([0, 1]);

  if (plans.length === 0) return null;

  const togglePlan = (index) => {
    setSelectedPlans(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), index];
      }
      return [...prev, index];
    });
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-dark-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Crown size={16} className="text-gold-400" />
            Compare Plans
          </h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gold-400"
          >
            {expanded ? 'Less' : 'More'}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Mobile Plan Selector */}
        <div className="flex gap-2 mt-3 md:hidden overflow-x-auto no-scrollbar">
          {plans.map((plan, i) => (
            <button
              key={plan._id}
              onClick={() => togglePlan(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedPlans.includes(i)
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                  : 'bg-dark-800 text-dark-400 border border-dark-600'
              }`}
            >
              {plan.icon || '⛏️'} {plan.name}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-dark-800/30">
              <th className="text-left text-[10px] text-dark-400 uppercase tracking-wider px-4 py-3 font-semibold min-w-[120px]">
                Feature
              </th>
              {plans.map((plan, i) => {
                const show = selectedPlans.includes(i) || window?.innerWidth >= 768;
                if (!show && typeof window !== 'undefined' && window.innerWidth < 768) return null;
                return (
                  <th
                    key={plan._id}
                    className="text-center text-[10px] uppercase tracking-wider px-3 py-3 font-semibold min-w-[100px]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xl">{plan.icon || '⛏️'}</span>
                      <span className={plan.isPopular ? 'text-gold-400' : 'text-dark-300'}>
                        {plan.name}
                      </span>
                      <span className="text-dark-400 font-mono">
                        ₹{plan.price?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700/30">
            {/* Numeric comparisons */}
            {comparisonFeatures.map((feature) => (
              <tr key={feature.key} className="hover:bg-dark-800/20 transition-colors">
                <td className="px-4 py-2.5 text-xs text-dark-300 font-medium">
                  {feature.label}
                </td>
                {plans.map((plan, i) => {
                  const show = selectedPlans.includes(i) || (typeof window !== 'undefined' && window.innerWidth >= 768);
                  if (!show && typeof window !== 'undefined' && window.innerWidth < 768) return null;
                  const value = plan[feature.key];
                  return (
                    <td key={plan._id} className="px-3 py-2.5 text-center">
                      <span className={`text-xs font-mono font-semibold ${
                        plan.isPopular ? 'text-gold-400' : 'text-white'
                      }`}>
                        {feature.prefix || ''}
                        {feature.format === 'currency'
                          ? value?.toLocaleString('en-IN')
                          : value}
                        {feature.suffix || feature.unit ? ` ${feature.suffix || feature.unit}` : ''}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Feature checkmarks */}
            <AnimatePresence>
              {expanded &&
                featuresList.map((feature, fi) => (
                  <motion.tr
                    key={feature}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="hover:bg-dark-800/20 transition-colors"
                  >
                    <td className="px-4 py-2 text-xs text-dark-300">{feature}</td>
                    {plans.map((plan, i) => {
                      const show = selectedPlans.includes(i) || (typeof window !== 'undefined' && window.innerWidth >= 768);
                      if (!show && typeof window !== 'undefined' && window.innerWidth < 768) return null;

                      // Simulate feature availability based on plan tier
                      const planTier = ['Bronze', 'Silver', 'Gold', 'Diamond'].indexOf(plan.name);
                      const featureAvailable = fi <= planTier + 3 + Math.floor(planTier * 1.5);

                      return (
                        <td key={plan._id} className="px-3 py-2 text-center">
                          {featureAvailable ? (
                            <Check size={14} className="text-green-400 mx-auto" />
                          ) : (
                            <X size={14} className="text-dark-600 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div className="p-3 border-t border-dark-700/30 bg-dark-800/20">
        <p className="text-[9px] text-dark-500 flex items-center gap-1">
          <Info size={10} />
          Estimated returns are based on current mining rates and may vary. Past performance doesn't guarantee future results.
        </p>
      </div>
    </div>
  );
}