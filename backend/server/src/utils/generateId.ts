import { randomUUID } from 'crypto';

export function generateId(prefix = 'id'): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
