import type { Request } from 'express';
import { ApiError, forbidden } from './api-errors.js';

export function requireRoleFromUser(request: Request, allowed: Array<'admin' | 'user'>) {
  if (!request.user) {
    // Centralized error middleware expects thrown errors.
    throw new ApiError({ status: 401, code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  if (!allowed.includes(request.user.role)) {
    throw forbidden();
  }
}

