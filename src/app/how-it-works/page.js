export const runtime = 'edge';
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Pickaxe, 
  ArrowLeft, 
  ChevronRight, 
  Zap, 
  Wallet, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2,
  Banknote,
  Cpu,
  Smartphone
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Create Account",
      desc: "Sign up in seconds with your phone number and email. No 24-hour waiting periods—you're in instantly.",
      icon: Smartphone,
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      title: "Choose Mining Path",
      desc: "Select a mining plan that fits your goals. From Bronze to Expert, we have infrastructure for every level.",
      icon: Cpu,
      color: "bg-gold-500/10 text-gold-500"
    },
    {
      title: "Activate Nodes",
      desc: "One tap and our global server network starts extracting digital gold. Watch your balance grow in real-time.",
      icon: Pickaxe,
      color: "bg-amber-500/10 text-amber-500"
    },
    {
      title: "Withdraw Instantly",
      desc: "Once you hit the threshold, withdraw your earnings directly to your bank account or UPI ID.",
      icon: Banknote,
      color: "bg-green-500/10 text-green-500"
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

      <main className="pt-32 pb-24 px-6 uppercase-labels">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 md:mb-32 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-8 shadow-sm">
               <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
               <span className="text-[10px] text-gold-700 font-black uppercase tracking-widest">Simple. Powerful. Transparent.</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-display font-black text-dark-50 tracking-tighter mb-8 italic uppercase leading-[0.9]">How It <br /><span className="text-gold-500">Works.</span></h1>
            <p className="text-dark-300 font-medium text-lg md:text-xl italic leading-relaxed max-w-2xl mx-auto">
              We've simplified the world of digital mining. No hardware to manage, no electricity bills—just pure mining power delivered to your phone.
            </p>
          </motion.div>

          {/* Workflow Steps */}
          <div className="space-y-6 md:space-y-8 mb-32">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-50 p-8 md:p-12 rounded-[50px] border border-dark-100/5 group hover:border-gold-500/10 transition-all flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left shadow-soft"
              >
                <div className={`w-20 h-20 shrink-0 rounded-[30px] bg-white flex items-center justify-center ${step.color} shadow-lg group-hover:bg-gold-500 group-hover:text-white transition-all`}>
                  <step.icon size={36} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-gold-600 uppercase tracking-[0.4em] mb-3 italic">Step 0{idx + 1}</div>
                  <h3 className="text-2xl md:text-3xl font-display font-black text-dark-50 mb-4 tracking-tighter uppercase italic">{step.title}</h3>
                  <p className="text-dark-300 leading-relaxed font-medium text-base md:text-lg italic">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Why It Works Section */}
          <div className="bg-slate-900 rounded-[60px] p-12 md:p-20 text-white relative overflow-hidden mb-32">
             <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500 opacity-10 rounded-full blur-[120px] -z-10" />
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-12 justify-center md:justify-start">
                   <ShieldCheck className="text-gold-500" size={40} />
                   <h2 className="text-3xl md:text-5xl font-display font-black italic uppercase tracking-tighter">The Protocol.</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div>
                      <h4 className="text-gold-500 font-display font-black text-xl italic mb-6 uppercase">Cloud Extraction</h4>
                      <p className="text-slate-400 font-medium leading-relaxed italic mb-8">
                         Our nodes use an optimized algorithm to extract value from the network 24/7. When you lease a plan, you are assigning a fraction of this global hashing power to your account.
                      </p>
                      <div className="space-y-4">
                         {['Real-time Sync', 'Zero Downtime', 'Auto-Settlement'].map((f, i) => (
                           <div key={i} className="flex gap-4 items-center">
                              <CheckCircle2 size={18} className="text-gold-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{f}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                   
                   <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-sm">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Network Health</div>
                      <div className="space-y-8">
                         <div>
                            <div className="flex justify-between mb-2">
                               <span className="text-xs font-bold text-slate-300 uppercase">Hash Consistency</span>
                               <span className="text-xs font-mono text-gold-500">99.8%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full"><motion.div initial={{ width: 0 }} whileInView={{ width: '99%' }} className="h-full bg-gold-500" /></div>
                         </div>
                         <div>
                            <div className="flex justify-between mb-2">
                               <span className="text-xs font-bold text-slate-300 uppercase">Payout Speed</span>
                               <span className="text-xs font-mono text-gold-500">Instant</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full"><motion.div initial={{ width: 0 }} whileInView={{ width: '92%' }} className="h-full bg-gold-500" /></div>
                         </div>
                      </div>
                      <div className="mt-10 flex gap-6">
                         <div>
                            <div className="text-2xl font-display font-black text-white italic">₹3.2Cr+</div>
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Payouts</div>
                         </div>
                         <div className="w-px bg-white/10" />
                         <div>
                            <div className="text-2xl font-display font-black text-white italic">24/7</div>
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Node Monitoring</div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
             <div className="mb-12">
               <p className="text-[11px] font-black text-dark-400 uppercase tracking-[0.4em] mb-4">Start your journey</p>
               <h2 className="text-4xl md:text-6xl font-display font-black text-dark-50 uppercase italic tracking-tighter">Join 50k+ Miners.</h2>
             </div>
             <div className="flex flex-col md:flex-row gap-6 justify-center">
               <Link href="/signup">
                  <button className="gold-gradient-bg py-5 px-12 rounded-2xl text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-gold-500/20 hover:scale-[1.05] active:scale-[0.95] transition-all">
                     Join Now
                  </button>
               </Link>
               <Link href="/leaderboard">
                  <button className="bg-white border border-dark-100/10 py-5 px-12 rounded-2xl text-dark-50 font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                     View Standings <ChevronRight size={16} />
                  </button>
               </Link>
             </div>
          </div>
          
          <div className="mt-32 pt-10 border-t border-dark-100/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
             <p className="text-[10px] font-black text-dark-300 uppercase tracking-[0.3em]">© 2026 GoldMine Pro Systems / Proof of Power Protocol</p>
             <div className="flex gap-8">
                <Link href="/contact" className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] hover:opacity-70 transition-opacity flex items-center gap-2">More Questions? Help Center <ChevronRight size={14} /></Link>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
