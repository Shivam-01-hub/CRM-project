import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../lib/api-errors.js';

export function requireRole(...allowedRoles: Array<'admin' | 'user'>) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      return next(new ApiError({ status: 401, code: 'UNAUTHORIZED', message: 'Authentication required' }));
    }

    if (!allowedRoles.includes(request.user.role)) {
      return next(new ApiError({ status: 403, code: 'FORBIDDEN', message: 'Insufficient permissions' }));
    }

    next();
  };
}

