'use client';

export default function Skeleton({
  width,
  height,
  variant = 'rectangular',
  count = 1,
  gap = 2,
  className = '',
}) {
  const baseClasses = 'skeleton animate-pulse';

  const variantClasses = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded h-4',
    card: 'rounded-2xl',
  };

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={`space-y-${gap}`}>
      {items.map((i) => (
        <div
          key={i}
          className={`
            ${baseClasses}
            ${variantClasses[variant]}
            ${className}
          `}
          style={{
            width: width || '100%',
            height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? width || '3rem' : '3rem'),
          }}
        />
      ))}
    </div>
  );
}

// Preset Skeletons
export function CardSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-dark-700 rounded-xl" />
        <div className="flex-1">
          <div className="h-4 bg-dark-700 rounded w-28 mb-2" />
          <div className="h-3 bg-dark-700 rounded w-20" />
        </div>
      </div>
      <div className="h-8 bg-dark-700 rounded w-32" />
      <div className="h-3 bg-dark-700 rounded w-full" />
    </div>
  );
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass-card p-3.5 animate-pulse flex items-center gap-3">
          <div className="w-9 h-9 bg-dark-700 rounded-xl shrink-0" />
          <div className="flex-1">
            <div className="h-3.5 bg-dark-700 rounded w-3/4 mb-1.5" />
            <div className="h-2.5 bg-dark-700 rounded w-1/2" />
          </div>
          <div className="h-4 bg-dark-700 rounded w-14" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="bg-dark-800/50 p-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-dark-700 rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-3 flex gap-4 border-t border-dark-700/30">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-dark-700 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}