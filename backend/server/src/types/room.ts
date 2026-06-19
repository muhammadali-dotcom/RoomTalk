export interface Room {
  id: string;
  name: string;
  description: string;
}

export interface RoomWithCount extends Room {
  activeUsers: number;
}
