# 📋 Web Chat App — TODO & Execution Log

> **Legend Status:**
> - `[ ]` Pending
> - `[~]` In Progress
> - `[x]` Done
> - `[!]` Blocked / Error

---

## 🗂️ PHASE 0 — Project Setup

- [x] **0.1** Init root `package.json` dengan Yarn Workspaces (`server`, `client`)
- [x] **0.2** Setup `.gitignore` (node_modules, dist, .env, uploads)
- [x] **0.3** Buat file `.env.example` di `server/`

---

## ⚙️ PHASE 1 — Backend: Foundation

- [x] **1.1** Init `server/` dengan TypeScript (`tsconfig.json`, `package.json`)
- [x] **1.2** Install backend dependencies via `yarn`
- [x] **1.3** Buat `server/src/types/index.ts` — semua shared interfaces (User, Message, Group, Room)
- [x] **1.4** Buat `server/src/store/memory.ts` — in-memory data store
- [x] **1.5** Buat `server/src/index.ts` — Express + socketio-kit server entry point

---

## 🔐 PHASE 2 — Backend: Auth

- [x] **2.1** Buat `server/src/middleware/auth.ts` — JWT middleware
- [x] **2.2** Buat `server/src/routes/auth.ts` — `POST /api/auth/register`
- [x] **2.3** Tambah `POST /api/auth/login` di auth route
- [x] **2.4** Tambah `GET /api/auth/me` di auth route
- [x] **2.5** Buat `server/src/config/oauth.ts` — Passport Google OAuth config
- [x] **2.6** Tambah `GET /api/auth/google` + callback route

---

## 📡 PHASE 3 — Backend: Socket Events

- [x] **3.1** Buat `server/src/sockets/presence.ts` — online/offline broadcast
- [x] **3.2** Buat `server/src/sockets/typing.ts` — typing indicator events
- [x] **3.3** Buat `server/src/sockets/chat.ts` — private & group chat events
- [x] **3.4** Register semua socket handlers di `server/src/index.ts`

---

## 📤 PHASE 4 — Backend: Upload

- [x] **4.1** Buat `server/src/routes/upload.ts` — `POST /api/upload` dengan Multer (max 5MB)
- [x] **4.2** Setup static serving untuk folder `server/uploads/`

---

## 🎨 PHASE 5 — Frontend: Setup & Design System

- [x] **5.1** Init `client/` dengan Vite + React + TypeScript via `yarn create vite`
- [x] **5.2** Install frontend dependencies via `yarn`
- [x] **5.3** Setup Tailwind CSS v4 (`@tailwindcss/vite`)
- [x] **5.4** Init shadcn/ui via `yarn dlx shadcn@latest init`
- [x] **5.5** Install shadcn/ui components: `button`, `input`, `avatar`, `badge`, `dialog`, `scroll-area`, `tooltip`, `dropdown-menu`, `separator`, `sheet`
- [x] **5.6** Setup `index.css` — Inter font, CSS variables (color palette dark/light), global styles
- [x] **5.7** Buat `client/src/types/index.ts` — shared types frontend

---

## 🔑 PHASE 6 — Frontend: Auth

- [x] **6.1** Buat `client/src/utils/api.ts` — Axios instance dengan JWT interceptor
- [x] **6.2** Buat `client/src/context/AuthContext.tsx` — global auth state (real JWT & Google OAuth callback)
- [x] **6.3** Buat `client/src/hooks/useAuth.ts`
- [x] **6.4** Buat `client/src/components/auth/LoginForm.tsx`
- [x] **6.5** Buat `client/src/components/auth/RegisterForm.tsx`
- [x] **6.6** Buat `client/src/pages/LoginPage.tsx`
- [x] **6.7** Buat `client/src/pages/RegisterPage.tsx`
- [x] **6.8** Setup routing di `client/src/App.tsx` (React Router with ProtectedRoute)

---

## 💬 PHASE 7 — Frontend: Chat UI

