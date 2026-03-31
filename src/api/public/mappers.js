function formatMoney(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return String(value);
  }

  return `$${amount.toFixed(2)}`;
}

function mapHeroSlide(item, index) {
  return {
    id: item.id || `hero-slide-${index}`,
    eyebrow: item.eyebrow || item.badge || 'Featured',
    title: item.title || item.name || 'Editorial Drop',
    ctaLabel: item.ctaLabel || item.cta || 'Explore',
    href: item.href || '#collections',
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
    price: formatMoney(item.price) || item.priceLabel || '$0.00',
    compareAt: formatMoney(item.compareAtPrice || item.compareAt || item.originalPrice),
    image: item.image || item.imageUrl || item.primaryImageUrl || '',
    href: item.href || item.slug || '#',
  };
}

function mapCatalogProduct(item, index) {
  return {
    id: item.id || `catalog-product-${index}`,
    name: item.name || item.title || 'Untitled piece',
    categoryName: item.categoryName || 'Collection',
    shortDescription: item.shortDescription || item.description || 'Public product details will appear here.',
    description: item.description || item.shortDescription || '',
    price: formatMoney(item.price) || '$0.00',
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
