import type { Request } from 'express';
import { ApiError } from './api-errors.js';

export function assertAdmin(request: Request) {
  if (!request.user) {
    throw new ApiError({ status: 401, code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  if (request.user.role !== 'admin') {
    throw new ApiError({ status: 403, code: 'FORBIDDEN', message: 'Insufficient permissions' });
  }
}

export function assertOwnerOrAdmin(request: Request, ownerId: string) {
  if (!request.user) {
    throw new ApiError({ status: 401, code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  if (request.user.role === 'admin') return;
  if (request.user.userId !== ownerId) {
    throw new ApiError({ status: 403, code: 'FORBIDDEN', message: 'Insufficient permissions' });
  }
}

