import { randomUUID } from 'node:crypto';
import { withOwnerWorkspace } from './product-access.js';
import {
  defaultImageByCategory,
  imageMatchesCategory,
  imagePresets,
  productCategories,
} from '../lib/product-catalog.js';
import {
  deleteProduct,
  findProduct,
  insertProduct,
  listProducts,
  updateProduct,
} from '../repositories/product-repository.js';
import { invalidProduct, productNotFound } from '../validation/product-validation.js';

function toProductResponse(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    stock: row.stock,
    imageKey: row.image_key,
    description: row.description,
    tag: row.tag,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getProductCatalog() {
  return { categories: productCategories, imagePresets };
}

export function listWorkspaceProducts(database, workspaceId, filters) {
  return listProducts(database, workspaceId, filters).map(toProductResponse);
}

// Foto dipilih dari preset kategori. Tanpa pilihan, foto lama dipakai bila masih
// sesuai kategori; jika tidak, kembali ke foto default kategori seperti prototype.
function resolveImageKey(category, requestedImageKey, currentImageKey) {
  if (requestedImageKey !== undefined) {
    if (!imageMatchesCategory(requestedImageKey, category)) {
      throw invalidProduct({ imageKey: 'Foto preset tidak sesuai kategori.' });
    }
    return requestedImageKey;
  }
  if (currentImageKey && imageMatchesCategory(currentImageKey, category)) {
    return currentImageKey;
  }
  return defaultImageByCategory[category];
}

function buildProduct(workspaceId, input, now) {
  return {
    id: randomUUID(),
    workspaceId,
    name: input.name,
    category: input.category,
    price: input.price,
    stock: input.stock,
    imageKey: resolveImageKey(input.category, input.imageKey),
    description: input.description,
    tag: input.tag,
    now: now.toISOString(),
  };
}

export function createProduct(database, auth, input, now) {
  return withOwnerWorkspace(database, auth, (workspaceId) => {
    const product = buildProduct(workspaceId, input, now);
    insertProduct(database, product);
    return toProductResponse(findProduct(database, workspaceId, product.id));
  });
}

function readExistingProduct(database, workspaceId, productId) {
  const product = findProduct(database, workspaceId, productId);
  if (!product) {
    throw productNotFound();
  }
  return product;
}

export function updateWorkspaceProduct(database, auth, productId, input, now) {
  return withOwnerWorkspace(database, auth, (workspaceId) => {
    const current = readExistingProduct(database, workspaceId, productId);
    const changes = { ...input, updatedAt: now.toISOString() };
    if (input.category !== undefined || input.imageKey !== undefined) {
      const category = input.category ?? current.category;
      changes.imageKey = resolveImageKey(category, input.imageKey, current.image_key);
    }
    updateProduct(database, workspaceId, productId, changes);
    return toProductResponse(findProduct(database, workspaceId, productId));
  });
}

export function deleteWorkspaceProduct(database, auth, productId) {
  return withOwnerWorkspace(database, auth, (workspaceId) => {
    if (deleteProduct(database, workspaceId, productId) === 0) {
      throw productNotFound();
    }
  });
}
