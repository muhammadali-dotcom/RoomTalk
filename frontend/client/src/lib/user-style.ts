const COLOR_PALETTE = [
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-rose-500',
  'bg-orange-500',
  'bg-lime-500',
] as const;

function hashUsername(username: string): number {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash * 31 + username.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getUserColor(username: string): string {
  return COLOR_PALETTE[hashUsername(username) % COLOR_PALETTE.length];
}

export function getUserAvatarLabel(username: string): string {
  if (username.includes('-')) {
    const parts = username.split('-');
    const a = parts[0]?.[0] ?? '';
    const b = parts[1]?.[0] ?? '';
    return (a + b).toUpperCase().slice(0, 2);
  }
  // CamelCase: collect uppercase letters (e.g. TechUser -> TU)
  const uppers = username.replace(/[^A-Z]/g, '');
  if (uppers.length >= 2) return uppers.slice(0, 2);
  if (uppers.length === 1) return (uppers + (username[1] ?? '')).slice(0, 2).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

export function formatMessageTime(createdAt: string): string {
  return new Date(createdAt).toLocaleTimeString([], {
    hour:   '2-digit',
    minute: '2-digit',
  });
}
