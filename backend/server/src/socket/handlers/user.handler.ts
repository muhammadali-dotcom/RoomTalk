import { Socket } from 'socket.io';
import { validateUsername, normalizeUsername } from '../../utils/normalizeUsername';

export function registerUserHandler(
  socket: Socket,
  activeUsers: Map<string, string>,
): void {
  socket.on('user:join', (payload: { username: string }) => {
    const raw = payload?.username ?? '';

    const validationError = validateUsername(raw);
    if (validationError) {
      socket.emit('user:error', { message: validationError });
      return;
    }

    const normalized = normalizeUsername(raw);

    if (activeUsers.has(normalized)) {
      socket.emit('user:error', { message: 'Username is already taken. Please choose a different one.' });
      return;
    }

    activeUsers.set(normalized, socket.id);
    socket.data.username = normalized;

    console.log(`Username accepted: "${raw.trim()}" (${socket.id})`);

    socket.emit('user:accepted', {
      username: raw.trim(),
      socketId: socket.id,
    });
  });
}
