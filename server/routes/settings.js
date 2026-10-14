import { Router } from 'express';
import { requireRole, requireSession } from '../middleware/auth.js';
import {
  getWorkspaceSettings,
  resetWorkspace,
  updateWorkspaceSettings,
} from '../services/settings-service.js';
import { parseResetBody, parseSettingsPatch } from '../validation/settings-validation.js';

const staff = [requireSession, requireRole('owner', 'cashier')];
const ownerOnly = [requireSession, requireRole('owner')];

function createPatchHandler(database) {
  return (request, response) => {
    const changes = parseSettingsPatch(request.body);
    const settings = updateWorkspaceSettings(database, request.auth, changes, new Date());
    response.json({ settings });
  };
}

function createResetHandler(database) {
  return (request, response) => {
    parseResetBody(request.body);
    const result = resetWorkspace(database, request.auth, new Date());
    response.json({ reset: true, ...result });
  };
}

export function createSettingsRouter(database) {
  const router = Router();
  router.get('/settings', ...staff, (request, response) => {
    response.json({ settings: getWorkspaceSettings(database, request.auth.workspaceId) });
  });
  router.patch('/settings', ...ownerOnly, createPatchHandler(database));
  router.post('/demo/reset', ...ownerOnly, createResetHandler(database));
  return router;
}
