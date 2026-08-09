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
- [x] **8.4** Responsive layout untuk mobile (Sheet sidebar)

---

## ✅ PHASE 9 — Verifikasi

- [x] **9.1** Test register & login
- [x] **9.2** Test private chat antara 2 user (buka 2 tab)
- [x] **9.3** Test group chat
- [x] **9.4** Test typing indicator
- [x] **9.5** Test status online/offline
- [x] **9.6** Test upload gambar
- [x] **9.7** Test emoji reaction
- [x] **9.8** Test browser notification
- [x] **9.9** Test dark/light mode toggle
- [x] **9.10** Test Google OAuth (setelah credentials diisi)

---

## 🔄 PHASE 10 — Auth Refactoring (Google OAuth + Guest Auth)

- [x] **10.1** Update shared types (`server/src/types/index.ts` & `client/src/types/index.ts`) for Guest user & editable profile
- [x] **10.2** Update backend `memoryStore` (`server/src/store/memory.ts`) with Guest creation and `updateUsername`
- [x] **10.3** Update backend routes (`server/src/routes/auth.ts`) to add `POST /guest`, `PATCH /profile`, and remove email/password routes
- [x] **10.4** Update frontend API & AuthContext (`client/src/utils/api.ts` & `client/src/context/AuthContext.tsx`)
- [x] **10.5** Redesign `LoginForm.tsx`, remove `RegisterForm.tsx` & `RegisterPage.tsx`, update router in `App.tsx`
- [x] **10.6** Add display name editing UI to `Sidebar.tsx`
- [x] **10.7** Verification via `yarn tsc --noEmit`

---

## 🔄 PHASE 11 — Dark Mode Persistence Fix

- [x] **11.1** Add pre-render theme script to `client/index.html`
- [x] **11.2** Create `client/src/context/ThemeContext.tsx`
- [x] **11.3** Wrap app in `<ThemeProvider>` in `client/src/App.tsx`
- [x] **11.4** Refactor `client/src/pages/ChatPage.tsx` to use `useTheme()`
- [x] **11.5** Add theme toggle to `client/src/pages/LoginPage.tsx` / `LoginForm.tsx`
- [x] **11.6** Verification via `yarn workspace client tsc --noEmit`

---

## 🔄 PHASE 12 — User Account & Session Deletion

- [x] **12.1** Add `deleteUser` method to `server/src/store/memory.ts`
- [x] **12.2** Add `DELETE /api/auth/me` endpoint in `server/src/routes/auth.ts`
- [x] **12.3** Add `deleteAccountApi` and `deleteAccount` in `client/src/utils/api.ts` & `client/src/context/AuthContext.tsx`
- [x] **12.4** Listen for `auth:force-logout` event in `client/src/context/ChatContext.tsx` / `useSocket.ts`
- [x] **12.5** Add Delete Account confirmation modal & action button to `client/src/components/sidebar/Sidebar.tsx`
- [x] **12.6** Verification via `yarn workspace server tsc --noEmit && yarn workspace client tsc --noEmit`

---

## 🔄 PHASE 13 — Automatic User Cleanup on Logout

- [x] **13.1** Add `POST /api/auth/logout` endpoint in `server/src/routes/auth.ts`
- [x] **13.2** Update `client/src/utils/api.ts` with `logoutApi`
- [x] **13.3** Update `logout()` in `client/src/context/AuthContext.tsx`
- [x] **13.4** Remove `Trash2` button & dialog modal from `client/src/components/sidebar/Sidebar.tsx`
- [x] **13.5** Verification via `yarn workspace server tsc --noEmit && yarn workspace client tsc --noEmit`

---

## 🔄 PHASE 14 — Disconnect Grace Period & Session Removal

- [x] **14.1** Add disconnect timer helpers (`scheduleDisconnectGracePeriod`, `cancelDisconnectGracePeriod`) to `server/src/store/memory.ts`
- [x] **14.2** Update `server/src/sockets/presence.ts` with 5-second reconnect grace timer on disconnect & cancel on reconnect
- [x] **14.3** Update `POST /api/auth/logout` in `server/src/routes/auth.ts` to cancel timer, delete user & broadcast `user:removed`
- [x] **14.4** Handle `user:removed` socket event in `client/src/context/ChatContext.tsx`
- [x] **14.5** Verification via `yarn workspace server tsc --noEmit && yarn workspace client tsc --noEmit`

