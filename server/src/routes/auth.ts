import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth.js';
import { memoryStore } from '../store/memory.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// ─── Register ─────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required' });
      return;
    }

    const existingUser = memoryStore.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = memoryStore.createUser({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Login ────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = memoryStore.getUserByEmail(email);
    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Get Current User Profile ─────────────────────────────
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.jwtUser) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = memoryStore.getUserById(authReq.jwtUser.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// ─── Get All Users ────────────────────────────────────────
router.get('/users', authenticateToken, (_req: Request, res: Response) => {
  const users = memoryStore.getAllUsers();
  res.json(users);
});

// ─── Google OAuth Routes ─────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', (req: Request, res: Response, next) => {
  passport.authenticate('google', { session: false }, (err: any, user: any) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (err || !user) {
      console.error('❌ Google OAuth callback error:', err);
      res.redirect(`${clientUrl}/login?error=auth_failed`);
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ Google OAuth success for ${user.email}, issuing token & redirecting to ${clientUrl}`);
    res.redirect(`${clientUrl}?token=${token}`);
  })(req, res, next);
});

export default router;
