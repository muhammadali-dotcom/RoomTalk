import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'RoomTalk — Real-time Chat Rooms',
  description: 'Join rooms, chat publicly, send private messages. Chats expire after 12 hours.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#070B10] text-[#F8FAFC] antialiased">
        {children}
      </body>
    </html>
  );
}
