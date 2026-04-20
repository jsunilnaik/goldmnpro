'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function OTPInput({
    length = 6,
    value = '',
    onChange,
    onComplete,
    disabled = false,
    error = false,
    autoFocus = true,
    size = 'default', // 'small' | 'default' | 'large'
}) {
    const [otp, setOtp] = useState(
        value ? value.split('').slice(0, length) : Array(length).fill('')
    );
    const [activeIndex, setActiveIndex] = useState(0);
    const [shake, setShake] = useState(false);
    const inputRefs = useRef([]);

    // Sync external value
    useEffect(() => {
        if (value !== undefined) {
            const newOtp = value
                .split('')
                .slice(0, length)
                .concat(Array(length).fill(''))
                .slice(0, length);
            setOtp(newOtp);
        }
    }, [value, length]);

    // Auto focus
    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [autoFocus]);

    // Shake on error
    useEffect(() => {
        if (error) {
            setShake(true);
            // Clear and focus first input
            const cleared = Array(length).fill('');
            setOtp(cleared);
            setTimeout(() => {
                setShake(false);
                inputRefs.current[0]?.focus();
            }, 500);
        }
    }, [error, length]);

    const focusInput = useCallback(
        (index) => {
            const safeIndex = Math.max(0, Math.min(index, length - 1));
            setActiveIndex(safeIndex);
            inputRefs.current[safeIndex]?.focus();
            inputRefs.current[safeIndex]?.select();
        },
        [length]
    );

    const handleChange = (index, inputValue) => {
        // Only accept digits
        const digit = inputValue.replace(/\D/g, '').slice(-1);

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        const otpString = newOtp.join('');
        if (onChange) onChange(otpString);

        // Move to next field
        if (digit && index < length - 1) {
            focusInput(index + 1);
        }

        // Auto-submit when complete
        if (digit && index === length - 1) {
            const fullOtp = newOtp.join('');
            if (fullOtp.length === length && onComplete) {
                // Small delay for visual feedback
                setTimeout(() => onComplete(fullOtp), 100);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        switch (e.key) {
            case 'Backspace':
                e.preventDefault();
                if (otp[index]) {
                    // Clear current
                    const newOtp = [...otp];
                    newOtp[index] = '';
                    setOtp(newOtp);
                    if (onChange) onChange(newOtp.join(''));
                } else if (index > 0) {
                    // Move to prev and clear
                    focusInput(index - 1);
                    const newOtp = [...otp];
                    newOtp[index - 1] = '';
                    setOtp(newOtp);
                    if (onChange) onChange(newOtp.join(''));
                }
                break;
            case 'Delete':
                e.preventDefault();
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
                if (onChange) onChange(newOtp.join(''));
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (index > 0) focusInput(index - 1);
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (index < length - 1) focusInput(index + 1);
                break;
            case 'Home':
                e.preventDefault();
                focusInput(0);
                break;
            case 'End':
                e.preventDefault();
                focusInput(length - 1);
                break;
            default:
                break;
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, length);

        if (!pasted) return;

        const newOtp = [...otp];
        for (let i = 0; i < pasted.length; i++) {
            newOtp[i] = pasted[i];
        }
        setOtp(newOtp);

        const otpString = newOtp.join('');
        if (onChange) onChange(otpString);

        // Focus appropriate field
        if (pasted.length >= length) {
            focusInput(length - 1);
            if (onComplete) {
                setTimeout(() => onComplete(otpString), 100);
            }
        } else {
            focusInput(pasted.length);
        }
    };

    const handleFocus = (index) => {
        setActiveIndex(index);
        inputRefs.current[index]?.select();
    };

    // Size configurations
    const sizeConfig = {
        small: {
            wrapper: 'gap-1.5',
            input: 'w-9 h-11 text-base',
        },
        default: {
            wrapper: 'gap-2.5',
            input: 'w-12 h-14 text-xl',
        },
        large: {
            wrapper: 'gap-3',
            input: 'w-14 h-16 text-2xl',
        },
    };

    const config = sizeConfig[size] || sizeConfig.default;
    const isFilled = otp.every((d) => d !== '');
    const filledCount = otp.filter((d) => d !== '').length;

    return (
        <div className="space-y-3">
            {/* OTP Input Fields */}
            <motion.div
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={`flex justify-center ${config.wrapper}`}
                onPaste={handlePaste}
            >
                {otp.map((digit, index) => {
                    const isFocused = activeIndex === index;
                    const hasValue = digit !== '';

                    return (
                        <motion.div
                            key={index}
                            initial={false}
                            animate={{
                                scale: isFocused ? 1.05 : 1,
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <input
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onFocus={() => handleFocus(index)}
                                disabled={disabled}
                                autoComplete="one-time-code"
                                aria-label={`Digit ${index + 1}`}
                                className={`
                  ${config.input}
                  text-center font-mono font-bold rounded-xl border-2 outline-none
                  transition-all duration-200 select-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${error
                                        ? 'border-red-500/60 bg-red-500/5 text-red-400'
                                        : hasValue
                                            ? 'bg-gold-500/10 border-gold-500/50 text-gold-400 shadow-sm shadow-gold-500/10'
                                            : isFocused
                                                ? 'bg-dark-800 border-gold-500/70 text-white ring-2 ring-gold-500/20'
                                                : 'bg-dark-800 border-dark-600 text-white hover:border-dark-500'
                                    }
                `}
                            />

                            {/* Cursor animation for empty focused field */}
                            {isFocused && !hasValue && !disabled && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="w-0.5 h-5 bg-gold-400 mx-auto -mt-10 mb-5 rounded-full"
                                />
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-1.5">
                {otp.map((digit, i) => (
                    <motion.div
                        key={i}
                        initial={false}
                        animate={{
                            scale: digit ? 1 : 0.6,
                            backgroundColor: digit ? '#FFD700' : '#2a2a4a',
                        }}
                        className="w-1.5 h-1.5 rounded-full"
                    />
                ))}
            </div>

            {/* Filled Status */}
            {isFilled && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-1.5 text-green-400"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <motion.path
                                d="M5 13l4 4L19 7"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                            />
                        </svg>
                    </motion.div>
                    <span className="text-xs font-medium">Code entered</span>
                </motion.div>
            )}
        </div>
    );
}