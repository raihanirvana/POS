import express from 'express';
import { resolve } from 'node:path';
import { config } from './config.js';
import { createHealthRouter } from './routes/health.js';
import { apiNotFound, errorHandler } from './middleware/errors.js';
import { requestContext } from './middleware/request-context.js';

export function createApp(database) {
  const app = express();
  app.disable('x-powered-by');
  app.use(requestContext);
  app.use(express.json({ limit: '100kb' }));
  app.use('/api', createHealthRouter(database));
  app.use('/api', apiNotFound);
  app.use('/prototype', express.static(config.prototypeDirectory, { dotfiles: 'deny' }));
  app.use(express.static(config.webDirectory));
  app.get('/{*path}', (_request, response) => {
    response.sendFile(resolve(config.webDirectory, 'index.html'));
  });
  app.use(errorHandler);
  return app;
}
