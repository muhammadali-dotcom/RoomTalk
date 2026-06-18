export const redisKeys = {
  activeUser: (username: string) => `active:user:${username}`,
  socketUser: (socketId: string) => `socket:user:${socketId}`,
  userRoom: (username: string) => `user:${username}:room`,
  roomUsers: (roomId: string) => `room:${roomId}:users`,
  roomMessages: (roomId: string) => `room:${roomId}:messages`,
  privateMessages: (userA: string, userB: string) => {
    const [first, second] = [userA, userB].sort();
    return `private:${first}:${second}:messages`;
  },
  unread: (receiver: string, sender: string) => `unread:${receiver}:${sender}`,
};
