import { getRedisClient } from '../redis/redis.client';
import { dmUsersKey, unreadKey } from '../redis/redis.keys';
import { ROOM_SESSION_TTL_SECONDS } from '../redis/redis.ttl';

export interface DirectMessageUser {
  username: string;
  unreadCount: number;
}

export async function addDirectMessageUser(
  currentUser: string,
  otherUser: string,
): Promise<void> {
  const client = getRedisClient();
  await client.sAdd(dmUsersKey(currentUser), otherUser);
  await client.expire(dmUsersKey(currentUser), ROOM_SESSION_TTL_SECONDS);
  await client.sAdd(dmUsersKey(otherUser), currentUser);
  await client.expire(dmUsersKey(otherUser), ROOM_SESSION_TTL_SECONDS);
}

export async function getDirectMessageUsers(username: string): Promise<string[]> {
  const client = getRedisClient();
  return client.sMembers(dmUsersKey(username));
}

export async function getDirectMessagesWithUnread(
  username: string,
): Promise<DirectMessageUser[]> {
  const client = getRedisClient();
  const users = await client.sMembers(dmUsersKey(username));
  const result: DirectMessageUser[] = [];
  for (const u of users) {
    const value = await client.get(unreadKey(username, u));
    result.push({ username: u, unreadCount: Number(value || 0) });
  }
  return result;
}
