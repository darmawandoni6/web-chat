import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useSocket } from '@/hooks/useSocket';
import {
  type ActiveChat,
  type Conversation,
  type Group,
  type Message,
  type PresencePayload,
  type User,
} from '@/types';

import { getGroupsApi, getUsersApi } from '@/utils/api';
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
  deleteGroup: (groupId: string) => void;
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

  // 1. Load users and groups from API on mount
  useEffect(() => {
    if (!user) return;
    async function loadData() {
      try {
        const [usersList, groupsList] = await Promise.all([
          getUsersApi(),
          getGroupsApi().catch(() => []),
        ]);

        const otherUsers = usersList.filter((u) => u.id !== user?.id);
        setAllUsers(otherUsers);

        // Build initial conversations list
        setConversations(
          otherUsers.map((u) => ({
            userId: u.id,
            username: u.username,
            avatar: u.avatar,
            isOnline: onlineUserIds.includes(u.id),
            messages: [],
            unreadCount: 0,
          }))
        );

        if (groupsList.length > 0) {
          setGroups(groupsList);
          // Auto-select Public Lounge so the main window is immediately active
          const defaultGroup = groupsList.find((g) => g.id === 'public-lounge') || groupsList[0];
          setActiveChat({ type: 'group', groupId: defaultGroup.id });
        }
      } catch (err) {
        console.error('Failed to load initial chat data:', err);
      }
    }
    loadData();
  }, [user]);

  // Keep conversations isOnline state synchronized with onlineUserIds
  useEffect(() => {
    if (onlineUserIds.length === 0) return;
    setConversations((prev) =>
      prev.map((c) => ({
        ...c,
        isOnline: onlineUserIds.includes(c.userId),
      }))
    );
  }, [onlineUserIds]);

  // Auto-join socket rooms for all loaded groups
  useEffect(() => {
    if (!socketClient || groups.length === 0) return;
    groups.forEach((g) => {
      socketClient.emit('group:join', { groupId: g.id });
    });
  }, [socketClient, groups]);


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
    const unsubOnline = socketClient.on<PresencePayload>(
      'presence:online',
      (data) => {
        setOnlineUserIds((prev) => Array.from(new Set([...prev, data.userId])));

        // Add or update user in allUsers
        setAllUsers((prev) => {
          if (prev.some((u) => u.id === data.userId)) {
            return prev.map((u) =>
              u.id === data.userId
                ? { ...u, username: data.username, email: data.email || u.email }
                : u
            );
          }
          return [...prev, { id: data.userId, username: data.username, email: data.email || '' }];
        });


        // Add to conversations if not existing
        setConversations((prev) => {
          const exists = prev.some((c) => c.userId === data.userId);
          if (exists) {
            return prev.map((c) => {
              if (c.userId === data.userId) {
                const wasOffline = !c.isOnline;
                let updatedMsgs = c.messages;

                if (wasOffline || data.reconnected) {
                  const systemMsg: Message = {
                    id: `system-on-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                    from: 'system',
                    fromUsername: 'System',
                    to: c.userId,
                    content: `⚡ ${data.username} reconnected`,
                    type: 'system',
                    timestamp: Date.now(),
                    read: true,
                    reactions: [],
                  };
                  updatedMsgs = [...c.messages, systemMsg];
                }
                return { ...c, isOnline: true, messages: updatedMsgs };
              }
              return c;
            });
          }
          return [
            ...prev,
            {
              userId: data.userId,
              username: data.username,
              isOnline: true,
              messages: [],
              unreadCount: 0,
            },
          ];
        });

      }
    );

    // Presence offline
    const unsubOffline = socketClient.on<{ userId: string; username: string }>(
      'presence:offline',
      (data) => {
        setOnlineUserIds((prev) => prev.filter((id) => id !== data.userId));
        setConversations((prev) =>
          prev.map((c) => {
            if (c.userId === data.userId) {
              const systemMsg: Message = {
                id: `system-off-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                from: 'system',
                fromUsername: 'System',
                to: c.userId,
                content: `⚠️ ${data.username} disconnected. Waiting for reconnect...`,
                type: 'system',
                timestamp: Date.now(),
                read: true,
                reactions: [],
              };
              return {
                ...c,
                isOnline: false,
                messages: [...c.messages, systemMsg],
              };
            }
            return c;
          })
        );
      }
    );

    // Private message receive
    const unsubPrivRecv = socketClient.on<{
      messageId: string;
      from: string;
      fromUsername?: string;
      message: string;
      type?: 'text' | 'image' | 'file';
      fileUrl?: string;
      timestamp: number;
    }>('private:receive', (data) => {
      const newMsg: Message = {
        id: data.messageId,
        from: data.from,
        fromUsername: data.fromUsername,
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
            if (c.messages.some((m) => m.id === newMsg.id)) return c;
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

      const senderDisplayName = data.fromUsername || data.from;
      sendNotification(`New message from ${senderDisplayName}`, { body: data.message });
    });

    // Private sent ack (for current sender)
    const unsubPrivAck = socketClient.on<Message>('private:sent-ack', (msg) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.userId === msg.to) {
            if (c.messages.some((m) => m.id === msg.id)) return c;
            return { ...c, messages: [...c.messages, msg] };
          }
          return c;
        })
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
      fromUsername?: string;
      message: string;
      type?: 'text' | 'image' | 'file';
      fileUrl?: string;
      timestamp: number;
    }>('group:receive', (data) => {
      const newMsg: Message = {
        id: data.messageId,
        from: data.from,
        fromUsername: data.fromUsername,
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
            if (g.messages.some((m) => m.id === newMsg.id)) return g;
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

    // Typing update — filter out current user's typing events so typing indicator is only shown for other users
    const unsubTyping = socketClient.on<{ from: string; isTyping: boolean; chatId: string }>(
      'typing:update',
      (data) => {
        if (data.from === user.id) return;
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

    // History response handlers
    const unsubPrivHist = socketClient.on<{ withUserId: string; messages: Message[] }>(
      'private:history-response',
      (data) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.userId === data.withUserId) {
              const existingSystemMsgs = c.messages.filter((m) => m.type === 'system');
              const merged = [...data.messages];
              existingSystemMsgs.forEach((sys) => {
                if (!merged.some((m) => m.id === sys.id)) {
                  merged.push(sys);
                }
              });
              merged.sort((a, b) => a.timestamp - b.timestamp);
              return { ...c, messages: merged };
            }
            return c;
          })
        );
      }
    );

    const unsubGroupHist = socketClient.on<{ groupId: string; messages: Message[] }>(
      'group:history-response',
      (data) => {
        setGroups((prev) =>
          prev.map((g) => (g.id === data.groupId ? { ...g, messages: data.messages } : g))
        );
      }
    );

    // Group deleted handler
    const unsubGroupDeleted = socketClient.on<{ groupId: string }>('group:deleted', (data) => {
      setGroups((prev) => prev.filter((g) => g.id !== data.groupId));
      if (activeChat?.type === 'group' && activeChat.groupId === data.groupId) {
        setActiveChat({ type: 'group', groupId: 'public-lounge' });
      }
    });

    // Force logout event from server when account/session is deleted
    const unsubForceLogout = socketClient.on<{ userId: string }>('auth:force-logout', () => {
      console.warn('⚠️ Session deleted by server. Redirecting to login.');
      localStorage.removeItem('token');
      window.location.href = '/login';
    });

    // User removed event from server when session is destroyed
    const unsubUserRemoved = socketClient.on<{ userId: string }>('user:removed', (data) => {
      setAllUsers((prev) => prev.filter((u) => u.id !== data.userId));
      setConversations((prev) => prev.filter((c) => c.userId !== data.userId));
      if (activeChat?.type === 'private' && activeChat.userId === data.userId) {
        setActiveChat(null);
      }

    });

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
      unsubPrivHist?.();
      unsubGroupHist?.();
      unsubGroupDeleted?.();
      unsubForceLogout?.();
      unsubUserRemoved?.();
    };
  }, [user, socketClient, activeChat, sendNotification]);


  // Fetch message history whenever active chat changes or socket connects
  useEffect(() => {
    if (!socketClient || !activeChat) return;
    if (activeChat.type === 'private') {
      socketClient.emit('private:history', { withUserId: activeChat.userId });
    } else if (activeChat.type === 'group') {
      socketClient.emit('group:history', { groupId: activeChat.groupId });
    }
  }, [socketClient, activeChat]);




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

  const deleteGroup = useCallback(
    (groupId: string) => {
      if (!socketClient || !groupId || groupId === 'public-lounge') return;
      socketClient.emit('group:delete', { groupId });
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
        deleteGroup,
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
