function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return String(value);
  }

  return `Rs ${amount.toFixed(2)}`;
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const amount = Number(value);
  return Number.isNaN(amount) ? null : amount;
}

function mapHeroSlide(item, index) {
  return {
    id: item.id || `hero-slide-${index}`,
    eyebrow: item.eyebrow || item.badge || 'Featured',
    title: item.title || item.name || 'Editorial Drop',
    ctaLabel: item.ctaLabel || item.cta || 'Explore',
    href: item.href || item.ctaUrl || '#collections',
    image: item.image || item.imageUrl || '',
  };
}

function mapFeaturedCategory(item, index) {
  return {
    id: item.id || `featured-category-${index}`,
    name: item.name || 'Collection',
    caption: item.caption || item.description || 'Curated selection',
    href: item.href || '#collections',
    image: item.image || item.imageUrl || '',
    emphasis: item.emphasis || 'regular',
  };
}

function mapMerchCard(item, index) {
  return {
    id: item.id || `product-card-${index}`,
    family: item.family || item.categoryName || 'Collection',
    title: item.title || item.name || 'Untitled piece',
    price: formatMoney(item.price) || item.priceLabel || 'Rs 0.00',
    compareAt: formatMoney(item.compareAtPrice || item.compareAt || item.originalPrice),
    image: item.image || item.imageUrl || item.primaryImageUrl || '',
    href: item.href || (item.slug ? `/products/${item.slug}` : '#'),
  };
}

function mapCatalogProduct(item, index) {
  return {
    id: item.id || `catalog-product-${index}`,
    name: item.name || item.title || 'Untitled piece',
    categoryName: item.categoryName || 'Collection',
    shortDescription: item.shortDescription || item.description || 'Public product details will appear here.',
    description: item.description || item.shortDescription || '',
    price: formatMoney(item.price) || 'Rs 0.00',
    compareAt: formatMoney(item.compareAtPrice || item.compareAt || item.originalPrice),
    image: item.image || item.imageUrl || item.primaryImageUrl || '',
    slug: item.slug || '',
    stockQuantity: item.stockQuantity,
    tagNames: item.tagNames || '',
    tagIds: item.tagIds || '',
    href: item.href || (item.slug ? `/products/${item.slug}` : '#'),
  };
}

export function mapStorefrontPayload(payload = {}) {
  return {
    brandName: payload.brandName || 'SHADES',
    quote: payload.quote || 'Your daily dose of style and substance.',
    quoteCaption: payload.quoteCaption || 'Established SHADES',
    heroSlides: Array.isArray(payload.heroSlides) ? payload.heroSlides.map(mapHeroSlide) : [],
    featuredCategories: Array.isArray(payload.featuredCategories)
      ? payload.featuredCategories.map(mapFeaturedCategory)
      : [],
    trendingProducts: Array.isArray(payload.trendingProducts)
      ? payload.trendingProducts.map(mapMerchCard)
      : [],
    newArrivals: Array.isArray(payload.newArrivals)
      ? payload.newArrivals.map(mapMerchCard)
      : [],
  };
}

export function mapProductsPayload(payload = []) {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map(mapCatalogProduct);
}

export function mapProductPayload(payload = {}) {
  return mapCatalogProduct(payload, 0);
}

export function mapCartPayload(payload = {}) {
  const items = Array.isArray(payload.items)
    ? payload.items.map((item) => ({
        id: item.id || null,
        productId: item.productId || null,
        productName: item.productName || 'Untitled piece',
        productSlug: item.productSlug || '',
        quantity: Number(item.quantity || 0),
        currencyCode: item.currencyCode || payload.currencyCode || 'NRS',
        unitPrice: toNumber(item.unitPrice),
        compareAt: toNumber(item.compareAt),
        lineSubtotal: toNumber(item.lineSubtotal),
        lineDiscount: toNumber(item.lineDiscount),
        lineTotal: toNumber(item.lineTotal),
        priceLabel: formatMoney(item.unitPrice) || 'Rs 0.00',
        lineTotalLabel: formatMoney(item.lineTotal) || 'Rs 0.00',
      }))
    : [];

  return {
    id: payload.id || null,
    sessionId: payload.sessionId || '',
    currencyCode: payload.currencyCode || 'NRS',
    status: payload.status || 'ACTIVE',
    itemCount: Number(payload.itemCount || 0),
    subtotalAmount: toNumber(payload.subtotalAmount),
    discountAmount: toNumber(payload.discountAmount),
    taxAmount: toNumber(payload.taxAmount),
    shippingAmount: toNumber(payload.shippingAmount),
    grandTotalAmount: toNumber(payload.grandTotalAmount),
    subtotalLabel: formatMoney(payload.subtotalAmount) || 'Rs 0.00',
    grandTotalLabel: formatMoney(payload.grandTotalAmount) || 'Rs 0.00',
    items,
  };
}

export function mapOrderPayload(payload = {}) {
  return {
    id: payload.id || null,
    orderCode: payload.orderCode || '',
    sessionId: payload.sessionId || '',
    customerName: payload.customerName || '',
    customerEmail: payload.customerEmail || '',
    customerPhone: payload.customerPhone || '',
    currencyCode: payload.currencyCode || 'NRS',
    subtotalAmount: toNumber(payload.subtotalAmount),
    discountAmount: toNumber(payload.discountAmount),
    taxAmount: toNumber(payload.taxAmount),
    shippingAmount: toNumber(payload.shippingAmount),
    grandTotalAmount: toNumber(payload.grandTotalAmount),
    grandTotalLabel: formatMoney(payload.grandTotalAmount) || 'Rs 0.00',
    status: payload.status || 'PENDING_PAYMENT',
    itemCount: Number(payload.itemCount || 0),
    notes: payload.notes || '',
  };
}

export function mapPaymentSubmissionPayload(payload = {}) {
  return {
    id: payload.id || null,
    orderCode: payload.orderCode || '',
    provider: payload.provider || 'ESEWA',
    expectedAmount: toNumber(payload.expectedAmount),
    paidAmount: toNumber(payload.paidAmount),
    payerMobile: payload.payerMobile || '',
    transactionReference: payload.transactionReference || '',
    receiptImageUrl: payload.receiptImageUrl || '',
    remarks: payload.remarks || '',
    verificationStatus: payload.verificationStatus || 'PENDING',
    submittedAt: payload.submittedAt || null,
    expectedAmountLabel: formatMoney(payload.expectedAmount) || 'Rs 0.00',
    paidAmountLabel: formatMoney(payload.paidAmount) || 'Rs 0.00',
  };
}
