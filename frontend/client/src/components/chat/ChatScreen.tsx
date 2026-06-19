'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Users, Hash } from 'lucide-react';
import Logo from '@/components/RoomTalk/Logo';
import { socket } from '@/lib/socket';

const ROOM_LABELS: Record<string, string> = {
  developers: 'Developers',
  marketing:  'Marketing',
  hr:         'HR',
};

interface PublicMessage {
  id:        string;
  roomId:    string;
  sender:    string;
  text:      string;
  type:      'public';
  createdAt: string;
}

interface Props {
  roomId:   string;
  username: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen({ roomId, username }: Props) {
  const router = useRouter();

  const [input, setInput]         = useState('');
  const [messages, setMessages]   = useState<PublicMessage[]>([]);
  const [roomUsers, setRoomUsers] = useState<string[]>([]);
  const [leaving, setLeaving]     = useState(false);
  const [msgError, setMsgError]   = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  const roomName = ROOM_LABELS[roomId] ?? roomId;

  // Scroll to newest message whenever the list grows
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // If socket disconnected (page refresh), go back to home
    if (!socket.connected) {
      router.replace('/');
      return;
    }

    function onRoomUsers({ users }: { roomId: string; users: string[] }) {
      setRoomUsers(users);
    }

    function onRoomLeft() {
      setMessages([]);
      router.push('/dashboard');
    }

    function onRoomError() {
      router.replace('/dashboard');
    }

    function onMessagesHistory({
      messages: history,
    }: {
      roomId: string;
      messages: PublicMessage[];
    }) {
      setMessages((prev) => {
        if (prev.length === 0) return history;
        // Merge: keep history as the base, append any real-time messages
        // that arrived before history loaded (race-condition guard)
        const historyIds = new Set(history.map((m) => m.id));
        const live = prev.filter((m) => !historyIds.has(m.id));
        return [...history, ...live];
      });
    }

    function onMessageReceive(msg: PublicMessage) {
      // Deduplicate: history + real-time can overlap during load
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    }

    function onMessageError({ message }: { message: string }) {
      setMsgError(message);
    }

    socket.on('room:users',       onRoomUsers);
    socket.on('room:left',        onRoomLeft);
    socket.on('room:error',       onRoomError);
    socket.on('messages:history', onMessagesHistory);
    socket.on('message:receive',  onMessageReceive);
    socket.on('message:error',    onMessageError);

    // Fetch room user list and message history on mount
    socket.emit('room:users:get', { roomId });
    socket.emit('messages:get',   { roomId });

    return () => {
      socket.off('room:users',       onRoomUsers);
      socket.off('room:left',        onRoomLeft);
      socket.off('room:error',       onRoomError);
      socket.off('messages:history', onMessagesHistory);
      socket.off('message:receive',  onMessageReceive);
      socket.off('message:error',    onMessageError);
    };
  }, [roomId, router]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    if (text.length > 500) {
      setMsgError('Message cannot exceed 500 characters.');
      return;
    }
    setMsgError('');
    socket.emit('message:send', { roomId, text });
    setInput('');
    inputRef.current?.focus();
  }

  function leaveRoom() {
    if (leaving) return;
    setLeaving(true);
    socket.emit('room:leave', { roomId });
  }

  const otherUsers = roomUsers.filter((u) => u !== username);

  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh', background: '#070B10' }}
    >
      <div
        className="flex flex-col flex-1 overflow-hidden m-2 sm:m-3 rounded-2xl"
        style={{
          border:    '1px solid rgba(148,163,184,0.1)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        {/* Navbar */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-5 sm:px-6 gap-4"
          style={{
            height:       '64px',
            background:   'rgba(10,14,22,0.98)',
            borderBottom: '1px solid rgba(148,163,184,0.09)',
          }}
        >
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={leaveRoom}
              disabled={leaving}
              className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-white transition-colors flex-shrink-0 disabled:opacity-50"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <div
              className="w-px h-5 flex-shrink-0"
              style={{ background: 'rgba(148,163,184,0.12)' }}
            />

            <div className="flex items-center gap-2 min-w-0">
              <Hash size={15} className="text-emerald-400 flex-shrink-0" />
              <span className="text-[15px] font-semibold text-white truncate">
                {roomName}
              </span>
            </div>

            <span className="text-[12px] text-gray-500 hidden sm:block flex-shrink-0">
              Public · messages expire after 12h
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Logo size="sm" />
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat column */}
          <div
            className="flex flex-1 flex-col overflow-hidden"
            style={{ background: 'rgba(8,12,20,0.85)' }}
          >
            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
              {/* System: joined banner */}
              <SystemMessage
                text={`You joined #${roomName.toLowerCase()}. Say hello!`}
              />

              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isSelf={msg.sender === username}
                />
              ))}

              {/* Invisible anchor — scrolled into view on new messages */}
              <div ref={messagesEndRef} />
            </div>

            {/* Inline error banner */}
            {msgError && (
              <div
                className="flex-shrink-0 mx-5 mb-2 px-4 py-2 rounded-xl text-[12.5px] text-red-400"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border:     '1px solid rgba(239,68,68,0.2)',
                }}
              >
                {msgError}
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
                    background: 'rgba(255,255,255,0.04)',
                    border:     '1px solid rgba(148,163,184,0.1)',
                    height:     '44px',
                  }}
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      if (msgError) setMsgError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={`Message #${roomName.toLowerCase()}…`}
                    maxLength={500}
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 transition-opacity disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    boxShadow:  '0 4px 16px rgba(16,185,129,0.3)',
                  }}
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Online users sidebar (desktop only) */}
          <aside
            className="hidden lg:flex flex-col flex-shrink-0 overflow-y-auto"
            style={{
              width:      '220px',
              background: 'rgba(10,14,22,0.9)',
              borderLeft: '1px solid rgba(148,163,184,0.08)',
              padding:    '20px 16px',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-gray-500" />
              <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">
                Online — {roomUsers.length}
              </span>
            </div>

            <div className="space-y-2">
              <UserRow name={username} isYou />
              {otherUsers.map((name) => (
                <UserRow key={name} name={name} />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SystemMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-center">
      <span
        className="text-[11.5px] text-gray-500 px-3 py-1 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border:     '1px solid rgba(148,163,184,0.08)',
        }}
      >
        {text}
      </span>
    </div>
  );
}

function MessageBubble({
  msg,
  isSelf,
}: {
  msg: PublicMessage;
  isSelf: boolean;
}) {
  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex flex-col gap-1 max-w-[72%] ${isSelf ? 'items-end' : 'items-start'}`}
      >
        {/* Sender + timestamp */}
        <div
          className={`flex items-center gap-2 ${isSelf ? 'flex-row-reverse' : ''}`}
        >
          <span className="text-[11.5px] font-semibold text-gray-400">
            {isSelf ? 'You' : msg.sender}
          </span>
          <span className="text-[10.5px] text-gray-600">
            {formatTime(msg.createdAt)}
          </span>
        </div>

        {/* Bubble */}
        <div
          className="px-3.5 py-2 rounded-2xl text-[13.5px] text-white leading-relaxed break-words"
          style={
            isSelf
              ? {
                  background: 'rgba(16,185,129,0.15)',
                  border:     '1px solid rgba(16,185,129,0.25)',
                }
              : {
                  background: 'rgba(255,255,255,0.05)',
                  border:     '1px solid rgba(148,163,184,0.1)',
                }
          }
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
}

function UserRow({ name, isYou = false }: { name: string; isYou?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
      <div className="relative flex-shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)' }}
        >
          {name[0]?.toUpperCase()}
        </div>
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0a0e16]"
          style={{ background: '#22C55E' }}
        />
      </div>
      <span className="text-[13px] text-white font-medium truncate">{name}</span>
      {isYou && (
        <span className="text-[10px] text-emerald-400 ml-auto flex-shrink-0">
          you
        </span>
      )}
    </div>
  );
}
