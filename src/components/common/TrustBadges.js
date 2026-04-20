'use client';

import { motion } from 'framer-motion';
import { Shield, Check, Award, Lock, TrendingUp, Users } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      label: 'Bank Level Security',
      sublabel: 'SSL Encrypted',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Award,
      label: 'SEBI Registered',
      sublabel: 'Licensed Investment',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: Lock,
      label: 'RBI Compliant',
      sublabel: 'Government Approved',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: TrendingUp,
      label: 'ISO 27001 Certified',
      sublabel: 'Information Security',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      icon: Users,
      label: '50K+ Active Miners',
      sublabel: 'Trusted Community',
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    {
      icon: Check,
      label: 'Verified Payouts',
      sublabel: '₹50Cr+ Withdrawn',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="w-full"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {badges.map((badge, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="group"
          >
            <div className={`relative p-6 rounded-2xl border-2 border-transparent bg-gradient-to-br ${badge.color.split(' ')[0]} opacity-0 absolute inset-0 rounded-2xl`} />
            
            <div className={`relative ${badge.bgColor} p-6 rounded-2xl border-2 border-dark-900/10 hover:border-dark-800/30 transition-all group-hover:shadow-lg group-hover:scale-105 cursor-pointer shadow-sm overflow-hidden`}>
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${badge.color} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`${badge.iconColor} mb-3 flex items-center justify-center`}>
                  <badge.icon size={28} />
                </div>
                
                {/* Label */}
                <p className="font-bold text-dark-50 text-sm leading-tight mb-1">
                  {badge.label}
                </p>
                
                {/* Sublabel */}
                <p className="text-[11px] font-mono text-dark-400 uppercase tracking-widest font-bold italic">
                  {badge.sublabel}
                </p>
              </div>

              {/* Decorative accent line */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${badge.color} w-0 group-hover:w-full transition-all duration-500`} />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
