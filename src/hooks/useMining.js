'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function useMining() {
  const [isMining, setIsMining] = useState(false);
  const [session, setSession] = useState(null);
  const [points, setPoints] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [miningRate, setMiningRate] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const pointsRef = useRef(0);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/mining/status');
      if (!res.ok) throw new Error('Failed to fetch');
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
      setHasActivePlan(data.hasActivePlan || false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (isMining && miningRate > 0) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
        pointsRef.current += miningRate / 3600;
        setPoints(pointsRef.current);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isMining, miningRate]);

  const start = useCallback(async () => {
    const res = await fetch('/api/mining/start', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setIsMining(true);
      setSession(data.session);
      setMiningRate(data.session.miningRate);
      setPoints(0);
      pointsRef.current = 0;
      setElapsed(0);
    }
    return { success: res.ok, message: data.message, data };
  }, []);

  const claim = useCallback(async () => {
    if (!session?._id) return { success: false };
    const res = await fetch('/api/mining/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session._id }),
    });
    const data = await res.json();
    if (res.ok) {
      setIsMining(false);
      setSession(null);
      setPoints(0);
      pointsRef.current = 0;
      setElapsed(0);
      fetchStatus();
    }
    return { success: res.ok, ...data };
  }, [session, fetchStatus]);

  const formatTime = useCallback((secs) => {
    const s = secs || elapsed;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }, [elapsed]);

  return {
    isMining, session, points, elapsed, miningRate,
    todayEarnings, hasActivePlan, loading, error,
    start, claim, fetchStatus, formatTime,
  };
}