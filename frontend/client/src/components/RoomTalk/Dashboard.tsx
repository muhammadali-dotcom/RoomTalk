'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, LogOut, Code2, TrendingUp, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import Logo from './Logo';
import Sidebar from './Sidebar';
import RoomCard, { type RoomDef } from './RoomCard';
import { socket } from '@/lib/socket';
import { useUserStore } from '@/store/useUserStore';

interface RoomFromServer {
  id: string;
  name: string;
  description: string;
  activeUsers: number;
}

interface RoomVisual {
  icon:        ReactNode;
  iconBg:      string;
  iconBorder:  string;
  iconColor:   string;
}

// Static visual config per room ID — counts come from the server
const ROOM_VISUAL: Record<string, RoomVisual> = {
  developers: {
    icon:       <Code2 size={28} />,
    iconBg:     'rgba(34,211,238,0.1)',
    iconBorder: 'rgba(34,211,238,0.22)',
    iconColor:  '#22D3EE',
  },
  marketing: {
    icon:       <TrendingUp size={28} />,
    iconBg:     'rgba(96,165,250,0.1)',
    iconBorder: 'rgba(96,165,250,0.22)',
    iconColor:  '#60A5FA',
  },
  hr: {
    icon:       <Users size={28} />,
    iconBg:     'rgba(251,191,36,0.1)',
    iconBorder: 'rgba(251,191,36,0.22)',
    iconColor:  '#FBBF24',
  },
};

interface Props {
  username: string;
}

export default function Dashboard({ username }: Props) {
  const router = useRouter();
  const clearUsername = useUserStore((s) => s.clearUsername);

  const [rooms, setRooms] = useState<RoomFromServer[]>([]);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string>('');

  const avatarInitial = username[0]?.toUpperCase() ?? 'U';

  useEffect(() => {
    // If socket is disconnected (e.g. page refresh), go back to home to reconnect
    if (!socket.connected) {
      router.replace('/');
      return;
    }

    function onLoggedOut() {
      clearUsername();
      router.replace('/');
    }

    function onRoomsList(data: RoomFromServer[]) {
      setRooms(data);
    }

    function onRoomsUpdate(data: RoomFromServer[]) {
      setRooms(data);
    }

    function onRoomJoined({ roomId }: { roomId: string }) {
      setJoiningRoomId(null);
      router.push(`/chat/${roomId}`);
    }

    function onRoomError({ message }: { message: string }) {
      setJoiningRoomId(null);
      setRoomError(message);
    }

    socket.on('user:logged-out', onLoggedOut);
    socket.on('rooms:list', onRoomsList);
    socket.on('rooms:update', onRoomsUpdate);
    socket.on('room:joined', onRoomJoined);
    socket.on('room:error', onRoomError);

    // Request the initial room list with counts
    socket.emit('rooms:get');

    return () => {
      socket.off('user:logged-out', onLoggedOut);
      socket.off('rooms:list', onRoomsList);
      socket.off('rooms:update', onRoomsUpdate);
      socket.off('room:joined', onRoomJoined);
      socket.off('room:error', onRoomError);
    };
  }, [clearUsername, router]);

  function logout() {
    socket.emit('user:logout');
  }

  function joinRoom(roomId: string) {
    setRoomError('');
    setJoiningRoomId(roomId);
    socket.emit('room:join', { roomId });
  }

  // Merge server data with frontend visual config
  const roomDefs: RoomDef[] = rooms.map((r) => {
    const visual = ROOM_VISUAL[r.id];
    return {
      id:          r.id,
      name:        r.name,
      description: r.description,
      active:      r.activeUsers,
      icon:        visual?.icon        ?? <Users size={28} />,
      iconBg:      visual?.iconBg      ?? 'rgba(148,163,184,0.1)',
      iconBorder:  visual?.iconBorder  ?? 'rgba(148,163,184,0.22)',
      iconColor:   visual?.iconColor   ?? '#94A3B8',
      avatarColors: [],
    };
  });

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
              onClick={logout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] text-gray-400 hover:text-red-400 transition-colors"
              style={{ border: '1px solid rgba(148,163,184,0.08)' }}
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>

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
              </div>

              {roomError && (
                <div
                  className="mb-4 px-4 py-3 rounded-xl text-[13px] text-red-400"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border:     '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  {roomError}
                </div>
              )}

              <div className="space-y-3">
                {roomDefs.length === 0 ? (
                  <div className="text-[13px] text-gray-500 py-4">Loading rooms…</div>
                ) : (
                  roomDefs.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      joining={joiningRoomId === room.id}
                      onJoin={() => joinRoom(room.id)}
                    />
                  ))
                )}
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
