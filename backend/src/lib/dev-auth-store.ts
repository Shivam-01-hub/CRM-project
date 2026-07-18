import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export type DevAuthUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
};

const storePath = join(tmpdir(), 'partnership-crm-dev-auth-users.json');

async function readUsers(): Promise<DevAuthUser[]> {
  try {
    const content = await readFile(storePath, 'utf8');
    const users = JSON.parse(content) as DevAuthUser[];
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: DevAuthUser[]) {
  await writeFile(storePath, JSON.stringify(users, null, 2), 'utf8');
}

export async function findDevUserByEmail(email: string) {
  const users = await readUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findDevUserById(id: string) {
  const users = await readUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function createDevUser(input: Pick<DevAuthUser, 'name' | 'email' | 'passwordHash'>) {
  const users = await readUsers();

  if (users.some((user) => user.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('Email is already registered');
  }

  const now = new Date().toISOString();
  const user: DevAuthUser = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    role: 'user',
    createdAt: now,
    updatedAt: now,
  };

  users.unshift(user);
  await writeUsers(users);
  return user;
}
