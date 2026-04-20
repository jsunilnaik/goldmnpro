'use client';

import { useState, useEffect } from 'react';
import { UserCheck, ShieldAlert, ArrowRightLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ImpersonationBanner({ initialIsImpersonating = false }) {
    const [isImpersonating, setIsImpersonating] = useState(initialIsImpersonating);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsImpersonating(initialIsImpersonating);
    }, [initialIsImpersonating]);

    const handleStopImpersonation = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/impersonate?action=stop');
            const data = await res.json();
            
            if (res.ok) {
                toast.success('Admin session restored');
                // Refresh to clear tokens and state
                window.location.href = data.redirect || '/admin/users';
            } else {
                toast.error(data.message || 'Failed to stop impersonation');
            }
        } catch (error) {
            toast.error('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!isImpersonating) return null;

    return (
        <div className="sticky top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-300">
            <div className="bg-red-600 text-white px-4 py-2.5 shadow-lg border-b border-red-500/50 backdrop-blur-md bg-opacity-95">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <ShieldAlert size={18} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Admin Console</span>
                            <span className="text-sm font-medium">You are currently impersonating a user account</span>
                        </div>
                    </div>

                    <button
                        onClick={handleStopImpersonation}
                        disabled={loading}
                        className="bg-white text-red-600 px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-75"
                    >
                        {loading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <ArrowRightLeft size={14} />
                        )}
                        Return to Admin
                    </button>
                </div>
            </div>
        </div>
    );
}
