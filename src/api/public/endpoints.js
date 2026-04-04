import { FRONTEND_API } from '../apiConstants';

export const PUBLIC_ENDPOINTS = {
  homepage: FRONTEND_API.public.homepage,
  products: FRONTEND_API.public.products,
  productBySlug: FRONTEND_API.public.productBySlug,
  cart: FRONTEND_API.public.cart,
  cartBySession: FRONTEND_API.public.cartBySession,
  cartItems: FRONTEND_API.public.cartItems,
  cartItemById: FRONTEND_API.public.cartItemById,
  removeCartItem: FRONTEND_API.public.removeCartItem,
  orders: FRONTEND_API.public.orders,
  orderByCode: FRONTEND_API.public.orderByCode,
  paymentSubmission: FRONTEND_API.public.paymentSubmission,
  auth: FRONTEND_API.public.auth,
};
