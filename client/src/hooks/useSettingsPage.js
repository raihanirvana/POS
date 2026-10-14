import { useState } from 'react';
import { useDemoReset } from './useDemoReset.js';
import { getSettings } from '../lib/settings-api.js';
import { useRemoteData } from './useRemoteData.js';
import { useTimedNotice } from './useTimedNotice.js';

function resetMessage(result) {
  return (
    `Data contoh dipulihkan: ${result.products} menu dan ${result.transactions} ` +
    'transaksi. Pesanan di Kasir dibatalkan.'
  );
}

function useSettingsFeedback(state) {
  const notice = useTimedNotice(6000);
  return {
    notice: notice.message,
    handleSaved: (_settings, changed) => {
      notice.show(changed ? 'Pengaturan disimpan.' : 'Tidak ada perubahan.');
      state.reload();
    },
    handleReset: (result) => {
      notice.show(resetMessage(result));
      state.reload();
    },
  };
}

// Setelah simpan/reset, tunggu data terbaru sebelum membuka editor lagi.
export function useSettingsPage() {
  const state = useRemoteData(getSettings);
  const feedback = useSettingsFeedback(state);
  const [saving, setSaving] = useState(false);
  const reset = useDemoReset(feedback.handleReset);
  const refreshing = state.status !== 'ready';
  return {
    state,
    ...feedback,
    reset,
    onSaving: setSaving,
    disabled: refreshing || reset.pending,
    resetDisabled: refreshing || saving || reset.pending,
  };
}
