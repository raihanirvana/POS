import { apiRequest, invalidResponse } from './api.js';
import { hasMenuImage } from './menu-images.js';
import { defaultImageByCategory } from './product-form.js';

function isProduct(value) {
  return (
    typeof value?.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.category === 'string' &&
    Object.hasOwn(defaultImageByCategory, value.category) &&
    Number.isSafeInteger(value.price) &&
    value.price >= 1000 &&
    value.price <= 10000000 &&
    Number.isSafeInteger(value.stock) &&
    value.stock >= 0 &&
    value.stock <= 100000 &&
    hasMenuImage(value.imageKey) &&
    typeof value.description === 'string' &&
    (value.tag === null || typeof value.tag === 'string')
  );
}

function isPreset(value) {
  return (
    hasMenuImage(value?.key) &&
    typeof value.label === 'string' &&
    value.label.trim().length > 0 &&
    typeof value.category === 'string' &&
    Object.hasOwn(defaultImageByCategory, value.category)
  );
}

function isCatalog(catalog) {
  const categories = Object.keys(defaultImageByCategory);
  const received = catalog?.categories;
  const presets = catalog?.imagePresets;
  return (
    Array.isArray(received) &&
    received.length === categories.length &&
    new Set(received).size === categories.length &&
    received.every((category) => categories.includes(category)) &&
    Array.isArray(presets) &&
    presets.every(isPreset) &&
    new Set(presets.map((preset) => preset.key)).size === presets.length &&
    categories.every((category) =>
      presets.some(
        (preset) =>
          preset.category === category && preset.key === defaultImageByCategory[category],
      ),
    )
  );
}

function productListResponse(payload) {
  const valid =
    Array.isArray(payload?.products) &&
    payload.products.every(isProduct) &&
    isCatalog(payload.catalog);
  if (!valid) {
    throw invalidResponse();
  }
  return payload;
}

function productResponse(payload) {
  if (!isProduct(payload?.product)) {
    throw invalidResponse();
  }
  return payload.product;
}

export async function listProducts({ category, search }, signal) {
  const query = new URLSearchParams();
  if (category) {
    query.set('category', category);
  }
  if (search) {
    query.set('search', search);
  }
  const text = query.toString();
  const suffix = text ? `?${text}` : '';
  return productListResponse(await apiRequest(`/products${suffix}`, { signal }));
}

export async function createProduct(body) {
  return productResponse(await apiRequest('/products', { method: 'POST', body }));
}

export async function updateProduct(id, body) {
  const path = `/products/${encodeURIComponent(id)}`;
  return productResponse(await apiRequest(path, { method: 'PATCH', body }));
}

export function deleteProduct(id) {
  return apiRequest(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
