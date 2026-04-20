'use client';

import { motion } from 'framer-motion';
import {
    Wallet,
    TrendingUp,
    Pickaxe,
    ArrowDownToLine,
    Sparkles,
    Clock,
    Gift,
    Crown,
} from 'lucide-react';

export default function StatsGrid({ wallet, subscription, miningStatus }) {
    const stats = [
        {
            label: 'Balance',
            value: `₹${wallet?.cashBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`,
            icon: Wallet,
            color: 'text-gold-400',
            bg: 'bg-gold-500/10',
            border: 'border-gold-500/20',
        },
        {
            label: 'Points',
            value: wallet?.pointsBalance?.toFixed(2) || '0.00',
            icon: Sparkles,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
        },
        {
            label: 'Gold',
            value: `${wallet?.goldBalance?.toFixed(4) || '0.0000'}g`,
            icon: Crown,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
        },
        {
            label: 'Earned',
            value: `₹${wallet?.totalCashEarned?.toLocaleString('en-IN') || '0'}`,
            icon: TrendingUp,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
        },
        {
            label: 'Withdrawn',
            value: `₹${wallet?.totalWithdrawn?.toLocaleString('en-IN') || '0'}`,
            icon: ArrowDownToLine,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
        },
        {
            label: 'Referral',
            value: `₹${wallet?.totalReferralEarnings?.toLocaleString('en-IN') || '0'}`,
            icon: Gift,
            color: 'text-pink-400',
            bg: 'bg-pink-500/10',
            border: 'border-pink-500/20',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
        >
            {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                    <motion.div
                        key={stat.label}
                        variants={itemVariants}
                        whileTap={{ scale: 0.97 }}
                        className={`glass-card p-3.5 border ${stat.border} cursor-pointer hover:bg-dark-800/80 transition-all haptic-button`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-dark-400 uppercase tracking-wider font-medium">
                                {stat.label}
                            </span>
                            <div className={`w-6 h-6 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                <Icon size={12} className={stat.color} />
                            </div>
                        </div>
                        <p className={`text-base font-mono font-bold ${stat.color}`}>
                            {stat.value}
                        </p>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}