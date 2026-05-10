'use client';

import { WifiOff, RefreshCw, Home, Pickaxe } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Icon Container */}
        <div className="relative mb-8 flex justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="w-24 h-24 rounded-3xl bg-dark-800 border border-dark-700 flex items-center justify-center relative z-10 shadow-2xl shadow-gold-500/10"
          >
            <WifiOff className="w-12 h-12 text-gold-500" />
          </motion.div>
          
          {/* Decorative Rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-dark-800 rounded-full animate-ping opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-dark-700/50 rounded-full" />
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-display font-black text-white mb-4 tracking-tight">
          You're <span className="text-gold-500">Offline</span>
        </h1>
        <p className="text-dark-400 mb-10 leading-relaxed">
          It looks like your connection has been interrupted. Don't worry, your mining progress is safe! Check your network and try again.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="w-full bg-gold-gradient text-dark-950 font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-gold-500/20 active:brightness-90 transition-all uppercase tracking-wider text-sm"
          >
            <RefreshCw className="w-5 h-5" />
            Retry Connection
          </motion.button>

          <div className="flex gap-4">
            <Link href="/" className="flex-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full bg-dark-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-dark-700/50 hover:bg-dark-700 transition-colors uppercase tracking-wider text-xs"
              >
                <Home className="w-4 h-4" />
                Go Home
              </motion.button>
            </Link>
            <Link href="/mining" className="flex-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-full bg-dark-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-dark-700/50 hover:bg-dark-700 transition-colors uppercase tracking-wider text-xs"
              >
                <Pickaxe className="w-4 h-4" />
                Mining Room
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-dark-800/50">
          <p className="text-[10px] text-dark-500 uppercase tracking-[0.2em] font-bold">
            GoldMine Pro &bull; Offline Mode v1.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
