import { getRedisClient } from '../redis/redis.client';
import { activeUserKey, socketUserKey } from '../redis/redis.keys';
import { ROOM_SESSION_TTL_SECONDS } from '../redis/redis.ttl';

export async function isUsernameActive(username: string): Promise<boolean> {
  const client = getRedisClient();
  const key = activeUserKey(username);
  const exists = await client.exists(key);
  return exists === 1;
}

export async function registerActiveUser(
  username: string,
  socketId: string,
): Promise<void> {
  const client = getRedisClient();
  await client.set(activeUserKey(username), socketId, {
    EX: ROOM_SESSION_TTL_SECONDS,
  });
  await client.set(socketUserKey(socketId), username, {
    EX: ROOM_SESSION_TTL_SECONDS,
  });
}

export async function getUsernameBySocketId(
  socketId: string,
): Promise<string | null> {
  const client = getRedisClient();
  const username = await client.get(socketUserKey(socketId));
  return username;
}

export async function removeActiveUser(
  username: string,
  socketId: string,
): Promise<void> {
  const client = getRedisClient();
  await client.del(activeUserKey(username));
  await client.del(socketUserKey(socketId));
}

export async function getSocketIdByUsername(username: string): Promise<string | null> {
  const client = getRedisClient();
  return client.get(activeUserKey(username));
}
