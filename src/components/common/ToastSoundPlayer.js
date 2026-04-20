'use client';

import { useEffect, useRef } from 'react';
import { useToasterStore } from 'react-hot-toast';
import { playMiningSound } from '@/lib/sounds';

/**
 * Global Toast Sound Listener
 * Automatically plays synthesized sounds when success or error toasts appear.
 */
export default function ToastSoundPlayer() {
  const { toasts } = useToasterStore();
  const prevToastsRef = useRef([]);

  useEffect(() => {
    // Only trigger for new toasts
    const newToasts = toasts.filter(
      (t) => !prevToastsRef.current.find((prev) => prev.id === t.id)
    );

    newToasts.forEach((toast) => {
      // Don't play if the toast is already visible or disappearing
      if (!toast.visible) return;

      if (toast.type === 'success') {
        playMiningSound('success');
      } else if (toast.type === 'error') {
        playMiningSound('error');
      } else {
        // Default sound for blank or custom toasts
        playMiningSound('success');
      }
    });

    prevToastsRef.current = toasts;
  }, [toasts]);

  return null; // This component doesn't render anything
}
