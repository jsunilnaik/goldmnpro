'use client';

import { motion } from 'framer-motion';

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  color = 'gold',
  animated = true,
  striped = false,
  className = '',
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
    xl: 'h-5',
  };

  const colorClasses = {
    gold: 'bg-gold-gradient',
    green: 'bg-gradient-to-r from-green-600 to-green-400',
    blue: 'bg-gradient-to-r from-blue-600 to-blue-400',
    red: 'bg-gradient-to-r from-red-600 to-red-400',
    purple: 'bg-gradient-to-r from-purple-600 to-purple-400',
  };

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-dark-400 font-medium">{label}</span>}
          {showValue && (
            <span className="text-xs font-mono text-dark-300">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      <div className={`bg-dark-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full relative ${colorClasses[color]}`}
        >
          {striped && (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%)',
                backgroundSize: '1rem 1rem',
                animation: 'shimmer 1s linear infinite',
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}