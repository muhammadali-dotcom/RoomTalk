import { createClient } from 'redis';
import { REDIS_URL } from '../config/env';

let client: ReturnType<typeof createClient> | null = null;

export async function connectRedis(): Promise<void> {
  if (client) return;

  client = createClient({ url: REDIS_URL });

  client.on('error', (err) => {
    console.error('Redis error:', err);
  });

  client.on('ready', () => {
    console.log('Redis connected successfully');
  });

  await client.connect();
}

export function getRedisClient() {
  if (!client) {
    throw new Error('Redis client not connected. Call connectRedis() first.');
  }
  return client;
}