---

## 🔄 PHASE 15 — Inline Disconnect & Reconnect Chat Separator Notifications

- [x] **15.1** Add `'system'` to `MessageType` in `server/src/types/index.ts` and `client/src/types/index.ts`
- [x] **15.2** Include `reconnected` flag in `presence:online` event in `server/src/sockets/presence.ts`
- [x] **15.3** Append system disconnect/reconnect messages in `client/src/context/ChatContext.tsx`
- [x] **15.4** Render `'system'` message type as centered inline separator in `client/src/components/chat/MessageBubble.tsx`
- [x] **15.5** Verification via `yarn workspace server tsc --noEmit && yarn workspace client tsc --noEmit`

---

## 🔄 PHASE 16 — Preserve & Restore Chat History During Google OAuth Grace Period

- [x] **16.1** Purge user messages in `deleteUser` method in `server/src/store/memory.ts`
- [x] **16.2** Add `private:history` and `group:history` socket event handlers in `server/src/sockets/chat.ts`
- [x] **16.3** Add history response listeners and auto-fetching in `client/src/context/ChatContext.tsx`
- [x] **16.4** Verification via `yarn workspace server tsc --noEmit && yarn workspace client tsc --noEmit`

---

## 🔄 PHASE 17 — Custom Group Channel Management & Admin Deletion

- [x] **17.1** Add `deleteGroup` method in `server/src/store/memory.ts`
- [x] **17.2** Add `group:delete` socket handler in `server/src/sockets/chat.ts`
- [x] **17.3** Add `deleteGroup` action & `group:deleted` socket listener in `client/src/context/ChatContext.tsx`
- [x] **17.4** Add "Delete Group" button & confirmation modal in `client/src/components/chat/ChatWindow.tsx`
- [x] **17.5** Verification via `yarn workspace server tsc --noEmit && yarn workspace client tsc --noEmit`

---

## 🔄 PHASE 18 — Header Dropdown Menu & Chat Info Modal

- [x] **18.1** Integrate `DropdownMenu` and Info Modal in `client/src/components/chat/ChatWindow.tsx`
- [x] **18.2** Verification via `yarn workspace server tsc --noEmit && yarn workspace client tsc --noEmit`

---

## 🔄 PHASE 19 — Turborepo Monorepo Build System

