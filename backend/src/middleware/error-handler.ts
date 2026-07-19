import type { NextFunction, Request, Response } from 'express';
import { normalizeError } from '../lib/errors.js';

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  const { status, payload } = normalizeError(error);

  response.status(status).json(payload);
}


