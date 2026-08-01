# AGENTS.md — AI Agent Rules for web-chat

> This file defines the rules, constraints, and workflow that the AI agent **must always follow**
> when working on this project. Read this file before doing anything else.

---

## 📌 Source of Truth Files

Always read these two files before starting any work:

| File | Purpose |
|---|---|
| [`TDD.md`](./TDD.md) | Technical Design Document — architecture, specs, file paths, types, events |
| [`TODO.md`](./TODO.md) | Task list + execution log — tracks progress, status, and history |

---

## 🔁 Workflow (Mandatory)

Follow this exact loop for **every task**:

```
1. READ TODO.md        → find the first [ ] (Pending) task
2. READ TDD.md         → look up the spec for that task
3. IMPLEMENT           → create/modify files as specified
4. VERIFY              → run: yarn tsc --noEmit (must pass with 0 errors)
5. UPDATE TODO.md      → change [ ] → [x], or [!] if blocked
6. LOG to TODO.md      → append a row to the Execution Log table
7. REPORT to user      → state what was done + show next task
8. REPEAT              → go to next [ ] task
```

---

## 🚫 Hard Rules — Never Break These

### Package Manager
- ✅ Always use **Yarn**: `yarn`, `yarn add`, `yarn add -D`, `yarn dlx`
- ❌ Never use `npm install`, `npm run`, or `npx`

### Language
- ✅ All source files must be **TypeScript**: `.ts` or `.tsx`
- ❌ Never create `.js` or `.jsx` files in `server/src/` or `client/src/`

### ID Generation
- ✅ Use Node.js built-in: `crypto.randomUUID()`
- ❌ Never install or import the `uuid` package

### shadcn/ui
- ✅ Install components via: `yarn dlx shadcn@latest add <component>`
- ❌ Never `yarn add shadcn` — it is not an npm package

### Verification
- ✅ Run `yarn tsc --noEmit` before marking any task as `[x]`
- ❌ Never mark a task done if there are TypeScript errors

### TODO.md
- ✅ Update TODO.md **immediately** after each completed task
- ✅ Always append a new row to the Execution Log table
- ❌ Never skip updating TODO.md between tasks

---

## 🛠️ Tech Stack (Non-Negotiable)

| Layer | Technology |
|---|---|
| Language | TypeScript 5.x |
| Package Manager | Yarn |
| Backend | Node.js + Express 4.x |
| Real-time Server | `socketio-kit/server` (peer: `socket.io ^4.8`) |
| Real-time Client | `socketio-kit/client` (peer: `socket.io-client ^4.7`) |
| Frontend | React 18 + Vite 5 |
| UI Components | shadcn/ui |
| CSS | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Font | Inter (Google Fonts) |
| Auth | JWT + Google OAuth (Passport.js) |
| Storage | In-memory only (no database) |
| Backend Port | `4000` |
| Frontend Port | `5173` |

---

## 📁 Project Structure

```
web-chat/
├── AGENTS.md                ← You are here
├── TDD.md                   ← Technical Design Document
├── TODO.md                  ← Task list + execution log
├── tdd_todo_driven/
│   └── SKILL.md             ← Skill definition
├── server/                  ← Backend (TypeScript)
│   ├── src/
│   │   ├── index.ts
│   │   ├── types/index.ts
│   │   ├── store/memory.ts
│   │   ├── middleware/auth.ts
│   │   ├── config/oauth.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── upload.ts
│   │   └── sockets/
│   │       ├── chat.ts
│   │       ├── typing.ts
│   │       └── presence.ts
│   ├── uploads/
│   ├── tsconfig.json
│   └── package.json
└── client/                  ← Frontend (React + TypeScript)
    ├── src/
    │   ├── types/index.ts
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── chat/
    │   │   ├── sidebar/
    │   │   └── ui/          ← shadcn/ui auto-generated
    │   ├── pages/
    │   ├── hooks/
    │   ├── context/
    │   ├── utils/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── vite.config.ts
    └── package.json
```

---

## 🎨 Design Rules

- **Font**: Inter from Google Fonts — import in `index.css`
- **Primary accent**: Violet `#7c3aed` (hover: `#a855f7`)
- **Secondary accent**: Emerald `#10b981` (online status, success)
- **Dark mode**: Default. Background `#0a0a0f`, card `#111118`
- **Light mode**: Toggle via button, preference saved in `localStorage`
- **Component library**: shadcn/ui — do not create custom UI primitives from scratch

---

## 📡 Socket Events Reference

### Private Chat
```
Emit:  "private:send"     { to: string, message: string }
On:    "private:receive"  { from: string, message: string, timestamp: number }
Emit:  "private:read"     { messageId: string, from: string }
On:    "private:read-ack" { messageId: string }
```

### Group Chat
```
Emit:  "group:create"      { name: string, members: string[] }
Emit:  "group:send"        { groupId: string, message: string }
On:    "group:receive"     { groupId: string, from: string, message: string }
Emit:  "group:join"        { groupId: string }
On:    "group:user-joined" { groupId: string, user: User }
```

### Typing
```
Emit:  "typing:start"   { to: string } | { groupId: string }
Emit:  "typing:stop"    { to: string } | { groupId: string }
On:    "typing:update"  { from: string, isTyping: boolean }
```

### Presence
```
On:  "presence:online"  { userId: string, username: string }
On:  "presence:offline" { userId: string, username: string }
On:  "presence:list"    Array<{ userId: string, username: string }>
```

---

## 🔐 REST API Reference

```
POST /api/auth/register         → { username, email, password }
POST /api/auth/login            → { email, password } → JWT
GET  /api/auth/me               → current user (requires JWT)
GET  /api/auth/google           → redirect to Google OAuth
GET  /api/auth/google/callback  → return JWT
POST /api/upload                → multipart/form-data → { fileUrl }
```

---

## ✅ TODO.md Status Markers

| Marker | Meaning |
|---|---|
| `[ ]` | Pending |
| `[~]` | In Progress |
| `[x]` | Done |
| `[!]` | Blocked / Error |

---

## 🔔 Google OAuth Note

Google OAuth credentials are **not yet configured**.
When implementing `server/src/config/oauth.ts`, use values from `.env`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173
```

The feature will be functional once the user fills in `.env` with real credentials from Google Cloud Console.

---

*This file is the single source of agent behavior rules for this project.*
*Do not override these rules unless the user explicitly requests a change.*
