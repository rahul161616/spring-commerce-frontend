export function mapBackendHomepageHero(item) {
  return {
    id: item.id,
    eyebrow: item.eyebrow || '',
    title: item.title || '',
    supportingText: item.supportingText || '',
    imageUrl: item.imageUrl || '',
    ctaLabel: item.ctaLabel || '',
    ctaUrl: item.ctaUrl || '',
    displayOrder: Number(item.displayOrder ?? 0),
    isActive: Boolean(item.isActive),
    linkProductId: item.linkProductId != null ? String(item.linkProductId) : '',
    linkCategoryId: item.linkCategoryId != null ? String(item.linkCategoryId) : '',
  };
}

export function buildHomepageHeroPayload(form, initial = null, isEdit = false) {
  const payload = {};

  if (!isEdit || form.eyebrow !== initial?.eyebrow) payload.eyebrow = form.eyebrow.trim();
  if (!isEdit || form.title !== initial?.title) payload.title = form.title.trim();
  if (!isEdit || form.supportingText !== initial?.supportingText) payload.supportingText = form.supportingText.trim();
  if (!isEdit || form.imageUrl !== initial?.imageUrl) payload.imageUrl = form.imageUrl.trim();
  if (!isEdit || form.ctaLabel !== initial?.ctaLabel) payload.ctaLabel = form.ctaLabel.trim();
  if (!isEdit || form.ctaUrl !== initial?.ctaUrl) payload.ctaUrl = form.ctaUrl.trim();
  if (!isEdit || form.isActive !== initial?.isActive) payload.isActive = form.isActive;

  if (!isEdit || form.linkProductId !== initial?.linkProductId || form.unlinkProduct !== false) {
    if (form.unlinkProduct) {
      payload.unlinkProduct = true;
    } else if (form.linkProductId) {
      payload.linkProductId = Number(form.linkProductId);
    }
  }

  if (!isEdit || form.linkCategoryId !== initial?.linkCategoryId || form.unlinkCategory !== false) {
    if (form.unlinkCategory) {
      payload.unlinkCategory = true;
    } else if (form.linkCategoryId) {
      payload.linkCategoryId = Number(form.linkCategoryId);
    }
  }

  return payload;
}

export function mapBackendHomepageFeaturedCategory(item) {
  return {
    id: item.id,
    caption: item.caption || '',
    imageUrl: item.imageUrl || '',
    emphasis: item.emphasis || 'REGULAR',
    isActive: Boolean(item.isActive),
    displayOrder: Number(item.displayOrder ?? 0),
    categoryId: item.categoryId != null ? String(item.categoryId) : '',
    categoryName: item.categoryName || '',
  };
}

export function buildHomepageFeaturedCategoryPayload(form, initial = null, isEdit = false) {
  const payload = {};

  if (!isEdit || form.caption !== initial?.caption) payload.caption = form.caption.trim();
  if (!isEdit || form.imageUrl !== initial?.imageUrl) payload.imageUrl = form.imageUrl.trim();
  if (!isEdit || form.emphasis !== initial?.emphasis) payload.emphasis = form.emphasis;
  if (!isEdit || form.isActive !== initial?.isActive) payload.isActive = form.isActive;
  if (!isEdit || form.categoryId !== initial?.categoryId) payload.categoryId = form.categoryId ? Number(form.categoryId) : null;

  return payload;
}

export function mapBackendHomepageTrendingProduct(item) {
  return {
    id: item.id,
    productId: item.productId != null ? String(item.productId) : '',
    label: item.label || '',
    isActive: Boolean(item.isActive),
    displayOrder: Number(item.displayOrder ?? 0),
  };
}

export function buildHomepageTrendingProductPayload(form, initial = null, isEdit = false) {
  const payload = {};

  if (!isEdit || form.productId !== initial?.productId) payload.productId = form.productId ? Number(form.productId) : null;
  if (!isEdit || form.label !== initial?.label) payload.label = form.label.trim();
  if (!isEdit || form.isActive !== initial?.isActive) payload.isActive = form.isActive;

  return payload;
}

export function mapBackendHomepageNewArrivalRule(item) {
  return {
    id: item.id,
    limitCount: String(item.limitCount ?? '3'),
    categoryId: item.categoryId != null ? String(item.categoryId) : '',
    categoryName: item.categoryName || '',
    tagId: item.tagId != null ? String(item.tagId) : '',
    tagName: item.tagName || '',
    onlyActive: Boolean(item.onlyActive),
    isActive: Boolean(item.isActive),
  };
}

export function buildHomepageNewArrivalPayload(form, initial = null, isEdit = false) {
  const payload = {};

  if (!isEdit || form.limitCount !== initial?.limitCount) payload.limitCount = Number(form.limitCount);
  if (!isEdit || form.categoryId !== initial?.categoryId) payload.categoryId = form.categoryId ? Number(form.categoryId) : null;
  if (!isEdit || form.tagId !== initial?.tagId) payload.tagId = form.tagId ? Number(form.tagId) : null;
  if (!isEdit || form.onlyActive !== initial?.onlyActive) payload.onlyActive = form.onlyActive;
  if (!isEdit || form.isActive !== initial?.isActive) payload.isActive = form.isActive;

  return payload;
}
