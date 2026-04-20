'use client';

import { motion } from 'framer-motion';
import { Clock, Target, Award } from 'lucide-react';

export default function MiningProgress({
  currentPoints = 0,
  targetPoints = 100,
  elapsedMinutes = 0,
  maxMinutes = 1440,
  goldEarned = 0,
}) {
  const pointsProgress = Math.min((currentPoints / targetPoints) * 100, 100);
  const timeProgress = Math.min((elapsedMinutes / maxMinutes) * 100, 100);

  const milestones = [
    { points: targetPoints * 0.25, label: '25%', reward: '🥉' },
    { points: targetPoints * 0.5, label: '50%', reward: '🥈' },
    { points: targetPoints * 0.75, label: '75%', reward: '🥇' },
    { points: targetPoints, label: '100%', reward: '💎' },
  ];

  return (
    <div className="glass-card p-4 space-y-4">
      {/* Points Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Target size={13} className="text-gold-400" />
            <span className="text-xs text-dark-400 font-medium">Mining Progress</span>
          </div>
          <span className="text-xs font-mono text-gold-400">
            {currentPoints.toFixed(2)} / {targetPoints} pts
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pointsProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 rounded-full relative"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </motion.div>
          </div>

          {/* Milestones */}
          <div className="absolute inset-0 flex items-center">
            {milestones.map((m, i) => {
              const position = ((i + 1) / milestones.length) * 100;
              const reached = currentPoints >= m.points;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: reached ? 1 : 0.6 }}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] ${
                      reached
                        ? 'bg-gold-500 border-gold-300'
                        : 'bg-dark-800 border-dark-600'
                    }`}
                  >
                    {reached ? m.reward : ''}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-dark-500">{pointsProgress.toFixed(1)}% complete</span>
          <span className="text-[9px] text-dark-500">
            {(targetPoints - currentPoints).toFixed(2)} pts to go
          </span>
        </div>
      </div>

      {/* Time Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-blue-400" />
            <span className="text-xs text-dark-400 font-medium">Session Time</span>
          </div>
          <span className="text-xs font-mono text-blue-400">
            {Math.floor(elapsedMinutes / 60)}h {elapsedMinutes % 60}m
          </span>
        </div>
        <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${timeProgress}%` }}
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
          />
        </div>
      </div>

      {/* Gold Earned */}
      <div className="flex items-center justify-between p-2.5 bg-dark-800/50 rounded-xl">
        <div className="flex items-center gap-1.5">
          <Award size={14} className="text-yellow-400" />
          <span className="text-xs text-dark-300">Gold Earned</span>
        </div>
        <span className="text-sm font-mono font-bold text-yellow-400">
          {goldEarned.toFixed(6)}g
        </span>
      </div>
    </div>
  );
}