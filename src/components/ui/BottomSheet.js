'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.5, 0.9],
  initialSnap = 0,
  showHandle = true,
}) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const sheetRef = useRef(null);
  const dragControls = useDragControls();

  const maxHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const currentHeight = maxHeight * snapPoints[currentSnap];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentSnap(initialSnap);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialSnap]);

  const handleDragEnd = useCallback((_, info) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 500 || offset > 100) {
      if (currentSnap === 0) {
        onClose();
      } else {
        setCurrentSnap(Math.max(0, currentSnap - 1));
      }
    } else if (velocity < -500 || offset < -100) {
      if (currentSnap < snapPoints.length - 1) {
        setCurrentSnap(currentSnap + 1);
      }
    }
  }, [currentSnap, snapPoints, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: `${100 - snapPoints[currentSnap] * 100}%` }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-[151] bg-dark-900 rounded-t-3xl border-t border-dark-700/50 shadow-2xl"
            style={{
              height: maxHeight * snapPoints[snapPoints.length - 1],
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Handle */}
            {showHandle && (
              <div
                className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-10 h-1 rounded-full bg-dark-600" />
              </div>
            )}

            {/* Title */}
            {title && (
              <div className="px-5 pb-3 border-b border-dark-700/50">
                <h3 className="font-semibold text-base">{title}</h3>
              </div>
            )}

            {/* Content */}
            <div
              className="overflow-y-auto px-5 py-4"
              style={{
                maxHeight: currentHeight - (title ? 100 : 60),
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}