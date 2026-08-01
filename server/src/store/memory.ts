import { Group, Message, User } from '../types/index.js';

class MemoryStore {
  private users = new Map<string, User>();
  private usersByEmail = new Map<string, User>();
  private messages: Message[] = [];
  private groups = new Map<string, Group>();
  private onlineUsers = new Map<string, string>(); // socketId -> userId

  // ─── User Store ──────────────────────────────────────────
  public createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const id = crypto.randomUUID();
    const user: User = {
      ...userData,
      id,
      createdAt: Date.now(),
    };
    this.users.set(id, user);
    this.usersByEmail.set(user.email.toLowerCase(), user);
    return user;
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.usersByEmail.get(email.toLowerCase());
  }

  public getUserByGoogleId(googleId: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.googleId === googleId);
  }

  public getAllUsers(): User[] {
    return Array.from(this.users.values()).map(({ password, ...rest }) => rest as User);
  }

  // ─── Presence ────────────────────────────────────────────
  public setOnline(socketId: string, userId: string): void {
    this.onlineUsers.set(socketId, userId);
  }

  public setOffline(socketId: string): string | undefined {
    const userId = this.onlineUsers.get(socketId);
    if (userId) {
      this.onlineUsers.delete(socketId);
    }
    return userId;
  }

  public isUserOnline(userId: string): boolean {
    return Array.from(this.onlineUsers.values()).includes(userId);
  }

  public getOnlineUserIds(): string[] {
    return Array.from(new Set(this.onlineUsers.values()));
  }

  // ─── Message Store ───────────────────────────────────────
  public addMessage(msgData: Omit<Message, 'id' | 'timestamp' | 'read' | 'reactions'>): Message {
    const message: Message = {
      ...msgData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      read: false,
      reactions: [],
    };
    this.messages.push(message);
    return message;
  }

  public getPrivateMessages(userId1: string, userId2: string): Message[] {
    return this.messages.filter(
      (m) =>
        (m.from === userId1 && m.to === userId2) ||
        (m.from === userId2 && m.to === userId1)
    );
  }

  public getGroupMessages(groupId: string): Message[] {
    return this.messages.filter((m) => m.groupId === groupId);
  }

  public markAsRead(messageId: string): boolean {
    const msg = this.messages.find((m) => m.id === messageId);
    if (msg) {
      msg.read = true;
      return true;
    }
    return false;
  }

  public addReaction(messageId: string, userId: string, emoji: string): Message | undefined {
    const msg = this.messages.find((m) => m.id === messageId);
    if (!msg) return undefined;

    const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
    if (existingReaction) {
      if (existingReaction.userIds.includes(userId)) {
        existingReaction.userIds = existingReaction.userIds.filter((id) => id !== userId);
      } else {
        existingReaction.userIds.push(userId);
      }
    } else {
      msg.reactions.push({ emoji, userIds: [userId] });
    }
    return msg;
  }

  // ─── Group Store ─────────────────────────────────────────
  public createGroup(name: string, description: string | undefined, adminId: string, members: string[]): Group {
    const groupId = crypto.randomUUID();
    const group: Group = {
      id: groupId,
      name,
      description,
      adminId,
      members: Array.from(new Set([adminId, ...members])),
      createdAt: Date.now(),
    };
    this.groups.set(groupId, group);
    return group;
  }

  public getGroupById(groupId: string): Group | undefined {
    return this.groups.get(groupId);
  }

  public getUserGroups(userId: string): Group[] {
    return Array.from(this.groups.values()).filter((g) => g.members.includes(userId));
  }
}

export const memoryStore = new MemoryStore();
