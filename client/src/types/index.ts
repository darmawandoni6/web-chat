// ─── User ───────────────────────────────────────────────
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

// ─── Message ────────────────────────────────────────────
export type MessageType = 'text' | 'image' | 'file'

export interface Reaction {
  emoji: string
  userIds: string[]
}

export interface Message {
  id: string
  from: string
  to?: string
  groupId?: string
  content: string
  type: MessageType
  timestamp: number
  read: boolean
  reactions: Reaction[]
  fileUrl?: string
}

// ─── Private Conversation ───────────────────────────────
export interface Conversation {
  userId: string
  username: string
  avatar?: string
  isOnline: boolean
  messages: Message[]
  unreadCount: number
}

// ─── Group ──────────────────────────────────────────────
export interface Group {
  id: string
  name: string
  description?: string
  members: string[]
  adminId: string
  messages: Message[]
  unreadCount: number
}

// ─── Chat Context State ─────────────────────────────────
export type ActiveChat =
  | { type: 'private'; userId: string }
  | { type: 'group'; groupId: string }
  | null

// ─── Socket Payloads ────────────────────────────────────
export interface PrivateSendPayload {
  to: string
  message: string
}

export interface PrivateReceivePayload {
  from: string
  message: string
  timestamp: number
  messageId: string
}

export interface GroupSendPayload {
  groupId: string
  message: string
}

export interface GroupReceivePayload {
  groupId: string
  from: string
  message: string
  timestamp: number
  messageId: string
}

export interface TypingPayload {
  to?: string
  groupId?: string
}

export interface TypingUpdatePayload {
  from: string
  isTyping: boolean
  chatId: string
}

export interface PresencePayload {
  userId: string
  username: string
}

// ─── Auth ────────────────────────────────────────────────
export interface AuthUser {
  id: string
  username: string
  email: string
  avatar?: string
  token: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}
