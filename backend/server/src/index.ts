import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { CLIENT_URL, PORT } from './config/env';
import { registerUserHandler } from './socket/handlers/user.handler';

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const activeUsers = new Map<string, string>();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  registerUserHandler(socket, activeUsers);

  socket.on('disconnect', () => {
    const username = socket.data.username as string | undefined;
    if (username) {
      activeUsers.delete(username);
      console.log(`Username removed: "${username}" (${socket.id})`);
    }
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`RoomTalk backend is running on port ${PORT}`);
});
