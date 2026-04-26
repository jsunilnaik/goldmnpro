'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Pickaxe, Target, Users, Landmark, Globe, Shield, ArrowLeft, ChevronRight, Zap } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      title: "Our Mission",
      content: "To empower every Indian with the tools to earn digital gold from their phone. We believe financial growth should be simple and accessible to everyone.",
      icon: Target
    },
    {
      title: "Global Infrastructure",
      content: "We operate a network of high-performance mining nodes across strategic global locations, ensuring maximum efficiency for our users.",
      icon: Globe
    },
    {
      title: "Institutional Security",
      content: "Our system is built with vault-grade security protocols. Your earnings and account are protected by military-grade encryption.",
      icon: Shield
    },
    {
      title: "Community First",
      content: "Join over 50,000+ Indians who are already part of the GoldMine Pro ecosystem. We grow together, every minute, every day.",
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-white text-dark-50 font-sans antialiased selection:bg-gold-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-dark-100/10">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
             <ArrowLeft size={20} className="text-dark-300 group-hover:text-gold-500 transition-colors" />
             <span className="text-xs font-black uppercase tracking-widest text-dark-300">Back Home</span>
          </Link>
          <div className="flex items-center gap-2 group">
             <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Pickaxe className="w-4 h-4 text-white" />
             </div>
             <span className="font-display font-black text-dark-50 tracking-tighter text-lg md:text-xl">
                GOLD<span className="text-gold-500">MINE</span>
             </span>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 md:mb-32"
          >
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-8 shadow-sm">
               <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
               <span className="text-[10px] text-gold-700 font-black uppercase tracking-widest">Our Story & Mission</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-black text-dark-50 tracking-tighter mb-8 italic uppercase leading-[0.9]">Mining the <br /><span className="text-gold-500">Future.</span></h1>
            <p className="text-dark-300 font-medium text-lg md:text-xl italic leading-relaxed max-w-2xl">
              GoldMine Pro was founded to bridge the gap between complex digital extraction and daily earners. We've built India's most powerful and easy-to-use gold mining protocol.
            </p>
          </motion.div>

          {/* Core Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-32">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-50 p-8 md:p-10 rounded-[40px] border border-dark-100/5 group hover:border-gold-500/20 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-dark-50 mb-8 group-hover:bg-gold-500 group-hover:text-white transition-all shadow-sm">
                  <value.icon size={24} />
                </div>
                <h3 className="text-xl font-display font-black text-dark-50 mb-4 tracking-tight uppercase italic">{value.title}</h3>
                <p className="text-dark-300 leading-relaxed font-medium text-sm">
                  {value.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Infrastructure Section */}
          <div className="bg-slate-900 rounded-[50px] p-10 md:p-20 text-white relative overflow-hidden mb-32">
             <div className="absolute inset-0 bg-gold-500 opacity-[0.03] pointer-events-none" />
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                   <Landmark className="text-gold-500" size={32} />
                   <h2 className="text-3xl md:text-4xl font-display font-black italic uppercase tracking-tighter">Real Power. Real Results.</h2>
                </div>
                <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-medium mb-12 max-w-3xl italic">
                  Unlike many apps, we own and manage our own hardware. When you sign up, you're tapping into actual processing power from our server clusters, optimized for maximum gold extraction efficiency.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                   {[
                     { label: 'Uptime', val: '99.9%' },
                     { label: 'Latency', val: '<20ms' },
                     { label: 'Encryption', val: 'AES-256' },
                     { label: 'Nodes', val: '52K+' }
                   ].map((stat, i) => (
                     <div key={i}>
                        <div className="text-gold-500 text-2xl font-mono font-bold mb-1">{stat.val}</div>
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Join Section */}
          <div className="text-center bg-slate-50 rounded-[50px] p-12 md:p-20 border border-dark-100/5">
             <Zap className="text-gold-500 mb-8 mx-auto" size={40} />
             <h2 className="text-3xl md:text-5xl font-display font-black text-dark-50 mb-8 uppercase italic tracking-tighter">Ready to join the network?</h2>
             <p className="text-dark-300 font-medium text-lg mb-12 max-w-xl mx-auto italic">
                Start your journey towards daily gold earnings today. No technical skills required.
             </p>
             <Link href="/signup">
                <button className="gold-gradient-bg py-5 px-12 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-gold-500/20 hover:scale-[1.05] active:scale-[0.95] transition-all">
                   Start Mining Now
                </button>
             </Link>
          </div>
          
          <div className="mt-24 pt-10 border-t border-dark-100/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
             <p className="text-[10px] font-black text-dark-300 uppercase tracking-[0.3em]">© 2026 GoldMine Pro Systems</p>
             <div className="flex gap-8">
                <Link href="/legal/terms" className="text-[10px] font-black text-dark-300 uppercase tracking-[0.2em] hover:text-gold-500 transition-colors">Terms</Link>
                <Link href="/legal/privacy" className="text-[10px] font-black text-dark-300 uppercase tracking-[0.2em] hover:text-gold-500 transition-colors">Privacy</Link>
                <Link href="/contact" className="text-[10px] font-black text-gold-500 uppercase tracking-[0.2em] hover:opacity-70 transition-opacity flex items-center gap-2">Contact Us <ChevronRight size={14} /></Link>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
