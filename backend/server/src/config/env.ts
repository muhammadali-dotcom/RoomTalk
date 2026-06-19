import dotenv from 'dotenv';

dotenv.config();

export const PORT: number = process.env.PORT
  ? Number(process.env.PORT)
  : 5001;

export const CLIENT_URL: string =
  process.env.CLIENT_URL || 'http://localhost:3000';

export const REDIS_URL: string = process.env.REDIS_URL || 'redis://localhost:6379';

export const ROOM_SESSION_TTL_SECONDS: number = process.env.ROOM_SESSION_TTL_SECONDS
  ? Number(process.env.ROOM_SESSION_TTL_SECONDS)
  : 43200;