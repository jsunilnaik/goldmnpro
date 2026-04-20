'use client';

import { MapPin, ShieldAlert, LogOut, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function BlockedRegion({ city }) {
  const { logout } = useAuth();

  return (
    <div className="fixed inset-0 z-[9999] bg-dark-50 flex items-center justify-center p-6 text-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-red-500/5 blur-[120px] rounded-full animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full relative"
      >
        {/* Icon Animation */}
        <div className="relative mb-8 flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-[2.5rem] bg-red-500/10 flex items-center justify-center border-2 border-red-500/20 shadow-2xl shadow-red-500/10"
          >
            <ShieldAlert size={48} className="text-red-500" />
          </motion.div>
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 w-24 h-24 border-2 border-dashed border-red-500/20 rounded-[2.5rem]"
          />
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-display font-black text-white mb-4">
          Region Suspended
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-100 border border-dark-200 text-dark-800 text-sm font-bold mb-6">
          <MapPin size={14} className="text-red-500" />
          {city || 'Your Location'}
        </div>
        
        <p className="text-dark-400 text-sm leading-relaxed mb-8 font-medium">
          Access to GoldMine Pro has been temporarily restricted in your region by administration. 
          Please contact our global support team if you believe this is an error or require assistance.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <a
            href="https://wa.me/your_support_number"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-white text-dark-950 font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl hover:bg-dark-50 transition-all shadow-lg shadow-white/5"
          >
            <MessageCircle size={16} />
            Contact Support
          </a>
          
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full bg-dark-100 border border-dark-200 text-red-500 font-bold text-sm py-4 rounded-2xl hover:bg-dark-200 transition-all"
          >
            <LogOut size={16} />
            Logout Account
          </button>
        </div>

        {/* Footer Info */}
        <p className="mt-8 text-[10px] uppercase font-black tracking-[0.2em] text-dark-600">
          GoldMine Pro Security Protocol 4.0
        </p>
      </motion.div>
    </div>
  );
}
