import type { NextFunction, Request, Response } from 'express';

export function requireRole(...allowedRoles: Array<'admin' | 'user'>) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
      return response.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}
