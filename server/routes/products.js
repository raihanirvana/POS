import { Router } from 'express';
import { requireRole, requireSession } from '../middleware/auth.js';
import {
  createProduct,
  deleteWorkspaceProduct,
  getProductCatalog,
  listWorkspaceProducts,
  updateWorkspaceProduct,
} from '../services/product-service.js';
import {
  parseProductCreate,
  parseProductId,
  parseProductPatch,
  parseProductQuery,
} from '../validation/product-validation.js';

const ownerOnly = [requireSession, requireRole('owner')];
const staff = [requireSession, requireRole('owner', 'cashier')];

function createListHandler(database) {
  return (request, response) => {
    const filters = parseProductQuery(request.query);
    const products = listWorkspaceProducts(database, request.auth.workspaceId, filters);
    response.json({ products, filters, catalog: getProductCatalog() });
  };
}

function createCreateHandler(database) {
  return (request, response) => {
    const input = parseProductCreate(request.body);
    const product = createProduct(database, request.auth, input, new Date());
    response.status(201).json({ product });
  };
}

function createUpdateHandler(database) {
  return (request, response) => {
    const productId = parseProductId(request.params.id);
    const input = parseProductPatch(request.body);
    const now = new Date();
    const product = updateWorkspaceProduct(database, request.auth, productId, input, now);
    response.json({ product });
  };
}

function createDeleteHandler(database) {
  return (request, response) => {
    const productId = parseProductId(request.params.id);
    deleteWorkspaceProduct(database, request.auth, productId);
    response.status(204).end();
  };
}

// Workspace selalu dari request.auth (sesi server), tidak pernah dari query/body.
export function createProductRouter(database) {
  const router = Router();
  router.get('/products', ...staff, createListHandler(database));
  router.post('/products', ...ownerOnly, createCreateHandler(database));
  router.patch('/products/:id', ...ownerOnly, createUpdateHandler(database));
  router.delete('/products/:id', ...ownerOnly, createDeleteHandler(database));
  return router;
}
