// Kategori dan foto preset harus sama dengan CHECK pada migrasi 001.
export const productCategories = ['Kopi', 'Non-kopi', 'Pastry'];

export const imagePresets = [
  { key: 'iced-coffee', label: 'Kopi susu es', category: 'Kopi' },
  { key: 'latte', label: 'Latte', category: 'Kopi' },
  { key: 'americano', label: 'Americano', category: 'Kopi' },
  { key: 'matcha', label: 'Matcha', category: 'Non-kopi' },
  { key: 'chocolate', label: 'Cokelat', category: 'Non-kopi' },
  { key: 'tea', label: 'Teh', category: 'Non-kopi' },
  { key: 'croissant', label: 'Croissant', category: 'Pastry' },
  { key: 'cinnamon', label: 'Cinnamon roll', category: 'Pastry' },
];

// Sama dengan foto produk baru pada prototype HTML.
export const defaultImageByCategory = {
  Kopi: 'latte',
  'Non-kopi': 'matcha',
  Pastry: 'croissant',
};

export function imageMatchesCategory(imageKey, category) {
  return imagePresets.some(
    (preset) => preset.key === imageKey && preset.category === category,
  );
}
