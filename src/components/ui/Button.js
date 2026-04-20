'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-gold-gradient text-dark-900 font-bold shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30',
  secondary: 'bg-dark-800 text-white border border-dark-600 hover:bg-dark-700 hover:border-dark-500',
  outline: 'bg-transparent text-gold-400 border border-gold-500/30 hover:bg-gold-500/10',
  ghost: 'bg-transparent text-dark-300 hover:bg-dark-800/50 hover:text-white',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30',
  success: 'bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-[10px] rounded-lg',
  sm: 'px-3 py-2 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-sm rounded-xl',
  xl: 'px-8 py-4 text-base rounded-2xl',
  icon: 'p-2 rounded-xl',
  'icon-sm': 'p-1.5 rounded-lg',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        haptic-button
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} className="animate-spin" />
          {children && <span>{typeof children === 'string' ? 'Loading...' : children}</span>}
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
          )}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;