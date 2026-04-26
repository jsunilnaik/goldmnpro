export const runtime = 'edge';
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Video, Link as LinkIcon, 
  Loader2, CheckCircle2, X, Star, 
  ExternalLink, Layout, Film,
  Save, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getEmbedUrl } from '@/lib/utils';

export default function AdminMediaPage() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('youtube');
  const [isFeatured, setIsFeatured] = useState(false);
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isVertical, setIsVertical] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (res.ok) {
        setMediaItems(data.media);
      }
    } catch (error) {
      toast.error('Failed to load media items');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setType('youtube');
    setIsFeatured(false);
    setOrder(0);
    setIsActive(true);
    setIsVertical(false);
    setThumbnailUrl('');
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setUrl(item.url);
    setType(item.type);
    setIsFeatured(item.isFeatured || false);
    setOrder(item.order || 0);
    setIsActive(item.isActive !== false);
    setIsVertical(item.isVertical || false);
    setThumbnailUrl(item.thumbnailUrl || '');
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem?._id,
          title,
          url,
          type,
          isFeatured,
          order,
          isActive,
          isVertical,
          thumbnailUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(editingItem ? 'Media updated' : 'Media added');
        resetForm();
        fetchMedia();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save media');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Media deleted');
        fetchMedia();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting media');
    }
  };


  // Auto-detect type from URL
  useEffect(() => {
    if (url.includes('instagram.com')) setType('instagram');
    else if (url.includes('youtube.com') || url.includes('youtu.be')) setType('youtube');
  }, [url]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Video className="text-gold-600" />
            Media Gallery
          </h1>
          <p className="text-slate-500 text-sm font-medium">Manage YouTube and Reels content displayed on the homepage.</p>
        </div>
        
        <button
          onClick={() => {
            if (showAddForm) resetForm();
            else setShowAddForm(true);
          }}
          className={`${showAddForm ? 'bg-slate-200 text-slate-600' : 'bg-slate-900 text-white shadow-lg'} px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all`}
        >
          {showAddForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add Media</>}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, mb: 0 }}
            animate={{ opacity: 1, height: 'auto', mb: 48 }}
            exit={{ opacity: 0, height: 0, mb: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Media Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Platform Introduction"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Video/Post URL</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-3.5 text-slate-400" size={16} />
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="YouTube or Instagram link"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all font-medium"
                          required
                        />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-2 ml-1 italic font-medium">Supports YouTube Videos, Shorts, and Instagram Reels/Posts.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                        <select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all font-bold"
                        >
                          <option value="youtube">YouTube</option>
                          <option value="instagram">Instagram</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Display Order</label>
                        <input
                          type="number"
                          value={order}
                          onChange={(e) => setOrder(parseInt(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Preview</label>
                      <div className={`${isVertical ? 'aspect-[9/16] h-[300px]' : 'aspect-video w-full'} bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center relative group`}>
                        {url ? (
                          thumbnailUrl ? (
                            <img src={thumbnailUrl} className="w-full h-full object-cover" alt="Custom thumbnail" />
                          ) : (
                            <iframe 
                              src={getEmbedUrl(url)} 
                              className="w-full h-full"
                              allowFullScreen
                              title="Preview"
                            />
                          )
                        ) : (
                          <div className="text-center p-4">
                            <Video size={32} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Valid URL</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all flex-1">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="w-4 h-4 accent-gold-500"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Featured Video</span>
                          <span className="text-[9px] text-slate-400 font-medium">Large landscape display</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-all flex-1">
                        <input
                          type="checkbox"
                          checked={isVertical}
                          onChange={(e) => setIsVertical(e.target.checked)}
                          className="w-4 h-4 accent-gold-500"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Is Vertical</span>
                          <span className="text-[9px] text-slate-400 font-medium">9:16 Aspect (Shorts/Reels)</span>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Custom Thumbnail URL (Optional)</label>
                      <input
                        type="url"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                        placeholder="Image URL for the video cover"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-gold-500 text-slate-900 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <><Loader2 className="animate-spin" /> Saving...</> : <><Save size={18} /> {editingItem ? 'Update Media' : 'Publish Media'}</>}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-gold-600" size={40} />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Syncing Media...</p>
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-slate-200 border-dashed">
          <Film className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-bold">Your gallery is empty.</p>
          <p className="text-slate-400 text-xs mt-2 italic">Start by adding your first promotional video or reel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaItems.map((item) => (
            <motion.div
              layout
              key={item._id}
              className={`bg-white border rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300 ${item.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}
            >
              <div className={`aspect-video bg-slate-100 relative ${item.type === 'instagram' ? 'aspect-[9/16]' : 'aspect-video'}`}>
                <iframe 
                  src={getEmbedUrl(item.url)} 
                  className="w-full h-full pointer-events-none"
                  title={item.title}
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {item.isFeatured && (
                    <div className="bg-gold-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                      <Star size={10} className="fill-white" /> Featured
                    </div>
                  )}
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md flex items-center gap-1.5 ${item.type === 'youtube' ? 'bg-red-600/90 text-white' : 'bg-pink-600/90 text-white'}`}>
                    {item.type === 'youtube' ? <Video size={10} /> : <Film size={10} />}
                    {item.type} {item.isVertical ? '(Vertical)' : '(Landscape)'}
                  </div>
                </div>

                {/* Overlays */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-3 bg-white text-slate-900 rounded-2xl hover:scale-110 transition-transform shadow-xl"
                  >
                    <Layout size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="p-3 bg-white text-red-500 rounded-2xl hover:scale-110 transition-transform shadow-xl"
                  >
                    <Trash2 size={20} />
                  </button>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white text-blue-500 rounded-2xl hover:scale-110 transition-transform shadow-xl"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h3 className="font-bold text-slate-900 truncate uppercase tracking-tight text-sm flex-1">{item.title}</h3>
                  <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                    <span className="text-[10px] font-black text-slate-400">#{item.order}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    {item.isActive ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-widest">
                        <Eye size={12} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <EyeOff size={12} /> Hidden
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
