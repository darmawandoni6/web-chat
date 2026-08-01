import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { MoreVertical, Phone, Video } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function ChatWindow() {
  const { user } = useAuth();
  const { activeChat, conversations, groups, sendMessage, sendTyping, addReaction, typingUsers, allUsers } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat, conversations, groups]);

  if (!activeChat) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-4 p-6"
        style={{ background: 'var(--background)' }}
      >
        <div
          className="h-20 w-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          💬
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            Welcome to WebChat, {user?.username}!
          </h3>
          <p className="text-sm max-w-sm" style={{ color: 'var(--muted-foreground)' }}>
            Select a direct message or group chat from the sidebar to start talking.
          </p>
        </div>
      </div>
    );
  }

  let headerName = '';
  let headerSub = '';
  let isOnline = false;
  let messages = [];
  let chatId = '';

  if (activeChat.type === 'private') {
    const conv = conversations.find((c) => c.userId === activeChat.userId);
    chatId = activeChat.userId;
    headerName = conv?.username || 'User';
    isOnline = conv?.isOnline || false;
    headerSub = isOnline ? 'Online' : 'Offline';
    messages = conv?.messages || [];
  } else {
    const group = groups.find((g) => g.id === activeChat.groupId);
    chatId = activeChat.groupId;
    headerName = group?.name || 'Group';
    headerSub = `${group?.members.length || 0} members`;
    messages = group?.messages || [];
  }

  const isTyping = Boolean(typingUsers[chatId]);

  const getSenderName = (fromId: string) => {
    if (fromId === user?.id) return 'You';
    return allUsers.find((u) => u.id === fromId)?.username || fromId;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-3 shadow-sm"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarFallback
              className="text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              {headerName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {activeChat.type === 'private' && (
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--card)]',
                isOnline ? 'bg-[var(--accent-emerald)]' : 'bg-[var(--muted-foreground)]'
              )}
            />
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            {headerName}
          </h2>
          <p
            className="text-xs"
            style={{ color: isOnline ? 'var(--accent-emerald)' : 'var(--muted-foreground)' }}
          >
            {headerSub}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--accent-violet)]"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--accent-violet)]"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.from === user?.id}
              senderName={activeChat.type === 'group' ? getSenderName(msg.from) : undefined}
              onReact={addReaction}
            />
          ))}

          {isTyping && (
            <TypingIndicator name={activeChat.type === 'private' ? headerName : 'Someone'} />
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <MessageInput onSend={sendMessage} onTyping={sendTyping} />
    </div>
  );
}
