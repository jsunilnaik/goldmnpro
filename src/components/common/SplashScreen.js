'use client';

import { motion } from 'framer-motion';
import { Pickaxe } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-dark-950 flex items-center justify-center z-[300]">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-gold-gradient flex items-center justify-center mx-auto mb-4"
        >
          <Pickaxe className="w-10 h-10 text-dark-900" />
        </motion.div>

        <h1 className="text-2xl font-display font-bold text-gold-shimmer">GoldMine Pro</h1>
        <p className="text-dark-400 text-xs mt-2 uppercase tracking-widest">Loading your vault...</p>

        {/* Loading Bar */}
        <div className="w-32 h-1 bg-dark-800 rounded-full mx-auto mt-6 overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-full h-full bg-gold-gradient"
          />
        </div>
      </motion.div>
    </div>
  );
}