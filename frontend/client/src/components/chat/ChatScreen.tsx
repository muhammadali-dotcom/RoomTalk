'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, Users, Hash, Lock } from 'lucide-react';
import Logo from '@/components/RoomTalk/Logo';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { socket } from '@/lib/socket';
import { getUserColor, getUserAvatarLabel, formatMessageTime } from '@/lib/user-style';

const ROOM_LABELS: Record<string, string> = {
  developers: 'Developers',
  marketing:  'Marketing',
  hr:         'HR',
};

interface PublicMessage {
  id:        string;
  roomId:    string;
  sender:    string;
  text:      string;
  type:      'public';
  createdAt: string;
}

interface PrivateMessage {
  id:        string;
  from:      string;
  to:        string;
  text:      string;
  type:      'private';
  createdAt: string;
}

interface DisplayMessage {
  id:        string;
  sender:    string;
  text:      string;
  createdAt: string;
}

interface Props {
  roomId:   string;
  username: string;
}

export default function ChatScreen({ roomId, username }: Props) {
  const router = useRouter();

  const [input, setInput]         = useState('');
  const [messages, setMessages]   = useState<PublicMessage[]>([]);
  const [roomUsers, setRoomUsers] = useState<string[]>([]);
  const [leaving, setLeaving]     = useState(false);
  const [msgError, setMsgError]   = useState('');

  const [activeChat, setActiveChat]           = useState<'public' | 'private'>('public');
  const [selectedUser, setSelectedUser]       = useState<string | null>(null);
  const [directMessages, setDirectMessages]   = useState<string[]>([]);
  const [privateMessages, setPrivateMessages] = useState<Record<string, PrivateMessage[]>>({});
  const [unreadCounts, setUnreadCounts]       = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  const roomName  = ROOM_LABELS[roomId] ?? roomId;
  const isPrivate = activeChat === 'private';

  const displayedMessages: DisplayMessage[] =
    activeChat === 'public'
      ? messages.map((m) => ({ id: m.id, sender: m.sender, text: m.text, createdAt: m.createdAt }))
      : (privateMessages[selectedUser ?? ''] ?? []).map((m) => ({
          id:        m.id,
          sender:    m.from,
          text:      m.text,
          createdAt: m.createdAt,
        }));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, privateMessages, activeChat, selectedUser]);

  useEffect(() => {
    if (!socket.connected) {
      router.replace('/');
      return;
    }

    function onRoomUsers({ users }: { roomId: string; users: string[] }) {
      setRoomUsers(users);
    }

    function onRoomLeft() {
      setMessages([]);
      router.push('/dashboard');
    }

    function onRoomError() {
      router.replace('/dashboard');
    }

    function onMessagesHistory({
      messages: history,
    }: {
      roomId: string;
      messages: PublicMessage[];
    }) {
      setMessages((prev) => {
        if (prev.length === 0) return history;
        const historyIds = new Set(history.map((m) => m.id));
        const live = prev.filter((m) => !historyIds.has(m.id));
        return [...history, ...live];
      });
    }

    function onMessageReceive(msg: PublicMessage) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    }

    function onMessageError({ message }: { message: string }) {
      setMsgError(message);
    }

    function onPrivateHistory({
      withUser,
      messages: history,
    }: {
      withUser: string;
      messages: PrivateMessage[];
    }) {
      setPrivateMessages((prev) => {
        const existing = prev[withUser] ?? [];
        if (existing.length === 0) return { ...prev, [withUser]: history };
        const historyIds = new Set(history.map((m) => m.id));
        const live = existing.filter((m) => !historyIds.has(m.id));
        return { ...prev, [withUser]: [...history, ...live] };
      });
      setDirectMessages((prev) =>
        prev.includes(withUser) ? prev : [...prev, withUser],
      );
    }

    function onPrivateReceive(msg: PrivateMessage) {
      const partner = msg.from === username ? msg.to : msg.from;
      setPrivateMessages((prev) => {
        const existing = prev[partner] ?? [];
        if (existing.some((m) => m.id === msg.id)) return prev;
        return { ...prev, [partner]: [...existing, msg] };
      });
      setDirectMessages((prev) =>
        prev.includes(partner) ? prev : [...prev, partner],
      );
    }

    function onPrivateError({ message }: { message: string }) {
      setMsgError(message);
    }

    socket.on('room:users',       onRoomUsers);
    socket.on('room:left',        onRoomLeft);
    socket.on('room:error',       onRoomError);
    socket.on('messages:history', onMessagesHistory);
    socket.on('message:receive',  onMessageReceive);
    socket.on('message:error',    onMessageError);
    socket.on('private:history',  onPrivateHistory);
    socket.on('private:receive',  onPrivateReceive);
    socket.on('private:error',    onPrivateError);

    socket.emit('room:users:get', { roomId });
    socket.emit('messages:get',   { roomId });

    return () => {
      socket.off('room:users',       onRoomUsers);
      socket.off('room:left',        onRoomLeft);
      socket.off('room:error',       onRoomError);
      socket.off('messages:history', onMessagesHistory);
      socket.off('message:receive',  onMessageReceive);
      socket.off('message:error',    onMessageError);
      socket.off('private:history',  onPrivateHistory);
      socket.off('private:receive',  onPrivateReceive);
      socket.off('private:error',    onPrivateError);
    };
  }, [roomId, router, username]);

  useEffect(() => {
    function onUnreadUpdate({ from, count }: { from: string; count: number }) {
      if (activeChat === 'private' && selectedUser === from) {
        setUnreadCounts((prev) => ({ ...prev, [from]: 0 }));
      } else {
        setUnreadCounts((prev) => ({ ...prev, [from]: count }));
        setDirectMessages((prev) =>
          prev.includes(from) ? prev : [...prev, from],
        );
      }
    }

    socket.on('unread:update', onUnreadUpdate);
    return () => {
      socket.off('unread:update', onUnreadUpdate);
    };
  }, [activeChat, selectedUser]);

  function openPrivateChat(targetUser: string) {
    setSelectedUser(targetUser);
    setActiveChat('private');
    setInput('');
    setMsgError('');
    setUnreadCounts((prev) => ({ ...prev, [targetUser]: 0 }));
    setDirectMessages((prev) =>
      prev.includes(targetUser) ? prev : [...prev, targetUser],
    );
    socket.emit('private:open', { withUser: targetUser });
  }

  function switchToDM(partner: string) {
    setSelectedUser(partner);
    setActiveChat('private');
    setInput('');
    setMsgError('');
    setUnreadCounts((prev) => ({ ...prev, [partner]: 0 }));
    socket.emit('private:open', { withUser: partner });
  }

  function switchToPublic() {
    setActiveChat('public');
    setSelectedUser(null);
    setInput('');
    setMsgError('');
  }

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    if (text.length > 500) {
      setMsgError('Message cannot exceed 500 characters.');
      return;
    }
    setMsgError('');

    if (activeChat === 'private' && selectedUser) {
      socket.emit('private:send', { to: selectedUser, text });
    } else {
      socket.emit('message:send', { roomId, text });
    }

    setInput('');
    inputRef.current?.focus();
  }

  function leaveRoom() {
    if (leaving) return;
    setLeaving(true);
    socket.emit('room:leave', { roomId });
  }

  const otherUsers = roomUsers.filter((u) => u !== username);

  const inputPlaceholder =
    isPrivate && selectedUser
      ? `Message ${selectedUser}…`
      : `Message #${roomName.toLowerCase()}…`;

  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh', background: 'var(--rt-bg-page)' }}
    >
      <div
        className="flex flex-col flex-1 overflow-hidden m-2 sm:m-3 rounded-2xl"
        style={{
          border:    '1px solid var(--rt-border)',
          boxShadow: 'var(--rt-shadow-card)',
        }}
      >
        {/* Navbar */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-5 sm:px-6 gap-4"
          style={{
            height:       '64px',
            background:   'var(--rt-bg-header)',
            borderBottom: '1px solid var(--rt-border-soft)',
          }}
        >
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={leaveRoom}
              disabled={leaving}
              className="flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0 disabled:opacity-50"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <div
              className="w-px h-5 flex-shrink-0"
              style={{ background: 'var(--rt-border)' }}
            />

            <div className="flex items-center gap-2 min-w-0">
              {isPrivate && selectedUser ? (
                <>
                  <Lock size={14} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-[15px] font-semibold text-slate-900 dark:text-white truncate">
                    {selectedUser}
                  </span>
                </>
              ) : (
                <>
                  <Hash size={15} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-[15px] font-semibold text-slate-900 dark:text-white truncate">
                    {roomName}
                  </span>
                </>
              )}
            </div>

            <span
              className="text-[12px] hidden sm:block flex-shrink-0 text-slate-400 dark:text-gray-500"
            >
              {isPrivate
                ? 'Private · messages expire after 12h'
                : 'Public · messages expire after 12h'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
            <Logo size="sm" />
          </div>
        </header>

        {/* Chat mode tab strip */}
        <div
          className="flex-shrink-0 flex items-center gap-1 px-4 py-2"
          style={{
            background:   'var(--rt-bg-header)',
            borderBottom: '1px solid var(--rt-border-soft)',
          }}
        >
          <button
            onClick={switchToPublic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              !isPrivate
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
            }`}
          >
            <Hash size={11} />
            {roomName.toLowerCase()}
          </button>

          {selectedUser && (
            <button
              onClick={() => { setActiveChat('private'); setMsgError(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                isPrivate
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300'
              }`}
            >
              <Lock size={11} />
              {selectedUser}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat column */}
          <div
            className="flex flex-1 flex-col overflow-hidden"
            style={{ background: 'var(--rt-bg-content)' }}
          >
            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
              <SystemMessage
                text={
                  isPrivate && selectedUser
                    ? `Private chat with ${selectedUser}. Only you two can see this.`
                    : `You joined #${roomName.toLowerCase()}. Say hello!`
                }
              />

              {displayedMessages.length === 0 && isPrivate && selectedUser && (
                <div className="flex justify-center pt-4">
                  <span className="text-[12px] text-slate-400 dark:text-gray-600">
                    No messages yet. Say hi!
                  </span>
                </div>
              )}

              {displayedMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isSelf={msg.sender === username}
                />
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Error banner */}
            {msgError && (
              <div
                className="flex-shrink-0 mx-5 mb-2 px-4 py-2 rounded-xl text-[12.5px] text-red-400"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border:     '1px solid rgba(239,68,68,0.2)',
                }}
              >
                {msgError}
              </div>
            )}

            {/* Input bar */}
            <div
              className="flex-shrink-0 px-5 py-4"
              style={{ borderTop: '1px solid var(--rt-border-soft)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 flex items-center px-4 rounded-xl"
                  style={{
                    background: 'var(--rt-bg-input)',
                    border:     '1px solid var(--rt-border)',
                    height:     '44px',
                  }}
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      if (msgError) setMsgError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={inputPlaceholder}
                    maxLength={500}
                    className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 outline-none"
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 transition-opacity disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    boxShadow:  '0 4px 16px rgba(16,185,129,0.3)',
                  }}
                >
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar (desktop only) */}
          <aside
            className="hidden lg:flex flex-col flex-shrink-0 overflow-y-auto"
            style={{
              width:      '220px',
              background: 'var(--rt-bg-sidebar)',
              borderLeft: '1px solid var(--rt-border-soft)',
              padding:    '20px 16px',
            }}
          >
            {/* Online section */}
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-slate-400 dark:text-gray-500" />
              <span className="text-[12px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">
                Online — {roomUsers.length}
              </span>
            </div>

            <div className="space-y-1">
              <UserRow name={username} isYou />
              {otherUsers.map((name) => (
                <UserRow
                  key={name}
                  name={name}
                  isActive={selectedUser === name && isPrivate}
                  onClick={() => openPrivateChat(name)}
                />
              ))}
            </div>

            {otherUsers.length > 0 && (
              <p className="text-[10.5px] text-slate-400 dark:text-gray-600 mt-2 px-2 leading-relaxed">
                Click a user to chat privately
              </p>
            )}

            {/* Direct Messages section */}
            {directMessages.length > 0 && (
              <div className="mt-5">
                <div
                  className="pb-3 mb-2"
                  style={{ borderTop: '1px solid var(--rt-border-soft)', paddingTop: '16px' }}
                >
                  <div className="flex items-center gap-2">
                    <Lock size={12} className="text-slate-400 dark:text-gray-500" />
                    <span className="text-[12px] font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide">
                      Direct Messages
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {directMessages.map((partner) => (
                    <DMRow
                      key={partner}
                      name={partner}
                      isActive={selectedUser === partner && isPrivate}
                      unreadCount={unreadCounts[partner] ?? 0}
                      onClick={() => switchToDM(partner)}
                    />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SystemMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-center">
      <span
        className="text-[11.5px] text-slate-500 dark:text-gray-500 px-3 py-1 rounded-full"
        style={{
          background: 'var(--rt-bg-surface)',
          border:     '1px solid var(--rt-border-soft)',
        }}
      >
        {text}
      </span>
    </div>
  );
}

function MessageBubble({
  msg,
  isSelf,
}: {
  msg:    DisplayMessage;
  isSelf: boolean;
}) {
  if (isSelf) {
    return (
      <div className="flex justify-end">
        <div className="flex flex-col gap-1 max-w-[80%] items-end">
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] text-slate-400 dark:text-gray-600">
              {formatMessageTime(msg.createdAt)}
            </span>
            <span className="text-[11.5px] font-semibold text-emerald-500 dark:text-emerald-400">You</span>
          </div>
          <div
            className="px-3.5 py-2 rounded-2xl text-[13.5px] text-white leading-relaxed break-words"
            style={{
              background: 'var(--rt-bubble-self-bg)',
              border:     '1px solid var(--rt-bubble-self-border)',
            }}
          >
            {msg.text}
          </div>
        </div>
      </div>
    );
  }

  const avatarColor = getUserColor(msg.sender);
  const avatarLabel = getUserAvatarLabel(msg.sender);

  return (
    <div className="flex justify-start items-start gap-2.5">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ${avatarColor}`}
      >
        {avatarLabel}
      </div>

      <div className="flex flex-col gap-1 max-w-[80%] items-start">
        <div className="flex items-center gap-1.5">
          <span className="text-[11.5px] font-semibold text-slate-700 dark:text-gray-300">
            {msg.sender}
          </span>
          <span className="text-[10.5px] text-slate-400 dark:text-gray-600">
            {formatMessageTime(msg.createdAt)}
          </span>
        </div>
        <div
          className="px-3.5 py-2 rounded-2xl text-[13.5px] leading-relaxed break-words text-slate-800 dark:text-white"
          style={{
            background: 'var(--rt-bubble-other-bg)',
            border:     '1px solid var(--rt-bubble-other-border)',
          }}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
}

function UserRow({
  name,
  isYou = false,
  isActive = false,
  onClick,
}: {
  name:      string;
  isYou?:    boolean;
  isActive?: boolean;
  onClick?:  () => void;
}) {
  if (isYou) {
    return (
      <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg">
        <div className="relative flex-shrink-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)' }}
          >
            {name[0]?.toUpperCase()}
          </div>
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-[#0a0e16]"
            style={{ background: '#22C55E' }}
          />
        </div>
        <span className="text-[13px] text-slate-900 dark:text-white font-medium truncate">{name}</span>
        <span className="text-[10px] text-emerald-500 dark:text-emerald-400 ml-auto flex-shrink-0">you</span>
      </div>
    );
  }

  const avatarColor = getUserColor(name);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all ${
        isActive
          ? 'bg-emerald-500/10 border border-emerald-500/20'
          : 'hover:bg-slate-100 dark:hover:bg-white/5'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white ${avatarColor}`}
        >
          {getUserAvatarLabel(name)}
        </div>
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-[#0a0e16]"
          style={{ background: '#22C55E' }}
        />
      </div>
      <span
        className={`text-[13px] font-medium truncate ${
          isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-white'
        }`}
      >
        {name}
      </span>
      {isActive && (
        <Lock size={10} className="text-emerald-500 dark:text-emerald-400 ml-auto flex-shrink-0" />
      )}
    </button>
  );
}

function DMRow({
  name,
  isActive,
  unreadCount = 0,
  onClick,
}: {
  name:         string;
  isActive:     boolean;
  unreadCount?: number;
  onClick:      () => void;
}) {
  const avatarColor = getUserColor(name);
  const hasUnread   = unreadCount > 0 && !isActive;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all ${
        isActive
          ? 'bg-emerald-500/10 border border-emerald-500/20'
          : 'hover:bg-slate-100 dark:hover:bg-white/5'
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ${avatarColor}`}
      >
        {getUserAvatarLabel(name)}
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
        {name}
      </span>
      {hasUnread ? (
        <span
          className="ml-auto flex-shrink-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : isActive ? (
        <Lock size={10} className="text-emerald-500 dark:text-emerald-400 ml-auto flex-shrink-0" />
      ) : null}
    </button>
  );
}
