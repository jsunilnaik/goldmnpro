'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const MiningContext = createContext(null);

export function MiningProvider({ children }) {
  const { user, refreshWallet } = useAuth();
  const [isMining, setIsMining] = useState(false);
  const [session, setSession] = useState(null);
  const [points, setPoints] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [remainingToCap, setRemainingToCap] = useState(0);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [miningRate, setMiningRate] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [maturity, setMaturity] = useState({ pendingValue: 0, lastReleaseAt: null });
  
  // Daily Quota State
  const [sessionsToday, setSessionsToday] = useState(0);
  const [dailySessionLimit, setDailySessionLimit] = useState(24);
  const [maxSessionMinutes, setMaxSessionMinutes] = useState(1440);

  const intervalRef = useRef(null);
  const pointsRef = useRef(0);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/mining/status');
      if (!res.ok) return;
      const data = await res.json();

      if (data.activeSession) {
        setSession(data.activeSession);
        setIsMining(true);
        setPoints(data.activeSession.pointsEarned || 0);
        pointsRef.current = data.activeSession.pointsEarned || 0;
        setMiningRate(data.activeSession.miningRate || 0);

        const start = new Date(data.activeSession.startedAt);
        setElapsed(Math.floor((Date.now() - start) / 1000));
      } else {
        setIsMining(false);
        setSession(null);
      }

      setTodayEarnings(data.todayEarnings || 0);
      setRemainingToCap(data.remainingToCap || 0);
      setSessionsToday(data.sessionsToday || 0);
      setDailySessionLimit(data.dailySessionLimit || 24);
      setMaxSessionMinutes(data.maxSessionMinutes || 1440);
      setHasActivePlan(data.hasActivePlan || false);
      setSubscription(data.subscription || null);
      if (data.maturity) setMaturity(data.maturity);
    } catch (error) {
      console.error('Mining status fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchStatus();
  }, [user, fetchStatus]);

  // Timer
  useEffect(() => {
    if (isMining && miningRate > 0) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
        const pps = miningRate / 3600;
        pointsRef.current += pps;
        setPoints(pointsRef.current);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isMining, miningRate]);

  const startMining = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/mining/start', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setIsMining(true);
        setSession(data.session);
        setMiningRate(data.session.miningRate);
        setPoints(0);
        pointsRef.current = 0;
        setElapsed(0);
        await fetchStatus(); // Refresh session info and quota
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Network error' };
    } finally {
      setActionLoading(false);
    }
  }, [fetchStatus]);

  const claimRewards = useCallback(async () => {
    let currentSessionId = session?._id;
    setActionLoading(true);

    // Fallback: If no session ID in memory, try to fetch it from server one last time
    if (!currentSessionId) {
      try {
        const res = await fetch('/api/mining/status');
        const data = await res.json();
        if (data.activeSession) {
          currentSessionId = data.activeSession._id;
          setSession(data.activeSession);
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    }

    if (!currentSessionId) {
      setActionLoading(false);
      return { success: false, message: 'No active session detected.' };
    }

    try {
      const res = await fetch('/api/mining/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentSessionId }),
      });
      const data = await res.json();

      if (res.ok) {
        // Optimistic UI updates
        setIsMining(false);
        setSession(null);
        setPoints(0);
        pointsRef.current = 0;
        setElapsed(0);
        refreshWallet();
        await fetchStatus(); // Refresh session info and quota
        return {
          success: true,
          pointsClaimed: data.pointsClaimed,
          goldClaimed: data.goldClaimed,
          cashClaimed: data.cashClaimed,
        };
      }
      
      // If server returns "No session found", it might have been claimed elsewhere
      if (res.status === 404) {
        await fetchStatus(); // Sync UI
      }
      
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Network error' };
    } finally {
      setActionLoading(false);
    }
  }, [session, refreshWallet, fetchStatus]);

  const claimMaturity = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/mining/maturity-claim', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        refreshWallet();
        await fetchStatus();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: 'Network error' };
    } finally {
      setActionLoading(false);
    }
  }, [refreshWallet, fetchStatus]);

  const formatElapsed = useCallback(() => {
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [elapsed]);

  return (
    <MiningContext.Provider value={{
      isMining,
      session,
      points,
      elapsed,
      miningRate,
      remainingToCap,
      todayEarnings,
      hasActivePlan,
      subscription,
      loading,
      actionLoading,
      startMining,
      claimRewards,
      claimMaturity,
      fetchStatus,
      formatElapsed,
      sessionsToday,
      dailySessionLimit,
      maxSessionMinutes,
      maturity,
    }}>
      {children}
    </MiningContext.Provider>
  );
}

export function useMiningContext() {
  const context = useContext(MiningContext);
  if (!context) throw new Error('useMiningContext must be used within MiningProvider');
  return context;
}