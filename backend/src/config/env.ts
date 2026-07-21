import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Try dotenv normally first
config();

/**
 * Parse key=value lines from a string, setting them on process.env
 * if they are not already defined.
 */
function parseAndSetEnv(content: string) {
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim().replace(/^\uFEFF/, '');
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = value;
    }
  }
}

/**
 * Read a .env file, handling UTF-8, UTF-16LE, and UTF-16BE encodings.
 */
function loadEnvFile(pathToEnv: string) {
  try {
    const raw = readFileSync(pathToEnv);

    const hasUtf16LeBom = raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe;
    const hasUtf16BeBom = raw.length >= 2 && raw[0] === 0xfe && raw[1] === 0xff;

    if (hasUtf16LeBom) {
      parseAndSetEnv(raw.toString('utf16le'));
    } else if (hasUtf16BeBom) {
      const converted = Buffer.allocUnsafe(raw.length);
      for (let i = 0; i < raw.length; i += 2) {
        converted[i] = raw[i + 1] ?? 0;
        converted[i + 1] = raw[i] ?? 0;
      }
      parseAndSetEnv(converted.toString('utf16le'));
    } else {
      parseAndSetEnv(raw.toString('utf8'));
    }
  } catch {
    // File not found or unreadable — ignore.
  }
}

// Try loading from common locations
loadEnvFile(resolve(process.cwd(), '.env'));           // backend/.env when cwd is backend
loadEnvFile(resolve(process.cwd(), '..', '.env'));     // repo root .env
loadEnvFile(resolve(process.cwd(), 'backend', '.env')); // extra safety

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL || '1h',
  PORT: Number(process.env.PORT) || 4000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

