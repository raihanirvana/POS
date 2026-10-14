import { useRef, useState } from 'react';
import { isUncertainFailure, newIdempotencyKey } from '../lib/checkout.js';
import { createTransaction } from '../lib/transactions-api.js';

async function postAttempt(current) {
  try {
    const body = { ...current.body, idempotencyKey: current.key };
    return { result: await createTransaction(body), previewTotal: current.previewTotal };
  } catch (error) {
    return { error, uncertain: isUncertainFailure(error) };
  }
}

function useCheckoutState() {
  const [attempt, setAttempt] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  function apply(current, outcome) {
    setAttempt(outcome.uncertain ? current : null);
    setStatus(outcome.error ? (outcome.uncertain ? 'uncertain' : 'failed') : 'idle');
    setError(outcome.error ?? null);
  }
  return { attempt, status, error, setStatus, setError, apply };
}

// Satu percobaan bayar = satu idempotency key. Hasil tidak pasti mempertahankan key dan
// body yang sama agar kirim ulang tidak membuat transaksi ganda.
async function sendAttempt(current, state, inFlight) {
  if (inFlight.current) {
    return { ignored: true };
  }
  const request = Symbol('checkout');
  inFlight.current = request;
  state.setStatus('submitting');
  state.setError(null);
  const outcome = await postAttempt(current);
  if (inFlight.current !== request) {
    return { ignored: true };
  }
  inFlight.current = null;
  state.apply(current, outcome);
  return outcome;
}

export function useCheckout() {
  const state = useCheckoutState();
  const inFlight = useRef(null);
  const send = (current) => sendAttempt(current, state, inFlight);
  return {
    attempt: state.attempt,
    status: state.status,
    error: state.error,
    submit: (body, previewTotal) =>
      send(state.attempt ?? { key: newIdempotencyKey(), body, previewTotal }),
    retry: () => send(state.attempt),
    abandon: () => {
      inFlight.current = null;
      state.apply(null, {});
    },
  };
}
