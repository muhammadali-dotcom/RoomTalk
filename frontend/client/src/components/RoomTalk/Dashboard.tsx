'use client';

import { useRouter } from 'next/navigation';
import {
  ChevronDown, Plus, Clock,
  Code2, TrendingUp, Users, MessageCircle, Gamepad2,
} from 'lucide-react';
import Logo from './Logo';
import Sidebar from './Sidebar';
import RoomCard, { type RoomDef } from './RoomCard';
import { socket } from '@/lib/socket';

const ROOMS: RoomDef[] = [
  {
    id:           'developers',
    name:         'Developers',
    description:  'Talk about code, frameworks, bugs, architecture, and more.',
    active:       4,
    icon:         <Code2 size={28} />,
    iconBg:       'rgba(34,211,238,0.1)',
    iconBorder:   'rgba(34,211,238,0.22)',
    iconColor:    '#22D3EE',
    avatarColors: ['#22D3EE', '#10B981', '#60A5FA', '#A78BFA'],
  },
  {
    id:           'marketing',
    name:         'Marketing',
    description:  'Discuss campaigns, strategies, growth and marketing trends.',
    active:       2,
    icon:         <TrendingUp size={28} />,
    iconBg:       'rgba(96,165,250,0.1)',
    iconBorder:   'rgba(96,165,250,0.22)',
    iconColor:    '#60A5FA',
    avatarColors: ['#60A5FA', '#34D399'],
  },
  {
    id:           'hr',
    name:         'HR',
    description:  'Talk about policies, culture, recruitment and more.',
    active:       0,
    icon:         <Users size={28} />,
    iconBg:       'rgba(251,191,36,0.1)',
    iconBorder:   'rgba(251,191,36,0.22)',
    iconColor:    '#FBBF24',
    avatarColors: [],
  },
  {
    id:           'general',
    name:         'General',
    description:  'General talks about anything and everything.',
    active:       6,
    icon:         <MessageCircle size={28} />,
    iconBg:       'rgba(20,184,166,0.1)',
    iconBorder:   'rgba(20,184,166,0.22)',
    iconColor:    '#14B8A6',
    avatarColors: ['#14B8A6', '#22D3EE', '#60A5FA', '#34D399'],
  },
  {
    id:           'gaming',
    name:         'Gaming',
    description:  'Discuss games, updates, streaming and more.',
    active:       3,
    icon:         <Gamepad2 size={28} />,
    iconBg:       'rgba(167,139,250,0.1)',
    iconBorder:   'rgba(167,139,250,0.22)',
    iconColor:    '#A78BFA',
    avatarColors: ['#A78BFA', '#F472B6', '#60A5FA'],
  },
];

interface Props {
  username: string;
}

export default function Dashboard({ username }: Props) {
  const router = useRouter();

  const avatarInitial = username[0]?.toUpperCase() ?? 'U';

  function joinRoom(roomId: string) {
    if (socket.connected) {
      socket.emit('room:join', { roomId });
    }
    router.push(`/chat/${roomId}`);
  }

  return (
    <div
      className="flex flex-col"
      style={{
        height:     '100dvh',
        background: 'radial-gradient(ellipse 70% 50% at 10% 20%, rgba(16,185,129,0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(59,130,246,0.04) 0%, transparent 60%), #070B10',
      }}
    >
      {/* Outer bordered shell */}
      <div
        className="flex flex-col flex-1 overflow-hidden m-2 sm:m-3 rounded-2xl"
        style={{
          border:    '1px solid rgba(148,163,184,0.1)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Navbar */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-5 sm:px-6"
          style={{
            height:       '72px',
            background:   'rgba(10,14,22,0.98)',
            borderBottom: '1px solid rgba(148,163,184,0.09)',
          }}
        >
          <Logo size="md" />

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-colors hover:bg-white/5"
              style={{ border: '1px solid rgba(148,163,184,0.1)' }}
            >
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)' }}
                >
                  {avatarInitial}
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#070B10]"
                  style={{ background: '#22C55E', boxShadow: '0 0 5px rgba(34,197,94,0.8)' }}
                />
              </div>
              <span className="hidden sm:block text-[13.5px] font-medium text-white">{username}</span>
              <ChevronDown size={14} className="hidden sm:block text-gray-500" />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:flex flex-shrink-0">
            <Sidebar />
          </div>

          <main
            className="flex-1 overflow-y-auto"
            style={{ background: 'rgba(8,12,20,0.7)' }}
          >
            <div className="px-6 sm:px-8 py-7 max-w-[900px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                <div>
                  <h1 className="text-[22px] font-bold text-white tracking-tight">Available Rooms</h1>
                  <p className="text-[13px] text-gray-400 mt-1">Join a room to start chatting with others</p>
                </div>
                <button className="rt-btn-outline flex items-center gap-2 self-start sm:self-auto">
                  <Plus size={14} />
                  Create Room
                </button>
              </div>

              <div className="space-y-3">
                {ROOMS.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onJoin={() => joinRoom(room.id)}
                  />
                ))}
              </div>

              <div
                className="mt-6 flex items-center gap-2.5 px-4 py-3 rounded-xl text-[12.5px] text-gray-500"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border:     '1px solid rgba(148,163,184,0.07)',
                }}
              >
                <Clock size={14} className="text-gray-600 flex-shrink-0" />
                Chats are temporary and automatically deleted after 12 hours.
              </div>
            </div>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <nav
          className="md:hidden flex-shrink-0 flex items-center justify-around px-2 py-2"
          style={{
            borderTop:  '1px solid rgba(148,163,184,0.09)',
            background: 'rgba(10,14,22,0.98)',
          }}
        >
          {[
            { label: 'Rooms',    active: true  },
            { label: 'Messages', active: false },
            { label: 'Friends',  active: false },
            { label: 'Settings', active: false },
          ].map(({ label, active }) => (
            <button
              key={label}
              className="flex-1 py-2 text-[11px] font-medium rounded-lg transition-colors"
              style={{ color: active ? '#34D399' : '#6B7280' }}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
