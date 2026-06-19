export interface PublicMessage {
  id:        string;
  roomId:    string;
  sender:    string;
  text:      string;
  type:      'public';
  createdAt: string;
}
