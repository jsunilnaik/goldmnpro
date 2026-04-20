import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-display font-bold text-gold-500/10">404</h1>
        <h2 className="text-xl font-bold mt-4 text-dark-50">Page Not Found</h2>
        <p className="text-dark-500 text-sm mt-2 font-medium">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center mt-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-gold-gradient text-dark-50 font-bold px-8 py-3.5 rounded-xl text-sm shadow-lg shadow-gold-500/20 haptic-button border border-gold-500/10"
          >
            <Home size={18} />
            Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 bg-white border-2 border-dark-800 text-dark-50 px-8 py-3.5 rounded-xl text-sm font-bold shadow-sm haptic-button hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={18} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}