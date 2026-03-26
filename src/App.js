import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import CategoryComposer from './components/composers/CategoryComposer';
import ProductComposer from './components/composers/ProductComposer';
import TagComposer from './components/composers/TagComposer';
import Sidebar from './components/layout/Sidebar';
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
  const [activeView, setActiveView] = useState(() => window.localStorage.getItem('spring-commerce-active-view') || 'products');
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
  const [categoryForm, setCategoryForm] = useState(INITIAL_CATEGORY_FORM);
  const [tagForm, setTagForm] = useState(INITIAL_TAG_FORM);
  const [toast, setToast] = useState(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
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

  const fetchJson = useCallback(async (url, fallbackMessage) => {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof data === 'string'
        ? data
        : data.message || data.error || fallbackMessage;
      throw new Error(message);
    }

    return data;
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);

    try {
      const data = await fetchJson('/api/v1/admin/products/all-products', 'Failed to load products.');
      setProducts(Array.isArray(data) ? data.map(mapBackendProduct) : []);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to load products.' });
    } finally {
      setIsLoadingProducts(false);
    }
  }, [fetchJson]);

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
      setToast({ type: 'error', message: error.message || 'Failed to load categories.' });
    } finally {
      setIsLoadingCategories(false);
    }
  }, [fetchJson]);

  const loadParentOptions = useCallback(async () => {
    setIsLoadingParentOptions(true);

    try {
      const data = await fetchJson('/api/v1/admin/categories/parent-options', 'Failed to load parent category options.');
      setParentOptions(Array.isArray(data) ? data.map(mapBackendCategory) : []);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to load parent category options.' });
    } finally {
      setIsLoadingParentOptions(false);
    }
  }, [fetchJson]);

  const loadTags = useCallback(async () => {
    setIsLoadingTags(true);

    try {
      const data = await fetchJson('/api/v1/admin/tags/all-tags', 'Failed to load tags.');
      setTags(Array.isArray(data) ? data.map(mapBackendTag) : []);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Failed to load tags.' });
    } finally {
      setIsLoadingTags(false);
    }
  }, [fetchJson]);

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
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const productSummary = useMemo(() => {
    const totalProducts = products.length;
    const lowStock = products.filter((item) => item.stockQuantity > 0 && item.stockQuantity <= 10).length;
    const outOfStock = products.filter((item) => item.stockQuantity === 0).length;

    return { totalProducts, lowStock, outOfStock };
  }, [products]);

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
      const response = await fetch('/api/v1/admin/products/create-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildProductPayload(productForm)),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.message || data.error || 'Request failed.';
        throw new Error(message);
      }

      setProducts((current) => [mapBackendProduct(data), ...current]);
      setLastResponse(data);
      setToast({ type: 'success', message: 'Product created successfully.' });
      setProductForm({
        ...INITIAL_PRODUCT_FORM,
        categoryId: productCategoryOptions[0]?.id || '',
      });
      setIsProductComposerOpen(false);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Something went wrong while creating the product.' });
    } finally {
      setIsSubmittingProduct(false);
    }
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();
    setIsSubmittingCategory(true);

    try {
      const response = await fetch('/api/v1/admin/categories/create-category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildCategoryPayload(categoryForm)),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.message || data.error || 'Request failed.';
        throw new Error(message);
      }

      setLastResponse(data);
      setToast({ type: 'success', message: 'Category created successfully.' });
      setCategoryForm(INITIAL_CATEGORY_FORM);
      setIsCategoryComposerOpen(false);
      await Promise.all([loadCategories(), loadParentOptions()]);
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Something went wrong while creating the category.' });
    } finally {
      setIsSubmittingCategory(false);
    }
  }

  async function handleTagSubmit(event) {
    event.preventDefault();
    setIsSubmittingTag(true);

    try {
      const response = await fetch('/api/v1/admin/tags/create-tag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildTagPayload(tagForm)),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.message || data.error || 'Request failed.';
        throw new Error(message);
      }

      setLastResponse(data);
      setToast({ type: 'success', message: 'Tag created successfully.' });
      setTagForm(INITIAL_TAG_FORM);
      setIsTagComposerOpen(false);
      await loadTags();
    } catch (error) {
      setToast({ type: 'error', message: error.message || 'Something went wrong while creating the tag.' });
    } finally {
      setIsSubmittingTag(false);
    }
  }

  return (
    <div className="app-shell">
      {toast ? <Toast type={toast.type} message={toast.message} /> : null}
      {isProductComposerOpen ? (
        <ProductComposer
          categories={productCategoryOptions}
          form={productForm}
          isLoadingCategories={isLoadingCategories}
          isLoadingTags={isLoadingTags}
          isSubmitting={isSubmittingProduct}
          onChange={handleProductChange}
          onClose={() => setIsProductComposerOpen(false)}
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

      <Sidebar activeView={activeView} onChangeView={setActiveView} />

      <main className="workspace">
        <Topbar activeView={activeView} />

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
            isLoadingProducts={isLoadingProducts}
            onAddProduct={() => setIsProductComposerOpen(true)}
            productSummary={productSummary}
            products={products}
            tags={tags}
          />
        ) : activeView === 'categories' ? (
          <CategoriesView
            categories={categories}
            categorySummary={categorySummary}
            isLoadingCategories={isLoadingCategories}
            onAddCategory={() => setIsCategoryComposerOpen(true)}
            parentOptions={parentOptions}
          />
        ) : (
          <TagsView
            isLoadingTags={isLoadingTags}
            onAddTag={() => setIsTagComposerOpen(true)}
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
