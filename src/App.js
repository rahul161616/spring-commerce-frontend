import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import CategoryComposer from './components/composers/CategoryComposer';
import ProductComposer from './components/composers/ProductComposer';
import TagComposer from './components/composers/TagComposer';
import Sidebar from './components/layout/Sidebar';
import EntityDetailsModal from './components/shared/EntityDetailsModal';
import ProductDetailsModal from './components/shared/ProductDetailsModal';
import Topbar from './components/layout/Topbar';
import Toast from './components/shared/Toast';
import CategoriesView from './views/CategoriesView';
import ProductsView from './views/ProductsView';
import TagsView from './views/TagsView';
import {
  INITIAL_CATEGORY_FORM,
  INITIAL_PRODUCT_FORM,
  INITIAL_TAG_FORM,
} from './constants/forms';
import {
  buildCategoryPayload,
  buildProductPayload,
  buildTagPayload,
  mapBackendCategory,
  mapBackendProduct,
  mapBackendTag,
} from './utils/adminData';

function App() {
  const PRODUCT_STATUS_FILTERS = [
    { id: 'ALL', label: 'All' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'INACTIVE', label: 'Inactive' },
    { id: 'DRAFT', label: 'Draft' },
    { id: 'ARCHIVED', label: 'Archived' },
  ];

  const [activeView, setActiveView] = useState(() => window.localStorage.getItem('spring-commerce-active-view') || 'products');
  const [activeProductStatusFilter, setActiveProductStatusFilter] = useState(
    () => window.localStorage.getItem('spring-commerce-product-status-filter') || 'ALL',
  );
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
  const [categoryForm, setCategoryForm] = useState(INITIAL_CATEGORY_FORM);
  const [tagForm, setTagForm] = useState(INITIAL_TAG_FORM);
  const [toast, setToast] = useState(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isUpdatingProductStatus, setIsUpdatingProductStatus] = useState(false);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingParentOptions, setIsLoadingParentOptions] = useState(true);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [lastResponse, setLastResponse] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [isProductComposerOpen, setIsProductComposerOpen] = useState(false);
  const [isCategoryComposerOpen, setIsCategoryComposerOpen] = useState(false);
  const [isTagComposerOpen, setIsTagComposerOpen] = useState(false);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [isLoadingProductDetails, setIsLoadingProductDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);

  const normalizeRequestError = useCallback((error, fallbackMessage) => {
    const rawMessage = error instanceof Error ? error.message : String(error || '');

    if (
      rawMessage.includes('Proxy error:') ||
      rawMessage.includes('ECONNREFUSED') ||
      rawMessage.includes('Failed to fetch')
    ) {
      return 'Backend service is unavailable. Start the Spring app on port 8088 and try again.';
    }

    return rawMessage || fallbackMessage;
  }, []);

  const fetchJson = useCallback(async (url, fallbackMessage) => {
    let response;

    try {
      response = await fetch(url);
    } catch (error) {
      throw new Error(normalizeRequestError(error, fallbackMessage));
    }

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof data === 'string'
        ? data
        : data.message || data.error || fallbackMessage;
      throw new Error(normalizeRequestError(message, fallbackMessage));
    }

    return data;
  }, [normalizeRequestError]);

  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);

    try {
      const data = await fetchJson('/api/v1/admin/products/all-products', 'Failed to load products.');
      setProducts(Array.isArray(data) ? data.map(mapBackendProduct) : []);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load products.') });
    } finally {
      setIsLoadingProducts(false);
    }
  }, [fetchJson, normalizeRequestError]);

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);

    try {
      const data = await fetchJson('/api/v1/admin/categories/all-categories', 'Failed to load categories.');
      const mappedCategories = Array.isArray(data) ? data.map(mapBackendCategory) : [];
      setCategories(mappedCategories);
      setProductForm((current) => {
        if (current.categoryId || mappedCategories.length === 0) {
          return current;
        }

        return {
          ...current,
          categoryId: String(mappedCategories[0].id),
        };
      });
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load categories.') });
    } finally {
      setIsLoadingCategories(false);
    }
  }, [fetchJson, normalizeRequestError]);

  const loadParentOptions = useCallback(async () => {
    setIsLoadingParentOptions(true);

    try {
      const data = await fetchJson('/api/v1/admin/categories/parent-options', 'Failed to load parent category options.');
      setParentOptions(Array.isArray(data) ? data.map(mapBackendCategory) : []);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load parent category options.') });
    } finally {
      setIsLoadingParentOptions(false);
    }
  }, [fetchJson, normalizeRequestError]);

  const loadTags = useCallback(async () => {
    setIsLoadingTags(true);

    try {
      const data = await fetchJson('/api/v1/admin/tags/all-tags', 'Failed to load tags.');
      setTags(Array.isArray(data) ? data.map(mapBackendTag) : []);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load tags.') });
    } finally {
      setIsLoadingTags(false);
    }
  }, [fetchJson, normalizeRequestError]);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadParentOptions();
    loadTags();
  }, [loadProducts, loadCategories, loadParentOptions, loadTags]);

  useEffect(() => {
    window.localStorage.setItem('spring-commerce-active-view', activeView);
  }, [activeView]);

  useEffect(() => {
    window.localStorage.setItem('spring-commerce-product-status-filter', activeProductStatusFilter);
  }, [activeProductStatusFilter]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 980) {
        setIsSidebarOpen(false);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const filteredProducts = useMemo(
    () => (activeProductStatusFilter === 'ALL'
      ? products
      : products.filter((item) => item.status === activeProductStatusFilter)),
    [activeProductStatusFilter, products],
  );

  const productSummary = useMemo(() => {
    const totalProducts = filteredProducts.length;
    const lowStock = filteredProducts.filter((item) => item.stockQuantity > 0 && item.stockQuantity <= 10).length;
    const outOfStock = filteredProducts.filter((item) => item.stockQuantity === 0).length;

    return { totalProducts, lowStock, outOfStock };
  }, [filteredProducts]);

  const productFilters = useMemo(
    () => PRODUCT_STATUS_FILTERS.map((filter) => ({
      ...filter,
      count: filter.id === 'ALL'
        ? products.length
        : products.filter((item) => item.status === filter.id).length,
    })),
    [products],
  );

  const categorySummary = useMemo(() => {
    const totalCategories = categories.length;
    const topLevelCategories = categories.filter((item) => item.parentId == null).length;
    const childCategories = categories.filter((item) => item.parentId != null).length;

    return { totalCategories, topLevelCategories, childCategories };
  }, [categories]);

  const tagSummary = useMemo(() => {
    const totalTags = tags.length;
    const activeTags = tags.filter((item) => item.isActive).length;
    const inactiveTags = tags.filter((item) => !item.isActive).length;

    return { totalTags, activeTags, inactiveTags };
  }, [tags]);

  const productCategoryOptions = useMemo(
    () => categories.map((item) => ({
      id: String(item.id),
      name: item.parentName ? `${item.parentName} > ${item.name}` : item.name,
    })),
    [categories],
  );

  const navItems = useMemo(() => ([
    { id: 'products', label: 'Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'tags', label: 'Tags' },
    { id: 'customers', label: 'Customers', disabled: true },
    { id: 'orders', label: 'Orders', disabled: true },
  ]), []);

  const viewMeta = activeView === 'categories'
    ? {
        eyebrow: 'Catalog Taxonomy',
        title: 'Categories',
        actionLabel: 'New Category',
        action: () => setIsCategoryComposerOpen(true),
        refresh: () => {
          loadCategories();
          loadParentOptions();
        },
      }
    : activeView === 'tags'
      ? {
          eyebrow: 'Product Labels',
          title: 'Tags',
          actionLabel: 'New Tag',
          action: () => setIsTagComposerOpen(true),
          refresh: loadTags,
        }
      : {
          eyebrow: 'Product Overview',
          title: 'Products',
          actionLabel: 'New Product',
          action: () => setIsProductComposerOpen(true),
          refresh: () => {
            loadProducts();
            loadCategories();
            loadTags();
          },
        };

  function handleProductChange(event) {
    const { name, value, type, checked } = event.target;
    setProductForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleCategoryChange(event) {
    const { name, value, type, checked } = event.target;
    setCategoryForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleTagChange(event) {
    const { name, value, type, checked } = event.target;
    setTagForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function toggleProductTag(tagId) {
    setProductForm((current) => {
      const nextIds = current.tagIds.includes(tagId)
        ? current.tagIds.filter((item) => item !== tagId)
        : [...current.tagIds, tagId];

      return {
        ...current,
        tagIds: nextIds,
      };
    });
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    setIsSubmittingProduct(true);

    try {
      let response;

      try {
        response = await fetch(editingProductId ? `/api/v1/admin/products/${editingProductId}/update-product` : '/api/v1/admin/products/create-product', {
          method: editingProductId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildProductPayload(productForm)),
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Something went wrong while saving the product.'));
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.message || data.error || 'Request failed.';
        throw new Error(normalizeRequestError(message, 'Something went wrong while saving the product.'));
      }

      const mappedProduct = mapBackendProduct(data);
      setProducts((current) => (
        editingProductId
          ? current.map((item) => (item.id === editingProductId ? mappedProduct : item))
          : [mappedProduct, ...current]
      ));
      setLastResponse(data);
      setToast({ type: 'success', message: editingProductId ? 'Product updated successfully.' : 'Product created successfully.' });
      setProductForm({
        ...INITIAL_PRODUCT_FORM,
        categoryId: productCategoryOptions[0]?.id || '',
      });
      setEditingProductId(null);
      setIsProductComposerOpen(false);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Something went wrong while saving the product.') });
    } finally {
      setIsSubmittingProduct(false);
    }
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();
    setIsSubmittingCategory(true);

    try {
      let response;

      try {
        response = await fetch('/api/v1/admin/categories/create-category', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildCategoryPayload(categoryForm)),
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Something went wrong while creating the category.'));
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.message || data.error || 'Request failed.';
        throw new Error(normalizeRequestError(message, 'Something went wrong while creating the category.'));
      }

      setLastResponse(data);
      setToast({ type: 'success', message: 'Category created successfully.' });
      setCategoryForm(INITIAL_CATEGORY_FORM);
      setIsCategoryComposerOpen(false);
      await Promise.all([loadCategories(), loadParentOptions()]);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Something went wrong while creating the category.') });
    } finally {
      setIsSubmittingCategory(false);
    }
  }

  async function handleTagSubmit(event) {
    event.preventDefault();
    setIsSubmittingTag(true);

    try {
      let response;

      try {
        response = await fetch('/api/v1/admin/tags/create-tag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildTagPayload(tagForm)),
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Something went wrong while creating the tag.'));
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.message || data.error || 'Request failed.';
        throw new Error(normalizeRequestError(message, 'Something went wrong while creating the tag.'));
      }

      setLastResponse(data);
      setToast({ type: 'success', message: 'Tag created successfully.' });
      setTagForm(INITIAL_TAG_FORM);
      setIsTagComposerOpen(false);
      await loadTags();
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Something went wrong while creating the tag.') });
    } finally {
      setIsSubmittingTag(false);
    }
  }

  async function handleProductSelect(productId) {
    const currentProduct = products.find((item) => item.id === productId) || null;
    setSelectedProduct(currentProduct);
    setIsProductDetailsOpen(true);
    setIsLoadingProductDetails(true);

    try {
      const data = await fetchJson(`/api/v1/admin/products/${productId}/product`, 'Failed to load product details.');
      setSelectedProduct(mapBackendProduct(data));
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load product details.') });
    } finally {
      setIsLoadingProductDetails(false);
    }
  }

  function handleEditProduct(product) {
    const matchingCategory = categories.find((item) => item.name === product.category);
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price ?? ''),
      stockQuantity: String(product.stockQuantity ?? 0),
      categoryId: matchingCategory ? String(matchingCategory.id) : '',
      tagIds: tags
        .filter((tag) => product.tags.includes(tag.slug) || product.tags.includes(tag.name))
        .map((tag) => tag.id),
      imageUris: product.images.map((image) => image.imageUrl).join('\n'),
      isFeatured: Boolean(product.isFeatured),
    });
    setIsProductComposerOpen(true);
  }

  async function handleDeleteProduct(product) {
    if (!window.confirm(`Delete product "${product.name}"?`)) {
      return;
    }

    try {
      let response;

      try {
        response = await fetch(`/api/v1/admin/products/${product.id}/product`, {
          method: 'DELETE',
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Failed to delete product.'));
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(normalizeRequestError(text, 'Failed to delete product.'));
      }

      setProducts((current) => current.filter((item) => item.id !== product.id));
      setToast({ type: 'success', message: 'Product deleted successfully.' });
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to delete product.') });
    }
  }

  async function handleProductStatusChange(product, status) {
    setIsUpdatingProductStatus(true);

    try {
      let response;

      try {
        response = await fetch('/api/v1/admin/products/status/update-product', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            status,
          }),
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Failed to update product status.'));
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.message || data.error || 'Request failed.';
        throw new Error(normalizeRequestError(message, 'Failed to update product status.'));
      }

      setProducts((current) => current.map((item) => (
        item.id === product.id ? { ...item, status: data.status || status } : item
      )));
      setSelectedProduct((current) => (
        current && current.id === product.id ? { ...current, status: data.status || status } : current
      ));
      setLastResponse(data);
      setToast({ type: 'success', message: data.message || 'Product status updated successfully.' });
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to update product status.') });
    } finally {
      setIsUpdatingProductStatus(false);
    }
  }

  function openEntityDetails(title, subtitle, fields) {
    setDetailModal({ title, subtitle, fields });
  }

  function handleViewCategory(category) {
    openEntityDetails(category.name, 'Category Details', [
      { label: 'Slug', value: category.slug },
      { label: 'Parent', value: category.parentName || 'Root' },
      { label: 'Description', value: category.description || 'No description' },
      { label: 'State', value: category.isActive ? 'Active' : 'Inactive' },
    ]);
  }

  function handleViewTag(tag) {
    openEntityDetails(tag.name, 'Tag Details', [
      { label: 'Slug', value: tag.slug },
      { label: 'Description', value: tag.description || 'No description' },
      { label: 'State', value: tag.isActive ? 'Active' : 'Inactive' },
    ]);
  }

  function handlePendingAction(label) {
    setToast({ type: 'error', message: `${label} is ready in the UI. Implement the backend API next.` });
  }

  return (
    <div className="app-shell">
      {toast ? <Toast type={toast.type} message={toast.message} /> : null}
      {detailModal ? (
        <EntityDetailsModal
          fields={detailModal.fields}
          onClose={() => setDetailModal(null)}
          subtitle={detailModal.subtitle}
          title={detailModal.title}
        />
      ) : null}
      {isProductDetailsOpen ? (
        <ProductDetailsModal
          isLoading={isLoadingProductDetails}
          isUpdatingStatus={isUpdatingProductStatus}
          onClose={() => setIsProductDetailsOpen(false)}
          onDelete={async (product) => {
            await handleDeleteProduct(product);
            setIsProductDetailsOpen(false);
          }}
          onEdit={(product) => {
            setIsProductDetailsOpen(false);
            handleEditProduct(product);
          }}
          onStatusChange={handleProductStatusChange}
          product={selectedProduct}
        />
      ) : null}
      {isProductComposerOpen ? (
        <ProductComposer
          categories={productCategoryOptions}
          form={productForm}
          isLoadingCategories={isLoadingCategories}
          isLoadingTags={isLoadingTags}
          isSubmitting={isSubmittingProduct}
          mode={editingProductId ? 'edit' : 'create'}
          onChange={handleProductChange}
          onClose={() => {
            setIsProductComposerOpen(false);
            setEditingProductId(null);
            setProductForm({
              ...INITIAL_PRODUCT_FORM,
              categoryId: productCategoryOptions[0]?.id || '',
            });
          }}
          onSubmit={handleProductSubmit}
          onTagToggle={toggleProductTag}
          tags={tags}
        />
      ) : null}
      {isCategoryComposerOpen ? (
        <CategoryComposer
          form={categoryForm}
          isLoadingParentOptions={isLoadingParentOptions}
          isSubmitting={isSubmittingCategory}
          onChange={handleCategoryChange}
          onClose={() => setIsCategoryComposerOpen(false)}
          onSubmit={handleCategorySubmit}
          parentOptions={parentOptions}
        />
      ) : null}
      {isTagComposerOpen ? (
        <TagComposer
          form={tagForm}
          isSubmitting={isSubmittingTag}
          onChange={handleTagChange}
          onClose={() => setIsTagComposerOpen(false)}
          onSubmit={handleTagSubmit}
        />
      ) : null}

      <Sidebar
        activeView={activeView}
        isOpen={isSidebarOpen}
        navItems={navItems}
        onChangeView={setActiveView}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="workspace">
        <Topbar
          activeView={activeView}
          onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
        />

        <section className="page-header">
          <div>
            <p className="eyebrow">{viewMeta.eyebrow}</p>
            <h2>{viewMeta.title}</h2>
          </div>
          <div className="header-actions">
            <button type="button" className="ghost-button" onClick={viewMeta.refresh}>Refresh</button>
            <button type="button" className="primary-button compact" onClick={viewMeta.action}>
              {viewMeta.actionLabel}
            </button>
          </div>
        </section>

        {activeView === 'products' ? (
          <ProductsView
            activeStatusFilter={activeProductStatusFilter}
            isLoadingProducts={isLoadingProducts}
            onAddProduct={() => setIsProductComposerOpen(true)}
            onSelectProduct={handleProductSelect}
            onStatusFilterChange={setActiveProductStatusFilter}
            productFilters={productFilters}
            productSummary={productSummary}
            products={filteredProducts}
            tags={tags}
          />
        ) : activeView === 'categories' ? (
          <CategoriesView
            categories={categories}
            categorySummary={categorySummary}
            isLoadingCategories={isLoadingCategories}
            onAddCategory={() => setIsCategoryComposerOpen(true)}
            onDeleteCategory={() => handlePendingAction('Delete category')}
            onEditCategory={() => handlePendingAction('Edit category')}
            onViewCategory={handleViewCategory}
            parentOptions={parentOptions}
          />
        ) : (
          <TagsView
            isLoadingTags={isLoadingTags}
            onAddTag={() => setIsTagComposerOpen(true)}
            onDeleteTag={() => handlePendingAction('Delete tag')}
            onEditTag={() => handlePendingAction('Edit tag')}
            onViewTag={handleViewTag}
            tagSummary={tagSummary}
            tags={tags}
          />
        )}

        <section className="response-strip">
          <div>
            <p className="eyebrow">Latest Response</p>
            <h3>Backend payload</h3>
          </div>
          <pre>{JSON.stringify(lastResponse || { note: 'No request completed in this session yet.' }, null, 2)}</pre>
        </section>
      </main>
    </div>
  );
}

export default App;
