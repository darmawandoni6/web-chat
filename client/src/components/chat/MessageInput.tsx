import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmojiPicker } from '@/components/chat/EmojiPicker';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, uploadFileApi } from '@/utils/api';
import { Image as ImageIcon, Loader2, Paperclip, Send, Smile } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import toast from 'react-hot-toast';

interface MessageInputProps {
  onSend: (content: string, type?: 'text' | 'image' | 'file', fileUrl?: string) => void;
  onTyping?: (isTyping: boolean) => void;
  isDark?: boolean;
}

export function MessageInput({ onSend, onTyping, isDark = true }: MessageInputProps) {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (v: string) => {
    setValue(v);
    if (onTyping) {
      onTyping(true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => onTyping(false), 2000);
    }
  };

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
    if (onTyping) onTyping(false);
    if (typingTimer.current) clearTimeout(typingTimer.current);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
  ];

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File size must be under ${MAX_FILE_SIZE_MB}MB`);
      if (e.target) e.target.value = '';
      return;
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error(`Invalid file type. Only images (JPG, PNG, GIF, WEBP), PDF, and text files under ${MAX_FILE_SIZE_MB}MB are allowed.`);
      if (e.target) e.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const res = await uploadFileApi(file);
      const msgType = isImage || file.type.startsWith('image/') ? 'image' : 'file';
      onSend(file.name, msgType, res.fileUrl);
      toast.success('File uploaded!');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to upload file';
      toast.error(msg);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div
      className="px-4 py-3 border-t flex items-center gap-2 relative"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      {/* Hidden file inputs */}
      <input
        type="file"
        accept="image/*, application/pdf, text/plain"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e, false)}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        onChange={(e) => handleFileUpload(e, true)}
        className="hidden"
      />


      {/* Attachment buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="h-8 w-8 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--accent-violet)]"
          title="Upload File"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={uploading}
          onClick={() => imageInputRef.current?.click()}
          className="h-8 w-8 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--accent-violet)]"
          title="Upload Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Text input */}
      <div className="flex-1 relative">
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          className="rounded-xl border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] pr-10 text-sm h-9"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShowEmoji(!showEmoji)}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--accent-violet)]"
        >
          <Smile className="h-4 w-4" />
        </Button>

        {showEmoji && (
          <EmojiPicker
            onSelect={(emoji) => setValue((prev) => prev + emoji)}
            onClose={() => setShowEmoji(false)}
            isDark={isDark}
          />
        )}
      </div>

      {/* Send button */}
      <Button
        onClick={handleSend}
        disabled={!value.trim()}
        size="icon"
        className="h-9 w-9 rounded-xl shrink-0 transition-all"
        style={{
          background: value.trim() ? 'var(--accent-violet)' : 'var(--muted)',
          color: value.trim() ? '#fff' : 'var(--muted-foreground)',
        }}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
