'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, User, Shield, Smile } from 'lucide-react';
import { socket } from '@/lib/socket';
import { useUserStore } from '@/store/useUserStore';

interface Props {
  onClose?: () => void;
}

export default function UsernameModal({ onClose }: Props) {
  const [username, setUsername] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const setStoreUsername = useUserStore((s) => s.setUsername);
  const router = useRouter();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    function onAccepted({ username }: { username: string }) {
      setLoading(false);
      setStoreUsername(username);
      router.push('/dashboard');
    }

    function onUserError({ message }: { message: string }) {
      setLoading(false);
      setError(message);
    }

    function onConnectError() {
      setLoading(false);
      setError('Cannot reach the server. Make sure the backend is running and refresh.');
    }

    function onDisconnect() {
      setLoading(false);
      setError('Connection lost. Please refresh and try again.');
    }

    socket.on('user:accepted', onAccepted);
    socket.on('user:error', onUserError);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('user:accepted', onAccepted);
      socket.off('user:error', onUserError);
      socket.off('connect_error', onConnectError);
      socket.off('disconnect', onDisconnect);
    };
  }, [setStoreUsername, router]);

  function submit() {
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Username is required');
      return;
    }
    if (!socket.connected) {
      setError('Not connected to server. Please wait a moment and try again.');
      return;
    }
    setError('');
    setLoading(true);
    socket.emit('user:join', { username: trimmed });
  }

  return (
    <div
      className="w-full max-w-[420px] rounded-2xl relative"
      style={{
        background:     'var(--rt-bg-card)',
        border:         '1px solid var(--rt-border)',
        padding:        '36px 32px 28px',
        boxShadow:      'var(--rt-shadow-page), 0 0 0 1px rgba(52,211,153,0.07), 0 0 60px rgba(52,211,153,0.04)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
        >
          <X size={15} />
        </button>
      )}

      {/* Top icon */}
      <div className="flex flex-col items-center mb-7">
        <div
          className="w-[60px] h-[60px] rounded-full flex items-center justify-center mb-5"
          style={{
            background: 'rgba(52,211,153,0.1)',
            border:     '1px solid rgba(52,211,153,0.25)',
            boxShadow:  '0 0 28px rgba(52,211,153,0.22)',
          }}
        >
          <Smile size={26} className="text-emerald-400" />
        </div>
        <h2 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">Welcome to RoomTalk</h2>
        <p className="text-[13.5px] text-slate-500 dark:text-gray-400 mt-2 text-center leading-relaxed max-w-[300px]">
          Choose your display name to enter the rooms
        </p>
      </div>

      {/* Form */}
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-3.5">
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <User size={15} className="text-slate-400 dark:text-gray-500" />
          </div>
          <input
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            placeholder="Enter username"
            autoFocus
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 outline-none transition-all"
            style={{
              background: 'var(--rt-bg-input)',
              border: error
                ? '1px solid rgba(239,68,68,0.45)'
                : '1px solid var(--rt-border)',
              boxShadow: error ? '0 0 0 3px rgba(239,68,68,0.08)' : undefined,
            }}
            onFocus={(e) => {
              if (!error) {
                e.currentTarget.style.border     = '1px solid rgba(52,211,153,0.4)';
                e.currentTarget.style.boxShadow  = '0 0 0 3px rgba(52,211,153,0.07)';
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.currentTarget.style.border    = '1px solid var(--rt-border)';
                e.currentTarget.style.boxShadow = '';
              }
            }}
          />
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-400">
            <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow:  '0 4px 20px rgba(16,185,129,0.4)',
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.boxShadow = '0 6px 24px rgba(16,185,129,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.4)';
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Entering rooms…
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </form>

      <div className="mt-5 flex items-start gap-2 text-[12px] text-slate-400 dark:text-gray-500 leading-relaxed">
        <Shield size={12} className="text-slate-400 dark:text-gray-600 flex-shrink-0 mt-0.5" />
        <span>Your chats are temporary and automatically deleted after 12 hours.</span>
      </div>
    </div>
  );
}
