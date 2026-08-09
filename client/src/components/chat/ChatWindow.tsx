import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { cn } from "@/lib/utils";
import { type Message } from "@/types";
import {
  Info,
  Menu,
  MoreVertical,
  Trash2,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatWindowProps {
  onOpenMobileSidebar?: () => void;
}

export function ChatWindow({ onOpenMobileSidebar }: ChatWindowProps) {
  const { user } = useAuth();
  const {
    activeChat,
    conversations,
    groups,
    sendMessage,
    sendTyping,
    addReaction,
    deleteGroup,
    typingUsers,
    allUsers,
  } = useChat();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, conversations, groups]);

  if (!activeChat) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center gap-4 p-6"
        style={{ background: "var(--background)" }}
      >
        <Button
          variant="outline"
          size="sm"
          className="md:hidden flex items-center gap-2 mb-2 border-[var(--border)] text-[var(--foreground)]"
          onClick={onOpenMobileSidebar}
        >
          <Menu className="h-4 w-4" />
          <span>Open Conversations</span>
        </Button>
        <div
          className="h-20 w-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          💬
        </div>
        <div className="text-center space-y-1">
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Welcome to WebChat, {user?.username}!
          </h3>
          <p
            className="text-sm max-w-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Select a direct message or group chat from the sidebar to start
            talking.
          </p>
        </div>
      </div>
    );
  }

  let headerName = "";
  let headerSub = "";
  let isOnline = false;
  let messages = [];
  let chatId = "";

  if (activeChat.type === "private") {
    const conv = conversations.find((c) => c.userId === activeChat.userId);
    chatId = activeChat.userId;
    headerName = conv?.username || "User";
    isOnline = conv?.isOnline || false;
    headerSub = isOnline ? "Online" : "Offline";
    messages = conv?.messages || [];
  } else {
    const group = groups.find((g) => g.id === activeChat.groupId);
    chatId = activeChat.groupId;
    headerName = group?.name || "Group";
    headerSub = `${group?.members.length || 0} members`;
    messages = group?.messages || [];
  }

  const isTyping = Boolean(typingUsers[chatId]);

  const getSenderName = (msg: Message) => {
    if (msg.from === user?.id) return "You";
    if (msg.fromUsername) return msg.fromUsername;
    const found = allUsers.find((u) => u.id === msg.from);
    if (found?.username) return found.username;
    return "User";
  };

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-3 shadow-sm"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] shrink-0"
          onClick={onOpenMobileSidebar}
          title="Open Menu"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarFallback
              className="text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              }}
            >
              {headerName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {activeChat.type === "private" && (
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--card)] transition-colors",
                isOnline ? "bg-emerald-500" : "bg-gray-400 dark:bg-zinc-600",
              )}
            />
          )}
        </div>

        <div className="flex-1">
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            {headerName}
          </h2>
          <p
            className={cn(
              "text-xs font-medium",
              isOnline ? "text-emerald-500" : "text-[var(--muted-foreground)]",
            )}
          >
            {headerSub}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {activeChat.type === "group" &&
            groups.find((g) => g.id === activeChat.groupId)?.adminId ===
              user?.id &&
            activeChat.groupId !== "public-lounge" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteModal(true)}
                className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10"
                title="Delete Group Channel"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                title="Chat Options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]"
            >
              {activeChat.type === "group" ? (
                <>
                  <DropdownMenuItem
                    onClick={() => setShowInfoModal(true)}
                    className="cursor-pointer gap-2 text-xs"
                  >
                    <Info className="h-4 w-4 text-[var(--accent-violet-hover)]" />
                    <span>Group Info & Members</span>
                  </DropdownMenuItem>
                  {activeChat.type === "group" &&
                    groups.find((g) => g.id === activeChat.groupId)?.adminId ===
                      user?.id &&
                    activeChat.groupId !== "public-lounge" && (
                      <>
                        <DropdownMenuSeparator className="bg-[var(--border)]" />
                        <DropdownMenuItem
                          onClick={() => setShowDeleteModal(true)}
                          className="cursor-pointer gap-2 text-xs text-red-500 focus:text-red-500 focus:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Group</span>
                        </DropdownMenuItem>
                      </>
                    )}
                </>
              ) : (
                <DropdownMenuItem
                  onClick={() => setShowInfoModal(true)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <UserIcon className="h-4 w-4 text-[var(--accent-violet-hover)]" />
                  <span>View Profile</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Group Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-red-500">
              <Trash2 className="h-5 w-5" />
              Delete Group Channel
            </DialogTitle>
            <DialogDescription className="text-xs text-[var(--muted-foreground)] pt-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[var(--foreground)]">
                {headerName}
              </span>
              ? All group messages will be permanently removed for all members.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="border-[var(--border)] text-[var(--foreground)]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (activeChat.type === "group") {
                  deleteGroup(activeChat.groupId);
                }
                setShowDeleteModal(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Delete Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info / Profile Modal */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="sm:max-w-md bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              {activeChat.type === "group" ? (
                <Users className="h-5 w-5 text-[var(--accent-violet-hover)]" />
              ) : (
                <UserIcon className="h-5 w-5 text-[var(--accent-violet-hover)]" />
              )}
              {activeChat.type === "group" ? "Group Details" : "User Profile"}
            </DialogTitle>
          </DialogHeader>

          {activeChat.type === "group" &&
          groups.find((g) => g.id === activeChat.groupId) ? (
            <div className="space-y-4 py-2">
              <div>
                <h4 className="text-sm font-semibold">{headerName}</h4>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  {groups.find((g) => g.id === activeChat.groupId)
                    ?.description || "No description provided"}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--muted-foreground)]">
                  Members (
                  {groups.find((g) => g.id === activeChat.groupId)?.members
                    .length || 0}
                  )
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1 border border-[var(--border)] rounded-xl p-2 bg-[var(--secondary)]">
                  {groups
                    .find((g) => g.id === activeChat.groupId)
                    ?.members.map((id) => {
                      const isSelf = id === user?.id;
                      const u = isSelf
                        ? { username: `${user.username} (You)` }
                        : allUsers.find((x) => x.id === id) || {
                            username: "User",
                          };
                      const adminId = groups.find(
                        (g) => g.id === activeChat.groupId,
                      )?.adminId;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-2 rounded-lg text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-gradient-to-tr from-violet-600 to-purple-500 text-white font-semibold">
                                {u.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-[var(--foreground)]">
                              {u.username}
                            </span>
                          </div>
                          {id === adminId && (
                            <span className="text-[10px] bg-[var(--accent-violet)]/20 text-[var(--accent-violet-hover)] px-1.5 py-0.5 rounded font-semibold border border-[var(--accent-violet)]/30">
                              👑 Admin
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl font-bold bg-gradient-to-tr from-violet-600 to-purple-500 text-white">
                  {headerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  {headerName}
                </h3>
                <p
                  className={cn(
                    "text-xs font-medium mt-1",
                    isOnline
                      ? "text-emerald-500"
                      : "text-[var(--muted-foreground)]",
                  )}
                >
                  {headerSub}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Messages area */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.from === user?.id}
              senderName={
                activeChat.type === "group" ? getSenderName(msg) : undefined
              }
              onReact={addReaction}
            />
          ))}

          {isTyping && (
            <TypingIndicator
              name={activeChat.type === "private" ? headerName : "Someone"}
            />
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <MessageInput onSend={sendMessage} onTyping={sendTyping} />
    </div>
  );
}
