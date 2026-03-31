function buildErrorMessage(response, fallbackMessage) {
  if (!response) {
    return fallbackMessage;
  }

  return `${fallbackMessage} (${response.status})`;
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
    throw new Error(buildErrorMessage(response, 'Public storefront request failed'));
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}
