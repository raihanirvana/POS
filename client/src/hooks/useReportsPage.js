import { useCallback, useState } from 'react';
import { jakartaDateKey } from '../lib/format.js';
import { periodError, presetPeriod } from '../lib/report-period.js';
import { getReport } from '../lib/reports-api.js';
import { useRemoteData } from './useRemoteData.js';
import { useReportExport } from './useReportExport.js';

// Isian tanggal (draft) baru dipakai bila valid; laporan dan CSV memakai periode sama.
function usePeriod(today) {
  const [draft, setDraft] = useState(() => presetPeriod(today, 7));
  const [period, setPeriod] = useState(draft);
  function update(next) {
    setDraft(next);
    if (!periodError(next)) {
      setPeriod(next);
    }
  }
  return {
    draft,
    period,
    error: periodError(draft),
    setFrom: (from) => update({ ...draft, from }),
    setTo: (to) => update({ ...draft, to }),
    applyPreset: (days) => update(presetPeriod(today, days)),
  };
}

export function useReportsPage() {
  const today = jakartaDateKey();
  const period = usePeriod(today);
  const { from, to } = period.period;
  const load = useCallback((signal) => getReport({ from, to }, signal), [from, to]);
  const report = useRemoteData(load);
  const displayed = report.data?.period;
  const canExport =
    report.status === 'ready' &&
    !period.error &&
    displayed?.from === from &&
    displayed?.to === to;
  const exporter = useReportExport(displayed, canExport);
  return { today, period, report, exporter };
}
