import React from 'react';
import { Users } from 'lucide-react';

export default function RoomCard({ room, onJoin }: { room: any; onJoin?: () => void }) {
  return (
    <div className="room-card flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-md bg-[#0B1318] flex items-center justify-center text-sm font-semibold">{room.name[0]}</div>
        <div>
          <div className="text-sm font-semibold">{room.name}</div>
          <div className="text-[12px] muted">{room.description}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="pill text-[13px] flex items-center gap-2"><Users size={14} />{room.active} active</div>
        <button onClick={onJoin} className="accent-btn flex items-center gap-2"><Users size={14} />Join Room</button>
      </div>
    </div>
  );
}