- [x] **7.1** Buat `client/src/context/ChatContext.tsx` — global chat state with real API & socketio-kit/client
- [x] **7.2** Buat `client/src/hooks/useSocket.ts` — socketio-kit/client integration
- [x] **7.3** Buat `client/src/hooks/useNotification.ts` — Web Notifications API
- [x] **7.4** Buat `client/src/utils/formatTime.ts` — format timestamp
- [x] **7.5** Buat `client/src/components/sidebar/Sidebar.tsx`
- [x] **7.6** Buat `client/src/components/sidebar/UserItem.tsx`
- [x] **7.7** Buat `client/src/components/sidebar/GroupItem.tsx`
- [x] **7.8** Buat `client/src/components/chat/ChatWindow.tsx`
- [x] **7.9** Buat `client/src/components/chat/MessageBubble.tsx` — dengan read receipt ✓✓
- [x] **7.10** Buat `client/src/components/chat/TypingIndicator.tsx`
- [x] **7.11** Buat `client/src/components/chat/EmojiPicker.tsx`
- [x] **7.12** Buat `client/src/components/chat/MessageInput.tsx` — teks + emoji + upload
- [x] **7.13** Buat `client/src/pages/ChatPage.tsx` — layout utama (sidebar + chat window)

---

## ✨ PHASE 8 — Polish & Features

- [x] **8.1** Implementasi Dark Mode / Light Mode toggle dengan `localStorage`
- [x] **8.2** Implementasi Emoji Reaction pada pesan (real-time update UI)
- [x] **8.3** Implementasi Browser Push Notification (Web Notifications API)
- [ ] **8.4** Responsive layout untuk mobile (Sheet sidebar)

---

## ✅ PHASE 9 — Verifikasi

- [ ] **9.1** Test register & login
- [ ] **9.2** Test private chat antara 2 user (buka 2 tab)
- [ ] **9.3** Test group chat
- [ ] **9.4** Test typing indicator
- [ ] **9.5** Test status online/offline
- [ ] **9.6** Test upload gambar
- [ ] **9.7** Test emoji reaction
- [ ] **9.8** Test browser notification
- [ ] **9.9** Test dark/light mode toggle
- [x] **9.10** Test Google OAuth (setelah credentials diisi)

---

## 📝 Execution Log

> Log semua aksi yang dikerjakan AI secara kronologis.

| # | Timestamp | Phase | Aksi | Status |
|---|---|---|---|---|
| 1 | 2026-08-01 | 0 | Inisialisasi TODO.md dan TDD.md di root project | ✅ Done |
| 2 | 2026-08-01 | 5 | Setup client with Vite + React + TS, Yarn 4, Tailwind v4 & shadcn/ui | ✅ Done |
| 3 | 2026-08-01 | 7 | Slicing Frontend UI (Sidebar, UserItem, GroupItem, ChatWindow, MessageBubble, MessageInput, TypingIndicator) with Dummy Data | ✅ Done |
| 4 | 2026-08-01 | 0 | Setup root package.json Yarn Workspaces, .gitignore, .env.example, and .env | ✅ Done |
| 5 | 2026-08-01 | 1 | Setup server TS foundation (tsconfig, package.json, types, memory store, index.ts) | ✅ Done |
| 6 | 2026-08-01 | 2 | Setup JWT Auth middleware, Register, Login, Me REST routes, & Google OAuth config | ✅ Done |
| 7 | 2026-08-01 | 3 | Setup socket handlers for Presence, Typing indicators, and Private & Group Chat events | ✅ Done |
| 8 | 2026-08-01 | 4 | Setup Multer upload route with 5MB limit & static file serving for /uploads | ✅ Done |
| 9 | 2026-08-01 | 6 | Integrated AuthContext with REST API, LoginForm, RegisterForm, LoginPage, RegisterPage & Protected React Router | ✅ Done |
| 10 | 2026-08-01 | 7 | Integrated ChatContext with real-time socketio-kit/client, EmojiPicker, CreateGroupModal, Web Notifications, & File Upload | ✅ Done |

---

*File ini diupdate otomatis oleh AI setiap kali menyelesaikan sebuah task.*
