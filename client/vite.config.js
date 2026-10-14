import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { config } from '../server/config.js';

const apiHost = ['0.0.0.0', '::'].includes(config.host) ? '127.0.0.1' : config.host;
const apiTarget = `http://${apiHost}:${config.port}`;

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: config.webPort,
    strictPort: true,
    proxy: { '/api': apiTarget, '/prototype': apiTarget },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
