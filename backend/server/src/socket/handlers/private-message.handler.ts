import { Server, Socket } from 'socket.io';
import { isUsernameActive, getSocketIdByUsername } from '../../services/user.service';
import { getUserCurrentRoom } from '../../services/room.service';
import {
  createPrivateMessage,
  savePrivateMessage,
  getPrivateMessages,
} from '../../services/private-message.service';
import { incrementUnread, resetUnread } from '../../services/unread.service';
import {
  addDirectMessageUser,
  getDirectMessageUsers,
  getDirectMessagesWithUnread,
} from '../../services/dm.service';

export function registerPrivateMessageHandler(socket: Socket, io: Server): void {

  // Client opens a private chat panel from within a room — requires same room
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

      // Reset unread count when the user opens the chat
      await resetUnread(username, withUser);
      socket.emit('unread:update', { from: withUser, count: 0 });

      const messages = await getPrivateMessages(username, withUser);
      socket.emit('private:history', { withUser, messages });
    } catch (err) {
      console.error('Error opening private chat:', err);
      socket.emit('private:error', { message: 'Failed to open private chat.' });
    }
  });

  // Client sends a private message — works from inside a room OR from Dashboard DM
  socket.on('private:send', async (payload: { to: string; text: string }) => {
    const sender      = socket.data.username as string | undefined;
    const currentRoom = socket.data.currentRoom as string | undefined;
    const receiver    = payload?.to;
    const rawText     = payload?.text;

    if (!sender) {
      socket.emit('private:error', { message: 'Not authenticated.' });
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
      // Determine if sending is allowed:
      //   Option A — both users are currently in the same room (new or existing chat)
      //   Option B — an existing DM conversation exists between them (dashboard continue)
      let sendingAllowed = false;

      if (currentRoom) {
        const isActive = await isUsernameActive(receiver);
        if (isActive) {
          const receiverRoom = await getUserCurrentRoom(receiver);
          sendingAllowed = receiverRoom === currentRoom;
        }
      }

      if (!sendingAllowed) {
        // Allow if this is an existing DM conversation
        const dmUsers = await getDirectMessageUsers(sender);
        sendingAllowed = dmUsers.includes(receiver);
      }

      if (!sendingAllowed) {
        socket.emit('private:error', {
          message: currentRoom
            ? `${receiver} is not in this room.`
            : 'No existing conversation with this user.',
        });
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

      // Track DM conversation for both users and refresh TTL
      await addDirectMessageUser(sender, receiver);

      // Deliver to sender
      socket.emit('private:receive', message);

      // Deliver to receiver if online + update their unread count and DM list
      const receiverSocketId = await getSocketIdByUsername(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('private:receive', message);

        const count = await incrementUnread(receiver, sender);
        io.to(receiverSocketId).emit('unread:update', { from: sender, count });

        // Emit updated DM list so the receiver's Dashboard stays in sync
        const dmList = await getDirectMessagesWithUnread(receiver);
        io.to(receiverSocketId).emit('dm:list', { users: dmList });
      }
    } catch (err) {
      console.error('Error sending private message:', err);
      socket.emit('private:error', { message: 'Failed to send message. Please try again.' });
    }
  });
}
