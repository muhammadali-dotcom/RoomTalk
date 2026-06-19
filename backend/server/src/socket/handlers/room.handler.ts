import { Server, Socket } from 'socket.io';
import {
  getRoomById,
  getRoomsWithCounts,
  joinRoom,
  leaveRoom,
  getRoomUsers,
} from '../../services/room.service';

export function registerRoomHandler(socket: Socket, io: Server): void {

  // Client asks for the full room list with live counts
  socket.on('rooms:get', async () => {
    try {
      const rooms = await getRoomsWithCounts();
      socket.emit('rooms:list', rooms);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  });

  // Client asks for the current users in a specific room (used by ChatScreen on mount)
  socket.on('room:users:get', async (payload: { roomId: string }) => {
    const roomId = payload?.roomId;
    if (!roomId) return;
    try {
      const users = await getRoomUsers(roomId);
      socket.emit('room:users', { roomId, users });
    } catch (err) {
      console.error('Error fetching room users:', err);
    }
  });

  socket.on('room:join', async (payload: { roomId: string }) => {
    const roomId = payload?.roomId;
    const username = socket.data.username as string | undefined;

    if (!username) {
      socket.emit('room:error', { message: 'Not authenticated. Please log in first.' });
      return;
    }

    const room = getRoomById(roomId);
    if (!room) {
      socket.emit('room:error', { message: 'Room not found.' });
      return;
    }

    try {
      const prevRoomId = socket.data.currentRoom as string | undefined;
      const isAlreadyInThisRoom = prevRoomId === roomId;

      // Leave the previous room if switching to a different one
      if (prevRoomId && !isAlreadyInThisRoom) {
        await leaveRoom(username, prevRoomId);
        socket.leave(prevRoomId);
        const prevUsers = await getRoomUsers(prevRoomId);
        io.to(prevRoomId).emit('room:users', { roomId: prevRoomId, users: prevUsers });
        socket.to(prevRoomId).emit('room:system', { message: `${username} left the room.` });
      }

      // SADD and socket.join are idempotent — safe to call even if already in the room
      await joinRoom(username, roomId);
      socket.join(roomId);
      socket.data.currentRoom = roomId;

      console.log(`"${username}" joined room: ${roomId} (${socket.id})`);

      // Always confirm back to the joining socket
      socket.emit('room:joined', { roomId, roomName: room.name });

      // Push fresh user list to everyone in the room
      const users = await getRoomUsers(roomId);
      io.to(roomId).emit('room:users', { roomId, users });

      // Notify others and update global counts only for new joins
      if (!isAlreadyInThisRoom) {
        socket.to(roomId).emit('room:system', { message: `${username} joined the room.` });
        const rooms = await getRoomsWithCounts();
        io.emit('rooms:update', rooms);
      }
    } catch (err) {
      console.error('Error joining room:', err);
      socket.emit('room:error', { message: 'Failed to join room.' });
    }
  });

  socket.on('room:leave', async (payload: { roomId?: string }) => {
    const roomId = (payload?.roomId ?? socket.data.currentRoom) as string | undefined;
    const username = socket.data.username as string | undefined;

    if (!roomId || !username) return;

    try {
      await leaveRoom(username, roomId);
      socket.leave(roomId);
      socket.data.currentRoom = undefined;

      console.log(`"${username}" left room: ${roomId} (${socket.id})`);

      // Confirm leave to the socket that requested it
      socket.emit('room:left', { roomId });

      // Push updated user list to remaining room members
      const users = await getRoomUsers(roomId);
      io.to(roomId).emit('room:users', { roomId, users });
      socket.to(roomId).emit('room:system', { message: `${username} left the room.` });

      // Update global room counts for all connected clients
      const rooms = await getRoomsWithCounts();
      io.emit('rooms:update', rooms);
    } catch (err) {
      console.error('Error leaving room:', err);
    }
  });
}
