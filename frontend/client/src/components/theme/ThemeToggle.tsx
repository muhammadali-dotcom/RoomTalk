'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] transition-colors
        text-slate-500 dark:text-gray-400
        hover:text-slate-800 dark:hover:text-white
        border border-slate-200 dark:border-white/[0.08]
        hover:bg-slate-100 dark:hover:bg-white/5"
    >
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
