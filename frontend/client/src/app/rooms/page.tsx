import React from 'react';
import RoomCard from '../../../components/rooms/RoomCard';
import { ROOMS } from '../../../lib/constants';
import UsernameForm from '../../../components/username/UsernameForm';
import { Search, Plus, Users } from 'lucide-react';

export default function RoomsPage() {
  return (
    <div className="container-panel p-6 flex gap-6">
      <div className="w-1/2 pr-4">
        <div className="h-[620px] rounded-md p-6 flex flex-col justify-between">
          <div>
            <div className="logo-sm">RoomTalk</div>
            <h2 className="text-3xl font-bold mt-4">Real-time conversations, organized by rooms.</h2>
            <p className="text-[14px] muted mt-2">Join topic-based rooms, chat publicly with members, start private conversations, and more.</p>
          </div>

          <div className="w-full max-w-[420px] mx-auto">
            <UsernameForm />
          </div>

          <div className="text-[13px] small-muted text-center">Chats are temporary and automatically deleted after 12 hours.</div>
        </div>
      </div>

      <div className="w-1/2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Users size={18} /> Available Rooms</h3>
            <div className="small-muted">Join a room to start chatting with others</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#07121a] rounded p-2 border border-[rgba(255,255,255,0.02)]">
              <Search size={16} className="text-[var(--text-muted)]" />
              <input className="bg-transparent outline-none text-sm" placeholder="Search rooms" />
            </div>
            <button className="px-3 py-1 rounded bg-transparent border border-[rgba(255,255,255,0.03)] text-[var(--text-secondary)] flex items-center gap-2"><Plus size={14}/>Create</button>
            <div className="avatar-stack">
              <img src="/avatar1.svg" alt="a" />
              <img src="/avatar2.svg" alt="b" />
              <img src="/avatar3.svg" alt="c" />
            </div>
          </div>
        </div>

        <div className="room-list-scroll">
          {ROOMS.map((r) => (
            <RoomCard key={r.id} room={r} onJoin={() => alert('Join ' + r.name)} />
          ))}
        </div>
      </div>
    </div>
  );
}
