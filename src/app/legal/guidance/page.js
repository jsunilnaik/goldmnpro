export const runtime = 'edge';
'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, Scale, ScrollText, CheckCircle2 } from 'lucide-react';

export default function LegalGuidancePage() {
  const sections = [
    {
      title: "Service Overview",
      content: "GoldMine Pro provides a cloud-based infrastructure for digital gold mining. Our platform allows users to lease hash power from our global facilities. By using our service, you acknowledge that mining performance varies based on network difficulty and gold market valuations.",
      icon: Scale
    },
    {
      title: "Risk Disclosure",
      content: "Digital asset mining involves significant risk. Capital allocated to mining should be considered at risk. GoldMine Pro does not guarantee fixed fiat returns. Past performance of mining nodes is not an indicator of future results.",
      icon: ShieldAlert
    },
    {
      title: "Privacy Commitment",
      content: "We utilize institutional-grade encryption to protect your identity and financial data. Your personal information is never sold to third parties. We comply with international data protection standards of the highest caliber.",
      icon: CheckCircle2
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 mb-6 tracking-tight">Platform <span className="text-gold-600">Guidance</span></h1>
          <p className="text-slate-500 font-medium text-lg italic max-w-2xl mx-auto">
            The regulatory and ethical framework governing your mining operations at GoldMine Pro.
          </p>
        </motion.div>

        <div className="space-y-12">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-start"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-gold-600 shrink-0 border border-slate-100">
                <section.icon size={28} />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-slate-900 mb-4 uppercase tracking-widest">{section.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {section.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-slate-900 rounded-2xl text-white">
          <div className="flex items-center gap-4 mb-4">
            <ScrollText className="text-gold-500" />
            <h4 className="font-bold uppercase tracking-widest text-sm">Official Agreement</h4>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed italic">
            By accessing the GoldMine Pro interface, you agree to our full Terms of Service and Privacy Policy. These documents are updated periodically to ensure compliance with global jurisdictional changes. For specific legal inquiries, contact our compliance department at legal@goldminepro.io.
          </p>
        </div>
      </div>
    </div>
  );
}
