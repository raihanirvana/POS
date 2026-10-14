import { useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue.js';
import { useProductDelete } from './useProductDelete.js';
import { useProducts } from './useProducts.js';
import { useTimedNotice } from './useTimedNotice.js';

function useProductFilters() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  return { category, setCategory, search, setSearch, debouncedSearch };
}

function useProductEditor(onSaved) {
  const [editor, setEditor] = useState(null);
  return {
    editor,
    openCreate: () => setEditor({ key: 'baru', product: null }),
    openEdit: (product) => setEditor({ key: product.id, product }),
    closeEditor: () => setEditor(null),
    handleSaved: (product) => {
      setEditor(null);
      onSaved(product);
    },
  };
}

// Setelah simpan/hapus daftar dimuat ulang dari server, bukan diubah lokal.
export function useProductsPage() {
  const filters = useProductFilters();
  const products = useProducts({
    category: filters.category,
    search: filters.debouncedSearch,
  });
  const notice = useTimedNotice();
  const afterChange = (message) => {
    notice.show(message);
    products.reload();
  };
  const editor = useProductEditor((product) => afterChange(`${product.name} disimpan.`));
  const remover = useProductDelete((product) =>
    afterChange(`${product.name} dihapus dari menu.`),
  );
  return { filters, products, remover, notice: notice.message, ...editor };
}
