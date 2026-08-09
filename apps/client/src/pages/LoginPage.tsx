import { LoginForm } from '@/components/auth/LoginForm';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function LoginPage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)] relative">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--secondary)] shadow-sm"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
      <LoginForm />
    </div>
  );
}

