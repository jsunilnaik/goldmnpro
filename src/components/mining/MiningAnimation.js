'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pickaxe } from 'lucide-react';

export default function MiningAnimation({ active = false, size = 200 }) {
  const [particles, setParticles] = useState([]);
  const [sparks, setSparks] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        // Gold particles
        if (Math.random() > 0.5) {
          const id = Date.now() + Math.random();
          const particle = {
            id,
            x: 40 + Math.random() * 20,
            y: 50,
            size: 8 + Math.random() * 12,
            emoji: ['✨', '💎', '⭐', '🪙', '✦', '◆'][Math.floor(Math.random() * 6)],
            duration: 1 + Math.random() * 0.5,
            angle: -30 + Math.random() * 60,
          };
          setParticles(prev => [...prev.slice(-15), particle]);
          setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
          }, particle.duration * 1000);
        }

        // Small spark dots
        if (Math.random() > 0.3) {
          const id = Date.now() + Math.random() + 1000;
          const spark = {
            id,
            x: 35 + Math.random() * 30,
            y: 45 + Math.random() * 10,
            color: ['#FFD700', '#FFA500', '#FFE680', '#FFFFFF'][Math.floor(Math.random() * 4)],
          };
          setSparks(prev => [...prev.slice(-8), spark]);
          setTimeout(() => {
            setSparks(prev => prev.filter(s => s.id !== id));
          }, 600);
        }
      }, 200);
    } else {
      clearInterval(intervalRef.current);
      setParticles([]);
      setSparks([]);
    }

    return () => clearInterval(intervalRef.current);
  }, [active]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer Glow Ring */}
      <motion.div
        animate={active ? {
          boxShadow: [
            '0 0 20px rgba(255,215,0,0.1), 0 0 40px rgba(255,215,0,0.05)',
            '0 0 30px rgba(255,215,0,0.2), 0 0 60px rgba(255,215,0,0.1)',
            '0 0 20px rgba(255,215,0,0.1), 0 0 40px rgba(255,215,0,0.05)',
          ],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full"
      />

      {/* Rotating Dashed Rings */}
      <motion.div
        animate={active ? { rotate: 360 } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-0 rounded-full border-2 border-dashed ${
          active ? 'border-gold-500/30' : 'border-dark-700/30'
        }`}
      />
      <motion.div
        animate={active ? { rotate: -360 } : {}}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-[10%] rounded-full border ${
          active ? 'border-gold-400/20' : 'border-dark-700/20'
        }`}
      />
      <motion.div
        animate={active ? { rotate: 360 } : {}}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-[20%] rounded-full border border-dotted ${
          active ? 'border-gold-300/15' : 'border-dark-700/15'
        }`}
      />

      {/* Orbiting Dots */}
      {active && [0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 5 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
          className="absolute inset-0"
          style={{ transformOrigin: 'center center' }}
        >
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-gold-400"
            style={{ top: `${5 + i * 8}%`, left: '50%', transform: 'translateX(-50%)' }}
          />
        </motion.div>
      ))}

      {/* Center Mining Button Area */}
      <div className={`absolute inset-[25%] rounded-full flex items-center justify-center ${
        active ? 'mining-pulse' : ''
      }`}>
        <motion.div
          animate={active ? {
            rotate: [0, -15, 15, -15, 0],
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            rotate: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <Pickaxe
            size={size * 0.2}
            className={active ? 'text-dark-900' : 'text-gold-400'}
          />
        </motion.div>
      </div>

      {/* Gold Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              top: `${p.y - 40 - Math.random() * 20}%`,
              left: `${p.x + (Math.random() - 0.5) * 30}%`,
              scale: [0, 1, 0.5],
              opacity: [0, 1, 0],
              rotate: Math.random() * 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, ease: 'easeOut' }}
            className="absolute pointer-events-none"
            style={{ fontSize: p.size }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Sparks */}
      <AnimatePresence>
        {sparks.map((s) => (
          <motion.div
            key={s.id}
            initial={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              scale: 0,
              opacity: 1,
            }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{ backgroundColor: s.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}