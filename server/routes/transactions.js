import { Router } from 'express';
import { requireRole, requireSession } from '../middleware/auth.js';
import {
  getTransactionDetail,
  listWorkspaceTransactions,
} from '../services/transaction-query-service.js';
import { checkout } from '../services/transaction-service.js';
import {
  parseCheckoutBody,
  parseTransactionId,
  parseTransactionQuery,
} from '../validation/transaction-validation.js';

const staff = [requireSession, requireRole('owner', 'cashier')];

// 201 untuk transaksi baru, 200 untuk replay idempotency key yang sama.
function createCheckoutHandler(database) {
  return (request, response) => {
    const input = parseCheckoutBody(request.body);
    const result = checkout(database, request.auth, input, new Date());
    response.status(result.replayed ? 200 : 201).json(result);
  };
}

function createListHandler(database) {
  return (request, response) => {
    const query = parseTransactionQuery(request.query);
    const { workspaceId } = request.auth;
    response.json(listWorkspaceTransactions(database, workspaceId, query));
  };
}

function createDetailHandler(database) {
  return (request, response) => {
    const transactionId = parseTransactionId(request.params.id);
    const { workspaceId } = request.auth;
    const transaction = getTransactionDetail(database, workspaceId, transactionId);
    response.json({ transaction });
  };
}

// Workspace selalu dari sesi server; total, harga, dan peran dari klien tidak dipakai.
export function createTransactionRouter(database) {
  const router = Router();
  router.post('/transactions', ...staff, createCheckoutHandler(database));
  router.get('/transactions', ...staff, createListHandler(database));
  router.get('/transactions/:id', ...staff, createDetailHandler(database));
  return router;
}
