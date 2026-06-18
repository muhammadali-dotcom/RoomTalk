'use client';

import { useState } from 'react';
import { Hash, MessageSquare, Users, Settings, Signal } from 'lucide-react';
import Logo from './Logo';

const NAV_ITEMS = [
  { key: 'rooms',    label: 'Rooms',           icon: Hash,          badge: null },
  { key: 'dms',      label: 'Direct Messages', icon: MessageSquare, badge: '2' },
  { key: 'friends',  label: 'Friends',         icon: Users,         badge: null },
  { key: 'settings', label: 'Settings',        icon: Settings,      badge: null },
];

interface Props {
  activeTab?: string;
  onTabChange?: (key: string) => void;
}

export default function Sidebar({ activeTab = 'rooms', onTabChange }: Props) {
  const [active, setActive] = useState(activeTab);

  function select(key: string) {
    setActive(key);
    onTabChange?.(key);
  }

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
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}>
        <Logo size="md" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => select(key)}
            className={`rt-sidebar-item w-full text-left ${active === key ? 'active' : ''}`}
          >
            <Icon size={17} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && (
              <span
                className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  background: 'rgba(239,68,68,0.18)',
                  border:     '1px solid rgba(239,68,68,0.3)',
                  color:      '#F87171',
                }}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
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
              style={{
                background: '#22C55E',
                boxShadow:  '0 0 6px rgba(34,197,94,0.7)',
              }}
            />
            <span className="text-[13px] font-semibold text-white">Online</span>
            <Signal size={12} className="text-gray-500 ml-auto" />
          </div>
          <p className="text-[11.5px] text-gray-500 pl-4">Connected to chat server</p>
        </div>
      </div>
    </aside>
  );
}
