'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Globe } from 'lucide-react';

// --------------------------------------------------------------------------------
// CONFIGURATION: INSERT YOUR MOBILE APP LINK HERE
// If you have a direct Play Store, App Store, or APK link, insert it below.
// If left empty, the button will trigger the browser's PWA installation flow.
// --------------------------------------------------------------------------------
const APP_DOWNLOAD_URL = "#"; 

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const pathname = usePathname();

  // Reset prompt visibility on page navigation
  useEffect(() => {
    setShowPrompt(false);
  }, [pathname]);

  useEffect(() => {
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode);
    if (isInStandaloneMode) return;

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const delay = 10000; // 10 seconds
    const timer = setTimeout(() => {
      if (!window.matchMedia('(display-mode: standalone)').matches &&
        !window.navigator.standalone) {
        setShowPrompt(true);
      }
    }, delay);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleAction = async () => {
    // 1. If a direct App Link is provided, redirect to it
    if (APP_DOWNLOAD_URL) {
      window.open(APP_DOWNLOAD_URL, '_blank');
      return;
    }

    // 2. Otherwise, trigger PWA Installation
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowPrompt(false);
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS doesn't support generic prompt, show instructions (already in UI)
      alert("To install: Tap the 'Share' icon in Safari and select 'Add to Home Screen'.");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  useEffect(() => {
    if (showPrompt) {
      document.body.classList.add('pwa-banner-active');
    } else {
      document.body.classList.remove('pwa-banner-active');
    }
    return () => document.body.classList.remove('pwa-banner-active');
  }, [showPrompt]);

  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -64, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[110] md:hidden h-[64px] bg-slate-900 border-b border-gold-500/20 px-3 flex items-center justify-between shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button
            onClick={handleDismiss}
            className="p-1.5 md:p-2 -ml-1 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} className="md:w-5 md:h-5" />
          </button>

          <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gold-gradient flex items-center justify-center shrink-0 shadow-lg shadow-gold-500/20">
              {isIOS ? (
                <Smartphone className="w-5 h-5 md:w-6 md:h-6 text-slate-900" />
              ) : (
                <Download className="w-5 h-5 md:w-6 md:h-6 text-slate-900" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-sans font-bold text-[11px] md:text-sm text-white leading-tight uppercase tracking-tight truncate">
                GoldMine Pro {APP_DOWNLOAD_URL && APP_DOWNLOAD_URL !== "#" ? 'Mobile App' : 'App'}
              </h3>
              <p className="text-[9px] md:text-xs text-slate-400 mt-0.5 font-medium leading-tight truncate">
                {isIOS
                  ? 'Tap share and "Add to Home Screen"'
                  : APP_DOWNLOAD_URL && APP_DOWNLOAD_URL !== "#"
                    ? 'Get the official mobile application'
                    : 'Experience premium gold mining'
                }
              </p>
            </div>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleAction}
          className="bg-gold-gradient text-slate-900 font-black text-[10px] md:text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-wider shadow-xl shadow-gold-500/20 border border-white/10 shrink-0 ml-2"
        >
          {APP_DOWNLOAD_URL && APP_DOWNLOAD_URL !== "#" ? <Globe size={12} className="md:w-3.5 md:h-3.5" /> : <Download size={12} className="md:w-3.5 md:h-3.5" />}
          <span>{APP_DOWNLOAD_URL && APP_DOWNLOAD_URL !== "#" ? 'Get App' : 'Install'}</span>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}