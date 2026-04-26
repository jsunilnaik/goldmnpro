export const runtime = 'edge';
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { AlertTriangle, TrendingDown, ShieldOff, ArrowLeft, ChevronRight, Info, Landmark } from 'lucide-react';

export default function LegalDisclaimerPage() {
  const points = [
    {
      title: "Not Financial Advice",
      content: "All information provided on GoldMine Pro is for educational and informational purposes only. We are not financial advisors.",
      icon: Info
    },
    {
      title: "Market Risk",
      content: "Digital asset mining involves significant risk. Yields can fluctuate based on network difficulty and market conditions.",
      icon: TrendingDown
    },
    {
      title: "No Guarantees",
      content: "While we aim for maximum uptime, we do not guarantee constant mining yields or specific daily returns.",
      icon: AlertTriangle
    },
    {
      title: "Regulatory Compliance",
      content: "Users are responsible for ensuring digital gold mining is legal in their specific jurisdiction and for paying any applicable taxes.",
      icon: Landmark
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
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-gold-500" size={16} />
            <span className="text-[10px] font-black text-dark-300 uppercase tracking-widest">Notice v1.0.5</span>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 md:mb-24"
          >
            <h1 className="text-5xl md:text-8xl font-display font-black text-dark-50 tracking-tighter mb-8 italic uppercase leading-[0.9]">Legal <br /><span className="text-gold-500">Disclaimer.</span></h1>
            <p className="text-dark-300 font-medium text-lg md:text-xl italic leading-relaxed max-w-2xl">
              Please read this carefully. Using GoldMine Pro involves risks, and we want you to be fully informed before you start mining.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-20">
            {points.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-50 p-8 md:p-10 rounded-[40px] border border-dark-100/5 hover:border-gold-500/20 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-dark-50 mb-8 group-hover:bg-gold-500 group-hover:text-white transition-all shadow-sm">
                  <section.icon size={24} />
                </div>
                <h3 className="text-xl font-display font-black text-dark-50 mb-4 tracking-tight uppercase italic">{section.title}</h3>
                <p className="text-dark-300 leading-relaxed font-medium text-sm">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-[50px] p-10 md:p-16 text-white relative overflow-hidden">
             <ShieldOff className="absolute -right-20 -bottom-20 w-80 h-80 text-white/5" />
             <div className="relative z-10">
                <h4 className="text-3xl font-display font-black mb-8 italic text-gold-500 uppercase tracking-tighter">Limited Liability</h4>
                <p className="text-slate-400 leading-relaxed font-medium mb-12 text-lg">
                  GoldMine Pro and its affiliates are not responsible for any direct or indirect losses occurring from the use of our infrastructure or market fluctuations. Mining is a highly technical field, and results are never guaranteed.
                </p>
                <Link href="/signup">
                  <button className="gold-gradient-bg py-5 px-10 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-gold-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                     Accept & Proceed
                  </button>
                </Link>
             </div>
          </div>
          
          <div className="mt-20 pt-10 border-t border-dark-100/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
             <p className="text-[10px] font-black text-dark-300 uppercase tracking-[0.3em]">© 2026 GoldMine Pro Systems</p>
             <Link href="/contact" className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] hover:opacity-70 transition-opacity flex items-center gap-2">
                Need Clarification? <ChevronRight size={14} />
             </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
