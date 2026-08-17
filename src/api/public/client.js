import { FRONTEND_API } from '../apiConstants';

const AUTH_STORAGE_KEY = 'storefront_auth_session';
let publicRefreshPromise = null;

function buildErrorMessage(response, fallbackMessage) {
  if (!response) {
    return fallbackMessage;
  }

  return `${fallbackMessage} (${response.status})`;
}

function getPublicAuthToken() {
  const session = getPublicAuthSession();
  return session?.accessToken || session?.token || '';
}

function getPublicAuthSession() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem('storefront_auth_session');
    if (!rawSession) {
      return null;
    }

    return JSON.parse(rawSession);
  } catch (error) {
    return null;
  }
}

async function refreshPublicAuthSession() {
  if (publicRefreshPromise) {
    return publicRefreshPromise;
  }

  const session = getPublicAuthSession();
  if (!session?.refreshToken) {
    throw new Error('No refresh token is available.');
  }

  publicRefreshPromise = (async () => {
    const response = await fetch(FRONTEND_API.public.auth.refresh, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        refreshToken: session.refreshToken,
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok || !payload?.accessToken) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      throw new Error(payload?.message || 'Session refresh failed.');
    }

    const nextSession = {
      ...session,
      token: payload.accessToken,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken || session.refreshToken,
    };
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    return nextSession;
  })();

  try {
    return await publicRefreshPromise;
  } finally {
    publicRefreshPromise = null;
  }
}

async function extractErrorMessage(response, fallbackMessage) {
  if (!response) {
    return fallbackMessage;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return buildErrorMessage(response, fallbackMessage);
  }

  try {
    const payload = await response.json();
    return payload?.message || payload?.error || buildErrorMessage(response, fallbackMessage);
  } catch (error) {
    return buildErrorMessage(response, fallbackMessage);
  }
}

function isAuthenticatedRequest(options) {
  return Boolean(options?.auth);
}

function isExpiredStorefrontSession(response, message, options) {
  if (!isAuthenticatedRequest(options)) {
    return false;
  }

  if (response?.status === 401 || response?.status === 403) {
    return true;
  }

  const normalizedMessage = (message || '').trim().toLowerCase();
  return normalizedMessage === 'invalid authenticated user';
}

function redirectToLoginForExpiredSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?reason=session-expired';
    return;
  }

  window.history.replaceState({}, '', '/login?reason=session-expired');
}

export async function publicRequest(path, options = {}, hasRetried = false) {
  const token = options.auth ? getPublicAuthToken() : '';
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response, 'Public storefront request failed');

    if (isExpiredStorefrontSession(response, message, options)) {
      if (!hasRetried) {
        try {
          await refreshPublicAuthSession();
          return publicRequest(path, options, true);
        } catch (error) {
          // Fall through to login redirect after refresh fails.
        }
      }

      const authError = new Error('Session expired. Redirecting to login.');
      authError.code = 'AUTH_EXPIRED';
      redirectToLoginForExpiredSession();
      throw authError;
    }

    throw new Error(message);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}
