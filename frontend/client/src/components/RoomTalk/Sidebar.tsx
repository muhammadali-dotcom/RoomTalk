'use client';

import { Hash, Lock } from 'lucide-react';
import { getUserColor, getUserAvatarLabel } from '@/lib/user-style';

export interface DmUser {
  username: string;
  unreadCount: number;
}

interface Props {
  username?: string;
  dmList?: DmUser[];
  onDmClick?: (username: string) => void;
  onRoomsClick?: () => void;
  activeDM?: string | null;
}

export default function Sidebar({
  username = '',
  dmList = [],
  onDmClick,
  onRoomsClick,
  activeDM = null,
}: Props) {
  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width:       '260px',
        minWidth:    '260px',
        background:  'var(--rt-bg-sidebar)',
        borderRight: '1px solid var(--rt-border-soft)',
      }}
    >
      {/* Nav area */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {/* Rooms button */}
        <button
          onClick={() => onRoomsClick?.()}
          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all ${
            !activeDM
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300'
              : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Hash size={15} className="flex-shrink-0" />
          <span className="font-medium">Rooms</span>
        </button>

        {/* Direct Messages section */}
        {dmList.length > 0 ? (
          <div>
            <div
              className="px-2 pb-2"
              style={{ borderTop: '1px solid var(--rt-border-soft)', paddingTop: '12px' }}
            >
              <div className="flex items-center gap-2">
                <Lock size={11} className="text-slate-400 dark:text-gray-500 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wide">
                  Direct Messages
                </span>
              </div>
            </div>

            <div className="space-y-0.5">
              {dmList.map((dm) => {
                const isActive  = activeDM === dm.username;
                const hasUnread = dm.unreadCount > 0 && !isActive;
                const avatarColor = getUserColor(dm.username);

                return (
                  <button
                    key={dm.username}
                    onClick={() => onDmClick?.(dm.username)}
                    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ${avatarColor}`}
                    >
                      {getUserAvatarLabel(dm.username)}
                    </div>
                    <span
                      className={`text-[13px] font-medium truncate ${
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : hasUnread
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-gray-400'
                      }`}
                    >
                      {dm.username}
                    </span>
                    {hasUnread && (
                      <span
                        className="ml-auto flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                        style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                      >
                        {dm.unreadCount > 99 ? '99+' : dm.unreadCount}
                      </span>
                    )}
                    {isActive && (
                      <Lock size={10} className="text-emerald-500 dark:text-emerald-400 ml-auto flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            className="px-2 pt-2"
            style={{ borderTop: '1px solid var(--rt-border-soft)', paddingTop: '12px' }}
          >
            <span className="text-[11px] text-slate-400 dark:text-gray-600">No direct messages yet</span>
          </div>
        )}
      </nav>

      {/* Status card */}
      <div className="px-3 pb-4">
        <div
          className="px-4 py-3 rounded-xl"
          style={{
            background: 'var(--rt-bg-surface)',
            border:     '1px solid var(--rt-border-soft)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }}
            />
            <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{username}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
