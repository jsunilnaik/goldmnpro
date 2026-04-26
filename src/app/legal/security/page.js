export const runtime = 'edge';
'use client';

import { motion } from 'framer-motion';
import { Lock, ShieldCheck, Cpu, HardDrive, Key, Globe } from 'lucide-react';

export default function SecurityInfoPage() {
  const protocols = [
    {
      title: "AES-256 Vaults",
      desc: "All session data and sensitive user information are encrypted via military-grade AES-256 standards. Our databases are isolated from public access using advanced VPC peering and private subnets.",
      icon: Lock
    },
    {
      title: "Multi-Signature Protocol",
      desc: "Withdrawal processing requires multiple cryptographic signatures across geographically distributed hardware security modules. Manual overrides are disabled for automated security.",
      icon: HardDrive
    },
    {
      title: "Cold Storage Reserve",
      desc: "95% of digital gold reserves are maintained in ultra-secure cold storage facilities, disconnected from the internet to prevent unauthorized access.",
      icon: Key
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full px-4 py-2 mb-8">
            <ShieldCheck className="text-gold-600" size={16} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Security v4.2</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 tracking-tight mb-8">Institutional <br /> <span className="text-gold-600">Armor.</span></h1>
          <p className="text-slate-500 font-medium text-xl italic max-w-2xl mx-auto leading-relaxed">
            The GoldMine Pro network is fortified with multi-layered engineering to protect your sovereignty.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          {protocols.map((protocol, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:border-gold-500/20 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-slate-900 mb-8 shadow-sm group-hover:bg-gold-500 group-hover:text-white transition-all">
                <protocol.icon size={32} />
              </div>
              <h3 className="text-xl font-display font-black text-slate-900 mb-4 tracking-tight">{protocol.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                {protocol.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">Global Infrastructure <span className="text-gold-600">Audits.</span></h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Our hardware facilities undergo bi-annual physical security audits and real-time vulnerability scanning by independent cybersecurity firms.
            </p>
            <div className="space-y-6">
              {[
                { label: "SOC2 Compliance Pending", value: "Q4 2026" },
                { label: "Uptime Protocol", value: "99.99%" },
                { label: "Network Layer", value: "L-3 Firewall Integrated" }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  <span className="text-sm font-display font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gold-500/10 rounded-[40px] blur-[80px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="aspect-square bg-slate-900 rounded-[40px] p-12 flex flex-col justify-between overflow-hidden relative shadow-2xl">
               <Cpu className="absolute -right-12 -top-12 w-64 h-64 text-white/5" />
               <div className="relative z-10">
                 <Globe className="text-gold-500 mb-8" size={60} />
                 <h4 className="text-white text-3xl font-display font-black tracking-tight mb-4 leading-tight">Decentralized Hardware <br /> Network.</h4>
                 <p className="text-slate-400 text-sm font-medium leading-relaxed">Infrastructure redundancy across 12 high-availability data centers worldwide.</p>
               </div>
               <div className="relative z-10 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Network Online</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
