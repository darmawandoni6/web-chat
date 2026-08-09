import { Group, Message, User } from '../types/index.js';

class MemoryStore {
  private users = new Map<string, User>();
  private usersByEmail = new Map<string, User>();
  private messages: Message[] = [];
  private groups = new Map<string, Group>();
  private onlineUsers = new Map<string, string>(); // socketId -> userId
  private disconnectTimers = new Map<string, NodeJS.Timeout>();


  constructor() {
    // Seed default Public Lounge group so every user has an instant channel to chat
    const defaultGroup: Group = {
      id: 'public-lounge',
      name: '🌐 Global Lounge',
      description: 'Public channel for everyone on WebChat',
      adminId: 'system',
      members: [],
      createdAt: Date.now(),
    };
    this.groups.set(defaultGroup.id, defaultGroup);

    // Seed welcome message
    this.messages.push({
      id: 'welcome-msg-1',
      from: 'system',
      groupId: 'public-lounge',
      content: 'Welcome to WebChat! Feel free to send messages, share files, and try out real-time features! 🚀',
      type: 'text',
      timestamp: Date.now(),
      read: true,
      reactions: [{ emoji: '👋', userIds: ['system'] }],
    });
  }

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
    
    // Auto-add new user to public lounge
    const publicGroup = this.groups.get('public-lounge');
    if (publicGroup && !publicGroup.members.includes(id)) {
      publicGroup.members.push(id);
    }

    return user;
  }

  public createGuestUser(customUsername?: string): User {
    const id = crypto.randomUUID();
    const shortId = id.slice(0, 4).toUpperCase();
    const username = customUsername?.trim() || `Guest-${shortId}`;
    const email = `guest_${id.slice(0, 8)}@guest.local`;

    const user: User = {
      id,
      username,
      email,
      isGuest: true,
      createdAt: Date.now(),
    };

    this.users.set(id, user);
    this.usersByEmail.set(email.toLowerCase(), user);

    const publicGroup = this.groups.get('public-lounge');
    if (publicGroup && !publicGroup.members.includes(id)) {
      publicGroup.members.push(id);
    }

    return user;
  }

  public updateUsername(userId: string, newUsername: string): User | undefined {
    const user = this.users.get(userId);
    if (!user) return undefined;

    user.username = newUsername.trim();
    return user;
  }

  public deleteUser(userId: string): { deleted: boolean; socketIds: string[]; username?: string } {
    this.cancelDisconnectGracePeriod(userId);

    const user = this.users.get(userId);
    if (!user) return { deleted: false, socketIds: [] };

    const username = user.username;

    this.users.delete(userId);
    if (user.email) {
      this.usersByEmail.delete(user.email.toLowerCase());
    }

    // Clean up group memberships
    this.groups.forEach((group) => {
      group.members = group.members.filter((id) => id !== userId);
    });

    // Clean up online socket sessions
    const socketIds: string[] = [];
    this.onlineUsers.forEach((id, socketId) => {
      if (id === userId) {
        socketIds.push(socketId);
        this.onlineUsers.delete(socketId);
      }
    });

    // Purge user messages when user deletion is finalized
    this.messages = this.messages.filter((m) => m.from !== userId && m.to !== userId);

    return { deleted: true, socketIds, username };
  }


  public scheduleDisconnectGracePeriod(
    userId: string,
    delayMs: number,
    onExpire: () => void,
  ): void {
    this.cancelDisconnectGracePeriod(userId);

    const timer = setTimeout(() => {
      this.disconnectTimers.delete(userId);
      onExpire();
    }, delayMs);

    this.disconnectTimers.set(userId, timer);
  }

  public cancelDisconnectGracePeriod(userId: string): boolean {
    const timer = this.disconnectTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(userId);
      return true;
    }
    return false;
  }

  public getUserSocketIds(userId: string): string[] {
    const socketIds: string[] = [];
    this.onlineUsers.forEach((id, socketId) => {
      if (id === userId) {
        socketIds.push(socketId);
      }
    });
    return socketIds;
  }




  public restoreUser(user: User): User {
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email.toLowerCase(), user);

    // Auto-add restored user to public lounge
    const publicGroup = this.groups.get('public-lounge');
    if (publicGroup && !publicGroup.members.includes(user.id)) {
      publicGroup.members.push(user.id);
    }

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
    const sender = this.getUserById(msgData.from);
    const message: Message = {
      ...msgData,
      fromUsername: msgData.fromUsername || sender?.username,
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
    return Array.from(this.groups.values()).filter(
      (g) => g.id === 'public-lounge' || g.members.includes(userId)
    );
  }

  public getAllGroups(): Group[] {
    return Array.from(this.groups.values());
  }

  public deleteGroup(groupId: string): boolean {
    if (groupId === 'public-lounge') return false;
    const group = this.groups.get(groupId);
    if (!group) return false;

    this.groups.delete(groupId);
    this.messages = this.messages.filter((m) => m.groupId !== groupId);
    return true;
  }
}


export const memoryStore = new MemoryStore();
