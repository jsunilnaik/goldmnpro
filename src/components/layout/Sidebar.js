'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Pickaxe,
    Wallet,
    CreditCard,
    ArrowDownToLine,
    User,
    Gift,
    History,
    HelpCircle,
    LogOut,
    Crown,
    Settings,
    Shield,
    MapPin,
} from 'lucide-react';

const menuItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/mining', icon: Pickaxe, label: 'Mining' },
    { href: '/wallet', icon: Wallet, label: 'Wallet' },
    { href: '/plans', icon: Crown, label: 'Plans' },
    { href: '/withdraw', icon: ArrowDownToLine, label: 'Withdraw' },
    { href: '/transactions', icon: History, label: 'Transactions' },
    { href: '/referrals', icon: Gift, label: 'Referrals' },
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/support', icon: HelpCircle, label: 'Support' },
];

const adminItems = [
    { href: '/admin', icon: Shield, label: 'Admin Panel' },
    { href: '/admin/users', icon: User, label: 'Manage Users' },
    { href: '/admin/withdrawals', icon: ArrowDownToLine, label: 'Withdrawals' },
    { href: '/admin/locations', icon: MapPin, label: 'Manage Locations' },
    { href: '/admin/mining-config', icon: Settings, label: 'Mining Config' },
];

export default function Sidebar({ isOpen, onClose }) {
    const pathname = usePathname();
    const { user, logout, isAdmin } = useAuth();

    const handleNavItemClick = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-dark-950/60 backdrop-blur-sm z-[100] md:hidden"
                    />
                )}
            </AnimatePresence>

            <aside className={`fixed inset-y-0 left-0 z-[101] flex flex-col w-64 bg-dark-950 border-r border-dark-800 h-screen shadow-sm transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
            {/* Logo */}
            <div className="p-6 border-b border-dark-800">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center">
                        <Pickaxe className="w-6 h-6 text-dark-900" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gold-shimmer font-display">GoldMine</h1>
                        <p className="text-[10px] text-dark-400 uppercase tracking-widest">Pro</p>
                    </div>
                </Link>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-dark-800">
                <Link 
                    href="/profile" 
                    onClick={handleNavItemClick}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white border border-dark-900/10 shadow-sm hover:border-gold-500/30 transition-all group"
                >
                    <div className="w-10 h-10 rounded-full border border-dark-900/5 flex items-center justify-center text-dark-50 font-bold text-sm overflow-hidden shrink-0 shadow-sm">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gold-gradient flex items-center justify-center text-dark-50">
                                {user?.fullName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-dark-50 group-hover:text-gold-600 transition-colors">{user?.fullName}</p>
                        <p className="text-[10px] text-dark-500 truncate font-medium">{user?.email}</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-dark-500 font-semibold px-3 mb-2">
                    Main Menu
                </p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={handleNavItemClick}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                                    ? 'bg-gold-500/10 text-gold-600 border border-gold-500/20 shadow-sm'
                                    : 'text-dark-500 hover:bg-slate-100 hover:text-dark-50 transition-all'
                                }`}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-600" />
                            )}
                        </Link>
                    );
                })}

                {/* Admin Section */}
                {isAdmin && (
                    <>
                        <div className="pt-4 pb-2">
                            <p className="text-[10px] uppercase tracking-widest text-red-400/60 font-semibold px-3">
                                Admin
                            </p>
                        </div>
                        {adminItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${isActive
                                            ? 'bg-red-500/10 text-red-600 border border-red-500/20 shadow-sm'
                                            : 'text-dark-500 hover:bg-red-500/5 hover:text-red-600 transition-all'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-dark-800">
                <button
                    onClick={() => {
                        handleNavItemClick();
                        logout();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/5 transition-all"
                >
                    <LogOut size={18} />
                    <span className="font-medium">Log Out</span>
                </button>
            </div>
        </aside>
        </>
    );
}