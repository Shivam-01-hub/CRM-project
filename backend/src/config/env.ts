import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

// Try dotenv normally first (in case the environment is standard)
config();

/**
 * Load .env even if it is saved as UTF-16LE/UTF-16BE (common in some editors on Windows).
 * This avoids dotenv silently failing to inject env vars.
 */
function loadEnvFileFlexible(pathToEnv: string) {
  try {
    const raw = readFileSync(pathToEnv);

    const hasUtf16LeBom = raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe;
    const hasUtf16BeBom = raw.length >= 2 && raw[0] === 0xfe && raw[1] === 0xff;

    let content: string;
    if (hasUtf16LeBom) {
      content = raw.toString('utf16le');
    } else if (hasUtf16BeBom) {
      // Convert BE buffer to LE by swapping pairs
      const converted = Buffer.allocUnsafe(raw.length);
      for (let i = 0; i < raw.length; i += 2) {
        converted[i] = raw[i + 1] ?? 0;
        converted[i + 1] = raw[i] ?? 0;
      }
      content = converted.toString('utf16le');
    } else {
      content = raw.toString('utf8');
    }

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex === -1) continue;

      const key = trimmed.slice(0, equalsIndex).trim().replace(/^\uFEFF/, '');
      const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, '');

      // Only set if undefined/empty (keeps explicit env vars > file vars)
      if (process.env[key] === undefined || process.env[key] === '') {
        process.env[key] = value;
      }
    }
  } catch {
    // ignore
  }
}

// Candidate locations (tsx/tsx watch cwd can vary)
loadEnvFileFlexible(resolve(process.cwd(), '.env')); // backend/.env when cwd is backend
loadEnvFileFlexible(resolve(process.cwd(), '..', '.env')); // repo root .env
loadEnvFileFlexible(resolve(process.cwd(), 'backend', '.env')); // extra safety

function loadFallbackEnvFile() {
  // If JWT secret is already set (even empty string is considered set), stop.
  if (process.env.JWT_ACCESS_SECRET) {
    return;
  }

  const candidatePaths = [
    resolve(process.cwd(), '.env'), // when running from backend/ this is backend/.env
    resolve(process.cwd(), '..', '.env'), // repo root .env
  ];

  const envPath = candidatePaths.find((p) => {
    try {
      readFileSync(p);
      return true;
    } catch {
      return false;
    }
  });

  if (!envPath) {
    return;
  }

  const raw = readFileSync(envPath);

  for (const encoding of ['utf8', 'utf16le', 'utf16be'] as const) {
    try {
      let content: string;

      if (encoding === 'utf8') {
        content = raw.toString('utf8');
      } else if (encoding === 'utf16le') {
        content = raw.toString('utf16le');
      } else {
        const converted = Buffer.allocUnsafe(raw.length);
        for (let index = 0; index < raw.length; index += 2) {
          converted[index] = raw[index + 1] ?? 0;
          converted[index + 1] = raw[index] ?? 0;
        }

        content = converted.toString('utf16le');
      }

      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('#')) {
          continue;
        }

        const equalsIndex = trimmed.indexOf('=');
        if (equalsIndex === -1) {
          continue;
        }

        const key = trimmed.slice(0, equalsIndex).trim().replace(/^\uFEFF/, '');
        const value = trimmed.slice(equalsIndex + 1).trim().replace(/^['"]|['"]$/g, '');

        if (!process.env[key]) {
          process.env[key] = value;
        }
      }

      return;
    } catch {
      // Try the next encoding.
    }
  }
}

loadFallbackEnvFile();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL || '1h',
  PORT: Number(process.env.PORT) || 4000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

