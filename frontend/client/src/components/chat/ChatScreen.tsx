'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Send, ArrowLeft, Users, Hash } from 'lucide-react';
import Logo from '@/components/RoomTalk/Logo';

const ROOM_LABELS: Record<string, string> = {
  developers: 'Developers',
  marketing:  'Marketing',
  hr:         'HR',
  general:    'General',
  gaming:     'Gaming',
};

interface Props {
  roomId:   string;
  username: string;
}

export default function ChatScreen({ roomId, username }: Props) {
  const [message, setMessage] = useState('');
  const router = useRouter();

  const roomName = ROOM_LABELS[roomId] ?? roomId;

  return (
    <div
      className="flex flex-col"
      style={{
        height:     '100dvh',
        background: '#070B10',
      }}
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
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-white transition-colors flex-shrink-0"
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
              <span className="text-[15px] font-semibold text-white truncate">{roomName}</span>
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
          {/* Chat area */}
          <div className="flex flex-1 flex-col overflow-hidden" style={{ background: 'rgba(8,12,20,0.85)' }}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
              {/* Placeholder system message */}
              <div className="flex justify-center">
                <span
                  className="text-[11.5px] text-gray-500 px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border:     '1px solid rgba(148,163,184,0.08)',
                  }}
                >
                  You joined <strong className="text-gray-400">{roomName}</strong>. Say hello!
                </span>
              </div>
            </div>

            {/* Input bar */}
            <div
              className="flex-shrink-0 px-5 py-4"
              style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 flex items-center gap-3 px-4 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border:     '1px solid rgba(148,163,184,0.1)',
                    height:     '44px',
                  }}
                >
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Message #${roomName.toLowerCase()}…`}
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                  />
                </div>
                <button
                  className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 transition-opacity disabled:opacity-40"
                  disabled={!message.trim()}
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

          {/* Online users sidebar */}
          <aside
            className="hidden lg:flex flex-col flex-shrink-0 overflow-y-auto"
            style={{
              width:       '220px',
              background:  'rgba(10,14,22,0.9)',
              borderLeft:  '1px solid rgba(148,163,184,0.08)',
              padding:     '20px 16px',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Users size={14} className="text-gray-500" />
              <span className="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">
                Online — 1
              </span>
            </div>

            <div className="space-y-2">
              {/* Current user */}
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)' }}
                  >
                    {username[0]?.toUpperCase()}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0a0e16]"
                    style={{ background: '#22C55E' }}
                  />
                </div>
                <span className="text-[13px] text-white font-medium truncate">{username}</span>
                <span className="text-[10px] text-emerald-400 ml-auto flex-shrink-0">you</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
