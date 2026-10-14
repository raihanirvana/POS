import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { normalizeOrigin } from './lib/origin.js';

const rootDirectory = fileURLToPath(new URL('../', import.meta.url));
dotenv.config({ path: resolve(rootDirectory, '.env'), quiet: true });

function readPort(value, name) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} harus berupa bilangan bulat antara 1 dan 65535.`);
  }
  return port;
}

function readDemoTtlMinutes(value) {
  const minutes = Number(value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 10080) {
    throw new Error('DEMO_TTL_MINUTES harus berupa bilangan bulat antara 1 dan 10080.');
  }
  return minutes;
}

function readLimit(value, fallback, name) {
  const number = Number(value ?? fallback);
  if (!Number.isInteger(number) || number < 1 || number > 1000000) {
    throw new Error(`${name} harus berupa bilangan bulat antara 1 dan 1.000.000.`);
  }
  return number;
}

// Origin tambahan yang boleh melakukan mutasi (dipisah koma), misalnya domain hosting.
function readOrigins(value) {
  const origins = (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return [
    ...new Set(
      origins.map((origin) => {
        const normalized = normalizeOrigin(origin);
        if (!normalized) {
          throw new Error(
            'ALLOWED_ORIGINS harus berisi origin HTTP(S) tanpa path/kredensial.',
          );
        }
        return normalized;
      }),
    ),
  ];
}

// Nilai Express "trust proxy": false, jumlah hop, atau daftar alamat/subnet proxy.
function readTrustProxy(value) {
  if (value === undefined || value === '' || value === 'false') {
    return false;
  }
  if (value === 'true') {
    throw new Error(
      'TRUST_PROXY=true memercayai semua proxy; isi jumlah hop atau alamat.',
    );
  }
  if (/^\d+$/.test(value)) {
    const hops = Number(value);
    if (!Number.isSafeInteger(hops)) {
      throw new Error('TRUST_PROXY harus berupa jumlah hop yang valid.');
    }
    return hops;
  }
  return value;
}

export const config = {
  port: readPort(process.env.PORT ?? '3001', 'PORT'),
  webPort: readPort(process.env.WEB_PORT ?? '5173', 'WEB_PORT'),
  host: process.env.HOST ?? '127.0.0.1',
  environment: process.env.NODE_ENV ?? 'development',
  demoTtlMinutes: readDemoTtlMinutes(process.env.DEMO_TTL_MINUTES ?? '720'),
  trustProxy: readTrustProxy(process.env.TRUST_PROXY),
  allowedOrigins: readOrigins(process.env.ALLOWED_ORIGINS),
  // Batas demo publik: login per IP per 10 menit, request API per IP per menit,
  // dan jumlah ruang demo aktif di seluruh server.
  demoSessionLimit: readLimit(process.env.DEMO_SESSION_LIMIT, 30, 'DEMO_SESSION_LIMIT'),
  apiRateLimit: readLimit(process.env.API_RATE_LIMIT, 300, 'API_RATE_LIMIT'),
  maxWorkspaces: readLimit(process.env.DEMO_MAX_WORKSPACES, 500, 'DEMO_MAX_WORKSPACES'),
  databasePath: resolve(
    rootDirectory,
    process.env.DATABASE_PATH ?? './data/seduh.sqlite',
  ),
  webDirectory: resolve(rootDirectory, 'client/dist'),
  prototypeDirectory: resolve(rootDirectory, 'dist'),
};
