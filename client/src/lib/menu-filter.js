// Filter menu kasir di browser agar pencarian terasa instan; data tetap dari API.
export function filterMenu(products, { category, search }) {
  const term = search.trim().toLocaleLowerCase('id-ID');
  return products.filter((product) => {
    const inCategory = !category || product.category === category;
    const text = `${product.name} ${product.description}`.toLocaleLowerCase('id-ID');
    return inCategory && (!term || text.includes(term));
  });
}
