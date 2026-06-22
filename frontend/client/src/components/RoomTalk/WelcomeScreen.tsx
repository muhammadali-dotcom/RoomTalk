"use client";

import { useState } from "react";
import { Users, MessageSquare, Shield, MessageCircle, Check, Hash, LogIn, Clock } from "lucide-react";
import Logo from "./Logo";
import UsernameModal from "./UsernameModal";
import ThemeToggle from "@/components/theme/ThemeToggle";

const FEATURES = [
  {
    icon: Users,
    color: "text-emerald-400",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.2)",
    title: "Join Rooms",
    desc: "Explore topic-based rooms and join instantly.",
  },
  {
    icon: MessageSquare,
    color: "text-blue-400",
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.2)",
    title: "Public & Private",
    desc: "Chat in rooms or have private 1-on-1 conversations.",
  },
  {
    icon: Shield,
    color: "text-yellow-400",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.2)",
    title: "Temporary Chats",
    desc: "Sessions are stored temporarily and cleaned up after 12 hours.",
  },
];

export default function WelcomeScreen() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-5"
      style={{ background: "var(--rt-bg-page-gradient)" }}
    >
      {/* ── Outer app border ──────────────────────────────────────── */}
      <div
        className="relative w-full max-w-6xl rounded-2xl overflow-hidden"
        style={{
          background: "var(--rt-bg-card)",
          border: "1px solid var(--rt-border)",
          boxShadow: "var(--rt-shadow-page)",
        }}
      >
        {/* Subtle top-edge glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(52,211,153,0.3), transparent)",
          }}
        />

        {/* ── Navbar ──────────────────────────────────────────────── */}
        <header
          className="flex items-center justify-between px-6 sm:px-8 py-4"
          style={{ borderBottom: "1px solid var(--rt-border-soft)" }}
        >
          <Logo size="md" />
          <ThemeToggle />
        </header>

        {/* ── Two-column grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* LEFT — hero + features ─────────────────────────────── */}
          <div className="flex flex-col justify-center px-7 sm:px-10 py-10 lg:py-14">
            {/* Headline */}
            <h1 className="text-[36px] sm:text-[44px] font-bold text-slate-900 dark:text-white leading-[1.15] tracking-tight">
              Real-time conversations,
              <br />
              organized by{" "}
              <span
                className="text-emerald-600 dark:text-emerald-400"
                style={{ textShadow: "0 0 32px rgba(52,211,153,0.45)" }}
              >
                rooms.
              </span>
            </h1>

            <p className="mt-4 text-[14.5px] text-slate-500 dark:text-gray-400 leading-relaxed max-w-[420px]">
              Join topic-based rooms, chat publicly with members, start private
              conversations, and more — no account needed.
            </p>

            {/* Feature cards */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FEATURES.map(
                ({ icon: Icon, color, bg, border, title, desc }) => (
                  <div
                    key={title}
                    className="p-4 rounded-xl transition-colors"
                    style={{
                      background: "var(--rt-bg-surface2)",
                      border: "1px solid var(--rt-border)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--rt-border-strong)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--rt-border)";
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                      style={{ background: bg, border: `1px solid ${border}` }}
                    >
                      <Icon size={16} className={color} />
                    </div>
                    <div className="text-[13px] font-semibold text-slate-900 dark:text-white mb-1">
                      {title}
                    </div>
                    <div className="text-[12px] text-slate-500 dark:text-gray-500 leading-relaxed">
                      {desc}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* RIGHT — anonymous entry panel ──────────────────────── */}
          <div
            className="hidden lg:flex flex-col justify-center px-8 py-14"
            style={{ borderLeft: "1px solid var(--rt-border-soft)" }}
          >
            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--rt-bg-surface2)",
                border: "1px solid var(--rt-border)",
                boxShadow: "var(--rt-shadow-card)",
                backdropFilter: "blur(16px)",
              }}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(52,211,153,0.12)",
                    border: "1px solid rgba(52,211,153,0.25)",
                    boxShadow: "0 0 18px rgba(52,211,153,0.15)",
                  }}
                >
                  <MessageCircle size={16} className="text-emerald-400" />
                </div>
                <div>
                  <div className="text-[15px] font-semibold text-slate-900 dark:text-white leading-tight">
                    Start chatting anonymously
                  </div>
                  <div className="text-[12px] text-slate-500 dark:text-gray-500 mt-0.5">
                    No signup. Pick a temporary name and enter a room.
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div
                className="mb-5"
                style={{ borderTop: "1px solid var(--rt-border-soft)" }}
              />

              {/* Temporary name field */}
              <div className="mb-4">
                <label className="block text-[11.5px] font-medium text-slate-500 dark:text-gray-400 mb-1.5 tracking-wide uppercase">
                  Temporary name
                </label>
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{
                    background: "var(--rt-bg-surface2)",
                    border: "1px solid var(--rt-border)",
                  }}
                >
                  <span className="flex-1 text-[13.5px] text-slate-600 dark:text-gray-300 select-none font-mono">
                    Guest-4821
                  </span>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(52,211,153,0.15)",
                      border: "1px solid rgba(52,211,153,0.3)",
                    }}
                  >
                    <Check size={11} className="text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Choose a room */}
              <div className="mb-5">
                <label className="block text-[11.5px] font-medium text-slate-500 dark:text-gray-400 mb-1.5 tracking-wide uppercase">
                  Choose a room
                </label>
                <div className="space-y-2">
                  {/* Selected room */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                    style={{
                      background: "rgba(52,211,153,0.08)",
                      border: "1px solid rgba(52,211,153,0.3)",
                      boxShadow: "0 0 16px rgba(52,211,153,0.06)",
                    }}
                  >
                    <Hash size={14} className="text-emerald-400 flex-shrink-0" />
                    <span className="flex-1 text-[13px] font-medium text-slate-900 dark:text-white">
                      Open Chat
                    </span>
                    <span
                      className="text-[11px] font-medium text-emerald-400 px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(52,211,153,0.12)",
                        border: "1px solid rgba(52,211,153,0.25)",
                      }}
                    >
                      12 online
                    </span>
                  </div>

                  {/* Neutral rooms */}
                  {[
                    { name: "Tech Talk", count: "8 online" },
                    { name: "Chill Room", count: "5 online" },
                  ].map((room) => (
                    <div
                      key={room.name}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors"
                      style={{
                        background: "var(--rt-bg-surface2)",
                        border: "1px solid var(--rt-border)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--rt-border-strong)";
                        e.currentTarget.style.background = "var(--rt-bg-surface2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--rt-border)";
                        e.currentTarget.style.background = "var(--rt-bg-surface2)";
                      }}
                    >
                      <Hash size={14} className="text-slate-400 dark:text-gray-600 flex-shrink-0" />
                      <span className="flex-1 text-[13px] font-medium text-slate-500 dark:text-gray-400">
                        {room.name}
                      </span>
                      <span
                        className="text-[11px] text-slate-400 dark:text-gray-600 px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--rt-bg-surface2)",
                          border: "1px solid var(--rt-border-soft)",
                        }}
                      >
                        {room.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold text-white transition-all active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  boxShadow: "0 6px 24px rgba(16,185,129,0.35)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 30px rgba(16,185,129,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 6px 24px rgba(16,185,129,0.35)";
                }}
              >
                Enter Room
                <LogIn size={15} />
              </button>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400 dark:text-gray-600">
                <Clock size={11} className="flex-shrink-0" />
                Text-only · Auto-clears after 12h
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal overlay ────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <UsernameModal onClose={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
}
