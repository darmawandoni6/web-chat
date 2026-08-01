import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useSocket } from '@/hooks/useSocket';
import {
  type ActiveChat,
  type Conversation,
  type Group,
  type Message,
  type User,
} from '@/types';
import { getUsersApi } from '@/utils/api';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

interface ChatContextValue {
  conversations: Conversation[];
  groups: Group[];
  activeChat: ActiveChat;
  onlineUserIds: string[];
  typingUsers: Record<string, boolean>;
  setActiveChat: (chat: ActiveChat) => void;
  sendMessage: (content: string, type?: 'text' | 'image' | 'file', fileUrl?: string) => void;
  sendTyping: (isTyping: boolean) => void;
  addReaction: (messageId: string, emoji: string) => void;
  createGroup: (name: string, description: string, members: string[]) => void;
  markAsRead: (chatId: string) => void;
  allUsers: User[];
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const socketClient = useSocket(user?.id);
  const { sendNotification } = useNotification();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeChat, setActiveChat] = useState<ActiveChat>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  // 1. Load users from API on mount
  useEffect(() => {
    if (!user) return;
    async function loadUsers() {
      try {
        const usersList = await getUsersApi();
        const otherUsers = usersList.filter((u) => u.id !== user?.id);
        setAllUsers(otherUsers);

        // Build initial conversations list
        setConversations(
          otherUsers.map((u) => ({
            userId: u.id,
            username: u.username,
            avatar: u.avatar,
            isOnline: false,
            messages: [],
            unreadCount: 0,
          }))
        );
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    }
    loadUsers();
  }, [user]);

  // 2. Real-time Socket.IO Listeners via socketio-kit/client
  useEffect(() => {
    if (!user || !socketClient) return;

    // Presence list
    const unsubList = socketClient.on<string[]>('presence:list', (list) => {
      setOnlineUserIds(list);
      setConversations((prev) =>
        prev.map((c) => ({ ...c, isOnline: list.includes(c.userId) }))
      );
    });

    // Presence online
    const unsubOnline = socketClient.on<{ userId: string; username: string }>(
      'presence:online',
      (data) => {
        setOnlineUserIds((prev) => [...new Set([...prev, data.userId])]);
        setConversations((prev) =>
          prev.map((c) =>
            c.userId === data.userId ? { ...c, isOnline: true } : c
          )
        );
      }
    );

    // Presence offline
    const unsubOffline = socketClient.on<{ userId: string; username: string }>(
      'presence:offline',
      (data) => {
        setOnlineUserIds((prev) => prev.filter((id) => id !== data.userId));
        setConversations((prev) =>
          prev.map((c) =>
            c.userId === data.userId ? { ...c, isOnline: false } : c
          )
        );
      }
    );

    // Private message receive
    const unsubPrivRecv = socketClient.on<{
      messageId: string;
      from: string;
      message: string;
      type?: 'text' | 'image' | 'file';
      fileUrl?: string;
      timestamp: number;
    }>('private:receive', (data) => {
      const newMsg: Message = {
        id: data.messageId,
        from: data.from,
        content: data.message,
        type: data.type || 'text',
        fileUrl: data.fileUrl,
        timestamp: data.timestamp,
        read: false,
        reactions: [],
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.userId === data.from) {
            const isActive = activeChat?.type === 'private' && activeChat.userId === data.from;
            return {
              ...c,
              messages: [...c.messages, newMsg],
              unreadCount: isActive ? c.unreadCount : c.unreadCount + 1,
            };
          }
          return c;
        })
      );

      sendNotification(`New message from ${data.from}`, { body: data.message });
    });

    // Private sent ack (for current sender)
    const unsubPrivAck = socketClient.on<Message>('private:sent-ack', (msg) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.userId === msg.to
            ? { ...c, messages: [...c.messages, msg] }
            : c
        )
      );
    });

    // Group created
    const unsubGroupCreated = socketClient.on<Group>('group:created', (group) => {
      setGroups((prev) => [...prev, { ...group, messages: [], unreadCount: 0 }]);
      socketClient.emit('group:join', { groupId: group.id });
    });

    // Group receive message
    const unsubGroupRecv = socketClient.on<{
      messageId: string;
      groupId: string;
      from: string;
      message: string;
      type?: 'text' | 'image' | 'file';
      fileUrl?: string;
      timestamp: number;
    }>('group:receive', (data) => {
      const newMsg: Message = {
        id: data.messageId,
        from: data.from,
        groupId: data.groupId,
        content: data.message,
        type: data.type || 'text',
        fileUrl: data.fileUrl,
        timestamp: data.timestamp,
        read: false,
        reactions: [],
      };

      setGroups((prev) =>
        prev.map((g) => {
          if (g.id === data.groupId) {
            const isActive = activeChat?.type === 'group' && activeChat.groupId === data.groupId;
            return {
              ...g,
              messages: [...g.messages, newMsg],
              unreadCount: isActive ? g.unreadCount : g.unreadCount + 1,
            };
          }
          return g;
        })
      );

      if (data.from !== user.id) {
        sendNotification('New Group Message', { body: data.message });
      }
    });

    // Typing update
    const unsubTyping = socketClient.on<{ from: string; isTyping: boolean; chatId: string }>(
      'typing:update',
      (data) => {
        setTypingUsers((prev) => ({ ...prev, [data.chatId]: data.isTyping }));
      }
    );

    // Reaction update
    const unsubReaction = socketClient.on<{ messageId: string; reactions: any[] }>(
      'message:reaction-update',
      (data) => {
        const updateMsg = (msgs: Message[]) =>
          msgs.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m));

        setConversations((prev) =>
          prev.map((c) => ({ ...c, messages: updateMsg(c.messages) }))
        );
        setGroups((prev) =>
          prev.map((g) => ({ ...g, messages: updateMsg(g.messages) }))
        );
      }
    );

    return () => {
      unsubList?.();
      unsubOnline?.();
      unsubOffline?.();
      unsubPrivRecv?.();
      unsubPrivAck?.();
      unsubGroupCreated?.();
      unsubGroupRecv?.();
      unsubTyping?.();
      unsubReaction?.();
    };
  }, [user, socketClient, activeChat, sendNotification]);

  // 3. Actions
  const sendMessage = useCallback(
    (content: string, type: 'text' | 'image' | 'file' = 'text', fileUrl?: string) => {
      if (!activeChat || !content.trim()) return;

      if (activeChat.type === 'private') {
        socketClient.emit('private:send', {
          to: activeChat.userId,
          message: content,
          type,
          fileUrl,
        });
      } else {
        socketClient.emit('group:send', {
          groupId: activeChat.groupId,
          message: content,
          type,
          fileUrl,
        });
      }
    },
    [activeChat, socketClient]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!activeChat) return;
      const event = isTyping ? 'typing:start' : 'typing:stop';
      if (activeChat.type === 'private') {
        socketClient.emit(event, { to: activeChat.userId });
      } else {
        socketClient.emit(event, { groupId: activeChat.groupId });
      }
    },
    [activeChat, socketClient]
  );

  const addReaction = useCallback(
    (messageId: string, emoji: string) => {
      if (!activeChat) return;
      if (activeChat.type === 'private') {
        socketClient.emit('message:react', {
          messageId,
          emoji,
          toUserId: activeChat.userId,
        });
      } else {
        socketClient.emit('message:react', {
          messageId,
          emoji,
          groupId: activeChat.groupId,
        });
      }
    },
    [activeChat, socketClient]
  );

  const createGroup = useCallback(
    (name: string, description: string, members: string[]) => {
      socketClient.emit('group:create', { name, description, members });
    },
    [socketClient]
  );

  const markAsRead = useCallback((chatId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.userId === chatId ? { ...c, unreadCount: 0 } : c))
    );
    setGroups((prev) =>
      prev.map((g) => (g.id === chatId ? { ...g, unreadCount: 0 } : g))
    );
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        groups,
        activeChat,
        onlineUserIds,
        typingUsers,
        setActiveChat,
        sendMessage,
        sendTyping,
        addReaction,
        createGroup,
        markAsRead,
        allUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
}
