'use client';

import { useRef, useEffect, useCallback } from 'react';

export default function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  timeout = 300,
  preventScroll = false,
  elementRef,
} = {}) {
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    if (preventScroll) {
      const diffX = Math.abs(touchEnd.current.x - touchStart.current.x);
      const diffY = Math.abs(touchEnd.current.y - touchStart.current.y);

      if (diffX > diffY && diffX > 10) {
        e.preventDefault();
      }
    }
  }, [preventScroll]);

  const handleTouchEnd = useCallback(() => {
    const diffX = touchEnd.current.x - touchStart.current.x;
    const diffY = touchEnd.current.y - touchStart.current.y;
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);
    const timeDiff = Date.now() - touchStart.current.time;

    if (timeDiff > timeout) return;

    const isHorizontal = absDiffX > absDiffY;

    if (isHorizontal && absDiffX > threshold) {
      if (diffX > 0) {
        onSwipeRight?.({ distance: absDiffX, duration: timeDiff });
      } else {
        onSwipeLeft?.({ distance: absDiffX, duration: timeDiff });
      }
    } else if (!isHorizontal && absDiffY > threshold) {
      if (diffY > 0) {
        onSwipeDown?.({ distance: absDiffY, duration: timeDiff });
      } else {
        onSwipeUp?.({ distance: absDiffY, duration: timeDiff });
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold, timeout]);

  useEffect(() => {
    const element = elementRef?.current || document;
    const options = { passive: !preventScroll };

    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll]);

  return {
    touchStart: touchStart.current,
    touchEnd: touchEnd.current,
  };
}