import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Hot-reload safe Prisma client singleton.
 *
 * In development, `tsx watch` re-runs this module on every file change.
 * Without the global cache, every re-import creates a new PrismaClient instance,
 * exhausting database connections until PostgreSQL refuses new clients.
 *
 * `globalThis` survives TypeScript re-execution, so we store the single
 * instance there and reuse it across hot reloads.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV !== 'production' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Disconnect Prisma and clear the global reference.
 * Call this during graceful shutdown (SIGTERM/SIGINT) to let the
 * process exit cleanly without a hanging connection.
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  if (process.env.NODE_ENV !== 'production') {
    delete globalForPrisma.prisma;
  }
}
