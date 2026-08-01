import { type AuthUser, type Conversation, type Group, type Message, type User } from '@/types'

// ─── Dummy Users ────────────────────────────────────────
export const DUMMY_ME: AuthUser = {
  id: 'user-me',
  username: 'You',
  email: 'you@example.com',
  avatar: undefined,
  token: 'dummy-jwt-token',
}

export const DUMMY_USERS: User[] = [
  { id: 'user-1', username: 'Alice Chen', email: 'alice@example.com' },
  { id: 'user-2', username: 'Bob Smith', email: 'bob@example.com' },
  { id: 'user-3', username: 'Carlos Rivera', email: 'carlos@example.com' },
  { id: 'user-4', username: 'Diana Park', email: 'diana@example.com' },
]

const now = Date.now()
const min = (n: number) => now - n * 60000

// ─── Dummy Messages ─────────────────────────────────────
const makeMsg = (
  id: string,
  from: string,
  content: string,
  timestamp: number,
  read = true
): Message => ({
  id,
  from,
  content,
  type: 'text',
  timestamp,
  read,
  reactions: [],
})

// ─── Dummy Conversations ────────────────────────────────
export const DUMMY_CONVERSATIONS: Conversation[] = [
  {
    userId: 'user-1',
    username: 'Alice Chen',
    isOnline: true,
    unreadCount: 2,
    messages: [
      makeMsg('m1', 'user-1', 'Hey! How are you doing?', min(60)),
      makeMsg('m2', 'user-me', 'I\'m good, thanks! Working on a new project.', min(55)),
      makeMsg('m3', 'user-1', 'That sounds exciting! What kind of project?', min(50)),
      makeMsg('m4', 'user-me', 'A real-time chat app with Socket.IO 😄', min(45)),
      makeMsg('m5', 'user-1', 'Oh nice! Can\'t wait to see it.', min(5), false),
      makeMsg('m6', 'user-1', 'Let me know when it\'s ready!', min(2), false),
    ],
  },
  {
    userId: 'user-2',
    username: 'Bob Smith',
    isOnline: false,
    unreadCount: 0,
    messages: [
      makeMsg('m7', 'user-me', 'Did you finish the report?', min(120)),
      makeMsg('m8', 'user-2', 'Yes, sent it to you via email.', min(110)),
      makeMsg('m9', 'user-me', 'Got it, thanks Bob!', min(100)),
    ],
  },
  {
    userId: 'user-3',
    username: 'Carlos Rivera',
    isOnline: true,
    unreadCount: 1,
    messages: [
      makeMsg('m10', 'user-3', 'Are we still on for the meeting tomorrow?', min(30), false),
    ],
  },
  {
    userId: 'user-4',
    username: 'Diana Park',
    isOnline: false,
    unreadCount: 0,
    messages: [
      makeMsg('m11', 'user-4', 'Thanks for your help yesterday!', min(1440)),
      makeMsg('m12', 'user-me', 'No problem at all! 😊', min(1430)),
    ],
  },
]

// ─── Dummy Groups ────────────────────────────────────────
export const DUMMY_GROUPS: Group[] = [
  {
    id: 'group-1',
    name: '🚀 Dev Team',
    adminId: 'user-me',
    members: ['user-me', 'user-1', 'user-2'],
    unreadCount: 3,
    messages: [
      makeMsg('gm1', 'user-1', 'Good morning team!', min(180)),
      makeMsg('gm2', 'user-2', 'Morning! Ready for standup?', min(175)),
      makeMsg('gm3', 'user-me', 'Yes, give me 5 mins ☕', min(170)),
      makeMsg('gm4', 'user-1', 'Sprint review at 3pm don\'t forget!', min(10), false),
      makeMsg('gm5', 'user-2', 'Noted 👍', min(8), false),
      makeMsg('gm6', 'user-1', 'Also, the staging server is back up.', min(3), false),
    ],
  },
  {
    id: 'group-2',
    name: '🎉 Weekend Plans',
    adminId: 'user-3',
    members: ['user-me', 'user-3', 'user-4'],
    unreadCount: 0,
    messages: [
      makeMsg('gm7', 'user-3', 'Who\'s joining the hike this Saturday?', min(2880)),
      makeMsg('gm8', 'user-4', 'I\'m in! 🏔️', min(2870)),
      makeMsg('gm9', 'user-me', 'Count me in too!', min(2860)),
      makeMsg('gm10', 'user-3', 'Great, meet at the trailhead at 7am', min(2850)),
    ],
  },
]
