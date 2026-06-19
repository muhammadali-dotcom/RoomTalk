export interface PublicMessage {
  id:        string;
  roomId:    string;
  sender:    string;
  text:      string;
  type:      'public';
  createdAt: string;
}

export interface PrivateMessage {
  id:        string;
  from:      string;
  to:        string;
  text:      string;
  type:      'private';
  createdAt: string;
}
