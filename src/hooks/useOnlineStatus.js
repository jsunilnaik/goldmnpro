'use client';

import { useState, useEffect, useCallback } from 'react';

export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnline, setLastOnline] = useState(null);
  const [connectionType, setConnectionType] = useState(null);
  const [effectiveType, setEffectiveType] = useState(null);
  const [downlink, setDownlink] = useState(null);

  const updateConnectionInfo = useCallback(() => {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      setConnectionType(conn.type || null);
      setEffectiveType(conn.effectiveType || null);
      setDownlink(conn.downlink || null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    updateConnectionInfo();

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      setLastOnline(new Date());
      updateConnectionInfo();

      // Auto-clear wasOffline after 5 seconds
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);
    };

    const handleConnectionChange = () => {
      updateConnectionInfo();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [updateConnectionInfo]);

  const isSlow = effectiveType === 'slow-2g' || effectiveType === '2g';
  const isFast = effectiveType === '4g' || (downlink && downlink > 5);

  return {
    isOnline,
    wasOffline,
    lastOnline,
    connectionType,
    effectiveType,
    downlink,
    isSlow,
    isFast,
  };
}