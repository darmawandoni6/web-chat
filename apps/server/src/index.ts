import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express, { Request, Response } from 'express';
import session from 'express-session';
import http from 'http';
import passport from 'passport';
import path from 'path';
import { Socket } from 'socket.io';
import { socketSdk } from 'socketio-kit/server';
import { configureGoogleOAuth } from './config/oauth.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import { setupChatHandlers } from './sockets/chat.js';
import { setupPresenceHandlers } from './sockets/presence.js';
import { setupTypingHandlers } from './sockets/typing.js';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── Middleware ───────────────────────────────────────────
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173'],
    credentials: true,
  }) as any
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'web_chat_session_secret',
    resave: false,
    saveUninitialized: false,
  }) as any
);

// ─── Passport Google OAuth ────────────────────────────────
configureGoogleOAuth();
app.use(passport.initialize() as any);
app.use(passport.session() as any);

// ─── socketio-kit Server SDK Initialization ───────────────
const io = socketSdk.init(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(socketSdk.middleware() as any);

// Socket event listeners
io.on('connection', (socket: Socket) => {
  setupPresenceHandlers(socket);
  setupTypingHandlers(socket);
  setupChatHandlers(socket);
});

// ─── REST Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ─── Start Server ─────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
