export const activeUserKey = (username: string) => `active:user:${username}`;
export const socketUserKey = (socketId: string) => `socket:user:${socketId}`;
export const roomUsersKey = (roomId: string) => `room:${roomId}:users`;
export const userRoomKey = (username: string) => `user:${username}:room`;
export const roomMessagesKey = (roomId: string) => `room:${roomId}:messages`;

export const privateMessagesKey = (userA: string, userB: string): string => {
  const [first, second] = [userA, userB].sort();
  return `private:${first}:${second}:messages`;
};

export const unreadKey = (receiver: string, sender: string) =>
  `unread:${receiver}:${sender}`;

export const dmUsersKey = (username: string) => `dm:${username}:users`;
