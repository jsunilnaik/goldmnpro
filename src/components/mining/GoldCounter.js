'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GoldCounter({
  value = 0,
  prefix = '',
  suffix = '',
  decimals = 4,
  duration = 0.5,
  className = '',
  size = 'default',
  animate = true,
  color = 'text-gold-400',
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isIncrementing, setIsIncrementing] = useState(false);
  const prevValue = useRef(value);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    const start = prevValue.current;
    const end = value;
    const diff = end - start;

    if (diff === 0) return;

    setIsIncrementing(diff > 0);

    const startTime = Date.now();
    const durationMs = duration * 1000;

    const tick = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(tick);
    prevValue.current = value;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, animate, duration]);

  const sizeClasses = {
    small: 'text-sm',
    default: 'text-2xl',
    large: 'text-4xl',
    xlarge: 'text-5xl',
  };

  const formattedValue = displayValue.toFixed(decimals);
  const [intPart, decPart] = formattedValue.split('.');

  return (
    <div className={`font-mono font-bold ${sizeClasses[size]} ${color} ${className} relative`}>
      {/* Increment Flash */}
      <AnimatePresence>
        {isIncrementing && animate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gold-500/10 rounded-lg -m-1"
          />
        )}
      </AnimatePresence>

      {/* Value */}
      <span className="relative z-10 tabular-nums">
        {prefix}
        <span>{intPart}</span>
        {decimals > 0 && (
          <>
            <span className="text-dark-500">.</span>
            <span className="opacity-70 text-[0.85em]">{decPart}</span>
          </>
        )}
        {suffix && <span className="text-dark-400 text-[0.6em] ml-1">{suffix}</span>}
      </span>
    </div>
  );
}