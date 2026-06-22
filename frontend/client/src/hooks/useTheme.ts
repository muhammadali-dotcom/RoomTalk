'use client';

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'roomtalk-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored === 'light') return 'light';
    if (stored === 'dark') return 'dark';

    return 'dark';
  } catch {
    return 'dark';
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;

  if (theme === 'dark') {
    html.classList.add('dark');
    html.setAttribute('data-theme', 'dark');
  } else {
    html.classList.remove('dark');
    html.setAttribute('data-theme', 'light');
  }
}

function saveTheme(theme: Theme) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore localStorage errors
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getInitialTheme();

    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  function setAppTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  }

  function toggle() {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setAppTheme(nextTheme);
  }

  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    mounted,
    setTheme: setAppTheme,
    toggle,
  };
}