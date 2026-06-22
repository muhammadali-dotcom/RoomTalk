'use client';

import { Hash, Lock } from 'lucide-react';
import { getUserColor, getUserAvatarLabel } from '@/lib/user-style';

export interface DmUser {
  username: string;
  unreadCount: number;
}

interface Props {
  dmList?:      DmUser[];
  onDmClick?:   (username: string) => void;
  onRoomsClick?: () => void;
  activeDM?:    string | null;
}

export default function Sidebar({
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
        background:  'rgba(10,14,22,0.95)',
        borderRight: '1px solid rgba(148,163,184,0.09)',
      }}
    >
      {/* Nav area */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {/* Rooms button */}
        <button
          onClick={() => onRoomsClick?.()}
          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all ${
            !activeDM
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Hash size={15} className="flex-shrink-0" />
          <span className="font-medium">Rooms</span>
        </button>

        {/* Direct Messages section */}
        {dmList.length > 0 ? (
          <div>
            <div className="px-2 pb-2" style={{ borderTop: '1px solid rgba(148,163,184,0.07)', paddingTop: '12px' }}>
              <div className="flex items-center gap-2">
                <Lock size={11} className="text-gray-500 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  Direct Messages
                </span>
              </div>
            </div>

            <div className="space-y-0.5">
              {dmList.map((dm) => {
                const isActive    = activeDM === dm.username;
                const hasUnread   = dm.unreadCount > 0 && !isActive;
                const avatarColor = getUserColor(dm.username);

                return (
                  <button
                    key={dm.username}
                    onClick={() => onDmClick?.(dm.username)}
                    className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-violet-500/10 border border-violet-500/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ${avatarColor}`}
                    >
                      {getUserAvatarLabel(dm.username)}
                    </div>
                    <span
                      className={`text-[13px] font-medium truncate ${
                        isActive ? 'text-violet-300' : hasUnread ? 'text-white' : 'text-gray-400'
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
                      <Lock size={10} className="text-violet-400 ml-auto flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="px-2 pt-2" style={{ borderTop: '1px solid rgba(148,163,184,0.07)', paddingTop: '12px' }}>
            <span className="text-[11px] text-gray-600">No direct messages yet</span>
          </div>
        )}
      </nav>

      {/* Status card */}
      <div className="px-3 pb-4">
        <div
          className="px-4 py-3 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.025)',
            border:     '1px solid rgba(148,163,184,0.08)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }}
            />
            <span className="text-[13px] font-semibold text-white">Online</span>
          </div>
          <p className="text-[11.5px] text-gray-500 pl-4">Connected to chat server</p>
        </div>
      </div>
    </aside>
  );
}
