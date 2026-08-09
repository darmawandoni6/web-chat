import { ChatWindow } from '@/components/chat/ChatWindow';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

export function ChatPage() {
  const { isDark, toggleTheme } = useTheme();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Desktop Sidebar — fixed width, visible on md and up */}
      <div className="hidden md:flex w-72 shrink-0 flex-col overflow-hidden">
        <Sidebar isDark={isDark} onToggleTheme={toggleTheme} />
      </div>

      {/* Mobile Sidebar Drawer (Sheet) */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" showCloseButton={false} className="p-0 w-80 max-w-[85vw] border-r border-[var(--border)] bg-[var(--sidebar)]">
          <SheetTitle className="sr-only">Sidebar Navigation</SheetTitle>
          <SheetDescription className="sr-only">Direct messages and groups list</SheetDescription>
          <Sidebar
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onSelectItem={() => setIsMobileSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Chat window — fills remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
      </div>
    </div>
  );
}

