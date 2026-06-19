import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

export interface RoomDef {
  id:           string;
  name:         string;
  description:  string;
  active:       number;
  icon:         ReactNode;
  iconBg:       string;
  iconBorder:   string;
  iconColor:    string;
  avatarColors: string[];
}

interface Props {
  room:     RoomDef;
  joining?: boolean;
  onJoin:   () => void;
}

export default function RoomCard({ room, joining = false, onJoin }: Props) {
  return (
    <div className="rt-room-card flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Icon box */}
      <div
        className="flex-shrink-0 w-[72px] h-[72px] rounded-xl flex items-center justify-center"
        style={{
          background: room.iconBg,
          border:     `1px solid ${room.iconBorder}`,
          boxShadow:  `0 0 16px ${room.iconBg}`,
          color:      room.iconColor,
        }}
      >
        {room.icon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-[15px] font-semibold text-white">{room.name}</h3>
          <span
            className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border:     '1px solid rgba(148,163,184,0.1)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#22C55E', boxShadow: '0 0 4px rgba(34,197,94,0.8)' }}
            />
            {room.active} active
          </span>
        </div>

        <p className="mt-1 text-[12.5px] text-gray-400 leading-relaxed line-clamp-1">
          {room.description}
        </p>

        <div className="mt-2.5 flex items-center gap-2">
          <span className="text-[11.5px] text-gray-500">
            {room.active === 0
              ? 'No one here yet — be the first!'
              : `${room.active} ${room.active === 1 ? 'member' : 'members'} chatting`}
          </span>
        </div>
      </div>

      {/* Join button */}
      <div className="flex-shrink-0">
        <button
          onClick={onJoin}
          disabled={joining}
          className="rt-btn-outline flex items-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {joining ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Joining…
            </>
          ) : (
            <>
              Join Room
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
