import { useState } from 'react';
import { downloadReportCsv } from '../lib/reports-api.js';

function saveFile({ blob, filename }) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function exportPeriod(period, setState) {
  setState({ pending: true, error: null, message: null });
  try {
    const file = await downloadReportCsv(period);
    saveFile(file);
    setState({
      pending: false,
      error: null,
      message: `CSV diunduh: ${file.rowCount} transaksi (${period.from}–${period.to}).`,
    });
  } catch (error) {
    setState({ pending: false, error, message: null });
  }
}

// CSV dibuat server untuk periode yang sama dengan laporan yang tampil.
export function useReportExport(period, enabled) {
  const [state, setState] = useState({ pending: false, error: null, message: null });
  function run() {
    if (!enabled || state.pending) {
      return;
    }
    return exportPeriod(period, setState);
  }
  return { ...state, run, enabled };
}
