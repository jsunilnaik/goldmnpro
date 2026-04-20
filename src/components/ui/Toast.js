'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: { icon: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  error: { icon: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  warning: { icon: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  info: { icon: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export default function Toast({
  visible,
  type = 'info',
  title,
  message,
  onClose,
  duration = 3000,
  position = 'top',
}) {
  const Icon = icons[type];
  const color = colors[type];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{
            opacity: 0,
            y: position === 'top' ? -20 : 20,
            scale: 0.95,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: position === 'top' ? -20 : 20,
            scale: 0.95,
          }}
          className={`
            fixed ${position === 'top' ? 'top-4' : 'bottom-4'} left-4 right-4
            max-w-sm mx-auto z-[300]
            bg-dark-900/95 backdrop-blur-xl border ${color.border}
            rounded-2xl p-4 shadow-2xl shadow-black/30
          `}
        >
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg ${color.bg} flex items-center justify-center shrink-0`}>
              <Icon size={16} className={color.icon} />
            </div>
            <div className="flex-1 min-w-0">
              {title && <p className="text-sm font-semibold">{title}</p>}
              {message && <p className="text-xs text-dark-400 mt-0.5">{message}</p>}
            </div>
            {onClose && (
              <button onClick={onClose} className="text-dark-400 hover:text-white p-0.5 shrink-0">
                <X size={14} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}