'use client';

import { useAuth } from '@/context/AuthContext';
import { Bell, Search, Pickaxe } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import NotificationDropdown from '@/components/common/NotificationDropdown';

export default function Header() {
  const { user, wallet } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const formatShortcut = (num) => {
    if (!num) return '0.00';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString('en-IN');
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-950/90 backdrop-blur-xl border-b border-dark-700/30 px-4 md:px-8 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left - Logo (Mobile) / Welcome (Desktop) */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center shadow-lg shadow-gold-500/20">
              <Pickaxe className="w-5 h-5 text-dark-50" />
            </div>
            <span className="font-display font-bold text-dark-50">GoldMine</span>
          </Link>

          <div className="hidden md:block">
            <h2 className="text-xs text-dark-500 font-medium">Welcome back,</h2>
            <p className="font-bold text-dark-50">{user?.fullName}</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Wallet Quick View */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-white border border-dark-900/10 rounded-xl px-3 py-1.5 shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-gold-gradient flex items-center justify-center shadow-sm">
              <span className="text-[10px] font-bold text-dark-50">₹</span>
            </div>
            <span className="text-sm font-mono font-bold text-dark-50">
              {formatShortcut(wallet?.cashBalance)}
            </span>
          </motion.div>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative p-2 rounded-xl bg-dark-800/80 hover:bg-dark-700/80 border border-dark-700/50 transition-colors haptic-button shadow-sm text-dark-400"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown 
              isOpen={isDropdownOpen}
              onClose={() => setIsDropdownOpen(false)}
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={handleMarkAsRead}
            />
          </div>

          {/* Avatar (Mobile) */}
          <Link href="/profile" className="md:hidden">
            <div className="w-8 h-8 rounded-full bg-dark-800 border border-gold-500/30 flex items-center justify-center text-dark-900 font-bold text-xs overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gold-gradient flex items-center justify-center">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}