'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggle, mounted } = useTheme();

  const isDark = theme === 'dark';

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Theme toggle"
        className="rt-theme-toggle flex h-10 min-w-10 items-center justify-center rounded-xl px-3"
      >
        <span className="h-4 w-4 rounded-full bg-slate-300 dark:bg-slate-700" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rt-theme-toggle group flex h-10 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors dark:bg-emerald-500/10 dark:text-emerald-400">
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </span>

      <span className="hidden sm:inline text-slate-600 dark:text-slate-300">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}