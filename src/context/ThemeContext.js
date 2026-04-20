'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark'); // dark | light | system
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  const [accentColor, setAccentColorState] = useState('gold');

  const accentColors = {
    gold: { primary: '#FFD700', secondary: '#FFA500' },
    blue: { primary: '#3B82F6', secondary: '#1D4ED8' },
    green: { primary: '#10B981', secondary: '#047857' },
    purple: { primary: '#8B5CF6', secondary: '#6D28D9' },
    red: { primary: '#EF4444', secondary: '#DC2626' },
    cyan: { primary: '#06B6D4', secondary: '#0891B2' },
  };

  // Resolve system theme
  useEffect(() => {
    const stored = localStorage.getItem('theme') || 'dark';
    const storedAccent = localStorage.getItem('accentColor') || 'gold';
    setThemeState(stored);
    setAccentColorState(storedAccent);

    if (stored === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e) => setResolvedTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setResolvedTheme(stored);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(newTheme);
    }
  }, []);

  const setAccentColor = useCallback((color) => {
    if (accentColors[color]) {
      setAccentColorState(color);
      localStorage.setItem('accentColor', color);

      // Apply CSS variables
      const root = document.documentElement;
      root.style.setProperty('--accent-primary', accentColors[color].primary);
      root.style.setProperty('--accent-secondary', accentColors[color].secondary);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  const isDark = resolvedTheme === 'dark';

  return (
    <ThemeContext.Provider value={{
      theme,
      resolvedTheme,
      isDark,
      accentColor,
      accentColors,
      setTheme,
      setAccentColor,
      toggleTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}