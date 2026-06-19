export const activeUserKey    = (username: string) => `active:user:${username}`;
export const socketUserKey    = (socketId: string) => `socket:user:${socketId}`;
export const roomUsersKey     = (roomId: string)   => `room:${roomId}:users`;
export const userRoomKey      = (username: string)  => `user:${username}:room`;
export const roomMessagesKey  = (roomId: string)   => `room:${roomId}:messages`;
