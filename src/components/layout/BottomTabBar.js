'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  Pickaxe,
  Wallet,
  Menu,
  Gift,
} from 'lucide-react';

const tabs = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/mining', icon: Pickaxe, label: 'Mine' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/referrals', icon: Gift, label: 'Refer' },
  { id: 'menu', icon: Menu, label: 'Menu' },
];

export default function BottomTabBar({ toggleSidebar, isSidebarOpen }) {
  const pathname = usePathname();

  return (
    <div className="bottom-tab-bar md:hidden">
      <div className="bg-dark-950/95 backdrop-blur-xl border-t border-dark-800/80 px-2 pt-2 pb-1 shadow-[0_-1px_10px_rgba(0,0,0,0.02)]">
        <nav className="flex justify-around items-center">
          {tabs.map((tab) => {
            const isMenu = tab.id === 'menu';
            const isActive = isMenu ? isSidebarOpen : (pathname === tab.href || pathname.startsWith(tab.href + '/'));
            const Icon = tab.icon;

            const TabComponent = isMenu ? 'button' : Link;
            const componentProps = isMenu ? { onClick: toggleSidebar, type: 'button' } : { href: tab.href };

            return (
              <TabComponent
                key={isMenu ? tab.id : tab.href}
                {...componentProps}
                className="relative flex flex-col items-center justify-center w-16 py-1 haptic-button outline-none"
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="bottomTab"
                    className="absolute -top-2 w-8 h-1 bg-gold-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-gold-600'
                      : 'text-dark-400 hover:text-dark-300'
                  }`}
                >
                  {isActive && !isMenu && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-gold-500/5 rounded-xl"
                    />
                  )}
                  {isActive && isMenu && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-gold-500/10 rounded-xl"
                    />
                  )}
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className={isActive && !isMenu ? 'animate-bounce-in' : ''}
                  />

                  {/* Mining animation dot */}
                  {tab.label === 'Mine' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-mining-active rounded-full animate-pulse" />
                  )}
                </motion.div>

                {/* Label */}
                <span className={`text-[10px] mt-0.5 font-medium transition-colors ${
                  isActive ? 'text-gold-600' : 'text-dark-500'
                }`}>
                  {tab.label}
                </span>
              </TabComponent>
            );
          })}
        </nav>
      </div>
    </div>
  );
}