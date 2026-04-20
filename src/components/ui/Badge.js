'use client';

const variants = {
  default: 'bg-dark-700 text-dark-300',
  primary: 'bg-gold-500/10 text-gold-400 border border-gold-500/20',
  success: 'bg-green-500/10 text-green-400 border border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};

const sizes = {
  xs: 'text-[8px] px-1.5 py-0.5',
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  dotColor,
  pill = true,
  className = '',
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-semibold uppercase tracking-wider
        ${pill ? 'rounded-full' : 'rounded-lg'}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dotColor || (variant === 'success' ? 'bg-green-400' :
            variant === 'danger' ? 'bg-red-400' :
            variant === 'warning' ? 'bg-yellow-400' :
            'bg-current')
          }`}
        />
      )}
      {children}
    </span>
  );
}