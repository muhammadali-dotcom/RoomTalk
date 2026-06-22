import { Server, Socket } from 'socket.io';
import {
  getDirectMessageUsers,
  getDirectMessagesWithUnread,
} from '../../services/dm.service';
import { getPrivateMessages } from '../../services/private-message.service';
import { resetUnread } from '../../services/unread.service';

export function registerDmHandler(socket: Socket, _io: Server): void {

  // Client requests their DM conversation list (called on Dashboard load)
  socket.on('dm:list:get', async () => {
    const username = socket.data.username as string | undefined;
    if (!username) return;

    try {
      const users = await getDirectMessagesWithUnread(username);
      socket.emit('dm:list', { users });
    } catch (err) {
      console.error('Error getting DM list:', err);
    }
  });

  // Client opens an existing DM from the Dashboard — no room membership required
  socket.on('dm:open', async (payload: { withUser: string }) => {
    const username = socket.data.username as string | undefined;
    const withUser = payload?.withUser;

    if (!username) {
      socket.emit('private:error', { message: 'Not authenticated.' });
      return;
    }
    if (!withUser || typeof withUser !== 'string') {
      socket.emit('private:error', { message: 'Invalid user.' });
      return;
    }
    if (withUser === username) {
      socket.emit('private:error', { message: 'Cannot open chat with yourself.' });
      return;
    }

    try {
      // Must have an existing DM conversation
      const dmUsers = await getDirectMessageUsers(username);
      if (!dmUsers.includes(withUser)) {
        socket.emit('private:error', { message: 'No conversation found with this user.' });
        return;
      }

      // Reset unread count for this conversation
      await resetUnread(username, withUser);
      socket.emit('unread:update', { from: withUser, count: 0 });

      // Load full message history
      const messages = await getPrivateMessages(username, withUser);
      socket.emit('private:history', { withUser, messages });

      // Send refreshed DM list so the badge clears
      const users = await getDirectMessagesWithUnread(username);
      socket.emit('dm:list', { users });
    } catch (err) {
      console.error('Error in dm:open:', err);
      socket.emit('private:error', { message: 'Failed to open conversation.' });
    }
  });
}
