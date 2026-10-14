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

export const config = {
  port: readPort(process.env.PORT ?? '3001', 'PORT'),
  webPort: readPort(process.env.WEB_PORT ?? '5173', 'WEB_PORT'),
  host: process.env.HOST ?? '127.0.0.1',
  environment: process.env.NODE_ENV ?? 'development',
  databasePath: resolve(
    rootDirectory,
    process.env.DATABASE_PATH ?? './data/seduh.sqlite',
  ),
  webDirectory: resolve(rootDirectory, 'client/dist'),
  prototypeDirectory: resolve(rootDirectory, 'dist'),
};
