'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Users,
  Crown,
  CreditCard,
  ArrowDownToLine,
  Settings,
  BarChart3,
  LogOut,
  Pickaxe,
  ChevronLeft,
  MessageSquare,
  Video,
  Megaphone,
  Landmark,
  MapPin,
} from 'lucide-react';
import SplashScreen from '@/components/common/SplashScreen';

const adminMenu = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/locations', icon: MapPin, label: 'Locations' },
  { href: '/admin/city-upis', icon: CreditCard, label: 'Regional UPI' },
  { href: '/admin/plans', icon: Crown, label: 'Plans' },
  { href: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { href: '/admin/p2p-matches', icon: Pickaxe, label: 'P2P Matches' },
  { href: '/admin/treasury', icon: Landmark, label: 'Treasury' },
  { href: '/admin/withdrawals', icon: ArrowDownToLine, label: 'Withdrawals' },
  { href: '/admin/mining-config', icon: Settings, label: 'Mining Config' },
  { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { href: '/admin/reviews', icon: MessageSquare, label: 'Reviews' },
  { href: '/admin/media', icon: Video, label: 'Media' },
  { href: '/admin/broadcasts', icon: Megaphone, label: 'Broadcasts' },
  { href: '/profile', icon: Settings, label: 'My KYC / Profile' },
];

export default function AdminLayout({ children }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return <SplashScreen />;
  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden w-full">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-dark-900/10 h-screen fixed left-0 top-0 z-40 shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-dark-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-sm">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-red-600 font-display">Admin</h1>
              <p className="text-[10px] text-dark-500 uppercase tracking-widest font-bold">GoldMine Pro</p>
            </div>
          </div>
        </div>

        {/* Back to App */}
        <div className="px-4 py-3 border-b border-dark-900/10 bg-slate-50/50">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-bold text-dark-400 hover:text-dark-100 transition-colors"
          >
            <ChevronLeft size={14} />
            Back to Dashboard
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {adminMenu.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-red-500/10 text-red-600 border border-red-500/20 shadow-sm font-bold'
                    : 'text-dark-500 hover:bg-slate-100 hover:text-dark-100 transition-all font-medium'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Info */}
        <div className="p-4 border-t border-dark-900/10 bg-slate-50/30">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-dark-900/10 mb-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-600 font-bold text-sm border border-red-500/20">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-dark-50">{user?.fullName}</p>
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Administrator</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/5 transition-all transition-all"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Admin Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-red-500/10 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-red-500" />
            <span className="font-bold text-red-600">Admin Panel</span>
          </div>
          <Link href="/dashboard" className="text-xs font-bold text-dark-400">
            ← App
          </Link>
        </div>
        {/* Mobile Nav */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
          {adminMenu.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-slate-100 text-dark-500'
                }`}
              >
                <Icon size={12} strokeWidth={isActive ? 2.5 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pt-32 md:pt-0 md:pl-64 overflow-x-hidden w-full">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}