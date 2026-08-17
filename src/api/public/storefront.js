import { publicRequest } from './client';
import { PUBLIC_ENDPOINTS } from './endpoints';
import {
  mapCartPayload,
  mapOrderPayload,
  mapPaymentSubmissionPayload,
  mapProductPayload,
  mapProductsPayload,
  mapStorefrontPayload,
} from './mappers';
import { mockProductsContent, mockStorefrontContent } from './mockData';

export async function fetchStorefrontContent() {
  try {
    const response = await publicRequest(PUBLIC_ENDPOINTS.homepage);
    return mapStorefrontPayload(response || {});
  } catch (error) {
    return mapStorefrontPayload(mockStorefrontContent);
  }
}

export async function fetchPublicProducts() {
  try {
    const response = await publicRequest(PUBLIC_ENDPOINTS.products);
    return mapProductsPayload(response || []);
  } catch (error) {
    return mapProductsPayload(mockProductsContent);
  }
}

export async function fetchPublicProductBySlug(slug) {
  try {
    const response = await publicRequest(PUBLIC_ENDPOINTS.productBySlug(encodeURIComponent(slug)));
    return mapProductPayload(response || {});
  } catch (error) {
    const fallbackProduct = mockProductsContent.find((item) => item.slug === slug);
    return fallbackProduct ? mapProductPayload(fallbackProduct) : null;
  }
}

export async function createOrGetCart(sessionId, currencyCode = 'NRS') {
  const response = await publicRequest(PUBLIC_ENDPOINTS.cart, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      currencyCode,
    }),
  });

  return mapCartPayload(response || {});
}

export async function fetchCartBySession(sessionId) {
  try {
    const response = await publicRequest(PUBLIC_ENDPOINTS.cartBySession(encodeURIComponent(sessionId)));
    return mapCartPayload(response || {});
  } catch (error) {
    return null;
  }
}

export async function addItemToCart({ sessionId, productId, quantity = 1, currencyCode = 'NRS' }) {
  const response = await publicRequest(PUBLIC_ENDPOINTS.cartItems, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      currencyCode,
      productId,
      quantity,
    }),
  });

  return mapCartPayload(response || {});
}

export async function updateCartItemQuantity(cartItemId, quantity) {
  const response = await publicRequest(PUBLIC_ENDPOINTS.cartItemById(cartItemId), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quantity,
    }),
  });

  return mapCartPayload(response || {});
}

export async function removeCartItem(cartItemId) {
  const response = await publicRequest(PUBLIC_ENDPOINTS.removeCartItem(cartItemId), {
    method: 'DELETE',
  });

  return mapCartPayload(response || {});
}

export async function createPublicOrder({ sessionId, customerName = '', customerEmail = '', customerPhone = '', notes = '' }) {
  const response = await publicRequest(PUBLIC_ENDPOINTS.orders, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    }),
  });

  return mapOrderPayload(response || {});
}

export async function fetchPublicOrderByCode(orderCode) {
  const response = await publicRequest(PUBLIC_ENDPOINTS.orderByCode(encodeURIComponent(orderCode)));
  return mapOrderPayload(response || {});
}

export async function submitPaymentSubmission(orderCode, payload) {
  const response = await publicRequest(PUBLIC_ENDPOINTS.paymentSubmission(encodeURIComponent(orderCode)), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return mapPaymentSubmissionPayload(response || {});
}

export async function signUpPublicUser({ fullName, email, password }) {
  return publicRequest(PUBLIC_ENDPOINTS.auth.signup, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: fullName,
      email,
      password,
    }),
  });
}

export async function loginPublicUser({ email, password }) {
  return publicRequest(PUBLIC_ENDPOINTS.auth.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export async function refreshPublicToken(refreshToken) {
  return publicRequest(PUBLIC_ENDPOINTS.auth.refresh, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken,
    }),
  });
}

export async function fetchOwnProfile() {
  return publicRequest(PUBLIC_ENDPOINTS.userProfile.me, {
    auth: true,
  });
}

export async function updateOwnProfile(payload) {
  return publicRequest(PUBLIC_ENDPOINTS.userProfile.me, {
    method: 'PATCH',
    auth: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
