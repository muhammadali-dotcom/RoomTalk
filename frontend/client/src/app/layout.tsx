import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../globals.css';

export const metadata: Metadata = {
  title: 'RoomTalk — Real-time Chat Rooms',
  description:
    'Join rooms, chat publicly, send private messages. Chats expire after 12 hours.',
};

/**
 * Prevents flash of wrong theme before React hydration.
 *
 * Theme rule:
 * - If localStorage has "light" → light mode
 * - Otherwise → dark mode by default
 */
const themeScript = `
(function () {
  try {
    var theme = localStorage.getItem('roomtalk-theme');
    var root = document.documentElement;

    if (theme === 'light') {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  } catch (e) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>

      <body className="h-full bg-[var(--rt-bg-page)] text-[var(--rt-text-primary)] antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}