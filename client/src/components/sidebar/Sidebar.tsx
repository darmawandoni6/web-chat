import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CreateGroupModal } from '@/components/chat/CreateGroupModal';
import { GroupItem } from '@/components/sidebar/GroupItem';
import { UserItem } from '@/components/sidebar/UserItem';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { LogOut, Moon, Plus, Search, Sun } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Sidebar({ isDark, onToggleTheme }: SidebarProps) {
  const { user, logout } = useAuth();
  const { conversations, groups, allUsers, createGroup } = useChat();
  const [search, setSearch] = useState('');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const totalUnread =
    conversations.reduce((s, c) => s + c.unreadCount, 0) +
    groups.reduce((s, g) => s + g.unreadCount, 0);

  const filteredConvs = conversations.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      className="flex flex-col h-full border-r"
      style={{ background: 'var(--sidebar)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              💬
            </div>
            <span className="font-bold text-base" style={{ color: 'var(--foreground)' }}>
              WebChat
            </span>
            {totalUnread > 0 && (
              <span
                className="h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: 'var(--accent-rose)', color: '#fff' }}
              >
                {totalUnread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              onClick={onToggleTheme}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search users or groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm rounded-lg border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)]"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        {/* Private chats */}
        <div className="mb-2">
          <div className="px-2 pb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Direct Messages
            </span>
          </div>
          <div className="space-y-0.5">
            {filteredConvs.length === 0 ? (
              <p className="px-2 py-2 text-xs text-[var(--muted-foreground)]">No other users online yet</p>
            ) : (
              filteredConvs.map((c) => <UserItem key={c.userId} conversation={c} />)
            )}
          </div>
        </div>

        <Separator className="my-2 opacity-30" />

        {/* Groups */}
        <div className="mb-2">
          <div className="px-2 pb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Groups
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsGroupModalOpen(true)}
              className="h-5 w-5 rounded text-[var(--muted-foreground)] hover:text-[var(--accent-violet)]"
              title="Create Group"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-0.5">
            {filteredGroups.length === 0 ? (
              <p className="px-2 py-2 text-xs text-[var(--muted-foreground)]">No groups created yet</p>
            ) : (
              filteredGroups.map((g) => <GroupItem key={g.id} group={g} />)
            )}
          </div>
        </div>
      </ScrollArea>

      {/* User profile footer */}
      <div
        className="px-3 py-3 border-t flex items-center gap-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback
            className="text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff' }}
          >
            {user?.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>
            {user?.username}
          </p>
          <p className="text-[10px] truncate" style={{ color: 'var(--accent-emerald)' }}>
            ● Online
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg shrink-0 hover:text-[var(--accent-rose)] text-[var(--muted-foreground)]"
          onClick={logout}
          title="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        users={allUsers}
        onCreate={createGroup}
      />
    </aside>
  );
}
