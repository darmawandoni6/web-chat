import { type Message } from '@/types';
import { API_URL } from '@/utils/api';
import { formatFullDate } from '@/utils/formatTime';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, FileText } from 'lucide-react';
import { useState } from 'react';

const EMOJI_OPTIONS = ['❤️', '😂', '👍', '😮', '😢', '🔥'];

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  senderName?: string;
  onReact: (messageId: string, emoji: string) => void;
}

export function MessageBubble({ message, isMine, senderName, onReact }: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);

  if (message.type === 'system') {
    const isDisconnect =
      message.content.includes('disconnected') ||
      message.content.includes('offline') ||
      message.content.includes('⚠️');

    const isConnect =
      !isDisconnect &&
      (message.content.includes('reconnected') ||
        message.content.includes('online') ||
        message.content.includes('⚡'));

    return (
      <div className="flex items-center justify-center my-3 w-full animate-in fade-in zoom-in-95 duration-200">
        <div
          className={cn(
            'flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-medium border shadow-xs transition-colors',
            isConnect
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-gray-500/10 text-gray-500 dark:text-zinc-400 border-gray-500/20 dark:border-zinc-700/50'
          )}
        >
          <span>{message.content}</span>
        </div>
      </div>
    );
  }



  const totalReactions = message.reactions.filter((r) => r.userIds.length > 0);


  const renderContent = () => {
    if (message.type === 'image' && message.fileUrl) {
      const fullUrl = message.fileUrl.startsWith('http') ? message.fileUrl : `${API_URL}${message.fileUrl}`;
      return (
        <div className="space-y-1">
          <img
            src={fullUrl}
            alt="Uploaded content"
            className="max-w-xs max-h-60 rounded-xl object-cover border border-white/10"
          />
          {message.content && message.content !== message.fileUrl && (
            <p className="text-xs text-[var(--muted-foreground)]">{message.content}</p>
          )}
        </div>
      );
    }

    if (message.type === 'file' && message.fileUrl) {
      const fullUrl = message.fileUrl.startsWith('http') ? message.fileUrl : `${API_URL}${message.fileUrl}`;
      return (
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 rounded-xl bg-black/20 hover:bg-black/30 transition-colors border border-white/10 text-xs text-[var(--accent-violet-hover)] underline"
        >
          <FileText className="h-4 w-4 shrink-0" />
          <span className="truncate">{message.content}</span>
        </a>
      );
    }

    return message.content;
  };

  return (
    <div
      className={cn('flex gap-2 group', isMine ? 'flex-row-reverse' : 'flex-row')}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* Bubble */}
      <div className={cn('max-w-[72%] flex flex-col gap-1', isMine ? 'items-end' : 'items-start')}>
        {/* Sender name (group only) */}
        {!isMine && senderName && (
          <span className="text-[11px] font-medium px-1 text-[var(--accent-violet-hover)]">
            {senderName}
          </span>
        )}

        <div
          className={cn(
            'px-3.5 py-2 rounded-2xl text-sm leading-relaxed relative shadow-sm',
            isMine ? 'rounded-tr-sm' : 'rounded-tl-sm'
          )}
          style={{
            background: isMine ? 'var(--message-sent)' : 'var(--message-recv)',
            color: 'var(--foreground)',
          }}
        >
          {renderContent()}

          {/* Timestamp + read receipt */}
          <div className={cn('flex items-center gap-1 mt-1', isMine ? 'justify-end' : 'justify-start')}>
            <span className="text-[10px] opacity-60">{formatFullDate(message.timestamp)}</span>
            {isMine &&
              (message.read ? (
                <CheckCheck className="h-3 w-3 text-[var(--accent-emerald)]" />
              ) : (
                <Check className="h-3 w-3 opacity-60" />
              ))}
          </div>
        </div>

        {/* Reactions */}
        {totalReactions.length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {totalReactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact(message.id, r.emoji)}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-all hover:scale-110"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                {r.emoji}
                <span className="text-[10px] opacity-70">{r.userIds.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Emoji picker (appears on hover) */}
      {showReactions && (
        <div
          className={cn(
            'flex items-center gap-0.5 self-center opacity-0 group-hover:opacity-100 transition-opacity',
            isMine ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(message.id, emoji)}
              className="h-7 w-7 rounded-full flex items-center justify-center text-sm hover:scale-125 transition-transform hover:bg-white/10"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
