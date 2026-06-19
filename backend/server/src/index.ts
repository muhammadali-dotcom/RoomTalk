import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { CLIENT_URL, PORT } from './config/env';
import { registerUserHandler } from './socket/handlers/user.handler';
import { registerRoomHandler } from './socket/handlers/room.handler';
import { registerMessageHandler } from './socket/handlers/message.handler';
import { connectRedis } from './redis/redis.client';
import { getUsernameBySocketId, removeActiveUser } from './services/user.service';
import {
  getUserCurrentRoom,
  leaveRoom,
  getRoomUsers,
  getRoomsWithCounts,
} from './services/room.service';

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  registerUserHandler(socket, io);
  registerRoomHandler(socket, io);
  registerMessageHandler(socket, io);

  socket.on('disconnect', () => {
    (async () => {
      try {
        const username = socket.data.username as string | undefined;
        let userToRemove = username ?? null;
        if (!userToRemove) {
          userToRemove = await getUsernameBySocketId(socket.id);
        }

        if (userToRemove) {
          // Clean up room membership before removing the user
          const currentRoomId: string | undefined =
            (socket.data.currentRoom as string | undefined) ??
            (await getUserCurrentRoom(userToRemove)) ??
            undefined;

          if (currentRoomId) {
            try {
              await leaveRoom(userToRemove, currentRoomId);

              const users = await getRoomUsers(currentRoomId);
              io.to(currentRoomId).emit('room:users', { roomId: currentRoomId, users });

              const rooms = await getRoomsWithCounts();
              io.emit('rooms:update', rooms);
            } catch (err) {
              console.error('Error during room cleanup on disconnect:', err);
            }
          }

          // Remove active username and socket mapping
          await removeActiveUser(userToRemove, socket.id);
          console.log(`Username removed: "${userToRemove}" (${socket.id})`);
        }
      } catch (err) {
        console.error('Error removing user on disconnect:', err);
      } finally {
        console.log('User disconnected:', socket.id);
      }
    })();
  });
});

async function startServer() {
  try {
    await connectRedis();
    httpServer.listen(PORT, () => {
      console.log(`RoomTalk backend is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
