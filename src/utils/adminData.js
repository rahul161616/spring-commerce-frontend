export function mapBackendProduct(item) {
  return {
    id: item.id,
    category: item.categoryName || 'Catalog',
    name: item.name || 'Untitled product',
    sku: item.slug || '--',
    price: Number(item.price ?? 0),
    stockQuantity: Number(item.stockQuantity ?? 0),
    imageLabel: item.name || 'Product',
    images: Array.isArray(item.images) ? item.images : [],
    primaryImageUrl: Array.isArray(item.images) && item.images.length
      ? item.images.find((image) => image.isPrimary)?.imageUrl || item.images[0].imageUrl
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
      url,
      isPrimary: index === 0,
      displayOrder: index,
    }));

  return {
    name: productForm.name.trim(),
    description: productForm.description.trim(),
    price: Number(productForm.price),
    stockQuantity: Number(productForm.stockQuantity),
    categoryId: Number(productForm.categoryId),
    tagIds: productForm.tagIds.map((item) => Number(item)),
    images,
    isFeatured: productForm.isFeatured,
  };
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
