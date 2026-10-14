import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import dotenv from 'dotenv';

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
  databasePath: resolve(
    rootDirectory,
    process.env.DATABASE_PATH ?? './data/seduh.sqlite',
  ),
  webDirectory: resolve(rootDirectory, 'client/dist'),
  prototypeDirectory: resolve(rootDirectory, 'dist'),
};
