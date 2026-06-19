import { getRedisClient } from '../redis/redis.client';
import { roomMessagesKey } from '../redis/redis.keys';
import { ROOM_SESSION_TTL_SECONDS } from '../redis/redis.ttl';
import { generateId } from '../utils/generateId';
import type { PublicMessage } from '../types/message';

export function createPublicMessage(
  roomId: string,
  sender: string,
  text: string,
): PublicMessage {
  return {
    id:        generateId('msg'),
    roomId,
    sender,
    text,
    type:      'public',
    createdAt: new Date().toISOString(),
  };
}

export async function saveRoomMessage(message: PublicMessage): Promise<void> {
  const client = getRedisClient();
  const key = roomMessagesKey(message.roomId);
  await client.rPush(key, JSON.stringify(message));
  await client.expire(key, ROOM_SESSION_TTL_SECONDS);
}

export async function getRoomMessages(roomId: string): Promise<PublicMessage[]> {
  const client = getRedisClient();
  const raw = await client.lRange(roomMessagesKey(roomId), 0, -1);

  const messages: PublicMessage[] = [];
  for (const item of raw) {
    try {
      messages.push(JSON.parse(item) as PublicMessage);
    } catch {
      // skip corrupted entries instead of crashing
    }
  }
  return messages;
}
