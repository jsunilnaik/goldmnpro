'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
   Trophy,
   Pickaxe,
   ArrowLeft,
   TrendingUp,
   Users,
   Medal,
   ChevronRight,
   ShieldCheck,
   Star,
   Loader2
} from 'lucide-react';

export default function LeaderboardPage() {
   const [miners, setMiners] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchLeaderboard = async () => {
         try {
            const res = await fetch('/api/leaderboard');
            const data = await res.json();
            if (res.ok) setMiners(data.miners);
         } catch (error) {
            console.error('Failed to load leaderboard');
         } finally {
            setLoading(false);
         }
      };
      fetchLeaderboard();
   }, []);

   const topThree = miners.slice(0, 3);
   const remaining = miners.slice(3);

   return (
      <div className="min-h-screen bg-slate-50 text-dark-50 font-sans antialiased selection:bg-gold-500/30">
         {/* Header */}
         <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-dark-100/10">
            <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
               <Link href="/" className="flex items-center gap-2 group">
                  <ArrowLeft size={20} className="text-dark-300 group-hover:text-gold-500 transition-colors" />
                  <span className="text-xs font-black uppercase tracking-widest text-dark-300">Back Home</span>
               </Link>
               <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 bg-gold-500/10 px-3 py-1 rounded-full border border-gold-500/20">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     <span className="text-[9px] font-black text-gold-600 uppercase tracking-widest">Live Updates</span>
                  </div>
                  <Trophy className="text-gold-500" size={20} />
               </div>
            </div>
         </header>

         <main className="pt-32 pb-24 px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
               {/* Hero Section */}
               <div className="text-center mb-16 md:mb-24">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ duration: 0.5 }}
                  >
                     <h1 className="text-5xl md:text-8xl font-display font-black text-dark-50 tracking-tighter mb-6 italic uppercase leading-[0.9]">Global <br /><span className="text-gold-500">Standings.</span></h1>
                     <p className="text-dark-300 font-medium text-lg md:text-xl italic leading-relaxed max-w-xl mx-auto">
                        Celebrating the top miners in our network. Competition drives efficiency, rewards follow power.
                     </p>
                  </motion.div>
               </div>

               {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                     <Loader2 className="animate-spin text-gold-500" size={40} />
                     <p className="text-[10px] font-black text-dark-300 uppercase tracking-[0.4em]">Syncing Standings...</p>
                  </div>
               ) : (
                  <div className="space-y-20">
                     {/* Podium Section */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end max-w-5xl mx-auto">
                        {/* 2nd Place */}
                        <motion.div
                           initial={{ opacity: 0, y: 30 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           transition={{ delay: 0.1 }}
                           className="order-2 md:order-1"
                        >
                           <div className="bg-white rounded-[40px] p-8 border border-dark-100/10 shadow-soft relative overflow-hidden group hover:scale-[1.02] transition-transform">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/50 rounded-bl-[100px] -z-10 group-hover:bg-gold-500/5 transition-colors" />
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6 font-display font-black text-xl italic shadow-inner">2</div>
                              <div className="flex items-center gap-4 mb-6">
                                 <div className="w-16 h-16 rounded-full bg-slate-200 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center font-black text-dark-50 text-xl italic">
                                    {topThree[1]?.name.charAt(0)}
                                 </div>
                                 <div>
                                    <div className="text-lg font-black text-dark-50 uppercase tracking-tight">{topThree[1]?.name}</div>
                                    <div className="text-[10px] font-bold text-dark-300 uppercase tracking-widest">Joined {topThree[1]?.joinDate}</div>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-end">
                                    <span className="text-[9px] font-black text-dark-400 uppercase tracking-widest">Total Gold</span>
                                    <span className="text-2xl font-display font-black text-dark-50 italic">{topThree[1]?.gold?.toFixed(6)}g</span>
                                 </div>
                                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: '85%' }} className="h-full bg-slate-400" />
                                 </div>
                                 <div className="pt-2 text-[10px] font-black text-gold-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <TrendingUp size={14} /> ₹{topThree[1]?.earnings?.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Earned
                                 </div>
                              </div>
                           </div>
                        </motion.div>

                        {/* 1st Place */}
                        <motion.div
                           initial={{ opacity: 0, y: 30 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           className="order-1 md:order-2"
                        >
                           <div className="bg-white rounded-[50px] p-10 border-2 border-gold-500 shadow-2xl shadow-gold-500/10 relative overflow-hidden group hover:scale-[1.05] transition-transform mb-4 md:mb-12">
                              <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/5 rounded-bl-[120px] -z-10" />
                              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl" />

                              <div className="flex justify-between items-start mb-8">
                                 <div className="w-16 h-16 rounded-[24px] bg-gold-500 flex items-center justify-center text-white shadow-2xl shadow-gold-500/40">
                                    <Trophy size={32} />
                                 </div>
                                 <div className="bg-gold-500 text-white px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-gold-500/20">Elite Miner</div>
                              </div>

                              <div className="flex items-center gap-6 mb-8">
                                 <div className="w-24 h-24 rounded-[32px] bg-gold-gradient-bg border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center font-display font-black text-white text-4xl italic">
                                    {topThree[0]?.name.charAt(0)}
                                 </div>
                                 <div>
                                    <div className="text-2xl font-display font-black text-dark-50 uppercase tracking-tighter italic">{topThree[0]?.name}</div>
                                    <div className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                                       <ShieldCheck size={14} /> Verified Rank 1
                                    </div>
                                 </div>
                              </div>

                              <div className="space-y-6">
                                 <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-dark-400 uppercase tracking-widest">Lifetime Gold</span>
                                    <span className="text-4xl font-display font-black text-gold-600 italic tracking-tighter">{topThree[0]?.gold?.toFixed(6)}g</span>
                                 </div>
                                 <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                       initial={{ width: 0 }}
                                       whileInView={{ width: '100%' }}
                                       transition={{ duration: 1.5, ease: "easeOut" }}
                                       className="h-full gold-gradient-bg"
                                    />
                                 </div>
                                 <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-dark-100/5">
                                    <div className="text-[10px] font-black text-dark-300 uppercase tracking-widest">Cumulative Income</div>
                                    <div className="text-xl font-mono font-bold text-dark-50">₹{topThree[0]?.earnings?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                                 </div>
                              </div>
                           </div>
                        </motion.div>

                        {/* 3rd Place */}
                        <motion.div
                           initial={{ opacity: 0, y: 30 }}
                           whileInView={{ opacity: 1, y: 0 }}
                           viewport={{ once: true }}
                           transition={{ delay: 0.2 }}
                           className="order-3 md:order-3"
                        >
                           <div className="bg-white rounded-[40px] p-8 border border-dark-100/10 shadow-soft relative overflow-hidden group hover:scale-[1.02] transition-transform">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-bl-[100px] -z-10 group-hover:bg-gold-500/5 transition-colors" />
                              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 font-display font-black text-xl italic shadow-inner">3</div>
                              <div className="flex items-center gap-4 mb-6">
                                 <div className="w-16 h-16 rounded-full bg-amber-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center font-black text-dark-50 text-xl italic">
                                    {topThree[2]?.name.charAt(0)}
                                 </div>
                                 <div>
                                    <div className="text-lg font-black text-dark-50 uppercase tracking-tight">{topThree[2]?.name}</div>
                                    <div className="text-[10px] font-bold text-dark-300 uppercase tracking-widest">Joined {topThree[2]?.joinDate}</div>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <div className="flex justify-between items-end">
                                    <span className="text-[9px] font-black text-dark-400 uppercase tracking-widest">Total Gold</span>
                                    <span className="text-2xl font-display font-black text-dark-50 italic">{topThree[2]?.gold?.toFixed(6)}g</span>
                                 </div>
                                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} whileInView={{ width: '70%' }} className="h-full bg-amber-400" />
                                 </div>
                                 <div className="pt-2 text-[10px] font-black text-gold-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <TrendingUp size={14} /> ₹{topThree[2]?.earnings?.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Earned
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                     </div>

                     {/* Table Section */}
                     <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8 px-4">
                           <h2 className="text-xl font-display font-black italic uppercase tracking-tighter text-dark-50">Active Miners Standing</h2>
                           <div className="flex items-center gap-2">
                              <Users size={16} className="text-dark-300" />
                              <span className="text-[10px] font-black text-dark-300 uppercase tracking-widest">52,401 Total Nodes</span>
                           </div>
                        </div>

                        <div className="bg-white rounded-[40px] border border-dark-100/10 shadow-xl overflow-hidden">
                           <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                 <thead>
                                    <tr className="bg-slate-50/50 border-b border-dark-100/10">
                                       <th className="px-8 py-6 text-[10px] font-black text-dark-300 uppercase tracking-[0.3em]">Rank</th>
                                       <th className="px-8 py-6 text-[10px] font-black text-dark-300 uppercase tracking-[0.3em]">Miner</th>
                                       <th className="px-8 py-6 text-[10px] font-black text-dark-300 uppercase tracking-[0.3em]">Gold Mined</th>
                                       <th className="px-8 py-6 text-[10px] font-black text-dark-300 uppercase tracking-[0.3em]">Total Value</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-dark-100/5">
                                    {remaining.map((miner) => (
                                       <tr key={miner.rank} className="hover:bg-slate-50/80 transition-colors group">
                                          <td className="px-8 py-6">
                                             <span className="text-sm font-mono font-bold text-dark-300 group-hover:text-gold-500 transition-colors">#{miner.rank}</span>
                                          </td>
                                          <td className="px-8 py-6">
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-dark-400 uppercase">
                                                   {miner.name.charAt(0)}
                                                </div>
                                                <div>
                                                   <div className="text-sm font-black text-dark-50 uppercase tracking-tight">{miner.name}</div>
                                                   <div className="text-[9px] font-bold text-dark-400 uppercase tracking-[0.2em]">Active since {miner.joinDate}</div>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-8 py-6">
                                             <div className="flex items-center gap-2">
                                                <Star size={12} className="text-gold-500 fill-gold-500/20" />
                                                <span className="text-sm font-mono font-bold text-dark-50">{miner.gold?.toFixed(6)} <span className="text-[10px] text-dark-300 lowercase">g</span></span>
                                             </div>
                                          </td>
                                          <td className="px-8 py-6">
                                             <div className="text-sm font-mono font-bold text-dark-50">₹{miner.earnings?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>

                           <div className="p-8 bg-slate-50/50 border-t border-dark-100/10 text-center">
                              <p className="text-[10px] font-bold text-dark-300 uppercase tracking-widest italic mb-6">Want to see your name here? Activate a high-tier path today.</p>
                              <Link href="/signup">
                                 <button className="gold-gradient-bg py-4 px-10 rounded-xl text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-gold-500/10 hover:shadow-xl transition-all">
                                    Boost Mining Power <ChevronRight size={14} className="inline-block ml-1" />
                                 </button>
                              </Link>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               <div className="mt-32 pt-10 border-t border-dark-100/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                  <p className="text-[10px] font-black text-dark-300 uppercase tracking-[0.3em]">© 2026 GoldMine Pro Systems / International Mining Network</p>
                  <div className="flex gap-8">
                     <Link href="/contact" className="text-[10px] font-black text-gold-500 uppercase tracking-[0.3em] hover:opacity-70 transition-opacity flex items-center gap-2">Have Questions? Contact Us <ChevronRight size={14} /></Link>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
}
