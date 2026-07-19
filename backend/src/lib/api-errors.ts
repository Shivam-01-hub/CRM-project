import { z } from 'zod';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'DATABASE_UNAVAILABLE'
  | 'BAD_REQUEST'
  | 'INTERNAL_ERROR'
  | 'TOKEN_SECRET_MISSING';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: ApiErrorCode;
  public readonly details?: unknown;

  constructor(args: { status: number; code: ApiErrorCode; message: string; details?: unknown }) {
    super(args.message);
    this.status = args.status;
    this.code = args.code;
    this.details = args.details;
  }
}

export function badRequest(message: string, details?: unknown) {
  return new ApiError({ status: 400, code: 'BAD_REQUEST', message, details });
}

export function notFound(message: string, details?: unknown) {
  return new ApiError({ status: 404, code: 'NOT_FOUND', message, details });
}

export function forbidden(message = 'Insufficient permissions', details?: unknown) {
  return new ApiError({ status: 403, code: 'FORBIDDEN', message, details });
}

export function unauthorized(message = 'Authentication required', details?: unknown) {
  return new ApiError({ status: 401, code: 'UNAUTHORIZED', message, details });
}

export function conflict(message: string, details?: unknown) {
  return new ApiError({ status: 409, code: 'CONFLICT', message, details });
}

export function tokenSecretMissing() {
  return new ApiError({
    status: 500,
    code: 'TOKEN_SECRET_MISSING',
    message: 'JWT_ACCESS_SECRET is not configured on the backend. Set JWT_ACCESS_SECRET in .env and restart the server.',
  });
}

export function zodToApiDetails(error: z.ZodError) {
  return error.flatten();
}

