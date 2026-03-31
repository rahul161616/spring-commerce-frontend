export const INITIAL_PRODUCT_FORM = {
  name: '',
  description: '',
  price: '55.00',
  compareAt: '',
  stockQuantity: '12',
  categoryId: '',
  tagIds: [],
  imageUris: '',
  isFeatured: true,
};

export const INITIAL_CATEGORY_FORM = {
  name: '',
  description: '',
  parentId: '',
  isActive: true,
};

export const INITIAL_TAG_FORM = {
  name: '',
  description: '',
  isActive: true,
};

export const INITIAL_HOMEPAGE_HERO_FORM = {
  eyebrow: '',
  title: '',
  supportingText: '',
  imageUrl: '',
  ctaLabel: '',
  ctaUrl: '',
  isActive: true,
  linkProductId: '',
  linkCategoryId: '',
  unlinkProduct: false,
  unlinkCategory: false,
};

export const INITIAL_HOMEPAGE_FEATURED_CATEGORY_FORM = {
  caption: '',
  imageUrl: '',
  emphasis: 'REGULAR',
  isActive: true,
  categoryId: '',
};

export const INITIAL_HOMEPAGE_TRENDING_PRODUCT_FORM = {
  productId: '',
  label: '',
  isActive: true,
};

export const INITIAL_HOMEPAGE_NEW_ARRIVAL_FORM = {
  limitCount: '3',
  categoryId: '',
  tagId: '',
  onlyActive: true,
  isActive: true,
};
