'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ConnectivityContext = createContext({
  isOnline: true,
  lastOnline: null
});

export function ConnectivityProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  const [lastOnline, setLastOnline] = useState(null);

  useEffect(() => {
    // Initial check
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) setLastOnline(Date.now());
    }

    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(Date.now());
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isOnline, lastOnline }}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  return useContext(ConnectivityContext);
}
