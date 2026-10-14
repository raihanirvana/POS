import { HttpError } from '../lib/http-error.js';

const maxTrackedIps = 10000;
const pruneIntervalMs = 1000;

function prune(hits, now) {
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) {
      hits.delete(key);
    }
  }
}

function requestEntry(state, key, now, windowMs) {
  const entry = state.hits.get(key);
  if (entry && entry.resetAt > now) {
    return entry;
  }
  if (!entry && state.hits.size >= maxTrackedIps) {
    if (now >= state.nextPruneAt) {
      prune(state.hits, now);
      state.nextPruneAt = now + pruneIntervalMs;
    }
    if (state.hits.size >= maxTrackedIps) {
      return null;
    }
  }
  const current = { count: 0, resetAt: now + windowMs };
  state.hits.set(key, current);
  return current;
}

function retrySeconds(current, now, windowMs, max) {
  if (!current) {
    return Math.ceil(windowMs / 1000);
  }
  current.count = Math.min(current.count + 1, max + 1);
  return current.count > max ? Math.ceil((current.resetAt - now) / 1000) : 0;
}

// Fixed window per IP. Penyimpanan dibatasi; entri aktif tidak digusur untuk memberi
// slot IP baru, supaya pergantian IP tidak menghapus hitungan IP yang sudah dibatasi.
export function createRateLimiter({ windowMs, max, message }) {
  const state = { hits: new Map(), nextPruneAt: 0 };
  return (request, response, next) => {
    const now = Date.now();
    const current = requestEntry(state, request.ip ?? 'tanpa-ip', now, windowMs);
    const retryAfter = retrySeconds(current, now, windowMs, max);
    if (retryAfter > 0) {
      response.set('Retry-After', String(retryAfter));
      next(new HttpError(429, 'RATE_LIMITED', message));
      return;
    }
    next();
  };
}
