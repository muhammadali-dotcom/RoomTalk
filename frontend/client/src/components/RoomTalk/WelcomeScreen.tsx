'use client';

import { Users, MessageSquare, Shield, Send } from 'lucide-react';
import Logo from './Logo';
import UsernameModal from './UsernameModal';

interface Props {
  onEnter: (username: string) => void;
}

const FEATURES = [
  {
    icon: Users,
    color: 'text-emerald-400',
    bg: 'rgba(52,211,153,0.1)',
    border: 'rgba(52,211,153,0.2)',
    title: 'Join Rooms',
    desc: 'Explore topic-based rooms and join instantly.',
  },
  {
    icon: MessageSquare,
    color: 'text-blue-400',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.2)',
    title: 'Public & Private',
    desc: 'Chat in rooms or have private 1-on-1 conversations.',
  },
  {
    icon: Shield,
    color: 'text-yellow-400',
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.2)',
    title: 'Temporary Chats',
    desc: 'Sessions are stored temporarily and cleaned up after 12 hours.',
  },
];

const PREVIEW_MSGS = [
  { sender: 'Ali',   initials: 'A', color: '#10B981', text: 'Anyone working on Socket.IO today?' },
  { sender: 'Rafay', initials: 'R', color: '#60A5FA', text: "Yes, I'm testing private messages." },
  { sender: 'Ayaz',  initials: 'Y', color: '#A78BFA', text: 'Redis TTL is working perfectly! 🚀' },
];

export default function WelcomeScreen({ onEnter }: Props) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-5"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 15% 40%, rgba(16,185,129,0.05) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 20%, rgba(59,130,246,0.05) 0%, transparent 55%), #070B10',
      }}
    >
      {/* ── Outer app border ──────────────────────────────────────── */}
      <div
        className="relative w-full max-w-6xl rounded-2xl overflow-hidden"
        style={{
          background:  'rgba(10,15,24,0.97)',
          border:      '1px solid rgba(148,163,184,0.11)',
          boxShadow:   '0 40px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
          minHeight:   'min(700px, 92vh)',
        }}
      >
        {/* Subtle top-edge glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)' }}
        />

        {/* ── Logo ─────────────────────────────────────────────────── */}
        <div className="absolute top-5 left-6 z-10">
          <Logo size="md" />
        </div>

        {/* ── Two-column grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">

          {/* LEFT — hero + features + preview ─────────────────────── */}
          <div className="flex flex-col justify-between px-7 sm:px-10 pt-20 pb-8">

            {/* Headline */}
            <div>
              <h1
                className="text-[36px] sm:text-[44px] font-bold text-white leading-[1.15] tracking-tight"
              >
                Real-time conversations,
                <br />
                organized by{' '}
                <span
                  className="text-emerald-400"
                  style={{ textShadow: '0 0 32px rgba(52,211,153,0.45)' }}
                >
                  rooms.
                </span>
              </h1>

              <p className="mt-4 text-[14.5px] text-gray-400 leading-relaxed max-w-[420px]">
                Join topic-based rooms, chat publicly with members, start private
                conversations, and more.
              </p>

              {/* Feature cards */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FEATURES.map(({ icon: Icon, color, bg, border, title, desc }) => (
                  <div
                    key={title}
                    className="p-4 rounded-xl transition-colors"
                    style={{
                      background: 'rgba(255,255,255,0.022)',
                      border:     '1px solid rgba(148,163,184,0.08)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(148,163,184,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(148,163,184,0.08)';
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: bg, border: `1px solid ${border}` }}
                    >
                      <Icon size={16} className={color} />
                    </div>
                    <div className="text-[13px] font-semibold text-white mb-1">{title}</div>
                    <div className="text-[12px] text-gray-500 leading-relaxed">{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat preview card */}
            <div
              className="mt-6 rounded-xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border:     '1px solid rgba(148,163,184,0.09)',
              }}
            >
              {/* Card header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
                    style={{ boxShadow: '0 0 7px rgba(52,211,153,0.7)' }}
                  />
                  <span className="text-[13px] font-semibold text-white">Developers Room</span>
                </div>
                <span
                  className="text-[11px] font-medium text-emerald-400 px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(52,211,153,0.1)',
                    border:     '1px solid rgba(52,211,153,0.2)',
                  }}
                >
                  4 online
                </span>
              </div>

              {/* Messages */}
              <div className="px-4 py-3 space-y-2.5">
                {PREVIEW_MSGS.map((m) => (
                  <div key={m.sender} className="flex items-start gap-2.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                      style={{ background: m.color + '28', border: `1px solid ${m.color}40` }}
                    >
                      {m.initials}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[12px] font-semibold mr-1.5" style={{ color: m.color }}>
                        {m.sender}
                      </span>
                      <span className="text-[12px] text-gray-300">{m.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input bar */}
              <div
                className="px-4 py-3"
                style={{ borderTop: '1px solid rgba(148,163,184,0.07)' }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(148,163,184,0.06)' }}
                >
                  <span className="flex-1 text-[12px] text-gray-600 select-none">
                    Type a message…
                  </span>
                  <Send size={13} className="text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — username modal ──────────────────────────────── */}
          <div
            className="flex items-center justify-center px-6 py-12 lg:py-0"
            style={{ borderLeft: '1px solid rgba(148,163,184,0.06)' }}
          >
            <div className="w-full max-w-[420px]">
              <UsernameModal onContinue={onEnter} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
