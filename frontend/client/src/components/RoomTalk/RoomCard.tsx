import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

export interface RoomDef {
  id:          string;
  name:        string;
  description: string;
  active:      number;
  icon:        ReactNode;
  iconBg:      string;
  iconBorder:  string;
  iconColor:   string;
  avatarColors: string[];
}

interface Props {
  room:   RoomDef;
  onJoin: () => void;
}

export default function RoomCard({ room, onJoin }: Props) {
  const initials = ['A', 'R', 'Y', 'S', 'M'];

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

        {/* Avatar stack */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex items-center">
            {room.avatarColors.slice(0, 4).map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{
                  background:  color + '30',
                  border:      `2px solid rgba(10,14,22,0.95)`,
                  marginLeft:  i === 0 ? 0 : '-6px',
                  zIndex:      10 - i,
                  boxShadow:   `0 0 0 1px ${color}50`,
                  position:    'relative',
                }}
              >
                {initials[i]}
              </div>
            ))}
          </div>
          <span className="text-[11.5px] text-gray-500">{room.active} members chatting</span>
        </div>
      </div>

      {/* Join button */}
      <div className="flex-shrink-0">
        <button
          onClick={onJoin}
          className="rt-btn-outline flex items-center gap-2 group"
        >
          Join Room
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
