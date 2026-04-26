'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Video, 
  Type, 
  Globe, 
  MapPin, 
  Trash2, 
  Edit2, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Link as LinkIcon,
  Loader2,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllStates, getCitiesForState } from '@/lib/india-cities';
import { getEmbedUrl } from '@/lib/utils';

export default function AdminBroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBroadcast, setEditingBroadcast] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'text',
    content: '',
    targetType: 'global',
    targetState: '',
    targetCity: '',
    buttonUrl: '',
    isActive: true,
    excludedStates: [],
    excludedCities: [],
    includedCities: [],
  });
  const [selectedStateForCityExclusion, setSelectedStateForCityExclusion] = useState('');

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/admin/broadcasts');
      const data = await res.json();
      if (res.ok) setBroadcasts(data.broadcasts);
    } catch (err) {
      toast.error('Failed to fetch broadcasts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (broadcast = null) => {
    if (broadcast) {
      setEditingBroadcast(broadcast);
      setFormData({
        title: broadcast.title,
        type: broadcast.type,
        content: broadcast.content,
        targetType: broadcast.targetType,
        targetState: broadcast.targetState || '',
        targetCity: broadcast.targetCity || '',
        buttonText: broadcast.buttonText || '',
        buttonUrl: broadcast.buttonUrl || '',
        isActive: broadcast.isActive,
        excludedStates: broadcast.excludedStates || [],
        excludedCities: broadcast.excludedCities || [],
        includedCities: broadcast.includedCities || [],
      });
    } else {
      setEditingBroadcast(null);
      setFormData({
        title: '',
        type: 'text',
        content: '',
        targetType: 'global',
        targetState: '',
        targetCity: '',
        buttonText: '',
        buttonUrl: '',
        isActive: true,
        excludedStates: [],
        excludedCities: [],
        includedCities: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const method = editingBroadcast ? 'PUT' : 'POST';
      const body = editingBroadcast ? { ...formData, id: editingBroadcast._id } : formData;

      const res = await fetch('/api/admin/broadcasts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setIsModalOpen(false);
        fetchBroadcasts();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) return;
    try {
      const res = await fetch(`/api/admin/broadcasts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Deleted successfully');
        fetchBroadcasts();
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const toggleActive = async (broadcast) => {
    try {
      const res = await fetch('/api/admin/broadcasts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: broadcast._id, isActive: !broadcast.isActive }),
      });
      if (res.ok) {
        setBroadcasts(broadcasts.map(b => b._id === broadcast._id ? { ...b, isActive: !b.isActive } : b));
        toast.success(`Broadcast ${!broadcast.isActive ? 'activated' : 'deactivated'}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-dark-50 flex items-center gap-2">
            <Megaphone className="text-red-500" /> Administrative Broadcasts
          </h1>
          <p className="text-dark-500 text-sm mt-1 font-medium italic">Deploy geo-targeted text or video alerts to user dash</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          New Announcement
        </button>
      </div>

      {/* Broadcast List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-white border border-dark-900/10 rounded-[2rem] animate-pulse" />
            ))
          ) : broadcasts.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <Megaphone size={48} className="mx-auto text-dark-800 mb-4 opacity-20" />
              <p className="text-dark-500 font-bold">No broadcasts deployed yet.</p>
            </div>
          ) : (
            broadcasts.map((b) => (
              <motion.div
                layout
                key={b._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border border-dark-900/10 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all group relative"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleActive(b); }}
                    className={`p-1.5 rounded-full shadow-sm transition-all ${b.isActive ? 'bg-green-500 text-white' : 'bg-dark-900 text-dark-500'}`}
                  >
                    {b.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      b.type === 'video' ? 'bg-red-50 text-red-600' : 
                      b.type === 'image' ? 'bg-purple-50 text-purple-600' : 
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {b.type === 'video' ? <Video size={18} /> : 
                       b.type === 'image' ? <ImageIcon size={18} /> : 
                       <Type size={18} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-dark-50 truncate max-w-[150px]">{b.title}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-dark-400">
                        {b.targetType === 'global' ? <Globe size={10} /> : <MapPin size={10} />}
                        {b.targetType === 'global' ? 'Global' : `${b.targetCity || 'Any'}, ${b.targetState}`}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-dark-500 font-medium line-clamp-3 bg-slate-50 p-3 rounded-xl border border-dashed border-dark-900/10 italic">
                    {b.type === 'video' ? b.content : b.content}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-dark-900/5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenModal(b)} className="p-2 rounded-lg bg-slate-100 text-dark-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(b._id)} className="p-2 rounded-lg bg-slate-100 text-dark-400 hover:text-red-600 hover:bg-red-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <span className="text-[9px] text-dark-400 font-mono">{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Deployment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-dark-50/20 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-dark-900/10 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg">
                      <Megaphone size={18} />
                   </div>
                   <div>
                      <h3 className="font-bold text-dark-50 text-sm italic">{editingBroadcast ? 'Update Manifest' : 'New Broadcast Manifest'}</h3>
                      <p className="text-[9px] text-dark-400 uppercase font-bold tracking-widest">{editingBroadcast ? 'Revision' : 'System Deployment'}</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl bg-white border text-dark-400 hover:text-dark-50 transition-all"><XCircle size={18} /></button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Title & Type */}
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1">Broadcast Header</label>
                        <input 
                           type="text" 
                           required 
                           value={formData.title} 
                           onChange={e => setFormData({...formData, title: e.target.value})} 
                           placeholder="Attention required..." 
                           className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold shadow-inner" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1">Payload Type</label>
                        <div className="flex gap-2">
                           <button 
                             type="button" 
                             onClick={() => setFormData({...formData, type: 'text'})}
                             className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${formData.type === 'text' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white border-dark-900/10 text-dark-400'}`}
                           >
                             <Type size={14} /> Text
                           </button>
                           <button 
                             type="button" 
                             onClick={() => setFormData({...formData, type: 'video'})}
                             className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${formData.type === 'video' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/20' : 'bg-white border-dark-900/10 text-dark-400'}`}
                           >
                             <Video size={14} /> Video
                           </button>
                           <button 
                             type="button" 
                             onClick={() => setFormData({...formData, type: 'image'})}
                             className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${formData.type === 'image' ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/20' : 'bg-white border-dark-900/10 text-dark-400'}`}
                           >
                             <ImageIcon size={14} /> Image
                           </button>
                        </div>
                      </div>
                   </div>

                   {/* Targeting */}
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1">Target Scope</label>
                        <select 
                          value={formData.targetType} 
                          onChange={e => setFormData({...formData, targetType: e.target.value})}
                          className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold shadow-inner appearance-none cursor-pointer"
                        >
                           <option value="global">🌍 Global (All Regions)</option>
                           <option value="city">📍 Regional Targeting</option>
                        </select>
                      </div>
                      {formData.targetType === 'city' && (
                        <div className="grid grid-cols-2 gap-2">
                           <select 
                             required 
                             value={formData.targetState} 
                             onChange={e => setFormData({...formData, targetState: e.target.value, targetCity: ''})}
                             className="bg-slate-50 border rounded-xl px-3 py-2 text-xs font-bold"
                           >
                              <option value="">State...</option>
                              {getAllStates().map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                           <select 
                             required 
                             value={formData.targetCity} 
                             onChange={e => setFormData({...formData, targetCity: e.target.value})}
                             disabled={!formData.targetState}
                             className="bg-slate-50 border rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50"
                           >
                              <option value="">All Cities</option>
                              {formData.targetState && getCitiesForState(formData.targetState).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                           </select>
                        </div>
                      )}
                   </div>
                </div>

                {/* Content Payload */}
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-dark-400 tracking-widest pl-1">
                     {formData.type === 'video' ? 'Video URL (YouTube/IG Reels)' : 
                      formData.type === 'image' ? 'Image URL' : 
                      'Announcement Body'}
                   </label>
                   {formData.type === 'video' ? (
                     <div className="space-y-3">
                       <input 
                         type="url" 
                         required 
                         value={formData.content} 
                         onChange={e => setFormData({...formData, content: e.target.value})} 
                         placeholder="https://youtube.com/shorts/..." 
                         className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-mono shadow-inner" 
                       />
                       {formData.content && (
                         <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-dark-900/10 shadow-lg">
                           <iframe 
                             src={getEmbedUrl(formData.content)} 
                             className="w-full h-full" 
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                             allowFullScreen
                           />
                         </div>
                       )}
                     </div>
                   ) : formData.type === 'image' ? (
                     <div className="space-y-3">
                       <input 
                         type="url" 
                         required 
                         value={formData.content} 
                         onChange={e => setFormData({...formData, content: e.target.value})} 
                         placeholder="https://example.com/image.jpg" 
                         className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-mono shadow-inner" 
                       />
                       {formData.content && (
                         <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-dark-900/10 shadow-lg">
                            <img 
                              src={formData.content} 
                              alt="Preview" 
                              className="w-full h-full object-contain"
                              onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL'; }}
                            />
                         </div>
                       )}
                     </div>
                   ) : (
                     <textarea 
                        required 
                        rows={4} 
                        value={formData.content} 
                        onChange={e => setFormData({...formData, content: e.target.value})} 
                        placeholder="Write your announcement here..." 
                        className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-medium shadow-inner"
                     />
                   )}
                </div>

                 {/* Exclusions */}
                 <div className="bg-red-50/50 p-6 rounded-[2rem] border border-dashed border-red-900/10 space-y-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest flex items-center gap-2">
                          <XCircle size={12} /> Exclude Regions (Optional)
                       </h4>
                       <p className="text-[9px] text-red-400 font-bold uppercase italic">Filter out specific audiences</p>
                    </div>
                    
                    <div className="space-y-4">
                       {/* Single State Selector */}
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-dark-400 pl-1">1. Select State</label>
                          <select 
                            value={selectedStateForCityExclusion}
                            onChange={e => setSelectedStateForCityExclusion(e.target.value)}
                            className="w-full bg-white border rounded-xl px-4 py-3 text-sm font-bold shadow-sm"
                          >
                             <option value="">Choose a state...</option>
                             {getAllStates().map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                       </div>

                       {selectedStateForCityExclusion && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                             {/* Action A: Exclude State */}
                             <div className="bg-white p-4 rounded-2xl border border-red-100 space-y-3">
                                <p className="text-[10px] font-black uppercase text-dark-500">Exclude Whole State</p>
                                <button 
                                  type="button"
                                  disabled={formData.excludedStates.includes(selectedStateForCityExclusion)}
                                  onClick={() => setFormData({...formData, excludedStates: [...formData.excludedStates, selectedStateForCityExclusion]})}
                                  className="w-full py-2 bg-red-50 text-red-600 text-[11px] font-black uppercase rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                >
                                   {formData.excludedStates.includes(selectedStateForCityExclusion) ? 'Already Excluded' : `Exclude ${selectedStateForCityExclusion}`}
                                </button>
                             </div>

                             {/* Action B: Exclude/Include Cities */}
                             <div className="bg-white p-4 rounded-2xl border border-red-100 space-y-3">
                                <p className="text-[10px] font-black uppercase text-dark-500">Target Specific Cities</p>
                                <div className="space-y-2">
                                   <select 
                                     onChange={e => {
                                       if (e.target.value) {
                                          // Add to excluded list
                                          if (!formData.excludedCities.includes(e.target.value)) {
                                             setFormData({...formData, excludedCities: [...formData.excludedCities, e.target.value]});
                                          }
                                       }
                                     }}
                                     className="w-full py-2 px-3 bg-red-50 border border-red-100 rounded-xl text-[11px] font-bold text-red-600"
                                   >
                                      <option value="">Add to EXCLUDED list...</option>
                                      {getCitiesForState(selectedStateForCityExclusion).map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                      ))}
                                   </select>

                                   <select 
                                     onChange={e => {
                                       if (e.target.value) {
                                          // Add to included list (Exceptions)
                                          if (!formData.includedCities.includes(e.target.value)) {
                                             setFormData({...formData, includedCities: [...formData.includedCities, e.target.value]});
                                          }
                                       }
                                     }}
                                     className="w-full py-2 px-3 bg-green-50 border border-green-100 rounded-xl text-[11px] font-bold text-green-600"
                                   >
                                      <option value="">Add as EXCEPTION (Always Include)...</option>
                                      {getCitiesForState(selectedStateForCityExclusion).map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                      ))}
                                   </select>
                                </div>
                             </div>
                          </div>
                       )}

                       {/* Exclusion Tags Summary */}
                       {(formData.excludedStates.length > 0 || formData.excludedCities.length > 0) && (
                         <div className="pt-4 border-t border-red-900/5 space-y-3">
                            {formData.excludedStates.length > 0 && (
                               <div className="space-y-1.5">
                                  <label className="text-[8px] font-black uppercase text-red-400">Excluded States</label>
                                  <div className="flex flex-wrap gap-1.5">
                                     {formData.excludedStates.map(s => (
                                       <span key={s} className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                                         {s}
                                         <button type="button" onClick={() => setFormData({...formData, excludedStates: formData.excludedStates.filter(x => x !== s)})}><XCircle size={12} /></button>
                                       </span>
                                     ))}
                                  </div>
                               </div>
                            )}
                            {formData.excludedCities.length > 0 && (
                               <div className="space-y-1.5">
                                  <label className="text-[8px] font-black uppercase text-red-400">Excluded Cities</label>
                                  <div className="flex flex-wrap gap-1.5">
                                     {formData.excludedCities.map(c => (
                                       <span key={c} className="bg-white border border-red-200 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                                         {c}
                                         <button type="button" onClick={() => setFormData({...formData, excludedCities: formData.excludedCities.filter(x => x !== c)})}><XCircle size={12} /></button>
                                       </span>
                                     ))}
                                  </div>
                               </div>
                            )}
                            {formData.includedCities.length > 0 && (
                               <div className="space-y-1.5">
                                  <label className="text-[8px] font-black uppercase text-green-500">Included Exceptions (Always Visible)</label>
                                  <div className="flex flex-wrap gap-1.5">
                                     {formData.includedCities.map(c => (
                                       <span key={c} className="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                                         {c}
                                         <button type="button" onClick={() => setFormData({...formData, includedCities: formData.includedCities.filter(x => x !== c)})}><XCircle size={12} /></button>
                                       </span>
                                     ))}
                                  </div>
                               </div>
                            )}
                         </div>
                       )}
                    </div>
                 </div>

                {/* Call to Action */}
                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-dashed border-dark-900/10 space-y-4">
                   <h4 className="text-[10px] font-black uppercase text-dark-400 tracking-widest flex items-center gap-2"><LinkIcon size={12} /> Interactive Response (Optional)</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-dark-400 pl-1">Button Label</label>
                        <input type="text" value={formData.buttonText} onChange={e => setFormData({...formData, buttonText: e.target.value})} placeholder="e.g. Join Now" className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-bold" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-dark-400 pl-1">Target URL</label>
                        <input type="text" value={formData.buttonUrl} onChange={e => setFormData({...formData, buttonUrl: e.target.value})} placeholder="https://..." className="w-full bg-white border rounded-xl px-3 py-2 text-xs font-mono" />
                      </div>
                   </div>
                </div>

                {/* Action Footer */}
                <div className="flex items-center gap-4 pt-4 border-t border-dark-900/5">
                   <button 
                     type="submit" 
                     disabled={formLoading} 
                     className="flex-1 bg-red-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                   >
                     {formLoading ? <Loader2 className="animate-spin" size={20} /> : (editingBroadcast ? 'Update Manifest' : 'Deploy Broadcast')}
                   </button>
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl bg-slate-100 text-dark-400 text-xs font-black uppercase tracking-widest">Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