- [x] **19.1** Install `turbo@^2.10.9` as root devDependency with `packageManager` in `package.json`
- [x] **19.2** Configure `turbo.json` build, check-types, and dev task pipelines
- [x] **19.3** Clean nested client Yarn lock files and add `check-types` scripts to `server` and `client` workspaces
- [x] **19.4** Verification via `yarn check-types` and `yarn build` (passed in 5ms with FULL TURBO cache hit)

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
| 11 | 2026-08-02 | 6 | Validated Google OAuth token extraction & fixed URL parameter shadowing bug in AuthContext loadUser effect | ✅ Done |
| 12 | 2026-08-02 | 2 | Fixed JWT secret mismatch by creating shared getJwtSecret() helper used dynamically across routes and middleware | ✅ Done |
| 13 | 2026-08-02 | 8 | Implemented mobile responsive layout with shadcn/ui Sheet sidebar drawer & trigger menu button | ✅ Done |
| 14 | 2026-08-02 | 9 | Executed automated verification suite for all Phase 9 real-time & REST API features — all 10 test cases passed | ✅ Done |
| 15 | 2026-08-09 | 10 | Refactored auth to Google OAuth & Guest Login, added profile update endpoint, redesigned LoginForm & added inline display name editor | ✅ Done |
| 16 | 2026-08-09 | 11 | Fixed dark mode persistence bug with global ThemeContext, anti-FOUC script in index.html, and login page toggle | ✅ Done |
| 17 | 2026-08-09 | 12 | Implemented User Session & Account Deletion with memory cleanup, REST route, socket force-disconnect & UI modal | ✅ Done |
| 18 | 2026-08-09 | 13 | Refactored logout to automatically remove user session from server memory, broadcast presence offline & cleaned up UI | ✅ Done |
| 19 | 2026-08-09 | 14 | Implemented 5-second reconnect grace period on socket disconnect, cancellation on reconnect, immediate removal on explicit logout & user:removed handling | ✅ Done |
| 20 | 2026-08-09 | 14 | Differentiated Guest (immediate removal) vs Google OAuth (configurable grace period via GOOGLE_DISCONNECT_GRACE_MS in .env) | ✅ Done |
| 21 | 2026-08-09 | 14 | Updated POST /logout so Google OAuth users get 5s grace period allowing re-login before removal from memory | ✅ Done |
| 22 | 2026-08-09 | 15 | Implemented inline chat separator notifications (system message type, centered pill styling in MessageBubble) for user disconnect & reconnect | ✅ Done |
| 23 | 2026-08-09 | 15 | Fixed reconnect separator trigger by detecting offline-to-online state transition in ChatContext | ✅ Done |
| 24 | 2026-08-09 | 15 | Styled system chat separator bubbles: emerald green for reconnect/connect and muted gray for disconnect in MessageBubble | ✅ Done |
| 25 | 2026-08-09 | 15 | Fixed substring collision in system message type classification (preventing disconnected from matching connected) | ✅ Done |
| 26 | 2026-08-09 | 15 | Fixed initial mount race condition by dynamically syncing conversations isOnline state with onlineUserIds in ChatContext | ✅ Done |
| 27 | 2026-08-09 | 16 | Implemented message history retention during Google OAuth grace period with private:history and group:history socket handlers and client restoration | ✅ Done |
| 28 | 2026-08-09 | 16 | Updated UserItem and ChatWindow online status indicators to use vibrant bg-emerald-500 for online green dot | ✅ Done |
| 29 | 2026-08-09 | 16 | Fixed missing email bug in presence:online socket broadcast and updated CreateGroupModal to display Google email vs (Guest) badge | ✅ Done |
| 30 | 2026-08-09 | 17 | Implemented custom group channel deletion with memory cleanup, group:delete socket handler, real-time group:deleted sync, and Admin Delete button & confirmation modal | ✅ Done |
| 31 | 2026-08-09 | 17 | Made upload file size limit configurable via MAX_FILE_SIZE_MB env variable in .env, .env.example, and server upload route | ✅ Done |
| 32 | 2026-08-09 | 17 | Added client-side file size (< 5MB) and MIME-type validation in MessageInput.tsx with native file picker filter and toast notifications | ✅ Done |
| 33 | 2026-08-09 | 17 | Synchronized client-side max file size constants (MAX_FILE_SIZE_MB & MAX_FILE_SIZE_BYTES) in api.ts with server upload route | ✅ Done |
| 34 | 2026-08-09 | 17 | Created client/.env and client/.env.example with Vite VITE_API_URL and VITE_MAX_FILE_SIZE_MB environment variables | ✅ Done |
| 35 | 2026-08-09 | 18 | Turned static MoreVertical button on line 192 of ChatWindow.tsx into an interactive DropdownMenu with Group Info / User Profile modal | ✅ Done |
| 36 | 2026-08-09 | 18 | Created custom vector SVG logo in client/public/favicon.svg and integrated into Sidebar header and LoginForm | ✅ Done |
| 37 | 2026-08-09 | 19 | Configured Turborepo monorepo build system with turbo.json, root packageManager, unified yarn dev/build/check-types, and verified caching | ✅ Done |
| 38 | 2026-08-09 | 19 | Refactored monorepo folder structure to Turborepo best practices moving server and client apps into apps/server and apps/client with apps/* workspace globbing | ✅ Done |
| 39 | 2026-08-09 | 19 | Defined Node.js >= 20.19.0 engine requirement in root package.json, created .nvmrc file, and updated documentation | ✅ Done |
| 40 | 2026-08-09 | 19 | Adjusted Node.js engines requirement to >= 20.18.0 to match local environment and .nvmrc settings | ✅ Done |
| 41 | 2026-08-09 | 19 | Audited and updated root .gitignore for Turborepo cache (.turbo), apps/ monorepo env files, uploads, and build outputs | ✅ Done |
| 42 | 2026-08-09 | 19 | Created comprehensive production-grade README.md with features showcase, monorepo structure, prerequisites, and getting started guide | ✅ Done |

---

*File ini diupdate otomatis oleh AI setiap kali menyelesaikan sebuah task.*









