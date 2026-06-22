import { getRedisClient } from '../redis/redis.client';
import { unreadKey } from '../redis/redis.keys';
import { ROOM_SESSION_TTL_SECONDS } from '../redis/redis.ttl';

export async function incrementUnread(receiver: string, sender: string): Promise<number> {
  const client = getRedisClient();
  const key    = unreadKey(receiver, sender);
  const count  = await client.incr(key);
  await client.expire(key, ROOM_SESSION_TTL_SECONDS);
  return count;
}

export async function resetUnread(receiver: string, sender: string): Promise<void> {
  const client = getRedisClient();
  await client.del(unreadKey(receiver, sender));
}

export async function getUnread(receiver: string, sender: string): Promise<number> {
  const client = getRedisClient();
  const value  = await client.get(unreadKey(receiver, sender));
  return Number(value || 0);
}
