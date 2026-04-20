'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Upload, MessageSquare, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews);
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalScreenshotUrl = screenshotUrl;

      // 1. Upload file if exists
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/reviews/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message);
        finalScreenshotUrl = uploadData.screenshotUrl;
      }

      // 2. Save Review
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, screenshotUrl: finalScreenshotUrl }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Review added successfully');
        setShowAddForm(false);
        setTitle('');
        setDescription('');
        setScreenshotUrl('');
        setFile(null);
        setPreview(null);
        fetchReviews();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Review deleted');
        fetchReviews();
      } else {
        toast.error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting review');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <MessageSquare className="text-gold-600" />
            Manage Reviews
          </h1>
          <p className="text-slate-500 text-sm font-medium">Add and maintain platform credibility through reviews.</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
        >
          {showAddForm ? 'Cancel' : <><Plus size={18} /> Add Review</>}
        </button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl mb-12"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Review Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Bronze Plan Mining Result"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the achievement or review content..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all min-h-[120px]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Screenshot Upload</label>
                <div className="relative group">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept="image/*"
                  />
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 group-hover:border-gold-500 transition-colors bg-slate-50">
                    {preview ? (
                      <img src={preview} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400">
                          <Upload size={20} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-slate-600">Click to upload screenshot</p>
                          <p className="text-[10px] text-slate-400 mt-1">JPG, PNG or WebP max 5MB</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gold-500 text-slate-900 px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-gold-400 transition-all shadow-xl shadow-gold-500/20 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <><Loader2 className="animate-spin" /> Publishing...</> : <><CheckCircle2 size={18} /> Publish Review</>}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-gold-600" size={40} />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
          <ImageIcon className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-bold">No reviews found.</p>
          <p className="text-slate-400 text-xs mt-2 italic">Start by adding your first feature review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <motion.div
              layout
              key={review._id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:shadow-xl transition-all"
            >
              <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                <img
                  src={review.screenshotUrl}
                  alt={review.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => handleDelete(review._id)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-2 truncate">{review.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">{review.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                    <CheckCircle2 size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
