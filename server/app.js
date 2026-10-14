import express from 'express';
import { resolve } from 'node:path';
import { config } from './config.js';
import { createHealthRouter } from './routes/health.js';
import { createProductRouter } from './routes/products.js';
import { createReportRouter } from './routes/reports.js';
import { createSettingsRouter } from './routes/settings.js';
import { createSessionRouter } from './routes/session.js';
import { createTransactionRouter } from './routes/transactions.js';
import { loadSession } from './middleware/auth.js';
import { apiNotFound, errorHandler } from './middleware/errors.js';
import { requireSameOrigin } from './middleware/origin-check.js';
import { createRateLimiter } from './middleware/rate-limit.js';
import { requestContext } from './middleware/request-context.js';
import { securityHeaders } from './middleware/security-headers.js';

// Respons API berisi data sesi/ruang demo, jadi tidak boleh disimpan cache.
function noStore(_request, response, next) {
  response.set('Cache-Control', 'no-store');
  next();
}

// Batas per IP: login demo (membuat ruang data) dan seluruh request API.
function createLimiters() {
  return {
    sessions: createRateLimiter({
      windowMs: 10 * 60 * 1000,
      max: config.demoSessionLimit,
      message: 'Terlalu banyak percobaan masuk demo. Coba lagi beberapa menit lagi.',
    }),
    api: createRateLimiter({
      windowMs: 60 * 1000,
      max: config.apiRateLimit,
      message: 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.',
    }),
  };
}

// Urutan penting: header & batas dulu, lalu origin, parsing JSON, sesi, dan router.
function mountApiGuards(app) {
  const limiters = createLimiters();
  app.use('/api', noStore);
  app.use('/api', limiters.api);
  app.use('/api', requireSameOrigin);
  app.post('/api/demo/sessions', limiters.sessions);
  app.use(express.json({ limit: '100kb' }));
}

function mountApiRoutes(app, database) {
  app.use('/api', createHealthRouter(database));
  app.use('/api', loadSession(database));
  app.use('/api', createSessionRouter(database));
  app.use('/api', createProductRouter(database));
  app.use('/api', createTransactionRouter(database));
  app.use('/api', createReportRouter(database));
  app.use('/api', createSettingsRouter(database));
  app.use('/api', apiNotFound);
}

function mountStatic(app) {
  app.use('/prototype', express.static(config.prototypeDirectory, { dotfiles: 'deny' }));
  app.use(express.static(config.webDirectory));
  app.get('/{*path}', (_request, response) => {
    response.sendFile(resolve(config.webDirectory, 'index.html'));
  });
}

export function createApp(database) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(requestContext);
  app.use(securityHeaders);
  mountApiGuards(app);
  mountApiRoutes(app, database);
  mountStatic(app);
  app.use(errorHandler);
  return app;
}
