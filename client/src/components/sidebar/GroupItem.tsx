import { Badge } from '@/components/ui/badge'
import { useChat } from '@/context/ChatContext'
import { type Group } from '@/types'
import { formatTime } from '@/utils/formatTime'
import { cn } from '@/lib/utils'
import { Users } from 'lucide-react'

interface GroupItemProps {
  group: Group
}

export function GroupItem({ group }: GroupItemProps) {
  const { activeChat, setActiveChat, markAsRead } = useChat()
  const isActive =
    activeChat?.type === 'group' && activeChat.groupId === group.id

  const lastMsg = group.messages[group.messages.length - 1]

  const handleClick = () => {
    setActiveChat({ type: 'group', groupId: group.id })
    markAsRead(group.id)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left',
        isActive
          ? 'bg-[var(--accent-violet)]/20 border border-[var(--accent-violet)]/30'
          : 'hover:bg-[var(--secondary)] border border-transparent'
      )}
    >
      {/* Group icon */}
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-base"
        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}
      >
        {group.name.startsWith('🚀') || group.name.startsWith('🎉')
          ? group.name.charAt(0)
          : <Users className="h-5 w-5" />}
      </div>

      {/* Name + last message */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={cn(
              'text-sm font-medium truncate',
              isActive ? 'text-[var(--accent-violet-hover)]' : 'text-[var(--foreground)]'
            )}
          >
            {group.name}
          </span>
          {lastMsg && (
            <span className="text-[10px] text-[var(--muted-foreground)] shrink-0 ml-1">
              {formatTime(lastMsg.timestamp)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--muted-foreground)] truncate">
            {lastMsg?.content ?? 'No messages yet'}
          </p>
          {group.unreadCount > 0 && (
            <Badge
              className="h-4 min-w-4 px-1 text-[10px] rounded-full shrink-0 ml-1"
              style={{ background: 'var(--accent-emerald)', color: '#fff' }}
            >
              {group.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}
