export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-tl-sm" style={{ background: 'var(--message-recv)' }}>
        <span className="text-xs text-[var(--muted-foreground)] mr-1">{name} is typing</span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[var(--muted-foreground)] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}
