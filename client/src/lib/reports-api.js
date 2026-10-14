import { apiDownload, apiRequest, invalidResponse } from './api.js';
import { isDashboard, isReport } from './report-response.js';

export async function getDashboard(signal) {
  const payload = await apiRequest('/dashboard', { signal });
  if (!isDashboard(payload)) {
    throw invalidResponse();
  }
  return payload;
}

function periodQuery({ from, to }) {
  return new URLSearchParams({ from, to }).toString();
}

export async function getReport(period, signal) {
  const payload = await apiRequest(`/reports?${periodQuery(period)}`, { signal });
  if (!isReport(payload, period)) {
    throw invalidResponse();
  }
  return payload;
}

export function downloadReportCsv(period) {
  return apiDownload(`/reports/export?${periodQuery(period)}`);
}
