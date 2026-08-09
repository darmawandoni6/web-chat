import bcrypt from "bcryptjs";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { socketSdk } from "socketio-kit/server";
import { AuthenticatedRequest, authenticateToken } from "../middleware/auth.js";
import { memoryStore } from "../store/memory.js";

import { getJwtSecret } from "../config/jwt.js";

const router = Router();

// ─── Guest Login ──────────────────────────────────────────
router.post("/guest", (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const user = memoryStore.createGuestUser(username);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        isGuest: true,
      },
      getJwtSecret(),
      { expiresIn: "7d" },
    );

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Guest login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Update Display Name / Profile ───────────────────────
router.patch("/profile", authenticateToken, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.jwtUser) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { username } = req.body;
  if (!username || typeof username !== "string" || !username.trim()) {
    res.status(400).json({ error: "Valid username is required" });
    return;
  }

  const updatedUser = memoryStore.updateUsername(
    authReq.jwtUser.userId,
    username,
  );
  if (!updatedUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Update JWT user reference
  authReq.jwtUser.username = updatedUser.username;

  const { password: _, ...userWithoutPassword } = updatedUser;
  res.json(userWithoutPassword);
});

// ─── Get Current User Profile ─────────────────────────────
router.get("/me", authenticateToken, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.jwtUser) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  memoryStore.cancelDisconnectGracePeriod(authReq.jwtUser.userId);
  let user = memoryStore.getUserById(authReq.jwtUser.userId);
  if (!user) {
    // Seamlessly restore user session in memory if server restarted
    user = memoryStore.restoreUser({
      id: authReq.jwtUser.userId,
      username: authReq.jwtUser.username,
      email: authReq.jwtUser.email,
      isGuest: authReq.jwtUser.isGuest,
      createdAt: Date.now(),
    });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// ─── Logout & Session Cleanup ─────────────────────────────
router.post("/logout", authenticateToken, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.jwtUser) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = authReq.jwtUser.userId;
  const user = memoryStore.getUserById(userId);

  if (user?.isGuest) {
    // Guest User -> Immediately delete from server memory and notify clients
    memoryStore.cancelDisconnectGracePeriod(userId);
    const result = memoryStore.deleteUser(userId);

    try {
      socketSdk.broadcast("presence:offline", {
        userId,
        username: result.username || authReq.jwtUser.username,
      });
      socketSdk.broadcast("user:removed", { userId });

      const io = (socketSdk as any).io;
      if (io && io.sockets && io.sockets.sockets) {
        result.socketIds.forEach((socketId: string) => {
          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            socket.disconnect(true);
          }
        });
      }
    } catch (err) {
      console.error("Socket cleanup error on guest logout:", err);
    }
  } else {
    // Google OAuth User -> Schedule grace period timer (from .env) allowing re-login before removal from memory
    const graceMs = parseInt(process.env.GOOGLE_DISCONNECT_GRACE_MS || "5000", 10);
    console.log(`⏳ Google user ${userId} logged out. Starting ${graceMs}ms grace period timer for re-login.`);

    try {
      socketSdk.broadcast("presence:offline", {
        userId,
        username: user?.username || authReq.jwtUser.username,
      });

      const io = (socketSdk as any).io;
      if (io && io.sockets && io.sockets.sockets) {
        const socketIds = memoryStore.getUserSocketIds(userId);
        socketIds.forEach((socketId: string) => {
          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            socket.disconnect(true);
          }
        });
      }
    } catch (err) {
      console.error("Socket disconnect error on google logout:", err);
    }

    memoryStore.scheduleDisconnectGracePeriod(userId, graceMs, () => {
      console.log(`⏰ ${graceMs}ms logout grace period expired for Google user ${userId}. Removing from memory.`);
      const result = memoryStore.deleteUser(userId);
      socketSdk.broadcast("user:removed", { userId });
    });
  }

  res.json({ message: "Logged out successfully" });
});






// ─── Get All Users ────────────────────────────────────────
router.get("/users", authenticateToken, (_req: Request, res: Response) => {
  const users = memoryStore.getAllUsers();
  res.json(users);
});

// ─── Get User Groups ──────────────────────────────────────
router.get("/groups", authenticateToken, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.jwtUser) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const groups = memoryStore.getUserGroups(authReq.jwtUser.userId);
  const groupsWithMessages = groups.map((g) => ({
    ...g,
    messages: memoryStore.getGroupMessages(g.id),
  }));

  res.json(groupsWithMessages);
});

// ─── Google OAuth Routes ─────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get("/google/callback", (req: Request, res: Response, next) => {
  passport.authenticate("google", { session: false }, (err: any, user: any) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    if (err || !user) {
      console.error("❌ Google OAuth callback error:", err);
      res.redirect(`${clientUrl}/login?error=auth_failed`);
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      getJwtSecret(),
      { expiresIn: "7d" },
    );

    console.log({ jwtSecret: getJwtSecret() });

    console.log(
      `✅ Google OAuth success for ${user.email}, issuing token & redirecting to ${clientUrl}`,
    );
    res.redirect(`${clientUrl}?token=${token}`);
  })(req, res, next);
});

export default router;
