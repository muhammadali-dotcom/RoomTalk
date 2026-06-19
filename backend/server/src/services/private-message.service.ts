import { getRedisClient } from '../redis/redis.client';
import { privateMessagesKey } from '../redis/redis.keys';
import { ROOM_SESSION_TTL_SECONDS } from '../redis/redis.ttl';
import { generateId } from '../utils/generateId';
import type { PrivateMessage } from '../types/message';

export function createPrivateMessage(
  from: string,
  to: string,
  text: string,
): PrivateMessage {
  return {
    id:        generateId('msg'),
    from,
    to,
    text,
    type:      'private',
    createdAt: new Date().toISOString(),
  };
}

export async function savePrivateMessage(message: PrivateMessage): Promise<void> {
  const client = getRedisClient();
  const key = privateMessagesKey(message.from, message.to);
  await client.rPush(key, JSON.stringify(message));
  await client.expire(key, ROOM_SESSION_TTL_SECONDS);
}

export async function getPrivateMessages(
  userA: string,
  userB: string,
): Promise<PrivateMessage[]> {
  const client = getRedisClient();
  const raw = await client.lRange(privateMessagesKey(userA, userB), 0, -1);
  const messages: PrivateMessage[] = [];
  for (const item of raw) {
    try {
      messages.push(JSON.parse(item) as PrivateMessage);
    } catch {
      // skip corrupted entries instead of crashing
    }
  }
  return messages;
}
