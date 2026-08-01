import { ChatWindow } from '@/components/chat/ChatWindow'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { useEffect, useState } from 'react'

export function ChatPage() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'light') {
      setIsDark(false)
      document.documentElement.classList.add('light')
    }
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Sidebar — fixed width */}
      <div className="w-72 shrink-0 flex flex-col overflow-hidden">
        <Sidebar isDark={isDark} onToggleTheme={toggleTheme} />
      </div>

      {/* Chat window — fills remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  )
}
