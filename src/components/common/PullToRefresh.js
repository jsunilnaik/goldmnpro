'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowDown, Loader2 } from 'lucide-react';

export default function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  maxPull = 120,
  disabled = false,
  backgroundColor = 'transparent',
}) {
  const [state, setState] = useState('idle'); // idle | pulling | threshold | refreshing | done
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPulling = useRef(false);

  const progress = Math.min(pullDistance / threshold, 1);

  const canPull = useCallback(() => {
    if (disabled) return false;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    return scrollTop <= 0;
  }, [disabled]);

  const handleTouchStart = useCallback((e) => {
    if (!canPull()) return;
    startY.current = e.touches[0].clientY;
    isPulling.current = true;
  }, [canPull]);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling.current || state === 'refreshing') return;
    if (!canPull()) {
      isPulling.current = false;
      setPullDistance(0);
      setState('idle');
      return;
    }

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      // Apply resistance
      const resistance = 0.4;
      const distance = Math.min(diff * resistance, maxPull);
      setPullDistance(distance);

      if (distance >= threshold) {
        setState('threshold');
      } else {
        setState('pulling');
      }

      // Prevent default scroll when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [canPull, maxPull, threshold, state]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= threshold && onRefresh) {
      setState('refreshing');
      setPullDistance(threshold * 0.6);

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }

      setState('done');
      setTimeout(() => {
        setPullDistance(0);
        setState('idle');
      }, 300);
    } else {
      setPullDistance(0);
      setState('idle');
    }
  }, [pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const options = { passive: false };
    container.addEventListener('touchstart', handleTouchStart, options);
    container.addEventListener('touchmove', handleTouchMove, options);
    container.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const getStatusText = () => {
    switch (state) {
      case 'pulling': return 'Pull to refresh';
      case 'threshold': return 'Release to refresh';
      case 'refreshing': return 'Refreshing...';
      case 'done': return 'Done!';
      default: return '';
    }
  };

  return (
    <div ref={containerRef} className="relative" style={{ backgroundColor }}>
      {/* Pull Indicator */}
      <AnimatePresence>
        {pullDistance > 10 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 right-0 z-50 flex flex-col items-center justify-end overflow-hidden"
            style={{
              height: pullDistance,
              top: 0,
            }}
          >
            <div className="flex flex-col items-center gap-1.5 pb-3">
              {/* Spinner / Arrow */}
              <motion.div
                animate={{
                  rotate: state === 'refreshing' ? 360 : progress * 180,
                }}
                transition={
                  state === 'refreshing'
                    ? { duration: 1, repeat: Infinity, ease: 'linear' }
                    : { duration: 0 }
                }
              >
                {state === 'refreshing' ? (
                  <Loader2 size={20} className="text-gold-400" />
                ) : state === 'threshold' ? (
                  <RefreshCw size={20} className="text-gold-400" />
                ) : (
                  <ArrowDown
                    size={20}
                    className="text-dark-400"
                    style={{
                      transform: `rotate(${progress * 180}deg)`,
                      transition: 'transform 0s',
                    }}
                  />
                )}
              </motion.div>

              {/* Status Text */}
              <span className={`text-[10px] font-medium transition-colors ${
                state === 'threshold' || state === 'refreshing'
                  ? 'text-gold-400'
                  : 'text-dark-500'
              }`}>
                {getStatusText()}
              </span>

              {/* Progress Bar */}
              <div className="w-8 h-0.5 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gold-500 rounded-full"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        animate={{ y: pullDistance }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}