const API_BASE = '/api/v1';

export const FRONTEND_API = {
  admin: {
    products: {
      all: `${API_BASE}/admin/products/all-products`,
      create: `${API_BASE}/admin/products/create-product`,
      statusUpdate: `${API_BASE}/admin/products/status/update-product`,
      byId: (id) => `${API_BASE}/admin/products/${id}/product`,
      update: (id) => `${API_BASE}/admin/products/${id}/update-product`,
      delete: (id) => `${API_BASE}/admin/products/${id}/product`,
    },
    categories: {
      all: `${API_BASE}/admin/categories/all-categories`,
      parentOptions: `${API_BASE}/admin/categories/parent-options`,
      create: `${API_BASE}/admin/categories/create-category`,
      byId: (id) => `${API_BASE}/admin/categories/${id}/category`,
      update: (id) => `${API_BASE}/admin/categories/${id}/category`,
      delete: (id) => `${API_BASE}/admin/categories/${id}/category`,
    },
    tags: {
      all: `${API_BASE}/admin/tags/all-tags`,
      create: `${API_BASE}/admin/tags/create-tag`,
      byId: (id) => `${API_BASE}/admin/tags/${id}/tag`,
      update: (id) => `${API_BASE}/admin/tags/${id}/tag`,
      delete: (id) => `${API_BASE}/admin/tags/${id}/tag`,
    },
    orders: {
      all: `${API_BASE}/admin/orders`,
      byId: (id) => `${API_BASE}/admin/orders/${id}`,
      verify: `${API_BASE}/admin/orders/verify`,
      process: `${API_BASE}/admin/orders/process`,
      cancel: `${API_BASE}/admin/orders/cancel`,
    },
    homepage: {
      hero: {
        all: `${API_BASE}/admin/homepage/hero`,
        create: `${API_BASE}/admin/homepage/hero`,
        byId: (id) => `${API_BASE}/admin/homepage/hero/${id}/hero`,
        update: (id) => `${API_BASE}/admin/homepage/hero/${id}/hero`,
        delete: (id) => `${API_BASE}/admin/homepage/hero/${id}/hero`,
      },
      featuredCategories: {
        all: `${API_BASE}/admin/homepage/featured-categories`,
        create: `${API_BASE}/admin/homepage/featured-categories`,
        byId: (id) => `${API_BASE}/admin/homepage/featured-categories/${id}`,
        update: (id) => `${API_BASE}/admin/homepage/featured-categories/${id}`,
        delete: (id) => `${API_BASE}/admin/homepage/featured-categories/${id}`,
      },
      trendingProducts: {
        all: `${API_BASE}/admin/homepage/trending-products`,
        create: `${API_BASE}/admin/homepage/trending-products`,
        byId: (id) => `${API_BASE}/admin/homepage/trending-products/${id}`,
        update: (id) => `${API_BASE}/admin/homepage/trending-products/${id}`,
        delete: (id) => `${API_BASE}/admin/homepage/trending-products/${id}`,
      },
      newArrivals: {
        all: `${API_BASE}/admin/homepage/new-arrivals`,
        create: `${API_BASE}/admin/homepage/new-arrivals`,
        byId: (id) => `${API_BASE}/admin/homepage/new-arrivals/${id}`,
        update: (id) => `${API_BASE}/admin/homepage/new-arrivals/${id}`,
        delete: (id) => `${API_BASE}/admin/homepage/new-arrivals/${id}`,
      },
    },
  },
  public: {
    homepage: `${API_BASE}/public/homepage/home`,
    products: `${API_BASE}/public/products`,
    productBySlug: (slug) => `${API_BASE}/public/products/slug/${slug}`,
    cart: `${API_BASE}/public/cart`,
    cartBySession: (sessionId) => `${API_BASE}/public/cart/${sessionId}`,
    cartItems: `${API_BASE}/public/cart/items`,
    cartItemById: (cartItemId) => `${API_BASE}/public/cart/items/${cartItemId}`,
    removeCartItem: (cartItemId) => `${API_BASE}/public/cart/items/${cartItemId}/remove`,
    orders: `${API_BASE}/public/orders`,
    orderByCode: (orderCode) => `${API_BASE}/public/orders/${orderCode}`,
    paymentSubmission: (orderCode) => `${API_BASE}/public/orders/${orderCode}/payment-submission`,
    auth: {
      signup: `${API_BASE}/public/auth/signup`,
      login: `${API_BASE}/public/auth/login`,
    },
  },
};
