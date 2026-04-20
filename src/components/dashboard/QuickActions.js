'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Pickaxe,
  Crown,
  ArrowDownToLine,
  Gift,
  Wallet,
  User,
  HelpCircle,
  History,
} from 'lucide-react';

const actions = [
  {
    href: '/mining',
    icon: Pickaxe,
    label: 'Start Mining',
    color: 'text-gold-400',
    bg: 'bg-gold-500/10',
    description: 'Mine gold now',
  },
  {
    href: '/plans',
    icon: Crown,
    label: 'Buy Plan',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    description: 'Subscribe',
  },
  {
    href: '/withdraw',
    icon: ArrowDownToLine,
    label: 'Withdraw',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    description: 'Cash out',
  },
  {
    href: '/referrals',
    icon: Gift,
    label: 'Refer & Earn',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    description: 'Invite friends',
  },
];

export default function QuickActions({ layout = 'grid' }) {
  if (layout === 'horizontal') {
    return (
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="shrink-0">
              <motion.div
                whileTap={{ scale: 0.93 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 glass-card px-4 py-3 haptic-button min-w-[140px]"
              >
                <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={action.color} />
                </div>
                <div>
                  <p className="text-xs font-semibold">{action.label}</p>
                  <p className="text-[9px] text-dark-500">{action.description}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2.5">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <motion.div
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl glass-card haptic-button hover:bg-dark-800/60 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center`}>
                <Icon size={20} className={action.color} />
              </div>
              <span className="text-[10px] text-dark-300 font-medium text-center leading-tight">
                {action.label}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}