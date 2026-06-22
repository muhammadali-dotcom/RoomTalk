'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Code2, Lock, LogOut, Send, TrendingUp, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import Logo from './Logo';
import Sidebar, { type DmUser } from './Sidebar';
import RoomCard, { type RoomDef } from './RoomCard';
import { socket } from '@/lib/socket';
import { useUserStore } from '@/store/useUserStore';
import { getUserColor, getUserAvatarLabel, formatMessageTime } from '@/lib/user-style';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RoomFromServer {
  id:          string;
  name:        string;
  description: string;
  activeUsers: number;
}

interface RoomVisual {
  icon:        ReactNode;
  iconBg:      string;
  iconBorder:  string;
  iconColor:   string;
}

interface PrivateMessage {
  id:        string;
  from:      string;
  to:        string;
  text:      string;
  type:      'private';
  createdAt: string;
}

// ─── Statics ─────────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

interface Props { username: string }

export default function Dashboard({ username }: Props) {
  const router       = useRouter();
  const clearUsername = useUserStore((s) => s.clearUsername);

  // Room state
  const [rooms,        setRooms]        = useState<RoomFromServer[]>([]);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [roomError,    setRoomError]    = useState('');

  // DM state
  const [directMessages, setDirectMessages] = useState<DmUser[]>([]);
  const [privateMessages, setPrivateMessages] = useState<Record<string, PrivateMessage[]>>({});
  const [activeDM,    setActiveDM]    = useState<string | null>(null);
  const [dmInput,     setDmInput]     = useState('');
  const [dmError,     setDmError]     = useState('');

  const dmMessagesEndRef = useRef<HTMLDivElement>(null);
  const dmInputRef       = useRef<HTMLInputElement>(null);

  const avatarInitial = username[0]?.toUpperCase() ?? 'U';

  // Scroll to bottom of DM panel when messages change
  useEffect(() => {
    dmMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [privateMessages, activeDM]);

  // ── Main socket listeners ──────────────────────────────────────────────────
  useEffect(() => {
    if (!socket.connected) {
      router.replace('/');
      return;
    }

    function onLoggedOut() {
      clearUsername();
      router.replace('/');
    }

    function onRoomsList(data: RoomFromServer[])  { setRooms(data); }
    function onRoomsUpdate(data: RoomFromServer[]) { setRooms(data); }

    function onRoomJoined({ roomId }: { roomId: string }) {
      setJoiningRoomId(null);
      router.push(`/chat/${roomId}`);
    }

    function onRoomError({ message }: { message: string }) {
      setJoiningRoomId(null);
      setRoomError(message);
    }

    // Full DM list from server (on load or after dm:open)
    function onDmList({ users }: { users: DmUser[] }) {
      setDirectMessages(users);
    }

    // New private message arrived on Dashboard
    function onPrivateReceive(msg: PrivateMessage) {
      const partner = msg.from === username ? msg.to : msg.from;

      setPrivateMessages((prev) => {
        const existing = prev[partner] ?? [];
        if (existing.some((m) => m.id === msg.id)) return prev;
        return { ...prev, [partner]: [...existing, msg] };
      });

      // Add partner to DM list if not already there
      setDirectMessages((prev) => {
        if (prev.some((d) => d.username === partner)) return prev;
        return [...prev, { username: partner, unreadCount: 0 }];
      });
    }

    // History loaded after dm:open
    function onPrivateHistory({
      withUser,
      messages: history,
    }: {
      withUser: string;
      messages: PrivateMessage[];
    }) {
      setPrivateMessages((prev) => {
        const existing = prev[withUser] ?? [];
        if (existing.length === 0) return { ...prev, [withUser]: history };
        const historyIds = new Set(history.map((m) => m.id));
        const live = existing.filter((m) => !historyIds.has(m.id));
        return { ...prev, [withUser]: [...history, ...live] };
      });
    }

    function onPrivateError({ message }: { message: string }) {
      setDmError(message);
    }

    socket.on('user:logged-out',  onLoggedOut);
    socket.on('rooms:list',       onRoomsList);
    socket.on('rooms:update',     onRoomsUpdate);
    socket.on('room:joined',      onRoomJoined);
    socket.on('room:error',       onRoomError);
    socket.on('dm:list',          onDmList);
    socket.on('private:receive',  onPrivateReceive);
    socket.on('private:history',  onPrivateHistory);
    socket.on('private:error',    onPrivateError);

    socket.emit('rooms:get');
    socket.emit('dm:list:get');

    return () => {
      socket.off('user:logged-out',  onLoggedOut);
      socket.off('rooms:list',       onRoomsList);
      socket.off('rooms:update',     onRoomsUpdate);
      socket.off('room:joined',      onRoomJoined);
      socket.off('room:error',       onRoomError);
      socket.off('dm:list',          onDmList);
      socket.off('private:receive',  onPrivateReceive);
      socket.off('private:history',  onPrivateHistory);
      socket.off('private:error',    onPrivateError);
    };
  }, [clearUsername, router, username]);

  // Separate effect so this handler always sees the latest activeDM
  useEffect(() => {
    function onUnreadUpdate({ from, count }: { from: string; count: number }) {
      setDirectMessages((prev) => {
        const exists = prev.some((d) => d.username === from);
        // If user is currently viewing this DM, force count to 0
        const effectiveCount = activeDM === from ? 0 : count;
        if (exists) {
          return prev.map((d) =>
            d.username === from ? { ...d, unreadCount: effectiveCount } : d,
          );
        }
        return [...prev, { username: from, unreadCount: effectiveCount }];
      });
    }

    socket.on('unread:update', onUnreadUpdate);
    return () => {
      socket.off('unread:update', onUnreadUpdate);
    };
  }, [activeDM]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function logout() { socket.emit('user:logout'); }

  function joinRoom(roomId: string) {
    setRoomError('');
    setJoiningRoomId(roomId);
    socket.emit('room:join', { roomId });
  }

  function openDM(partner: string) {
    setActiveDM(partner);
    setDmError('');
    // Reset badge immediately in local state
    setDirectMessages((prev) =>
      prev.map((d) => (d.username === partner ? { ...d, unreadCount: 0 } : d)),
    );
    socket.emit('dm:open', { withUser: partner });
  }

  function closeDM() {
    setActiveDM(null);
    setDmInput('');
    setDmError('');
  }

  function sendDMMessage() {
    const text = dmInput.trim();
    if (!text || !activeDM) return;
    if (text.length > 500) {
      setDmError('Message cannot exceed 500 characters.');
      return;
    }
    setDmError('');
    socket.emit('private:send', { to: activeDM, text });
    setDmInput('');
    dmInputRef.current?.focus();
  }

  function handleRoomsClick() {
    closeDM();
  }

  // ── Derived data ──────────────────────────────────────────────────────────

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

  const dmMessages = activeDM ? (privateMessages[activeDM] ?? []) : [];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col"
      style={{
        height:     '100dvh',
        background: 'radial-gradient(ellipse 70% 50% at 10% 20%, rgba(16,185,129,0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(59,130,246,0.04) 0%, transparent 60%), #070B10',
      }}
    >
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
          {/* Sidebar */}
          <div className="hidden md:flex flex-shrink-0">
            <Sidebar
              dmList={directMessages}
              onDmClick={openDM}
              onRoomsClick={handleRoomsClick}
              activeDM={activeDM}
            />
          </div>

          {/* Main content */}
          {activeDM ? (
            // ── DM Chat Panel ──────────────────────────────────────────────
            <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'rgba(8,12,20,0.85)' }}>
              {/* DM header */}
              <div
                className="flex-shrink-0 flex items-center gap-3 px-5 py-3"
                style={{ borderBottom: '1px solid rgba(148,163,184,0.09)', background: 'rgba(10,14,22,0.95)' }}
              >
                <button
                  onClick={closeDM}
                  className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <ArrowLeft size={15} />
                  <span className="hidden sm:inline">Back</span>
                </button>

                <div
                  className="w-px h-5 flex-shrink-0"
                  style={{ background: 'rgba(148,163,184,0.12)' }}
                />

                <Lock size={14} className="text-violet-400 flex-shrink-0" />
                <span className="text-[15px] font-semibold text-white truncate">{activeDM}</span>
                <span className="text-[12px] text-violet-500/70 hidden sm:block flex-shrink-0">
                  Private · messages expire after 12h
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
                <div className="flex justify-center">
                  <span
                    className="text-[11.5px] text-gray-500 px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border:     '1px solid rgba(148,163,184,0.08)',
                    }}
                  >
                    Private chat with {activeDM}. Only you two can see this.
                  </span>
                </div>

                {dmMessages.length === 0 && (
                  <div className="flex justify-center pt-4">
                    <span className="text-[12px] text-gray-600">No messages yet.</span>
                  </div>
                )}

                {dmMessages.map((msg) => {
                  const isSelf = msg.from === username;
                  if (isSelf) {
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div className="flex flex-col gap-1 max-w-[80%] items-end">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10.5px] text-gray-600">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                            <span className="text-[11.5px] font-semibold text-violet-400">You</span>
                          </div>
                          <div
                            className="px-3.5 py-2 rounded-2xl text-[13.5px] text-white leading-relaxed break-words"
                            style={{
                              background: 'rgba(139,92,246,0.15)',
                              border:     '1px solid rgba(139,92,246,0.25)',
                            }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const avatarColor = getUserColor(msg.from);
                  const avatarLabel = getUserAvatarLabel(msg.from);
                  return (
                    <div key={msg.id} className="flex justify-start items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ${avatarColor}`}
                      >
                        {avatarLabel}
                      </div>
                      <div className="flex flex-col gap-1 max-w-[80%] items-start">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11.5px] font-semibold text-gray-300">{msg.from}</span>
                          <span className="text-[10.5px] text-gray-600">
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                        <div
                          className="px-3.5 py-2 rounded-2xl text-[13.5px] text-white leading-relaxed break-words"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border:     '1px solid rgba(148,163,184,0.1)',
                          }}
                        >
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={dmMessagesEndRef} />
              </div>

              {/* Error banner */}
              {dmError && (
                <div
                  className="flex-shrink-0 mx-5 mb-2 px-4 py-2 rounded-xl text-[12.5px] text-red-400"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border:     '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  {dmError}
                </div>
              )}

              {/* Input bar */}
              <div
                className="flex-shrink-0 px-5 py-4"
                style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 flex items-center px-4 rounded-xl"
                    style={{
                      background: 'rgba(139,92,246,0.06)',
                      border:     '1px solid rgba(139,92,246,0.2)',
                      height:     '44px',
                    }}
                  >
                    <input
                      ref={dmInputRef}
                      value={dmInput}
                      onChange={(e) => {
                        setDmInput(e.target.value);
                        if (dmError) setDmError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendDMMessage();
                        }
                      }}
                      placeholder={`Message ${activeDM}…`}
                      maxLength={500}
                      className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                    />
                  </div>

                  <button
                    onClick={sendDMMessage}
                    disabled={!dmInput.trim()}
                    className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 transition-opacity disabled:opacity-40"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                      boxShadow:  '0 4px 16px rgba(139,92,246,0.3)',
                    }}
                  >
                    <Send size={16} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // ── Room Cards ────────────────────────────────────────────────
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
          )}
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
            { label: 'Rooms',    active: !activeDM },
            { label: 'Messages', active: !!activeDM },
          ].map(({ label, active }) => (
            <button
              key={label}
              onClick={() => {
                if (label === 'Rooms') closeDM();
              }}
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
