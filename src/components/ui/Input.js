'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  type = 'text',
  icon: Icon,
  error,
  success,
  helperText,
  fullWidth = true,
  size = 'md',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const sizeClasses = {
    sm: 'py-2 text-xs',
    md: 'py-3 text-sm',
    lg: 'py-3.5 text-sm',
  };

  const getStatusColor = () => {
    if (error) return 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20';
    if (success) return 'border-green-500/50 focus:border-green-500/70 focus:ring-green-500/20';
    return 'border-dark-600 focus:border-gold-500/50 focus:ring-gold-500/20';
  };

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-xs text-dark-400 font-medium pl-0.5 block">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              error ? 'text-red-400' : success ? 'text-green-400' : 'text-dark-400'
            }`}
          />
        )}

        <input
          ref={ref}
          type={inputType}
          className={`
            ${fullWidth ? 'w-full' : ''}
            bg-dark-800 border rounded-xl
            ${Icon ? 'pl-10' : 'pl-4'}
            ${isPassword ? 'pr-12' : error || success ? 'pr-10' : 'pr-4'}
            ${sizeClasses[size]}
            outline-none transition-all
            placeholder:text-dark-500
            focus:ring-1
            ${getStatusColor()}
            ${className}
          `}
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors p-0.5"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {/* Status Icon */}
        {!isPassword && (error || success) && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {error && <AlertCircle size={16} className="text-red-400" />}
            {success && <CheckCircle size={16} className="text-green-400" />}
          </div>
        )}
      </div>

      {/* Helper / Error Text */}
      {(error || helperText) && (
        <p className={`text-[10px] pl-0.5 ${error ? 'text-red-400' : 'text-dark-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;