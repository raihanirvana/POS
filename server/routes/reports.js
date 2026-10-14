import { Router } from 'express';
import { requireRole, requireSession } from '../middleware/auth.js';
import { buildReportCsv } from '../services/report-export-service.js';
import { getDashboard, getReport } from '../services/report-service.js';
import { parseReportPeriod } from '../validation/report-validation.js';

const ownerOnly = [requireSession, requireRole('owner')];

function createExportHandler(database) {
  return (request, response) => {
    const period = parseReportPeriod(request.query);
    const csv = buildReportCsv(database, request.auth.workspaceId, period);
    response.set('Content-Type', 'text/csv; charset=utf-8');
    response.set('Content-Disposition', `attachment; filename="${csv.filename}"`);
    response.set('X-Row-Count', String(csv.rowCount));
    response.send(csv.content);
  };
}

// Dashboard dan laporan dihitung server dari data workspace sesi (khusus pemilik).
export function createReportRouter(database) {
  const router = Router();
  router.get('/dashboard', ...ownerOnly, (request, response) => {
    response.json(getDashboard(database, request.auth.workspaceId, new Date()));
  });
  router.get('/reports', ...ownerOnly, (request, response) => {
    const period = parseReportPeriod(request.query);
    response.json(getReport(database, request.auth.workspaceId, period));
  });
  router.get('/reports/export', ...ownerOnly, createExportHandler(database));
  return router;
}
