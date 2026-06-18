import React from 'react';
import { Send, LogOut } from 'lucide-react';

function MessageBubble({ sender, text, mine }: { sender: string; text: string; mine?: boolean }) {
  return (
    <div className={`mb-3 max-w-[70%] ${mine ? 'ml-auto bg-[#05302a] text-[#DFFAF0] rounded-md px-4 py-2' : 'bg-[#0E1519] rounded-md px-4 py-2'}`}>
      {!mine && <div className="text-[12px] secondary font-semibold">{sender}</div>}
      <div className="text-sm mt-1">{text}</div>
      <div className="text-[11px] small-muted mt-1">10:30</div>
    </div>
  );
}

export default function ChatRoomPage({ params }: { params: { room: string } }) {
  const { room } = params;
  return (
    <div className="container-panel p-4 flex gap-4">
      <aside className="w-72 pr-4 border-r border-[rgba(255,255,255,0.03)]">
        <div className="mb-4 logo-sm">RoomTalk</div>
        <div className="text-[13px] small-muted">Online Users</div>
        <ul className="mt-3 space-y-3">
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#08131b] flex items-center justify-center">R</div>
              <div>Rafay</div>
            </div>
            <div className="pill">2</div>
          </li>
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#08131b] flex items-center justify-center">A</div>
              <div>Asim</div>
            </div>
            <div className="pill">1</div>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#08131b] flex items-center justify-center">Y</div>
            <div>Ayaz</div>
          </li>
        </ul>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">{room}</h2>
            <div className="text-[12px] small-muted">Public chat — messages expire after 12 hours</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-1 rounded bg-transparent border border-[rgba(255,255,255,0.03)] secondary flex items-center gap-2"><LogOut size={14}/>Leave Room</button>
          </div>
        </header>

        <div className="flex-1 rounded-md bg-[#0B1416] p-6 overflow-y-auto">
          <MessageBubble sender="Rafay" text="We are discussing Socket.io" />
          <MessageBubble sender="Asim" text="Redis TTL is useful" />
          <MessageBubble sender="Ayaz" text="Nice" />
          <MessageBubble sender="You" text="Hello everyone" mine />
        </div>

        <div className="mt-3">
          <div className="flex gap-3">
            <input className="flex-1 p-3 rounded bg-[#08121a] border border-[rgba(255,255,255,0.03)]" placeholder="Type a message..." />
            <button className="accent-btn flex items-center gap-2"><Send size={16} />Send</button>
          </div>
        </div>
      </main>

      <aside className="w-80 pl-4">
        <div className="mb-4 logo-sm">Private Chats</div>
        <div className="text-[12px] small-muted">Select a user to open a private chat.</div>
        <ul className="mt-3 space-y-3">
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#08131b] flex items-center justify-center">R</div>
              <div>Rafay</div>
            </div>
            <div className="pill">2</div>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#08131b] flex items-center justify-center">A</div>
            <div>Asim</div>
          </li>
        </ul>
      </aside>
    </div>
  );
}
