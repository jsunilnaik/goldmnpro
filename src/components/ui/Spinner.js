'use client';

export default function Spinner({
  size = 'md',
  color = 'gold',
  className = '',
}) {
  const sizeClasses = {
    xs: 'w-4 h-4 border-[2px]',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    gold: 'border-gold-500/30 border-t-gold-500',
    white: 'border-white/20 border-t-white',
    blue: 'border-blue-500/30 border-t-blue-500',
    green: 'border-green-500/30 border-t-green-500',
    red: 'border-red-500/30 border-t-red-500',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        rounded-full animate-spin
        ${className}
      `}
    />
  );
}