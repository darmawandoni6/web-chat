# 💬 WebChat — Modern Real-Time Monorepo Chat Application

A high-performance, full-stack real-time web chat application featuring **Google OAuth 2.0 & Guest Authentication**, **Private 1-on-1 Messaging**, **Custom Group Channels**, **Inline File & Image Uploads**, and **Real-Time Presence Indicators**. 

Built with **React 18**, **Vite**, **Express**, **TypeScript**, **Socket.IO (`socketio-kit`)**, **Tailwind CSS v4**, and orchestrated with **Turborepo**.

---

## ✨ Features

- 🔐 **Flexible Authentication**: Sign in via **Google OAuth 2.0** or instant **Guest Login** with inline display name customization.
- ⚡ **Real-Time Messaging**: Instant 1-on-1 private messaging and custom group channels powered by `socketio-kit`.
- 📁 **File & Image Attachments**: Inline photo preview thumbnails and document download cards with configurable max file size limit (default 5 MB).
- 🟢 **Presence & Typing Feedback**: Real-time emerald online status indicators and active typing indicators.
- 🗑️ **Group Channel Management**: Create custom groups, manage member lists, and group admin deletion with real-time sync.
- ⏱️ **Grace Period & Separator Notifications**: 5-second disconnect grace period for Google OAuth users with inline chat separator badges (green for reconnect, gray for disconnect).
- 🎨 **Dark / Light Mode**: Sleek dark mode by default with light mode toggle and anti-FOUC state persistence.
- ⚡ **Turborepo Monorepo Architecture**: Concurrent parallel dev servers (`yarn dev`), instant cached type checking (`yarn check-types`), and production builds (`yarn build`).

---

## 📁 Monorepo Structure

```
web-chat/
├── turbo.json               # Turborepo task pipelines
├── package.json             # Workspace root & scripts
├── .nvmrc                   # Target Node.js version
├── apps/
│   ├── server/              # Backend (Express + TypeScript + Socket.IO)
│   │   ├── src/
│   │   │   ├── index.ts     # Express server entry point
│   │   │   ├── config/      # Passport & Google OAuth setup
│   │   │   ├── middleware/  # JWT authentication middleware
│   │   │   ├── routes/      # Auth & file upload REST endpoints
│   │   │   ├── sockets/     # Chat, presence & typing socket handlers
│   │   │   └── store/       # In-memory data store & session manager
│   │   ├── uploads/         # Local file storage
│   │   └── package.json
│   │
│   └── client/              # Frontend (React + Vite + Tailwind CSS v4)
│       ├── src/
│       │   ├── components/  # ChatWindow, Sidebar, MessageBubble, Modals
│       │   ├── context/     # AuthContext, ChatContext, ThemeContext
│       │   ├── hooks/       # Custom React hooks
│       │   ├── utils/       # API client & helper utilities
│       │   └── types/       # Shared TypeScript interfaces
│       ├── public/
│       │   └── favicon.svg  # Custom SVG app logo
│       └── package.json
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Monorepo Orchestrator** | [Turborepo 2.x](https://turborepo.dev/) |
| **Package Manager** | Yarn 1.22.22 (`workspaces`) |
| **Node.js Target** | `>= 20.18.0` or `>= 22.12.0` (LTS) |
| **Language** | TypeScript 5.x |
| **Frontend** | React 18 + Vite 8 + React Router DOM v7 |
| **UI Components** | shadcn/ui + Lucide Icons |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Backend** | Node.js + Express 4.x |
| **Real-time Server** | `socketio-kit/server` (peer: `socket.io ^4.8`) |
| **Real-time Client** | `socketio-kit/client` (peer: `socket.io-client ^4.7`) |
| **Auth** | JWT + Passport.js (Google OAuth 2.0) |
| **File Storage** | Multer + Express Static File Serving |

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `>= 20.18.0` or `>= 22.12.0` (LTS) — check with `node -v`
- **Yarn**: `1.22.22` — check with `yarn -v`

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/web-chat.git
cd web-chat
```

### 2. Configure Environment Variables

Create `.env` files for both backend and frontend applications:

#### Backend Environment (`apps/server/.env`)
```env
PORT=4000
CLIENT_URL=http://localhost:5173
JWT_SECRET=super_secret_jwt_key_web_chat_2026
SESSION_SECRET=super_secret_session_key_web_chat_2026

# Google OAuth Credentials (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# Disconnect Grace Period (in milliseconds) for Google OAuth users
GOOGLE_DISCONNECT_GRACE_MS=10000

# File Upload Limit (in Megabytes)
MAX_FILE_SIZE_MB=5
```

#### Frontend Environment (`apps/client/.env`)
```env
# Backend API URL
VITE_API_URL=http://localhost:4000

# File Upload Limit (in Megabytes)
VITE_MAX_FILE_SIZE_MB=5
```

### 3. Install Dependencies
```bash
yarn install
```

### 4. Run Development Servers
Start both backend and frontend applications concurrently using Turborepo:
```bash
yarn dev
```

Open your browser and navigate to:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:4000`

---

## 📜 Available Scripts

Run these scripts from the project root directory:

| Command | Description |
|---|---|
| `yarn dev` | Launches **both** backend and frontend dev servers concurrently in parallel via Turborepo |
| `yarn build` | Builds production bundles for `apps/server` and `apps/client` (with Turborepo caching) |
| `yarn check-types` | Runs `tsc --noEmit` type checking across all workspace packages concurrently |
| `yarn dev:server` | Starts only the backend server (`apps/server`) |
| `yarn dev:client` | Starts only the frontend client (`apps/client`) |

---

## 🔐 Google OAuth Configuration Note

To enable Google OAuth login:
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create an OAuth 2.0 Client ID with:
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:4000/api/auth/google/callback`
3. Copy the Client ID & Secret into `apps/server/.env`.

> **Note**: Guest Login works out-of-the-box without any external setup!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
