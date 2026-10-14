import express from 'express';
import { resolve } from 'node:path';
import { config } from './config.js';
import { createHealthRouter } from './routes/health.js';
import { createProductRouter } from './routes/products.js';
import { createSessionRouter } from './routes/session.js';
import { createTransactionRouter } from './routes/transactions.js';
import { loadSession } from './middleware/auth.js';
import { apiNotFound, errorHandler } from './middleware/errors.js';
import { requestContext } from './middleware/request-context.js';

// Respons API berisi data sesi/ruang demo, jadi tidak boleh disimpan cache.
function noStore(_request, response, next) {
  response.set('Cache-Control', 'no-store');
  next();
}

export function createApp(database) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(requestContext);
  app.use('/api', noStore);
  app.use(express.json({ limit: '100kb' }));
  app.use('/api', createHealthRouter(database));
  app.use('/api', loadSession(database));
  app.use('/api', createSessionRouter(database));
  app.use('/api', createProductRouter(database));
  app.use('/api', createTransactionRouter(database));
  app.use('/api', apiNotFound);
  app.use('/prototype', express.static(config.prototypeDirectory, { dotfiles: 'deny' }));
  app.use(express.static(config.webDirectory));
  app.get('/{*path}', (_request, response) => {
    response.sendFile(resolve(config.webDirectory, 'index.html'));
  });
  app.use(errorHandler);
  return app;
}
