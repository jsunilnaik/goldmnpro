'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useConnectivity } from '@/context/ConnectivityContext';

export default function OfflineIndicator() {
  const { isOnline } = useConnectivity();
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowReconnected(false);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white text-center py-2 px-4 text-xs font-medium flex items-center justify-center gap-2"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 8px)' }}
        >
          <WifiOff size={14} />
          You're offline. Some features may be limited.
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-green-600 text-white text-center py-2 px-4 text-xs font-medium flex items-center justify-center gap-2"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 8px)' }}
        >
          <Wifi size={14} />
          Back online!
        </motion.div>
      )}
    </AnimatePresence>
  );
}