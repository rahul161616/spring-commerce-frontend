function buildErrorMessage(response, fallbackMessage) {
  if (!response) {
    return fallbackMessage;
  }

  return `${fallbackMessage} (${response.status})`;
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

export async function publicRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response, 'Public storefront request failed'));
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}
