import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { createDevUser, findDevUserByEmail, findDevUserById } from '../lib/dev-auth-store.js';
import { prisma } from '../lib/prisma.js';

const credentialsSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

function signAccessToken(user: { id: string; email: string; role: 'admin' | 'user' }) {
  if (!env.JWT_ACCESS_SECRET) {
    // Avoid a generic 500 from jsonwebtoken when misconfigured.
    throw new Error('JWT_ACCESS_SECRET is not configured');
  }

  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'],
  });
}


function isDatabaseError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? (error.code as string | undefined) : undefined;
  const name = 'name' in error ? (error.name as string | undefined) : undefined;

  return Boolean(code?.startsWith('P')) || name === 'PrismaClientInitializationError' || name === 'PrismaClientRustPanicError';
}

function handleAuthError(error: unknown) {
  if (isDatabaseError(error)) {
    return { databaseUnavailable: true as const };
  }

  console.error(error);
  return { databaseUnavailable: false as const };
}

async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return user;
    }

    return await findDevUserByEmail(email);
  } catch (error) {
    if (handleAuthError(error).databaseUnavailable) {
      const devUser = await findDevUserByEmail(email);
      return devUser;
    }

    throw error;
  }
}

async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      return user;
    }

    return await findDevUserById(id);
  } catch (error) {
    if (handleAuthError(error).databaseUnavailable) {
      const devUser = await findDevUserById(id);
      return devUser;
    }

    throw error;
  }
}

async function createUser(input: { name: string; email: string; passwordHash: string }) {
  try {
    return await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        role: 'user',
      },
    });
  } catch (error) {
    if (handleAuthError(error).databaseUnavailable) {
      return await createDevUser(input);
    }

    throw error;
  }
}

export const authRouter = Router();

authRouter.post('/signup', async (request, response) => {
  try {
    if (!env.JWT_ACCESS_SECRET) {
      return response.status(500).json({
        message:
          'JWT_ACCESS_SECRET is not configured on the backend. Set JWT_ACCESS_SECRET in .env and restart the server.',
        code: 'TOKEN_SECRET_MISSING',
        details: { envVar: 'JWT_ACCESS_SECRET' },
      });

    }


    const parsed = credentialsSchema.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({
        message: 'Invalid signup payload',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
    }


    const existingUser = await getUserByEmail(parsed.data.email);
    if (existingUser) {
      return response.status(409).json({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await createUser({
      name: parsed.data.name?.trim() || 'New user',
      email: parsed.data.email,
      passwordHash,
    });

    const accessToken = signAccessToken(user);

    response.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError.databaseUnavailable) {
      return response.status(503).json({
        message: 'Database unavailable. Check PostgreSQL, DATABASE_URL, and Prisma migrations.',
        code: 'DATABASE_UNAVAILABLE',
      });
    }


    if (error instanceof Error && error.message === 'JWT_ACCESS_SECRET is not configured') {
      return response.status(500).json({
        message:
          'JWT_ACCESS_SECRET is not configured on the backend. Set JWT_ACCESS_SECRET in .env and restart the server.',
        code: 'TOKEN_SECRET_MISSING',
      });
    }


    console.error(error);
    return response.status(500).json({ message: 'Internal server error' });
  }
});

authRouter.post('/login', async (request, response) => {
  try {
    if (!env.JWT_ACCESS_SECRET) {
      return response.status(500).json({
        message:
          'JWT_ACCESS_SECRET is not configured on the backend. Set JWT_ACCESS_SECRET in .env and restart the server.',
        code: 'TOKEN_SECRET_MISSING',
      });
    }


    const parsed = credentialsSchema.omit({ name: true }).safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({
        message: 'Invalid login payload',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
    }


    const user = await getUserByEmail(parsed.data.email);

    if (!user) {
      return response.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!passwordMatches) {
      return response.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = signAccessToken(user);

    response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (error) {
    const authError = handleAuthError(error);
    if (authError.databaseUnavailable) {
      return response.status(503).json({
        message: 'Database unavailable. Check PostgreSQL, DATABASE_URL, and Prisma migrations.',
      });
    }

    if (error instanceof Error && error.message === 'JWT_ACCESS_SECRET is not configured') {
      return response.status(500).json({
        message: 'JWT_ACCESS_SECRET is not configured on the backend. Set JWT_ACCESS_SECRET in .env and restart the server.',
      });
    }

    console.error(error);
    return response.status(500).json({ message: 'Internal server error' });
  }
});

authRouter.get('/me', async (request, response) => {
  if (!env.JWT_ACCESS_SECRET) {
    return response.status(500).json({
      message:
        'JWT_ACCESS_SECRET is not configured on the backend. Set JWT_ACCESS_SECRET in .env and restart the server.',
    });
  }

  try {

    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return response.status(401).json({ message: 'Missing access token' });
    }

    const payload = jwt.verify(header.slice('Bearer '.length), env.JWT_ACCESS_SECRET) as { userId: string };
    const user = await getUserById(payload.userId);

    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }

    response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return response.status(401).json({ message: 'Invalid or expired token' });
    }

    const authError = handleAuthError(error);
    if (authError.databaseUnavailable) {
      return response.status(503).json({
        message: 'Database unavailable. Check PostgreSQL, DATABASE_URL, and Prisma migrations.',
      });
    }

    return response.status(500).json({ message: 'Internal server error' });
  }
});
