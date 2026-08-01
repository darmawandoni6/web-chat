import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  jwtUser?: JWTPayload;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret_key';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    (req as AuthenticatedRequest).jwtUser = decoded as JWTPayload;
    next();
  });
}
