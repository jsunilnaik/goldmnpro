'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Megaphone, Play } from 'lucide-react';
import { getEmbedUrl } from '@/lib/utils';

export default function BroadcastModal() {
  const [activeBroadcast, setActiveBroadcast] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestBroadcast();
  }, []);

  const fetchLatestBroadcast = async () => {
    try {
      const res = await fetch('/api/broadcasts');
      const data = await res.json();
      
      if (res.ok && data.broadcasts && data.broadcasts.length > 0) {
        const latest = data.broadcasts[0];
        
        // Check if user has already dismissed this specific broadcast
        const dismissedId = localStorage.getItem(`dismissed_broadcast_${latest._id}`);
        if (!dismissedId) {
          setActiveBroadcast(latest);
          // Small delay before showing the modal for better UX
          setTimeout(() => setIsOpen(true), 1500);
        }
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    if (activeBroadcast) {
      localStorage.setItem(`dismissed_broadcast_${activeBroadcast._id}`, 'true');
    }
    setIsOpen(false);
  };

  if (!activeBroadcast || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="absolute inset-0 bg-dark-950/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl bg-white border border-dark-900/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all"
          >
            <X size={18} />
          </button>

          {/* Header/Title Banner */}
          <div className="relative h-20 bg-dark-50 flex items-center px-8 border-b border-white/5">
             <div className="absolute inset-0 overflow-hidden opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-600/50 to-blue-600/50 mix-blend-overlay" />
             </div>
             <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                   <Megaphone size={18} />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Administrative Broadcast</h3>
                  <h2 className="text-white font-display font-bold text-lg leading-tight truncate max-w-[300px]">{activeBroadcast.title}</h2>
                </div>
             </div>
          </div>

          {/* Body Content */}
          <div className="flex-1">
             {activeBroadcast.type === 'video' ? (
               <div className="relative aspect-video bg-black group">
                  <iframe
                    src={`${getEmbedUrl(activeBroadcast.content)}?autoplay=0`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  {/* Subtle video label Overlay (only visible on IG if needed, normally iframe covers it) */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={10} className="fill-white text-white" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Featured Content</span>
                  </div>
               </div>
             ) : (
               <div className="p-8 space-y-4">
                  <div className="p-6 bg-slate-50 border border-dark-900/5 rounded-[2rem] relative overflow-hidden group">
                     {/* Decorative background mark */}
                     <Megaphone size={120} className="absolute -bottom-8 -right-8 text-white opacity-40 group-hover:rotate-12 transition-transform duration-700" />
                     <p className="relative text-dark-100 text-sm leading-relaxed font-bold whitespace-pre-wrap">
                        {activeBroadcast.content}
                     </p>
                  </div>
               </div>
             )}
          </div>

          {/* Footer/Action */}
          <div className="p-6 bg-slate-50/50 border-t border-dark-900/5">
             {activeBroadcast.buttonUrl ? (
                <div className="flex flex-col sm:flex-row gap-3">
                   <a
                     href={activeBroadcast.buttonUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     onClick={handleDismiss}
                     className="flex-1 bg-red-600 text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all hover:translate-y-[-2px] active:translate-y-0"
                   >
                     {activeBroadcast.buttonText || 'Take Action'}
                     <ExternalLink size={14} />
                   </a>
                   <button
                     onClick={handleDismiss}
                     className="px-8 py-4 rounded-2xl bg-white border border-dark-900/10 text-dark-400 font-black uppercase tracking-widest text-[11px] hover:text-dark-50 transition-all"
                   >
                     Acknowledge
                   </button>
                </div>
             ) : (
                <button
                  onClick={handleDismiss}
                  className="w-full bg-dark-50 text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl shadow-lg hover:bg-dark-100 transition-all hover:translate-y-[-2px] active:translate-y-0"
                >
                  I Understand
                </button>
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
