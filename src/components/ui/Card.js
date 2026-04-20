'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Card = forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  animate = false,
  onClick,
  className = '',
  ...props
}, ref) => {
  const variantClasses = {
    default: 'glass-card',
    bordered: 'glass-card border border-dark-700/50',
    gold: 'glass-card border border-gold-500/20',
    elevated: 'bg-dark-800 rounded-2xl shadow-xl shadow-black/20',
    ghost: 'bg-transparent',
    gradient: 'bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl border border-dark-700/50',
  };

  const paddingClasses = {
    none: 'p-0',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4 md:p-5',
    lg: 'p-5 md:p-6',
    xl: 'p-6 md:p-8',
  };

  const Component = animate || onClick ? motion.div : 'div';
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      }
    : {};

  const hoverProps = hover
    ? { whileHover: { y: -2, transition: { duration: 0.2 } } }
    : {};

  const tapProps = onClick
    ? { whileTap: { scale: 0.98 } }
    : {};

  return (
    <Component
      ref={ref}
      onClick={onClick}
      className={`
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${hover ? 'cursor-pointer hover:bg-dark-800/80 transition-all' : ''}
        ${onClick ? 'cursor-pointer haptic-button' : ''}
        ${className}
      `}
      {...motionProps}
      {...hoverProps}
      {...tapProps}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';
export default Card;