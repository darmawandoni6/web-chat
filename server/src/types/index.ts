export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  createdAt: number;
}

export type MessageType = 'text' | 'image' | 'file';

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  from: string; // userId
  to?: string; // userId for private message
  groupId?: string; // groupId for group message
  content: string;
  type: MessageType;
  timestamp: number;
  read: boolean;
  reactions: Reaction[];
  fileUrl?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[]; // array of userIds
  adminId: string;
  createdAt: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}
