import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AuthUser = {
  userId: string;
  role: 'admin' | 'user';
  email: string;
};

import { ApiError } from '../lib/api-errors.js';
import { tokenSecretMissing } from '../lib/api-errors.js';

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const header = request.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError({ status: 401, code: 'UNAUTHORIZED', message: 'Missing access token' }));
  }

  const token = header.slice('Bearer '.length);

  try {
    if (!env.JWT_ACCESS_SECRET) {
      return next(tokenSecretMissing());
    }
    request.user = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthUser;
    next();
  } catch {
    return next(new ApiError({ status: 401, code: 'UNAUTHORIZED', message: 'Invalid or expired token' }));
  }
}

