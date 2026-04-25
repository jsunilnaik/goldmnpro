'use client';

import { useState, useEffect, useCallback } from 'react';

export default function useWallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const fetchWallet = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const res = await fetch('/api/wallet');
      if (!res.ok) throw new Error('Failed to fetch wallet');
      const data = await res.json();
      setWallet(data.wallet);
    } catch (err) {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (p = 1, type = 'all', limit = 20) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setTxLoading(false);
      return;
    }

    setTxLoading(true);
    try {
      const params = new URLSearchParams({ page: p.toString(), limit: limit.toString(), type });
      const res = await fetch(`/api/wallet/history?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();

      if (p === 1) {
        setTransactions(data.transactions || []);
      } else {
        setTransactions(prev => [...prev, ...(data.transactions || [])]);
      }
      setTotalPages(data.totalPages || 1);
      setPage(p);
    } catch (err) {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        console.error(err);
      }
    } finally {
      setTxLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (type = 'all') => {
    if (page < totalPages) {
      await fetchTransactions(page + 1, type);
    }
  }, [page, totalPages, fetchTransactions]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchWallet(), fetchTransactions(1)]);
  }, [fetchWallet, fetchTransactions]);

  useEffect(() => {
    fetchWallet();
    fetchTransactions(1);
  }, [fetchWallet, fetchTransactions]);

  return {
    wallet, transactions, loading, txLoading, error,
    page, totalPages, hasMore: page < totalPages,
    fetchWallet, fetchTransactions, loadMore, refresh,
  };
}