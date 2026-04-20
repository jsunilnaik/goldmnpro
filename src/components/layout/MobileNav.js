'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import {
  Menu,
  X,
  Home,
  Pickaxe,
  Wallet,
  Crown,
  ArrowDownToLine,
  User,
  Gift,
  History,
  HelpCircle,
  LogOut,
  Shield,
  Settings,
  ChevronRight,
  Bell,
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', color: 'text-blue-400' },
  { href: '/mining', icon: Pickaxe, label: 'Mining', color: 'text-gold-400' },
  { href: '/wallet', icon: Wallet, label: 'My Wallet', color: 'text-green-400' },
  { href: '/plans', icon: Crown, label: 'Plans', color: 'text-purple-400' },
  { href: '/withdraw', icon: ArrowDownToLine, label: 'Withdraw', color: 'text-cyan-400' },
  { href: '/transactions', icon: History, label: 'Transactions', color: 'text-orange-400' },
  { href: '/referrals', icon: Gift, label: 'Referrals', color: 'text-pink-400' },
  { href: '/profile', icon: User, label: 'Profile', color: 'text-indigo-400' },
  { href: '/support', icon: HelpCircle, label: 'Help & Support', color: 'text-teal-400' },
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAdmin, wallet } = useAuth();

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-xl bg-dark-800/80 hover:bg-dark-700/80 border border-dark-700/50 transition-colors haptic-button shadow-sm"
      >
        <Menu size={20} className="text-dark-400" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-[101] w-[280px] bg-dark-950 border-r border-dark-800 flex flex-col overflow-hidden shadow-2xl"
              style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
              {/* Header */}
              <div className="p-4 border-b border-dark-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
                      <Pickaxe className="w-5 h-5 text-dark-900" />
                    </div>
                    <span className="font-display font-bold text-gold-shimmer text-sm">GoldMine Pro</span>
                  </div>
                  <button
                    onClick={closeMenu}
                    className="p-1.5 rounded-lg bg-dark-800 text-dark-400 hover:text-dark-50 transition-colors border border-dark-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* User Card */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-900 border border-dark-800">
                  <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-dark-900 font-bold text-sm shrink-0">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-dark-50">{user?.fullName}</p>
                    <p className="text-[10px] text-dark-400 truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Balance Quick View */}
                <div className="flex items-center justify-between mt-3 px-1">
                  <div>
                    <p className="text-[9px] text-dark-500 uppercase tracking-wider">Balance</p>
                    <p className="text-sm font-mono font-bold text-gold-600">
                      ₹{wallet?.cashBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-dark-500 uppercase tracking-wider">Gold</p>
                    <p className="text-sm font-mono font-bold text-amber-600">
                      {wallet?.goldBalance?.toFixed(4) || '0.0000'}g
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        isActive
                          ? 'bg-gold-500/10 text-gold-600 border border-gold-500/10 shadow-sm'
                          : 'text-dark-500 hover:bg-slate-100 active:bg-slate-200'
                      }`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} className={isActive ? 'text-gold-600' : item.color.replace('400', '600')} />
                      <span className="font-medium flex-1">{item.label}</span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-gold-600" />}
                      {!isActive && <ChevronRight size={14} className="text-dark-600" />}
                    </Link>
                  );
                })}

                {/* Admin Link */}
                {isAdmin && (
                  <>
                    <div className="h-px bg-dark-800 my-2" />
                    <Link
                      href="/admin"
                      onClick={closeMenu}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/5 transition-all"
                    >
                      <Shield size={18} />
                      <span className="font-medium flex-1">Admin Panel</span>
                      <ChevronRight size={14} className="text-dark-600" />
                    </Link>
                  </>
                )}
              </nav>

              {/* Footer */}
              <div className="p-3 border-t border-dark-800" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}>
                <button
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/5 transition-all"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Log Out</span>
                </button>
                <p className="text-[9px] text-dark-500 text-center mt-3">
                  GoldMine Pro v1.0.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}