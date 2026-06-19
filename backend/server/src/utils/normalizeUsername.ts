const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export function validateUsername(raw: string): string | null {
  const trimmed = raw.trim();

  if (!trimmed) return 'Username is required.';
  if (trimmed.length < 3) return 'Username must be at least 3 characters.';
  if (trimmed.length > 20) return 'Username must be at most 20 characters.';
  if (!USERNAME_REGEX.test(trimmed)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens.';
  }

  return null;
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}
