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
          className="relative w-[calc(100%-2rem)] max-w-md md:max-w-3xl bg-white rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)] flex flex-col md:flex-row"
        >
          {/* Left Section - Vibrant Accent (Header on mobile) */}
          <div className="h-48 md:h-auto md:w-[38%] bg-orange-500 bg-gradient-to-br from-orange-400 to-orange-600 p-6 md:p-10 flex flex-col items-center justify-center text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
               <Megaphone size={250} className="absolute -bottom-10 -left-10 rotate-12" />
            </div>
            
            <motion.div
              animate={{ rotate: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 md:mb-6 border border-white/30 shadow-xl"
            >
              <Megaphone size={32} className="md:size-[40px] text-white" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-[0.8] relative z-10 text-center">
              Gold<br/>Mine
            </h1>
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mt-3 md:mt-4 opacity-70 relative z-10 text-center">
              Administrative<br className="hidden md:block" /> Broadcast
            </p>
          </div>

          {/* Right Section - Content */}
          <div className="flex-1 p-6 md:p-10 flex flex-col relative bg-white">
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-600 transition-all z-20"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="flex-1 flex flex-col justify-center min-h-0">
              <h2 className="text-2xl md:text-3xl font-display font-black text-slate-900 leading-tight mb-4 pr-8">
                {activeBroadcast.title}
              </h2>
              
              <div className="overflow-y-auto max-h-[250px] md:max-h-[350px] pr-2 custom-scrollbar">
                {activeBroadcast.type === 'video' ? (
                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-lg mb-4">
                    <iframe
                      src={`${getEmbedUrl(activeBroadcast.content)}?autoplay=0`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : activeBroadcast.type === 'image' ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-lg mb-4 bg-slate-50 border border-slate-100">
                    <img 
                      src={activeBroadcast.content} 
                      alt={activeBroadcast.title} 
                      className="w-full h-auto object-contain max-h-[300px]"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">
                    {activeBroadcast.content}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 md:mt-8 flex flex-col gap-2">
               {activeBroadcast.buttonUrl ? (
                  <div className="flex flex-col gap-2">
                     <a
                       href={activeBroadcast.buttonUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       onClick={handleDismiss}
                       className="w-full bg-orange-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_10px_20px_-5px_rgba(249,115,22,0.4)] hover:bg-orange-600 transition-all active:scale-95"
                     >
                       {activeBroadcast.buttonText || 'Details'}
                       <ExternalLink size={14} />
                     </a>
                     <button
                       onClick={handleDismiss}
                       className="w-full py-2 text-slate-400 font-bold uppercase tracking-widest text-[9px] hover:text-slate-900 transition-all"
                     >
                       Dismiss
                     </button>
                  </div>
               ) : (
                  <button
                    onClick={handleDismiss}
                    className="w-full bg-[#0f172a] text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-[0_10px_25px_-5px_rgba(15,23,42,0.3)] hover:bg-[#1e293b] transition-all active:scale-95"
                  >
                    I Understand
                  </button>
               )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
