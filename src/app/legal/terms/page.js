export const runtime = 'edge';
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, CheckCircle2, AlertTriangle, Scale, Globe, Cloud, ShieldOff, ArrowLeft, ChevronRight } from 'lucide-react';

export default function TermsAndConditionsPage() {
  const provisions = [
    {
      title: "Mining Service",
      content: "GoldMine Pro provides cloud mining infrastructure. We allocate hash power from our global nodes to your account.",
      icon: Cloud
    },
    {
      title: "User Rules",
      content: "You must be 18+ to use this app. One account per person. Multiple accounts will be banned instantly.",
      icon: CheckCircle2
    },
    {
      title: "Payouts",
      content: "Daily payouts are sent to your linked wallet. Ensure your payment details are 100% correct.",
      icon: Globe
    },
    {
      title: "Risk Disclosure",
      content: "Mining yields depend on network performance. Past performance does not guarantee future results.",
      icon: AlertTriangle
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
            <FileText className="text-gold-500" size={16} />
            <span className="text-[10px] font-black text-dark-300 uppercase tracking-widest">Legal v1.1.0</span>
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
            <h1 className="text-5xl md:text-8xl font-display font-black text-dark-50 tracking-tighter mb-8 italic uppercase leading-[0.9]">Terms & <br /><span className="text-gold-500">Conditions.</span></h1>
            <p className="text-dark-300 font-medium text-lg md:text-xl italic leading-relaxed max-w-2xl">
              Simple rules for using India's premium gold mining network. By using our app, you agree to these terms.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {provisions.map((section, idx) => (
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

          <div className="mt-20 glass-card-premium p-10 md:p-16 rounded-[50px] border-gold-500/10 relative overflow-hidden">
             <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
             <div className="relative z-10">
                <Scale className="text-gold-500 mb-8" size={32} />
                <h2 className="text-2xl font-display font-black text-dark-50 mb-6 uppercase italic tracking-tighter">Agreement & Responsibility</h2>
                <div className="space-y-6 text-dark-300 font-medium leading-relaxed">
                   <p>1. You are responsible for any taxes or TDS according to Indian government laws.</p>
                   <p>2. We keep your data private and use top-tier security to protect your account.</p>
                   <p>3. Do not share your login details with anyone.</p>
                </div>
             </div>
          </div>

          <div className="mt-16 pt-10 border-t border-dark-100/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
             <p className="text-[10px] font-black text-dark-300 uppercase tracking-[0.3em]">© 2026 GoldMine Pro Systems</p>
             <Link href="/contact" className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] hover:opacity-70 transition-opacity flex items-center gap-2">
                Need Help? Contact Us <ChevronRight size={14} />
             </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

