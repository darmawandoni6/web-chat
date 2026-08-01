import EmojiPickerReact, { type EmojiClickData, Theme } from 'emoji-picker-react';
import { useEffect, useRef } from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  isDark?: boolean;
}

export function EmojiPicker({ onSelect, onClose, isDark = true }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute bottom-12 right-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-[var(--border)]">
      <EmojiPickerReact
        theme={isDark ? Theme.DARK : Theme.LIGHT}
        onEmojiClick={(data: EmojiClickData) => {
          onSelect(data.emoji);
          onClose();
        }}
        lazyLoadEmojis
      />
    </div>
  );
}
