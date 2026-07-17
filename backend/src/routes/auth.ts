import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';

const credentialsSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(8),
});

function signAccessToken(user: { id: string; email: string; role: 'admin' | 'user' }) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'],
  });
}

export const authRouter = Router();

authRouter.post('/signup', async (request, response) => {
  const parsed = credentialsSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({ message: 'Invalid signup payload', issues: parsed.error.flatten() });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) {
    return response.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name?.trim() || 'New user',
      email: parsed.data.email,
      passwordHash,
      role: 'user',
    },
  });

  const accessToken = signAccessToken(user);

  response.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
});

authRouter.post('/login', async (request, response) => {
  const parsed = credentialsSchema.omit({ name: true }).safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({ message: 'Invalid login payload', issues: parsed.error.flatten() });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

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
});

authRouter.get('/me', async (request, response) => {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return response.status(401).json({ message: 'Missing access token' });
  }

  try {
    const payload = jwt.verify(header.slice('Bearer '.length), env.JWT_ACCESS_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }

    response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch {
    response.status(401).json({ message: 'Invalid or expired token' });
  }
});
