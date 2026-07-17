import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AuthUser = {
  userId: string;
  role: 'admin' | 'user';
  email: string;
};

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Missing access token' });
  }

  const token = header.slice('Bearer '.length);

  try {
    request.user = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUser;
    next();
  } catch {
    response.status(401).json({ message: 'Invalid or expired token' });
  }
}
