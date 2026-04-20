'use client';

import Link from 'next/link';
import { Pickaxe, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Platform: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Mining', href: '/mining' },
      { label: 'Plans', href: '/plans' },
      { label: 'Wallet', href: '/wallet' },
    ],
    Company: [
      { label: 'About Us', href: '/about' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'Leaderboard', href: '/leaderboard' },
      { label: 'Careers', href: '#' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Refund Policy', href: '/legal/terms' },
      { label: 'Disclaimer', href: '/legal/disclaimer' },
    ],
    Support: [
      { label: 'Help Center', href: '/contact' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/support' },
      { label: 'Report Bug', href: '/support' },
    ],
  };

  return (
    <footer className="bg-dark-900 border-t border-dark-700/50 mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
                <Pickaxe className="w-5 h-5 text-dark-900" />
              </div>
              <span className="font-display font-bold text-gold-shimmer">GoldMine Pro</span>
            </Link>
            <p className="text-xs text-dark-400 leading-relaxed mb-4">
              India's trusted digital gold mining platform. Mine gold, earn rewards, and grow your wealth.
            </p>
            <div className="space-y-2">
              <a href="mailto:support@goldminepro.com" className="flex items-center gap-2 text-xs text-dark-400 hover:text-white transition-colors">
                <Mail size={12} />
                support@goldminepro.com
              </a>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-xs text-dark-400 hover:text-white transition-colors">
                <Phone size={12} />
                +91 98765 43210
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-dark-200 uppercase tracking-wider mb-3">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-dark-400 hover:text-gold-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-dark-500 text-center md:text-left">
            © {currentYear} GoldMine Pro. All rights reserved. Mining rewards are subject to market conditions.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-dark-500">🇮🇳 Made in India</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-dark-500">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}