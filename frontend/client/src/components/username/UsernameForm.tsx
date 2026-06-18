import React, { useState } from 'react';

export default function UsernameForm({ onContinue }: { onContinue?: (name: string) => void }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    setError(null);
    if (onContinue) onContinue(username.trim());
    else alert('Continue: ' + username.trim());
  }

  return (
    <div className="username-modal">
      <div className="mb-4 text-center">
        <div className="logo-sm text-xl">RoomTalk</div>
        <h3 className="text-lg font-semibold mt-3">Welcome to RoomTalk</h3>
        <p className="small-muted mt-1">Enter your username to start chatting</p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="w-full p-3 rounded bg-[#0C1216] border border-[rgba(255,255,255,0.04)] outline-none"
        />

        {error && <div className="text-sm text-[var(--error)]">{error}</div>}

        <div className="flex items-center justify-between">
          <button type="submit" className="accent-btn">Continue</button>
          <div className="small-muted">Temporary chats expire after 12 hours</div>
        </div>
      </form>
    </div>
  );
}
