import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'RoomTalk — Real-time Chat Rooms',
  description: 'Join rooms, chat publicly, send private messages. Chats expire after 12 hours.',
};

// Runs before hydration to prevent flash of wrong theme
const themeScript = `(function(){var t=localStorage.getItem('roomtalk-theme');if(t!=='light')document.documentElement.classList.add('dark');})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full bg-slate-50 dark:bg-[#070B10] text-slate-900 dark:text-[#F8FAFC] antialiased">
        {children}
      </body>
    </html>
  );
}
