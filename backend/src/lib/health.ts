import { prisma } from './prisma.js';

export async function assertDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
}
