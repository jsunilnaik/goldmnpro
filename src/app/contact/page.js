export const runtime = 'edge';
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail, MessageCircle, Send, Phone, MapPin, ArrowLeft, ChevronRight, Pickaxe } from 'lucide-react';

export default function ContactPage() {
  const contactMethods = [
    {
      title: "WhatsApp",
      value: "+91 98765 43210",
      desc: "Instant support for quick queries.",
      icon: MessageCircle,
      color: "bg-green-500",
      link: "https://wa.me/919876543210"
    },
    {
      title: "Email Support",
      value: "care@goldminepro.in",
      desc: "For account and technical help.",
      icon: Mail,
      color: "bg-blue-500",
      link: "mailto:care@goldminepro.in"
    },
    {
      title: "Telegram",
      value: "@GoldMineSupport",
      desc: "Join our official support channel.",
      icon: Send,
      color: "bg-sky-500",
      link: "https://t.me/GoldMineSupport"
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
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 md:gap-24">
            {/* Left Side - Info */}
            <div className="md:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-8 shadow-sm">
                   <span className="text-[10px] text-gold-700 font-black uppercase tracking-widest">Always Online for You</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-display font-black text-dark-50 tracking-tighter mb-8 italic uppercase leading-[0.9]">Get in <br /><span className="text-gold-500">Touch.</span></h1>
                <p className="text-dark-300 font-medium text-lg italic leading-relaxed max-w-md mb-12">
                  Have a question about mining? Need help with your payouts? Our team is available 24/7 to help you.
                </p>

                <div className="space-y-6">
                   {contactMethods.map((method, idx) => (
                     <Link key={idx} href={method.link} target="_blank" className="flex items-center gap-6 group hover:translate-x-2 transition-transform cursor-pointer">
                        <div className={`w-12 h-12 rounded-2xl ${method.color} flex items-center justify-center text-white shadow-lg`}>
                           <method.icon size={24} />
                        </div>
                        <div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-dark-300 mb-1">{method.title}</div>
                           <div className="text-lg font-bold text-dark-50">{method.value}</div>
                        </div>
                     </Link>
                   ))}
                </div>
              </motion.div>
            </div>

            {/* Right Side - Premium Form */}
            <div className="md:w-1/2">
               <motion.div
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-slate-50 p-8 md:p-12 rounded-[50px] border border-dark-100/5 shadow-soft relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl rounded-full" />
                  
                  <h2 className="text-2xl font-display font-black text-dark-50 mb-10 uppercase italic tracking-tighter">Send a Message</h2>
                  
                  <form className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-dark-300 ml-4">Full Name</label>
                           <input type="text" placeholder="Your Name" className="w-full bg-white border border-dark-100/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-gold-500 outline-none transition-all placeholder:text-dark-100" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-dark-300 ml-4">Phone Number</label>
                           <input type="tel" placeholder="+91" className="w-full bg-white border border-dark-100/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-gold-500 outline-none transition-all placeholder:text-dark-100" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-dark-300 ml-4">Message</label>
                        <textarea rows="4" placeholder="How can we help you?" className="w-full bg-white border border-dark-100/10 rounded-2xl px-6 py-4 text-sm font-bold focus:border-gold-500 outline-none transition-all placeholder:text-dark-100 resize-none"></textarea>
                     </div>
                     <button className="gold-gradient-bg w-full py-5 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                        Submit Request <ChevronRight size={14} />
                     </button>
                  </form>
               </motion.div>
            </div>
          </div>
          
          <div className="mt-32 pt-10 border-t border-dark-100/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
             <p className="text-[10px] font-black text-dark-300 uppercase tracking-[0.3em]">© 2026 GoldMine Pro Systems</p>
             <div className="flex gap-8">
                <Link href="/about" className="text-[10px] font-black text-dark-300 uppercase tracking-[0.2em] hover:text-gold-500 transition-colors">About</Link>
                <Link href="/legal/terms" className="text-[10px] font-black text-dark-300 uppercase tracking-[0.2em] hover:text-gold-500 transition-colors">Terms</Link>
                <Link href="/legal/privacy" className="text-[10px] font-black text-dark-300 uppercase tracking-[0.2em] hover:text-gold-500 transition-colors">Privacy</Link>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
