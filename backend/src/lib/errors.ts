import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { ApiError } from './api-errors.js';


export type ApiErrorResponse = {
  message: string;
  code?: string;
  details?: unknown;
};

export function normalizeError(error: unknown): { status: number; payload: ApiErrorResponse } {
  // ApiError (custom)
  if (error instanceof ApiError) {
    return {
      status: error.status,
      payload: {
        message: error.message,
        code: error.code,
        details: error.details,
      },
    };
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return {
      status: 400,
      payload: {
        message: 'Invalid request payload',
        code: 'VALIDATION_ERROR',
        details: error.flatten(),
      },
    };
  }


  // JWT errors
  if (error instanceof jwt.TokenExpiredError) {
    return {
      status: 401,
      payload: { message: 'Invalid or expired token', code: 'TOKEN_EXPIRED' },
    };
  }
  if (error instanceof jwt.JsonWebTokenError) {
    return {
      status: 401,
      payload: { message: 'Invalid or expired token', code: 'TOKEN_INVALID' },
    };
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Common ones: P2002 unique constraint, P2025 not found, etc.
    const code = `PRISMA_${error.code}`;
    let status = 500;
    if (error.code === 'P2002') status = 409;
    if (error.code === 'P2025') status = 404;

    return {
      status,
      payload: {
        message: 'Database request failed',
        code,
        details: { meta: error.meta },
      },
    };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      payload: {
        message: 'Database unavailable',
        code: 'DATABASE_UNAVAILABLE',
      },
    };
  }

  // Fallback
  if (error instanceof Error) {
    return {
      status: 500,
      payload: {
        message: error.message || 'Internal server error',
      },
    };
  }

  return {
    status: 500,
    payload: { message: 'Internal server error', code: 'UNKNOWN_ERROR' },
  };
}

