import { Router } from 'express';
import { config } from '../config.js';
import { clearSessionCookie, setSessionCookie } from '../lib/session-cookie.js';
import { requireSession } from '../middleware/auth.js';
import {
  describeSession,
  endDemoSession,
  startDemoSession,
} from '../services/demo-session-service.js';
import { parseDemoSessionBody } from '../validation/session-validation.js';

function createDemoSessionHandler(database) {
  return (request, response) => {
    const { role } = parseDemoSessionBody(request.body);
    const result = startDemoSession(database, {
      role,
      currentAuth: request.auth,
      limits: { ttlMinutes: config.demoTtlMinutes, maxWorkspaces: config.maxWorkspaces },
    });
    setSessionCookie(request, response, result.token, result.auth.expiresAt);
    response.status(201).json({
      session: describeSession(result.auth),
      workspaceCreated: result.workspaceCreated,
    });
  };
}

function createLogoutHandler(database) {
  return (request, response) => {
    if (request.auth) {
      endDemoSession(database, request.auth);
    }
    clearSessionCookie(request, response);
    response.status(204).end();
  };
}

export function createSessionRouter(database) {
  const router = Router();
  router.post('/demo/sessions', createDemoSessionHandler(database));
  router.get('/session', requireSession, (request, response) => {
    response.json({ session: describeSession(request.auth) });
  });
  router.delete('/session', createLogoutHandler(database));
  return router;
}
