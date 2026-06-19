import express from 'express';
import cors from 'cors';
import { CLIENT_URL } from './config/env';

const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'RoomTalk backend is running',
  });
});

export default app;