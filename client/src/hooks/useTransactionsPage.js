import { useEffect, useState } from 'react';
import { jakartaDateKey } from '../lib/format.js';
import { useDebouncedValue } from './useDebouncedValue.js';
import { useTransactions } from './useTransactions.js';

export const historyPageSize = 20;

// Setiap perubahan filter kembali ke halaman pertama.
function useHistoryFilters(setPage) {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  useEffect(() => setPage(0), [debouncedSearch, setPage]);
  const update = (setter) => (value) => {
    setter(value);
    setPage(0);
  };
  return {
    search,
    date,
    debouncedSearch,
    pendingSearch: search.trim() !== debouncedSearch,
    today: jakartaDateKey(),
    setSearch: update(setSearch),
    setDate: update(setDate),
  };
}

function usePageBounds(list, setPage) {
  useEffect(() => {
    const data = list.data;
    if (list.status === 'ready' && data.offset > 0 && data.offset >= data.total) {
      setPage(Math.max(0, Math.ceil(data.total / historyPageSize) - 1));
    }
  }, [list.data, list.status, setPage]);
}

export function useTransactionsPage() {
  const [page, setPage] = useState(0);
  const filters = useHistoryFilters(setPage);
  const list = useTransactions({
    search: filters.debouncedSearch,
    date: filters.date,
    limit: historyPageSize,
    offset: page * historyPageSize,
  });
  usePageBounds(list, setPage);
  const [openId, setOpenId] = useState(null);
  return { filters, list, page, setPage, openId, setOpenId };
}
