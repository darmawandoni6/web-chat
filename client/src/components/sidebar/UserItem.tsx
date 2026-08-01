import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useChat } from "@/context/ChatContext";
import { cn } from "@/lib/utils";
import { type Conversation } from "@/types";
import { formatTime } from "@/utils/formatTime";

interface UserItemProps {
  conversation: Conversation;
}

export function UserItem({ conversation }: UserItemProps) {
  const { activeChat, setActiveChat, markAsRead } = useChat();
  const isActive =
    activeChat?.type === "private" && activeChat.userId === conversation.userId;

  const lastMsg = conversation.messages[conversation.messages.length - 1];

  const handleClick = () => {
    setActiveChat({ type: "private", userId: conversation.userId });
    markAsRead(conversation.userId);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group",
        isActive
          ? "bg-[var(--accent-violet)]/20 border border-[var(--accent-violet)]/30"
          : "hover:bg-[var(--secondary)] border border-transparent",
      )}
    >
      {/* Avatar with online indicator */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback
            className="text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff",
            }}
          >
            {conversation.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--sidebar)]",
            conversation.isOnline
              ? "bg-[var(--accent-emerald)]"
              : "bg-[var(--muted-foreground)]",
          )}
        />
      </div>

      {/* Name + last message */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={cn(
              "text-sm font-medium truncate",
              isActive
                ? "text-[var(--accent-violet-hover)]"
                : "text-[var(--foreground)]",
            )}
          >
            {conversation.username}
          </span>
          {lastMsg && (
            <span className="text-[10px] text-[var(--muted-foreground)] shrink-0 ml-1">
              {formatTime(lastMsg.timestamp)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--muted-foreground)] truncate">
            {lastMsg?.content ?? "No messages yet"}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge
              className="h-4 min-w-4 px-1 text-[10px] rounded-full shrink-0 ml-1"
              style={{ background: "var(--accent-violet)", color: "#fff" }}
            >
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
