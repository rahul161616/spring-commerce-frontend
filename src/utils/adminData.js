function normalizeImageUri(uri) {
  if (!uri) {
    return uri;
  }

  if (/^(https?:)?\/\//i.test(uri) || uri.startsWith('/')) {
    return uri;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(uri)) {
    return `https://${uri}`;
  }

  return uri;
}

export function mapBackendProduct(item) {
  const images = Array.isArray(item.images)
    ? [...item.images].sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
    : [];

  return {
    id: item.id,
    category: item.categoryName || 'Catalog',
    name: item.name || 'Untitled product',
    sku: item.slug || '--',
    description: item.description ?? '',
    price: Number(item.price ?? 0),
    stockQuantity: Number(item.stockQuantity ?? 0),
    isFeatured: Boolean(item.isFeatured),
    status: item.status || 'DRAFT',
    imageLabel: item.name || 'Product',
    images,
    primaryImageUrl: images.length
      ? images.find((image) => image.isPrimary)?.imageUrl || images[0].imageUrl
      : null,
    tags: Array.isArray(item.tags) ? item.tags : [],
  };
}

export function mapBackendCategory(item) {
  return {
    id: item.id,
    name: item.name || 'Untitled category',
    slug: item.slug || '--',
    description: item.description || 'No description provided.',
    isActive: Boolean(item.isActive),
    parentId: item.parentId ?? null,
    parentName: item.parentName || null,
  };
}

export function mapBackendTag(item) {
  return {
    id: item.id,
    name: item.name || 'Untitled tag',
    slug: item.slug || '--',
    description: item.description || 'No description provided.',
    isActive: Boolean(item.isActive),
  };
}

export function buildProductPayload(productForm) {
  const images = productForm.imageUris
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((url, index) => ({
      url: normalizeImageUri(url),
      isPrimary: index === 0,
      displayOrder: index,
    }));

  const payload = {
    name: productForm.name.trim(),
    price: Number(productForm.price),
    stockQuantity: Number(productForm.stockQuantity),
    categoryId: Number(productForm.categoryId),
    tagIds: productForm.tagIds.map((item) => Number(item)),
    images,
    isFeatured: productForm.isFeatured,
  };

  if (productForm.description !== undefined) {
    payload.description = productForm.description.trim();
  }

  return payload;
}

export function buildCategoryPayload(categoryForm) {
  return {
    name: categoryForm.name.trim(),
    description: categoryForm.description.trim(),
    parentId: categoryForm.parentId ? Number(categoryForm.parentId) : null,
    isActive: categoryForm.isActive,
  };
}

export function buildTagPayload(tagForm) {
  return {
    name: tagForm.name.trim(),
    description: tagForm.description.trim(),
    isActive: tagForm.isActive,
  };
}
