import { clsx } from 'clsx';

// Class Name Merger
export function cn(...inputs) {
  return clsx(inputs);
}

// Format Currency (INR)
export function formatCurrency(amount, options = {}) {
  const { decimals = 2, showSymbol = true, compact = false } = options;
  const num = parseFloat(amount) || 0;

  if (compact && num >= 100000) {
    return `${showSymbol ? '₹' : ''}${(num / 100000).toFixed(1)}L`;
  }
  if (compact && num >= 1000) {
    return `${showSymbol ? '₹' : ''}${(num / 1000).toFixed(1)}K`;
  }

  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `₹${formatted}` : formatted;
}

// Format Number
export function formatNumber(num, decimals = 2) {
  return (parseFloat(num) || 0).toFixed(decimals);
}

// Format Date
export function formatDate(date, format = 'short') {
  const d = new Date(date);
  const options = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    time: { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' },
    full: { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' },
    relative: null,
  };

  if (format === 'relative') return getRelativeTime(d);
  return d.toLocaleDateString('en-IN', options[format] || options.short);
}

// Relative Time
export function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date, 'short');
}

// Format Duration
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Generate Referral Code
export function generateReferralCode(prefix = 'GM', length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix;
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate OTP
export function generateOTP(length = 6) {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1))).toString();
}

// Mask sensitive data
export function maskEmail(email) {
  if (!email) return '';
  const [name, domain] = email.split('@');
  return `${name.charAt(0)}***@${domain}`;
}

export function maskPhone(phone) {
  if (!phone) return '';
  return `******${phone.slice(-4)}`;
}

export function maskAccount(account) {
  if (!account) return '';
  return `****${account.slice(-4)}`;
}

// Truncate text
export function truncate(str, length = 30) {
  if (!str || str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// Sleep utility
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Debounce
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Throttle
export function throttle(fn, limit = 300) {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Calculate withdrawal amounts
export function calculateWithdrawal(amount, tdsPercent = 30, processingFee = 10) {
  const tds = (amount * tdsPercent) / 100;
  const net = Math.max(0, amount - tds - processingFee);
  return { gross: amount, tds, processingFee, net };
}

// Check if withdrawal window is open
export function isWithdrawalWindowOpen(withdrawalDate = 15, windowDays = 3) {
  const today = new Date().getDate();
  return today >= withdrawalDate && today <= withdrawalDate + windowDays;
}

// Days until next withdrawal
export function daysUntilWithdrawal(withdrawalDate = 15) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), withdrawalDate);
  if (target <= now) target.setMonth(target.getMonth() + 1);
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

// Extract video ID and return embed URL for YouTube and Instagram
export function getEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let id = '';
    if (url.includes('v=')) id = url.split('v=')[1].split('&')[0];
    else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1].split('?')[0];
    else if (url.includes('shorts/')) id = url.split('shorts/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes('instagram.com')) {
    let id = '';
    if (url.includes('/reels/') || url.includes('/reel/')) {
      id = (url.includes('/reels/') ? url.split('/reels/')[1] : url.split('/reel/')[1]).split('/')[0];
      return `https://www.instagram.com/reel/${id}/embed`;
    }
    if (url.includes('/p/')) {
      id = url.split('/p/')[1].split('/')[0];
      return `https://www.instagram.com/p/${id}/embed`;
    }
    return `https://www.instagram.com/p/${url.split('instagram.com/')[1].split('/')[0]}/embed`;
  }
  return url;
}