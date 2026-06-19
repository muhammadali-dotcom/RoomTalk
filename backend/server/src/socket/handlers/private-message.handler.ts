import { Server, Socket } from 'socket.io';
import { isUsernameActive, getSocketIdByUsername } from '../../services/user.service';
import { getUserCurrentRoom } from '../../services/room.service';
import {
  createPrivateMessage,
  savePrivateMessage,
  getPrivateMessages,
} from '../../services/private-message.service';

export function registerPrivateMessageHandler(socket: Socket, io: Server): void {

  // Client opens a private chat panel — load message history
  socket.on('private:open', async (payload: { withUser: string }) => {
    const username    = socket.data.username as string | undefined;
    const currentRoom = socket.data.currentRoom as string | undefined;
    const withUser    = payload?.withUser;

    if (!username) {
      socket.emit('private:error', { message: 'Not authenticated.' });
      return;
    }
    if (!currentRoom) {
      socket.emit('private:error', { message: 'You are not in a room.' });
      return;
    }
    if (!withUser || typeof withUser !== 'string') {
      socket.emit('private:error', { message: 'Invalid user.' });
      return;
    }
    if (withUser === username) {
      socket.emit('private:error', { message: 'Cannot open private chat with yourself.' });
      return;
    }

    try {
      const isActive = await isUsernameActive(withUser);
      if (!isActive) {
        socket.emit('private:error', { message: `${withUser} is not online.` });
        return;
      }

      const theirRoom = await getUserCurrentRoom(withUser);
      if (theirRoom !== currentRoom) {
        socket.emit('private:error', { message: `${withUser} is not in this room.` });
        return;
      }

      const messages = await getPrivateMessages(username, withUser);
      socket.emit('private:history', { withUser, messages });
    } catch (err) {
      console.error('Error opening private chat:', err);
      socket.emit('private:error', { message: 'Failed to open private chat.' });
    }
  });

  // Client sends a private message to another user in the same room
  socket.on('private:send', async (payload: { to: string; text: string }) => {
    const sender      = socket.data.username as string | undefined;
    const currentRoom = socket.data.currentRoom as string | undefined;
    const receiver    = payload?.to;
    const rawText     = payload?.text;

    if (!sender) {
      socket.emit('private:error', { message: 'Not authenticated.' });
      return;
    }
    if (!currentRoom) {
      socket.emit('private:error', { message: 'You are not in a room.' });
      return;
    }
    if (!receiver || typeof receiver !== 'string') {
      socket.emit('private:error', { message: 'Invalid recipient.' });
      return;
    }
    if (receiver === sender) {
      socket.emit('private:error', { message: 'Cannot send a private message to yourself.' });
      return;
    }

    try {
      const isActive = await isUsernameActive(receiver);
      if (!isActive) {
        socket.emit('private:error', { message: `${receiver} is not online.` });
        return;
      }

      const receiverRoom = await getUserCurrentRoom(receiver);
      if (receiverRoom !== currentRoom) {
        socket.emit('private:error', { message: `${receiver} is not in this room.` });
        return;
      }

      if (!rawText || typeof rawText !== 'string') {
        socket.emit('private:error', { message: 'Message text is required.' });
        return;
      }

      const text = rawText.trim();
      if (!text) {
        socket.emit('private:error', { message: 'Message cannot be empty.' });
        return;
      }
      if (text.length > 500) {
        socket.emit('private:error', { message: 'Message cannot exceed 500 characters.' });
        return;
      }

      const message = createPrivateMessage(sender, receiver, text);
      await savePrivateMessage(message);

      // Deliver to sender and receiver only — never to the whole room
      socket.emit('private:receive', message);

      const receiverSocketId = await getSocketIdByUsername(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('private:receive', message);
      }
    } catch (err) {
      console.error('Error sending private message:', err);
      socket.emit('private:error', { message: 'Failed to send message. Please try again.' });
    }
  });
}
