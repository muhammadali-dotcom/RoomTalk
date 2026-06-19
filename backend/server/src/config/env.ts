import dotenv from 'dotenv';

dotenv.config();

export const PORT: number = process.env.PORT
  ? Number(process.env.PORT)
  : 5000;

export const CLIENT_URL: string =
  process.env.CLIENT_URL || 'http://localhost:3000';