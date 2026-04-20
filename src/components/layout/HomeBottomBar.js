'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Cpu,
  BarChart3,
  Star,
  ArrowRight,
} from 'lucide-react';

const tabs = [
  { id: 'top', href: '#homepage-root', icon: Home, label: 'Home' },
  { id: 'features', href: '#features', icon: Cpu, label: 'Protocol' },
  { id: 'plans', href: '#plans', icon: BarChart3, label: 'Tiers' },
  { id: 'reviews', href: '#reviews', icon: Star, label: 'Verify' },
  { id: 'join', href: '/signup', icon: ArrowRight, label: 'Join', isAction: true },
];

export default function HomeBottomBar() {
  const [activeSection, setActiveSection] = useState('top');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['features', 'plans', 'reviews'];
      
      // If at top
      if (window.scrollY < 300) {
        setActiveSection('top');
        return;
      }

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60]">
      <div className="bg-white/80 backdrop-blur-2xl border-t border-dark-100/10 px-2 pt-2 shadow-[0_-1px_20px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 4px)' }}>
        <nav className="flex justify-around items-center max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = activeSection === tab.id;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center w-16 py-1 haptic-button transition-all duration-300 ${
                  tab.isAction ? 'scale-110' : ''
                }`}
                onClick={(e) => {
                  if (tab.href.startsWith('#')) {
                    e.preventDefault();
                    const el = document.getElementById(tab.href.substring(1));
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                    setActiveSection(tab.id);
                  }
                }}
              >
                {/* Active Indicator */}
                {isActive && !tab.isAction && (
                  <motion.div
                    layoutId="homeTabActive"
                    className="absolute -top-2 w-8 h-1 bg-gold-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon Container */}
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className={`relative p-2 rounded-xl transition-all duration-200 ${
                    tab.isAction 
                      ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' 
                      : isActive
                        ? 'text-gold-600 bg-gold-500/5'
                        : 'text-dark-300 hover:text-dark-500'
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive || tab.isAction ? 2.5 : 1.5}
                  />
                </motion.div>

                {/* Label */}
                <span className={`text-[9px] mt-1 font-black uppercase tracking-widest transition-colors ${
                  tab.isAction 
                    ? 'text-gold-600' 
                    : isActive 
                      ? 'text-gold-600' 
                      : 'text-dark-400'
                }`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
