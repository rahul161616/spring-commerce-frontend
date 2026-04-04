const CART_SESSION_STORAGE_KEY = 'cart_session_id';

function createCartSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getCartSessionId() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createCartSessionId();
  }

  const existing = window.localStorage.getItem(CART_SESSION_STORAGE_KEY);
  if (existing && existing.trim()) {
    return existing;
  }

  const nextSessionId = createCartSessionId();
  window.localStorage.setItem(CART_SESSION_STORAGE_KEY, nextSessionId);
  return nextSessionId;
}

export function clearCartSessionId() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  window.localStorage.removeItem(CART_SESSION_STORAGE_KEY);
}

export { CART_SESSION_STORAGE_KEY };
