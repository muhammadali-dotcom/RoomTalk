import { getRedisClient } from '../redis/redis.client';
import { roomUsersKey, userRoomKey } from '../redis/redis.keys';
import { ROOM_SESSION_TTL_SECONDS } from '../redis/redis.ttl';
import { ROOMS } from '../config/rooms';
import type { Room, RoomWithCount } from '../types/room';

export function getRoomById(roomId: string): Room | undefined {
  return ROOMS.find((r) => r.id === roomId);
}

export async function getRoomsWithCounts(): Promise<RoomWithCount[]> {
  const client = getRedisClient();
  const results: RoomWithCount[] = [];

  for (const room of ROOMS) {
    const count = await client.sCard(roomUsersKey(room.id));
    results.push({ ...room, activeUsers: count });
  }

  return results;
}

export async function getRoomUsers(roomId: string): Promise<string[]> {
  const client = getRedisClient();
  return client.sMembers(roomUsersKey(roomId));
}

export async function getUserCurrentRoom(username: string): Promise<string | null> {
  const client = getRedisClient();
  return client.get(userRoomKey(username));
}

export async function setUserCurrentRoom(username: string, roomId: string): Promise<void> {
  const client = getRedisClient();
  await client.set(userRoomKey(username), roomId, { EX: ROOM_SESSION_TTL_SECONDS });
}

export async function clearUserCurrentRoom(username: string): Promise<void> {
  const client = getRedisClient();
  await client.del(userRoomKey(username));
}

export async function joinRoom(username: string, roomId: string): Promise<void> {
  const client = getRedisClient();
  const key = roomUsersKey(roomId);
  await client.sAdd(key, username);
  await client.expire(key, ROOM_SESSION_TTL_SECONDS);
  await setUserCurrentRoom(username, roomId);
}

export async function leaveRoom(username: string, roomId: string): Promise<void> {
  const client = getRedisClient();
  await client.sRem(roomUsersKey(roomId), username);
  await clearUserCurrentRoom(username);
}
