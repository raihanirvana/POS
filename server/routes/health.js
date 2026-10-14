import { Router } from 'express';

export function createHealthRouter(database) {
  const router = Router();
  router.get('/health', (_request, response) => {
    database.prepare('SELECT 1 AS ready').get();
    response.json({
      status: 'ok',
      service: 'seduh-pos-api',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  });
  return router;
}
