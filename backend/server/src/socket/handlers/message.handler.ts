import { Server, Socket } from 'socket.io';
import { getRoomById } from '../../services/room.service';
import {
  createPublicMessage,
  saveRoomMessage,
  getRoomMessages,
} from '../../services/message.service';

export function registerMessageHandler(socket: Socket, io: Server): void {

  // Client requests message history when it mounts the chat screen
  socket.on('messages:get', async (payload: { roomId: string }) => {
    const roomId = payload?.roomId;
    if (!roomId) return;

    try {
      const messages = await getRoomMessages(roomId);
      socket.emit('messages:history', { roomId, messages });
    } catch (err) {
      console.error('Error fetching message history:', err);
    }
  });

  // Client sends a public text message to a room
  socket.on('message:send', async (payload: { roomId: string; text: string }) => {
    const username   = socket.data.username as string | undefined;
    const currentRoom = socket.data.currentRoom as string | undefined;
    const roomId     = payload?.roomId;
    const rawText    = payload?.text;

    // Auth checks
    if (!username) {
      socket.emit('message:error', { message: 'Not authenticated. Please log in first.' });
      return;
    }

    if (!currentRoom) {
      socket.emit('message:error', { message: 'You are not currently in a room.' });
      return;
    }

    // The payload roomId must match the room the socket is actually in
    if (roomId !== currentRoom) {
      socket.emit('message:error', { message: 'Room mismatch.' });
      return;
    }

    if (!getRoomById(roomId)) {
      socket.emit('message:error', { message: 'Room not found.' });
      return;
    }

    // Text validation
    if (!rawText || typeof rawText !== 'string') {
      socket.emit('message:error', { message: 'Message text is required.' });
      return;
    }

    const text = rawText.trim();

    if (!text) {
      socket.emit('message:error', { message: 'Message cannot be empty.' });
      return;
    }

    if (text.length > 500) {
      socket.emit('message:error', { message: 'Message cannot exceed 500 characters.' });
      return;
    }

    try {
      const message = createPublicMessage(roomId, username, text);
      await saveRoomMessage(message);

      // Emit to every socket inside this room (including sender)
      io.to(roomId).emit('message:receive', message);
    } catch (err) {
      console.error('Error saving message:', err);
      socket.emit('message:error', { message: 'Failed to send message. Please try again.' });
    }
  });
}
