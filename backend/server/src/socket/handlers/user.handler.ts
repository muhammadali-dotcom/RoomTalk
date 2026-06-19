import { Server, Socket } from 'socket.io';
import { validateUsername, normalizeUsername } from '../../utils/normalizeUsername';
import {
  isUsernameActive,
  registerActiveUser,
  removeActiveUser,
  getUsernameBySocketId,
} from '../../services/user.service';
import {
  getUserCurrentRoom,
  leaveRoom,
  getRoomUsers,
  getRoomsWithCounts,
} from '../../services/room.service';

export function registerUserHandler(socket: Socket, io: Server): void {

  socket.on('user:logout', async () => {
    let username = socket.data.username as string | undefined;

    if (!username) {
      username = (await getUsernameBySocketId(socket.id)) ?? undefined;
    }

    // Clean up room membership before removing the user
    const currentRoomId: string | undefined =
      (socket.data.currentRoom as string | undefined) ??
      (username ? (await getUserCurrentRoom(username)) ?? undefined : undefined);

    if (currentRoomId && username) {
      try {
        await leaveRoom(username, currentRoomId);
        socket.leave(currentRoomId);
        socket.data.currentRoom = undefined;

        const users = await getRoomUsers(currentRoomId);
        io.to(currentRoomId).emit('room:users', { roomId: currentRoomId, users });
        socket.to(currentRoomId).emit('room:system', { message: `${username} left the room.` });

        const rooms = await getRoomsWithCounts();
        io.emit('rooms:update', rooms);
      } catch (err) {
        console.error('Error during room cleanup on logout:', err);
      }
    }

    // Remove active username and socket mapping from Redis
    if (username) {
      try {
        await removeActiveUser(username, socket.id);
      } catch (err) {
        console.error('Error removing active user on logout:', err);
      }
      socket.data.username = undefined;
      console.log(`User logged out: "${username}" (${socket.id})`);
    }

    socket.emit('user:logged-out');
  });

  socket.on('user:join', async (payload: { username: string }) => {
    const raw = payload?.username ?? '';

    const validationError = validateUsername(raw);
    if (validationError) {
      socket.emit('user:error', { message: validationError });
      return;
    }

    const normalized = normalizeUsername(raw);

    try {
      const active = await isUsernameActive(normalized);
      if (active) {
        socket.emit('user:error', { message: 'Username is already taken. Please choose a different one.' });
        return;
      }

      await registerActiveUser(normalized, socket.id);
      socket.data.username = normalized;

      console.log(`Username accepted: "${raw.trim()}" (${socket.id})`);

      socket.emit('user:accepted', {
        username: normalized,
        socketId: socket.id,
      });
    } catch (err) {
      console.error('Error during user join:', err);
      socket.emit('user:error', { message: 'Internal server error' });
    }
  });
}
