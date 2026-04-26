export const runtime = 'edge';
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Pickaxe, Shield, TrendingUp, Users, 
  ArrowRight, Star, Zap, ChevronDown, 
  Globe, Lock, Award, BarChart3,
  Cpu, Wallet, Smartphone, CheckCircle2,
  Image as ImageIcon, Loader2, Key,
  ShieldCheck, Github, Twitter, Mail,
  MoreHorizontal, Clock
} from 'lucide-react';
import HomeBottomBar from '@/components/layout/HomeBottomBar';
import { getEmbedUrl } from '@/lib/utils';


export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [mediaItems, setMediaItems] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [playingMedia, setPlayingMedia] = useState({});
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const notifications = [
    "Arjun from Mumbai just earned ₹3,200",
    "Priyanshu from Pune started mining today",
    "Withdrawal of 5.8 GOLD completed successfully",
    "Network performance improved by 15%",
    "Deepak from Hyderabad upgraded his plan"
  ];

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % notifications.length);
    }, 5000);
    fetchReviews();
    fetchMedia();
    fetchPlans();
    return () => clearInterval(timer);
  }, [notifications.length, isAuthenticated, router]);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      if (res.ok) setPlans(data.plans);
    } catch (error) {
      console.error('Failed to load plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (res.ok) setReviews(data.reviews);
    } catch (error) {
      console.error('Failed to load reviews');
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (res.ok) setMediaItems(data.media);
    } catch (error) {
      console.error('Failed to load media');
    } finally {
      setLoadingMedia(false);
    }
  };


  return (
    <div className="min-h-screen bg-dark-950 text-dark-50 font-sans antialiased overflow-x-hidden selection:bg-gold-500/30 pb-20 md:pb-0" id="homepage-root">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
      </div>

      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-dark-100/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-gold-500/20">
              <Pickaxe className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-black text-dark-50 tracking-tighter text-xl md:text-2xl">
              GOLD<span className="text-gold-500">MINE</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            {[
              { id: 'features', label: 'Protocol' },
              { id: 'plans', label: 'Tiers' },
              { id: 'reviews', label: 'Verify' },
              { id: 'security', label: 'Vault' }
            ].map((item) => (
              <Link 
                key={item.id} 
                href={`#${item.id}`} 
                className="text-[10px] font-bold text-dark-300 hover:text-gold-500 transition-all uppercase tracking-[0.2em]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-xs font-bold text-dark-300 hover:text-dark-50 transition-colors uppercase tracking-widest">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-dark-50 text-white font-black text-[10px] md:text-xs px-6 md:px-8 py-3 md:py-3.5 rounded-xl shadow-xl shadow-dark-50/10 hover:bg-dark-100 transition-all uppercase tracking-widest"
            >
              Start Mining
            </Link>
          </div>
        </div>
      </nav>      {/* Hero Section - App Style */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 px-4 z-10 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <span className="text-[10px] text-gold-700 font-black uppercase tracking-widest">Join 50,000+ Indians Earning Daily</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-display font-black leading-[1.1] text-dark-50 tracking-tight mb-8">
              Income Your <br />
              <span className="indian-gold-text">Way.</span>
            </h1>

            <p className="text-dark-300 text-base md:text-xl font-medium leading-relaxed max-w-xl mx-auto mb-10">
              India's easiest gold mining app. Simple, safe, and works while you sleep.
            </p>

            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <Link href="/signup">
                <button className="gold-gradient-bg text-white font-black w-full py-4 rounded-2xl text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-center gap-3">
                  Start Earning Now <ArrowRight size={20} />
                </button>
              </Link>
              <p className="text-[11px] text-dark-400 font-bold uppercase tracking-wider">
                ₹0 Activation Fee • Cancel Anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges Bar - Horizontal Scroll on Mobile */}
      <div className="bg-white/50 backdrop-blur-md border-y border-dark-100/5 py-6 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8 md:gap-12 min-w-max md:min-w-0">
          {[
            { icon: ShieldCheck, label: "100% Safe", sub: "Legal in India" },
            { icon: Zap, label: "Fast Pay", sub: "Instant Withdrawals" },
            { icon: Award, label: "Verified", sub: "Real User Reviews" },
            { icon: Clock, label: "24/7 Mining", sub: "Earn Every Minute" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500 group-hover:bg-gold-500 group-hover:text-white transition-all">
                <item.icon size={20} />
              </div>
              <div>
                <div className="text-sm font-black text-dark-50 uppercase tracking-wide leading-none mb-1">{item.label}</div>
                <div className="text-[10px] font-bold text-dark-300 uppercase tracking-widest leading-none">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted By Section - Industrial Partners Carousel */}
      <div className="bg-slate-50 border-b border-dark-100/5 py-12 md:py-20 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
          <h3 className="text-[10px] md:text-xs font-black text-dark-500 uppercase tracking-[0.4em] mb-4">Trusted By Industry Giants</h3>
          <div className="w-12 h-0.5 bg-gold-500/30 mx-auto" />
        </div>

        {/* Marquee Container */}
        <div className="relative flex overflow-hidden">
          {/* Fading gradients for professional look */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

          {/* Infinite Marquee Motion */}
          <motion.div 
            animate={{ x: [0, -1920] }}
            transition={{ 
              duration: 40, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="flex flex-nowrap gap-12 md:gap-24 items-center py-4 px-12"
          >
            {[
              { id: 'hgml', name: "Hutti Gold Mines Limited", logo: "/partners/hgml.png" },
              { id: 'bgml', name: "Bharat Gold Mines Limited", logo: "/partners/bgml.png" },
              { id: 'hzl', name: "Hindustan Zinc Limited", logo: "/partners/hzl.png" },
              { id: 'kundan', name: "Kundan Gold Mines", logo: "/partners/kundan.png" },
              { id: 'dgml', name: "Deccan Gold Mines Limited", logo: "/partners/dgml.png" },
              // Duplicate for seamless loop
              { id: 'hgml-2', name: "Hutti Gold Mines Limited", logo: "/partners/hgml.png" },
              { id: 'bgml-2', name: "Bharat Gold Mines Limited", logo: "/partners/bgml.png" },
              { id: 'hzl-2', name: "Hindustan Zinc Limited", logo: "/partners/hzl.png" },
              { id: 'kundan-2', name: "Kundan Gold Mines", logo: "/partners/kundan.png" },
              { id: 'dgml-2', name: "Deccan Gold Mines Limited", logo: "/partners/dgml.png" },
               // Thrice for very wide screens
              { id: 'hgml-3', name: "Hutti Gold Mines Limited", logo: "/partners/hgml.png" },
              { id: 'bgml-3', name: "Bharat Gold Mines Limited", logo: "/partners/bgml.png" },
              { id: 'hzl-3', name: "Hindustan Zinc Limited", logo: "/partners/hzl.png" },
              { id: 'kundan-3', name: "Kundan Gold Mines", logo: "/partners/kundan.png" },
              { id: 'dgml-3', name: "Deccan Gold Mines Limited", logo: "/partners/dgml.png" },
            ].map((partner, i) => (
              <div key={i} className="flex flex-col items-center gap-6 min-w-max group cursor-pointer px-4">
                <div className="relative h-24 md:h-32 w-auto flex items-center justify-center grayscale opacity-60 md:opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500">
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="h-full w-auto object-contain scale-125 md:scale-105 transition-transform duration-500 mix-blend-multiply" 
                  />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <span className="text-[9px] font-black text-gold-600 uppercase tracking-widest text-center whitespace-nowrap">
                    {partner.name}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Live Performance Bar */}
      <div className="bg-slate-50 border-y border-dark-100/10 py-8 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-12">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-dark-300 uppercase tracking-[0.3em] mb-2">Network Hash</span>
                <span className="text-xl font-mono font-bold text-dark-50 tracking-widest">4.88 <span className="text-gold-500 text-xs">EH/s</span></span>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-dark-300 uppercase tracking-[0.3em] mb-2">Active Nodes</span>
                <span className="text-xl font-mono font-bold text-dark-50 tracking-widest">52,401</span>
             </div>
          </div>
          
          <div className="flex items-center gap-5 bg-white px-6 py-3 rounded-xl border border-dark-100/10 shadow-xl w-full max-w-sm">
             <AnimatePresence mode="wait">
                <motion.div
                  key={tickerIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-[11px] font-bold text-dark-100 truncate tracking-wide"
                >
                  {notifications[tickerIndex]}
                </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </div>
      {/* Mobile App Preview - Interactive Look */}
      <section id="features" className="py-16 md:py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-6xl font-display font-black text-dark-50 mb-8 tracking-tighter uppercase italic">The App <br /> <span className="text-gold-500">You'll Love.</span></h2>
            <div className="space-y-8">
              {[
                { title: "One-Click Start", desc: "No complex setup. Just tap and start earning." },
                { title: "Real-time Tracking", desc: "Watch your gold balance grow every second." },
                { title: "Instant Withdraw", desc: "Send earnings to your bank account instantly via UPI." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                   <div className="w-12 h-12 shrink-0 rounded-2xl bg-white border border-dark-100/10 shadow-lg flex items-center justify-center text-gold-500 font-black italic">
                      {i + 1}
                   </div>
                   <div>
                     <h3 className="text-xl font-bold text-dark-50 uppercase tracking-widest mb-2">{item.title}</h3>
                     <p className="text-dark-300 font-medium leading-relaxed">{item.desc}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:w-1/2 relative">
             {/* Phone Frame Mockup */}
             <div className="relative w-full max-w-[320px] mx-auto aspect-[9/19] bg-dark-900 rounded-[3rem] border-[8px] border-dark-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-6 bg-dark-800 flex items-center justify-center">
                   <div className="w-16 h-1 rounded-full bg-dark-700 mt-1" />
                </div>
                
                <div className="p-6 pt-10 h-full flex flex-col">
                   <div className="flex justify-between items-center mb-10">
                      <div className="w-10 h-10 rounded-full bg-gold-500" />
                      <div className="h-2 w-20 bg-dark-700 rounded-full" />
                   </div>
                   
                   <div className="bg-dark-800 rounded-2xl p-6 mb-6">
                      <div className="text-[10px] text-dark-400 uppercase tracking-widest mb-2">Total Earnings</div>
                      <div className="text-3xl font-mono font-bold text-gold-500">₹12,450.80</div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-dark-800 rounded-xl p-4">
                         <div className="text-[8px] text-dark-500 uppercase tracking-widest mb-1">Gold</div>
                         <div className="text-sm font-bold text-white">4.52g</div>
                      </div>
                      <div className="bg-dark-800 rounded-xl p-4">
                         <div className="text-[8px] text-dark-500 uppercase tracking-widest mb-1">Nodes</div>
                         <div className="text-sm font-bold text-white">08</div>
                      </div>
                   </div>

                   <div className="flex-grow flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-4 border-gold-500 flex items-center justify-center relative">
                         <div className="absolute inset-0 rounded-full bg-gold-500/20 animate-ping" />
                         <Pickaxe className="text-gold-500" size={40} />
                      </div>
                   </div>

                   <button className="gold-gradient-bg py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-lg mt-10">
                      Active Mining...
                   </button>
                </div>
             </div>
             
             {/* Floating Trust Badge */}
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ repeat: Infinity, duration: 3 }}
               className="absolute -bottom-10 -right-4 md:-right-10 glass-card-premium p-6 rounded-3xl app-shadow border-gold-500/20 max-w-[200px]"
             >
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center">
                      <ShieldCheck className="text-white" size={16} />
                   </div>
                   <span className="text-xs font-black text-dark-50 uppercase tracking-widest">100% Safe</span>
                </div>
                <p className="text-[10px] text-dark-300 font-bold uppercase leading-relaxed italic">Verified Mining Protocol Grade A+</p>
             </motion.div>
          </div>
        </div>
      </section>

      {/* 100% Guarantee Section */}
      <section className="py-16 md:py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gold-500 mx-auto flex items-center justify-center mb-6 md:mb-8 shadow-2xl shadow-gold-500/30">
            <CheckCircle2 className="text-white" size={32} />
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black text-dark-50 mb-6 uppercase tracking-tight">Our <span className="text-gold-500">100% Guarantee.</span></h2>
          <p className="text-dark-300 font-medium text-base md:text-lg leading-relaxed mb-10 md:mb-12">
            We are so confident in our system that we guarantee you will see results within 24 hours of starting. Your safety and trust are our top priority.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Lock, label: "Money Safe", desc: "Your wallet is encrypted" },
              { icon: ShieldCheck, label: "Data Private", desc: "No identity sharing" },
              { icon: Wallet, label: "Fast Pay", sub: "Daily settlements" }
            ].map((box, i) => (
              <div key={i} className="bg-white p-8 rounded-[32px] border border-dark-100/10 shadow-soft">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-gold-500 mx-auto mb-6">
                  <box.icon size={24} />
                </div>
                <div className="text-sm font-black text-dark-50 uppercase tracking-widest mb-1">{box.label}</div>
                <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">{box.desc || box.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Media Gallery Section */}
      <section className="py-12 md:py-24 px-4 md:px-6 bg-slate-50 border-y border-dark-100/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-6xl font-display font-black text-dark-50 mb-4 md:mb-6 tracking-tighter uppercase italic">Media <span className="text-gold-500">Gallery.</span></h2>
            <p className="text-dark-300 font-medium text-sm md:text-lg max-w-xl mx-auto px-4">
              See the GoldMine protocol in action through our community.
            </p>
          </div>

          {!loadingMedia && mediaItems.length > 0 ? (
            <>
              {/* Landscape/Vertical Featured Video */}
              {mediaItems.find(item => item.isFeatured) && (
                <div className={`${mediaItems.find(item => item.isFeatured).isVertical ? 'max-w-sm' : 'max-w-4xl'} mx-auto mb-12 md:mb-20`}>
                  <div className={`${mediaItems.find(item => item.isFeatured).isVertical ? 'aspect-[9/16]' : 'aspect-video'} rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-dark-900/5 relative group`}>
                    {playingMedia[mediaItems.find(item => item.isFeatured)._id] || !mediaItems.find(item => item.isFeatured).thumbnailUrl ? (
                      <iframe 
                        src={getEmbedUrl(mediaItems.find(item => item.isFeatured).url)} 
                        className="w-full h-full"
                        allowFullScreen
                        title="Featured Video"
                        loading="lazy"
                      />
                    ) : (
                      <div className="relative w-full h-full cursor-pointer group" onClick={() => setPlayingMedia(prev => ({ ...prev, [mediaItems.find(item => item.isFeatured)._id]: true }))}>
                        <img 
                          src={mediaItems.find(item => item.isFeatured).thumbnailUrl} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          alt="Poster" 
                        />
                        <div className="absolute inset-0 bg-dark-900/20 group-hover:bg-dark-900/10 transition-colors flex items-center justify-center">
                          <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gold-500 flex items-center justify-center shadow-2xl shadow-gold-500/40 group-hover:scale-110 transition-transform">
                             <Zap className="text-white fill-white" size={32} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none border-[1px] border-white/20 rounded-[24px] md:rounded-[32px]" />
                  </div>
                </div>
              )}

              {/* Vertical Shorts/Reels Carousel */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
                
                <div className="flex overflow-x-auto no-scrollbar gap-4 md:gap-6 pb-6 md:pb-8 snap-x">
                  {mediaItems.filter(item => !item.isFeatured).map((item, i) => (
                    <div key={i} className={`flex-shrink-0 w-[160px] md:w-[320px] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl snap-center border-2 border-white/50 bg-dark-900/5 relative ${item.isVertical ? 'aspect-[9/16]' : 'aspect-video self-center'}`}>
                      {playingMedia[item._id] || !item.thumbnailUrl ? (
                        <iframe 
                          src={getEmbedUrl(item.url)} 
                          className="w-full h-full"
                          allowFullScreen
                          title={`Video ${i}`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="relative w-full h-full cursor-pointer group" onClick={() => setPlayingMedia(prev => ({ ...prev, [item._id]: true }))}>
                          <img 
                            src={item.thumbnailUrl} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                            alt="Poster" 
                          />
                          <div className="absolute inset-0 bg-dark-900/10 group-hover:bg-dark-900/0 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-gold-500/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                               <Zap className="text-white fill-white" size={20} />
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10 rounded-2xl md:rounded-3xl" />
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-6">
                  <p className="text-[9px] font-black text-dark-300 uppercase tracking-[0.3em] animate-pulse">Swipe Proof →</p>
                </div>
              </div>
            </>
          ) : !loadingMedia ? (
             <div className="text-center py-20 bg-dark-900/5 rounded-3xl border border-dashed border-dark-100/20 italic text-dark-300">
                Gallery items coming soon.
             </div>
          ) : (
            <div className="flex justify-center py-20">
               <Loader2 className="animate-spin text-gold-500" size={32} />
            </div>
          )}
        </div>
      </section>

      {/* Verified Results */}
      <section id="reviews" className="py-16 md:py-24 px-6 bg-white border-y border-dark-100/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-4xl font-display font-black text-dark-50 mb-6 tracking-tighter uppercase italic">Look at <span className="text-gold-500">Earnings.</span></h2>
            <p className="text-dark-300 font-medium text-base md:text-lg max-w-xl mx-auto">
              Real proof from our users across India.
            </p>
          </div>

          {loadingReviews ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
               <Loader2 className="animate-spin text-gold-500" size={40} />
               <p className="text-[10px] font-black text-dark-300 uppercase tracking-[0.4em]">Loading Proof...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-24 glass-card-premium italic text-dark-300 border-dashed">
               No recent proof found. Be the first!
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {reviews.map((review, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={review._id}
                  className="break-inside-avoid mb-6 flex flex-col group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-slate-100 mb-3 shadow-sm group-hover:shadow-xl transition-all duration-500 border border-dark-100/5">
                    <img
                      src={review.screenshotUrl}
                      alt={review.title}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg">
                       <ShieldCheck size={14} className="text-gold-500" />
                    </div>
                  </div>
                  
                  <div className="px-2">
                    <div className="flex gap-0.5 mb-1.5">
                       {[...Array(5)].map((_, index) => (
                         <Star key={index} size={10} className="fill-gold-500 text-gold-500" />
                       ))}
                    </div>
                    <h4 className="text-xs font-black text-dark-50 leading-snug line-clamp-1 uppercase tracking-tight">{review.title}</h4>
                    <p className="text-[10px] text-dark-300 font-medium leading-relaxed mt-1 line-clamp-2 italic">
                      "{review.description}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Income Plans */}
      <section id="plans" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-4xl md:text-6xl font-display font-black text-dark-50 mb-8 tracking-tighter uppercase italic">Best <span className="text-gold-500">Plans.</span></h2>
            <p className="text-dark-300 font-medium text-lg max-w-xl">Choose one and start earning from today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingPlans ? (
              <div className="col-span-full flex justify-center py-20">
                <Loader2 className="animate-spin text-gold-500" size={40} />
              </div>
            ) : plans.length > 0 ? (
              plans.map((plan, i) => (
                <div key={i} className={`group relative p-[1px] rounded-[40px] transition-all duration-500 ${plan.slug === 'silver' ? 'bg-gradient-to-b from-gold-500 to-transparent shadow-2xl shadow-gold-100' : 'bg-dark-100/5'}`}>
                  <div className="bg-white rounded-[39px] p-8 md:p-10 h-full flex flex-col relative overflow-hidden border border-dark-100/10 hover:shadow-xl transition-shadow">
                    {plan.slug === 'silver' && <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl -z-10" />}
                    
                    <div className="flex justify-between items-center mb-8">
                       <span className="text-[10px] font-black text-dark-300 uppercase tracking-widest">{plan.duration} Day Plan</span>
                       {plan.slug === 'silver' && <div className="px-4 py-1.5 bg-gold-500 text-white rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg shadow-gold-500/20">Best Choice</div>}
                    </div>
                    
                    <h3 className="text-3xl font-display font-black text-dark-50 mb-4 uppercase italic tracking-tighter">{plan.name}</h3>
                    <div className="flex items-baseline mb-6">
                      <span className="text-5xl font-mono font-bold text-dark-50 tracking-tighter">₹{plan.price.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="bg-gold-500/5 border border-gold-500/10 rounded-2xl p-4 mb-8 flex justify-between items-center">
                       <div>
                          <div className="text-[8px] font-black text-dark-400 uppercase tracking-widest mb-1">Earning Goal</div>
                          <div className="text-sm font-mono font-bold text-gold-600">₹{(plan.price * 2).toLocaleString('en-IN')}</div>
                       </div>
                       <div className="text-right">
                          <div className="text-[8px] font-black text-dark-400 uppercase tracking-widest mb-1">Guarantee</div>
                          <div className="text-[10px] font-black text-green-600 uppercase tracking-widest">100% Secure</div>
                       </div>
                    </div>
  
                     <div className="space-y-4 mb-10 flex-grow">
                        <div className="flex gap-4 items-center">
                           <Zap size={16} className="text-gold-500" />
                           <span className="text-xs font-bold text-dark-300 uppercase tracking-wide">{plan.miningRate} pts/hr speed</span>
                        </div>
                        <div className="flex gap-4 items-center">
                           <Clock size={16} className="text-gold-500" />
                           <span className="text-xs font-bold text-dark-300 uppercase tracking-wide">
                             {plan.dailySessionLimit} Sessions / {plan.maxSessionMinutes} Mins Each
                           </span>
                        </div>
                        <div className="flex gap-4 items-center">
                           <ShieldCheck size={16} className="text-gold-500" />
                           <span className="text-xs font-bold text-dark-300 uppercase tracking-wide">2X Payout Guaranteed</span>
                        </div>
                     </div>
  
                    <Link href="/signup">
                      <button className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                        plan.slug === 'silver' ? 'gold-gradient-bg text-white hover:scale-[1.02]' : 'bg-dark-50 text-white hover:bg-dark-100'
                      }`}>
                        Join Now
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 italic text-dark-400 font-medium">
                No active plans found.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-16 md:py-24 px-6 bg-white border-t border-dark-100/10 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="md:w-1/2">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gold-500/10 rounded-full mb-8 border border-gold-500/20">
               <ShieldCheck className="text-gold-500" size={16} />
               <span className="text-[9px] font-black text-gold-500 uppercase tracking-widest">Safe & Secure</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-display font-black text-dark-50 mb-8 tracking-tighter uppercase italic leading-[0.9]">Your <br /> <span className="text-gold-500">Income Safe.</span></h2>
            <p className="text-dark-300 text-lg font-medium leading-relaxed mb-10 max-w-lg">
               We use advanced security to keep your account and your gold earnings safe at all times.
            </p>
            <div className="grid grid-cols-2 gap-6">
               {[
                 { label: 'Uptime', val: '99.9%', sub: 'Always Online' },
                 { label: 'Security', val: 'AES-256', sub: 'Vault Grade' }
               ].map((stat, si) => (
                 <div key={si} className="p-6 border border-dark-100/5 bg-slate-50 rounded-3xl">
                    <div className="text-[9px] font-bold text-gold-500 uppercase tracking-widest mb-2">{stat.label}</div>
                    <div className="text-2xl font-display font-black text-dark-50 italic">{stat.val}</div>
                    <div className="text-[8px] font-medium text-dark-300 uppercase tracking-widest mt-1">{stat.sub}</div>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center w-full">
            <div className="relative w-full max-w-sm aspect-square bg-slate-50 border border-dark-100/10 rounded-[60px] p-16 flex items-center justify-center overflow-hidden shadow-2xl">
               <div className="absolute inset-0 bg-gold-500/5 animate-pulse" />
               <Pickaxe className="absolute w-[120%] h-[120%] text-dark-100/5 -rotate-12" />
               <div className="relative z-10 text-center">
                  <div className="w-20 h-20 rounded-[30px] bg-gold-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gold-500/40">
                     <Shield className="text-white" size={32} />
                  </div>
                  <span className="text-dark-50 font-display font-black text-xl uppercase tracking-tighter italic">V-Core Active</span>
                  <div className="text-[9px] font-black text-gold-500 uppercase tracking-[0.4em] mt-4 flex items-center justify-center gap-3">
                     SAFE MODE
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Premium Footer */}
      <footer className="py-12 md:py-20 px-6 bg-white border-t border-dark-100/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group mb-8">
              <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Pickaxe className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-black text-dark-50 tracking-tighter text-xl">
                GOLD<span className="text-gold-500">MINE</span>
              </span>
            </Link>
            <p className="text-dark-300 text-[10px] font-bold leading-loose mb-10 uppercase tracking-widest italic">
               The easiest way to <br /> earn gold from your phone.
            </p>
            <div className="flex gap-4">
               {[Github, Twitter, Mail].map((Icon, i) => (
                 <Link key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-dark-300 hover:bg-gold-500 hover:text-white transition-all border border-dark-100/5">
                    <Icon size={18} />
                 </Link>
               ))}
            </div>
          </div>

          {[
            { 
              title: 'Earnings', 
              links: [
                { label: 'How it works', href: '/how-it-works' },
                { label: 'Income Plans', href: '#plans' },
                { label: 'Leaderboard', href: '/leaderboard' },
                { label: 'Proof', href: '#reviews' }
              ] 
            },
            { 
              title: 'Support', 
              links: [
                { label: 'Help Center', href: '/contact' },
                { label: 'WhatsApp Us', href: '/contact' },
                { label: 'Legal', href: '/legal/disclaimer' },
                { label: 'Privacy', href: '/legal/privacy' }
              ] 
            },
            { 
              title: 'Company', 
              links: [
                { label: 'About Us', href: '/about' },
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'Leaderboard', href: '/leaderboard' },
                { label: 'Careers', href: '#' },
                { label: 'TDS & Tax', href: '/legal/terms' },
                { label: 'Terms', href: '/legal/terms' },
                { label: 'Contact', href: '/contact' }
              ] 
            },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="text-[10px] font-black text-dark-50 uppercase tracking-[0.4em] mb-8">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((link, li) => (
                  <li key={li}>
                    <Link href={link.href} className="text-dark-300 hover:text-gold-500 transition-colors text-[10px] font-bold uppercase tracking-widest italic">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-dark-100/10 flex flex-col md:flex-row justify-between items-center gap-6">
           <span className="text-[9px] font-black text-dark-300 uppercase tracking-[0.3em]">© {new Date().getFullYear()} GoldMine Pro / Professional Income</span>
           <span className="text-[9px] font-mono font-bold text-gold-500/60 uppercase tracking-[0.2em]">100% Reliable Service</span>
        </div>
      </footer>
      <HomeBottomBar />
    </div>
  );
}
