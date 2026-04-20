'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/users/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setWallet(data.wallet);
        setIsBlocked(!!data.isBlocked);
      } else {
        setUser(null);
        setWallet(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setIsBlocked(!!data.isBlocked);
        toast.success('Welcome back! 🎉');
        router.push('/dashboard');
        return { success: true };
      } else {
        toast.error(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  const signup = async (formData) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Account created! Please verify your phone.');
        router.push(`/verify-otp?phone=${formData.phone}`);
        return { success: true };
      } else {
        toast.error(data.message || 'Signup failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      return { success: false, message: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setWallet(null);
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshWallet = async () => {
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error('Wallet refresh error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      wallet,
      loading,
      login,
      signup,
      logout,
      fetchUser,
      refreshWallet,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isBlocked,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};