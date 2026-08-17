import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import CategoryComposer from './components/composers/CategoryComposer';
import HomepageFeaturedCategoryComposer from './components/composers/HomepageFeaturedCategoryComposer';
import HomepageHeroComposer from './components/composers/HomepageHeroComposer';
import HomepageNewArrivalComposer from './components/composers/HomepageNewArrivalComposer';
import HomepageTrendingProductComposer from './components/composers/HomepageTrendingProductComposer';
import ProductComposer from './components/composers/ProductComposer';
import TagComposer from './components/composers/TagComposer';
import Sidebar from './components/layout/Sidebar';
import EntityDetailsModal from './components/shared/EntityDetailsModal';
import ProductDetailsModal from './components/shared/ProductDetailsModal';
import Topbar from './components/layout/Topbar';
import Toast from './components/shared/Toast';
import CategoriesView from './views/CategoriesView';
import HomepageView from './views/HomepageView';
import OrdersView from './views/OrdersView';
import ProductsView from './views/ProductsView';
import TagsView from './views/TagsView';
import {
  INITIAL_CATEGORY_FORM,
  INITIAL_HOMEPAGE_FEATURED_CATEGORY_FORM,
  INITIAL_HOMEPAGE_HERO_FORM,
  INITIAL_HOMEPAGE_NEW_ARRIVAL_FORM,
  INITIAL_HOMEPAGE_TRENDING_PRODUCT_FORM,
  INITIAL_PRODUCT_FORM,
  INITIAL_TAG_FORM,
} from './constants/forms';
import {
  buildCategoryPayload,
  buildHomepageFeaturedCategoryPayload,
  buildHomepageHeroPayload,
  buildHomepageNewArrivalPayload,
  buildHomepageTrendingProductPayload,
  buildProductPayload,
  buildTagPayload,
  mapBackendCategory,
  mapBackendHomepageFeaturedCategory,
  mapBackendHomepageHero,
  mapBackendHomepageNewArrivalRule,
  mapBackendHomepageTrendingProduct,
  mapBackendOrderAdmin,
  mapBackendProduct,
  mapBackendTag,
} from './api/admin';
import { FRONTEND_API } from './api/apiConstants';

const AUTH_STORAGE_KEYS = ['admin_auth_session', 'storefront_auth_session'];
let adminRefreshPromise = null;

function parseJwtPayload(token) {
  if (!token) {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(window.atob(padded));
  } catch (error) {
    return null;
  }
}

function AdminAccessGate({ isAuthenticated, onGoLogin, onGoStorefront }) {
  return (
    <div className="admin-access-gate">
      <div className="admin-access-panel">
        <p className="eyebrow">Admin Access</p>
        <h2>{isAuthenticated ? 'You cannot access this page.' : 'Login is required.'}</h2>
        <p>
          {isAuthenticated
            ? 'Your current account does not have admin privileges. Sign in with an admin account to continue.'
            : 'Sign in with an admin account to open the management panel.'}
        </p>
        <div className="admin-access-actions">
          <button type="button" className="primary-button" onClick={onGoLogin}>
            Go To Login
          </button>
          <button type="button" className="ghost-button" onClick={onGoStorefront}>
            Back To Storefront
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [featuredCategoryForm, setFeaturedCategoryForm] = useState(INITIAL_HOMEPAGE_FEATURED_CATEGORY_FORM);
  const [heroForm, setHeroForm] = useState(INITIAL_HOMEPAGE_HERO_FORM);
  const [newArrivalRuleForm, setNewArrivalRuleForm] = useState(INITIAL_HOMEPAGE_NEW_ARRIVAL_FORM);
  const [trendingProductForm, setTrendingProductForm] = useState(INITIAL_HOMEPAGE_TRENDING_PRODUCT_FORM);
  const [toast, setToast] = useState(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isUpdatingProductStatus, setIsUpdatingProductStatus] = useState(false);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);
  const [isSubmittingFeaturedCategory, setIsSubmittingFeaturedCategory] = useState(false);
  const [isSubmittingHero, setIsSubmittingHero] = useState(false);
  const [isSubmittingNewArrivalRule, setIsSubmittingNewArrivalRule] = useState(false);
  const [isSubmittingTrendingProduct, setIsSubmittingTrendingProduct] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingParentOptions, setIsLoadingParentOptions] = useState(true);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [isLoadingFeaturedCategories, setIsLoadingFeaturedCategories] = useState(true);
  const [isLoadingHeroes, setIsLoadingHeroes] = useState(true);
  const [isLoadingNewArrivalRules, setIsLoadingNewArrivalRules] = useState(true);
  const [isLoadingTrendingProducts, setIsLoadingTrendingProducts] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [lastResponse, setLastResponse] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [heroes, setHeroes] = useState([]);
  const [homepageNewArrivalRules, setHomepageNewArrivalRules] = useState([]);
  const [homepageTrendingProducts, setHomepageTrendingProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [isProductComposerOpen, setIsProductComposerOpen] = useState(false);
  const [isCategoryComposerOpen, setIsCategoryComposerOpen] = useState(false);
  const [isTagComposerOpen, setIsTagComposerOpen] = useState(false);
  const [isFeaturedCategoryComposerOpen, setIsFeaturedCategoryComposerOpen] = useState(false);
  const [isHeroComposerOpen, setIsHeroComposerOpen] = useState(false);
  const [isNewArrivalComposerOpen, setIsNewArrivalComposerOpen] = useState(false);
  const [isTrendingProductComposerOpen, setIsTrendingProductComposerOpen] = useState(false);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [isLoadingProductDetails, setIsLoadingProductDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryInitial, setEditingCategoryInitial] = useState(null);
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingTagInitial, setEditingTagInitial] = useState(null);
  const [editingFeaturedCategoryId, setEditingFeaturedCategoryId] = useState(null);
  const [editingFeaturedCategoryInitial, setEditingFeaturedCategoryInitial] = useState(null);
  const [editingHeroId, setEditingHeroId] = useState(null);
  const [editingHeroInitial, setEditingHeroInitial] = useState(null);
  const [editingNewArrivalRuleId, setEditingNewArrivalRuleId] = useState(null);
  const [editingNewArrivalRuleInitial, setEditingNewArrivalRuleInitial] = useState(null);
  const [editingTrendingProductId, setEditingTrendingProductId] = useState(null);
  const [editingTrendingProductInitial, setEditingTrendingProductInitial] = useState(null);

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

  const getAuthSession = useCallback(() => {
    for (const storageKey of AUTH_STORAGE_KEYS) {
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
          continue;
        }

        const parsed = JSON.parse(raw);
        const token = parsed?.accessToken || parsed?.token || '';
        if (token) {
          return {
            storageKey,
            session: parsed,
            token,
            refreshToken: parsed?.refreshToken || '',
            payload: parseJwtPayload(token),
          };
        }
      } catch (error) {
        // Ignore malformed storage and continue checking known keys.
      }
    }

    return null;
  }, []);

  const refreshAuthSession = useCallback(async () => {
    if (adminRefreshPromise) {
      return adminRefreshPromise;
    }

    const authSession = getAuthSession();
    if (!authSession?.refreshToken) {
      throw new Error('No refresh token is available.');
    }

    adminRefreshPromise = (async () => {
      const response = await fetch(FRONTEND_API.public.auth.refresh, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: authSession.refreshToken,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : null;

      if (!response.ok || !data?.accessToken) {
        window.localStorage.removeItem(authSession.storageKey);
        throw new Error(data?.message || 'Session refresh failed.');
      }

      const nextSession = {
        ...(authSession.session || {}),
        token: data.accessToken,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || authSession.refreshToken,
      };

      window.localStorage.setItem(authSession.storageKey, JSON.stringify(nextSession));
      return data.accessToken;
    })();

    try {
      return await adminRefreshPromise;
    } finally {
      adminRefreshPromise = null;
    }
  }, [getAuthSession]);

  const getAccessToken = useCallback(() => getAuthSession()?.token || '', [getAuthSession]);

  const hasAdminAccess = useMemo(() => {
    const session = getAuthSession();
    const roles = Array.isArray(session?.payload?.roles) ? session.payload.roles : [];
    return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN');
  }, [getAuthSession]);
  const isAuthenticated = Boolean(getAccessToken());

  const authFetch = useCallback(async (url, options = {}, hasRetried = false) => {
    const token = getAccessToken();
    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if ((response.status === 401 || response.status === 403) && !hasRetried) {
      try {
        await refreshAuthSession();
        return authFetch(url, options, true);
      } catch (error) {
        return response;
      }
    }

    return response;
  }, [getAccessToken, refreshAuthSession]);

  const fetchJson = useCallback(async (url, fallbackMessage) => {
    let response;

    try {
      response = await authFetch(url);
    } catch (error) {
      throw new Error(normalizeRequestError(error, fallbackMessage));
    }

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Admin session is unauthorized. Log in again with an admin account.');
      }

      const message = typeof data === 'string'
        ? data
        : data.message || data.error || fallbackMessage;
      throw new Error(normalizeRequestError(message, fallbackMessage));
    }

    return data;
  }, [authFetch, normalizeRequestError]);

  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);

    try {
      const data = await fetchJson(FRONTEND_API.admin.products.all, 'Failed to load products.');
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
      const data = await fetchJson(FRONTEND_API.admin.categories.all, 'Failed to load categories.');
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
      const data = await fetchJson(FRONTEND_API.admin.categories.parentOptions, 'Failed to load parent category options.');
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
      const data = await fetchJson(FRONTEND_API.admin.tags.all, 'Failed to load tags.');
      setTags(Array.isArray(data) ? data.map(mapBackendTag) : []);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load tags.') });
    } finally {
      setIsLoadingTags(false);
    }
  }, [fetchJson, normalizeRequestError]);

  const loadHeroes = useCallback(async () => {
    setIsLoadingHeroes(true);

    try {
      const data = await fetchJson(FRONTEND_API.admin.homepage.hero.all, 'Failed to load homepage heroes.');
      setHeroes(Array.isArray(data) ? data.map(mapBackendHomepageHero) : []);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load homepage heroes.') });
    } finally {
      setIsLoadingHeroes(false);
    }
  }, [fetchJson, normalizeRequestError]);

  const loadFeaturedCategories = useCallback(async () => {
    setIsLoadingFeaturedCategories(true);

    try {
      const data = await fetchJson(FRONTEND_API.admin.homepage.featuredCategories.all, 'Failed to load featured categories.');
      setFeaturedCategories(Array.isArray(data) ? data.map(mapBackendHomepageFeaturedCategory) : []);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load featured categories.') });
    } finally {
      setIsLoadingFeaturedCategories(false);
    }
  }, [fetchJson, normalizeRequestError]);

  const loadNewArrivalRules = useCallback(async () => {
    setIsLoadingNewArrivalRules(true);

    try {
      const data = await fetchJson(FRONTEND_API.admin.homepage.newArrivals.all, 'Failed to load new arrivals rules.');
      setHomepageNewArrivalRules(Array.isArray(data) ? data.map(mapBackendHomepageNewArrivalRule) : []);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load new arrivals rules.') });
    } finally {
      setIsLoadingNewArrivalRules(false);
    }
  }, [fetchJson, normalizeRequestError]);

  const loadTrendingProducts = useCallback(async () => {
    setIsLoadingTrendingProducts(true);

    try {
      const data = await fetchJson(FRONTEND_API.admin.homepage.trendingProducts.all, 'Failed to load trending products.');
      setHomepageTrendingProducts(Array.isArray(data) ? data.map(mapBackendHomepageTrendingProduct) : []);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load trending products.') });
    } finally {
      setIsLoadingTrendingProducts(false);
    }
  }, [fetchJson, normalizeRequestError]);

  const loadOrders = useCallback(async () => {
    setIsLoadingOrders(true);

    try {
      const data = await fetchJson(FRONTEND_API.admin.orders.all, 'Failed to load orders.');
      setOrders(Array.isArray(data) ? data.map(mapBackendOrderAdmin) : []);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load orders.') });
    } finally {
      setIsLoadingOrders(false);
    }
  }, [fetchJson, normalizeRequestError]);

  useEffect(() => {
    if (!hasAdminAccess) {
      return;
    }

    loadProducts();
    loadCategories();
    loadParentOptions();
    loadTags();
    loadFeaturedCategories();
    loadHeroes();
    loadNewArrivalRules();
    loadTrendingProducts();
    loadOrders();
  }, [hasAdminAccess, loadProducts, loadCategories, loadParentOptions, loadTags, loadFeaturedCategories, loadHeroes, loadNewArrivalRules, loadTrendingProducts, loadOrders]);

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

  const orderSummary = useMemo(() => {
    const totalOrders = orders.length;
    const pendingPayment = orders.filter((item) => item.status === 'PENDING_PAYMENT').length;
    const paymentSubmitted = orders.filter((item) => item.status === 'PAYMENT_SUBMITTED').length;
    const paymentVerified = orders.filter((item) => item.status === 'PAYMENT_VERIFIED').length;

    return { totalOrders, pendingPayment, paymentSubmitted, paymentVerified };
  }, [orders]);

  const productCategoryOptions = useMemo(
    () => categories.map((item) => ({
      id: String(item.id),
      name: item.parentName ? `${item.parentName} > ${item.name}` : item.name,
    })),
    [categories],
  );

  const navItems = useMemo(() => ([
    { id: 'homepage', label: 'Homepage' },
    { id: 'products', label: 'Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'tags', label: 'Tags' },
    { id: 'customers', label: 'Customers', disabled: true },
    { id: 'orders', label: 'Orders' },
  ]), []);

  const viewMeta = activeView === 'homepage'
    ? {
        eyebrow: 'Public Experience',
        title: 'Homepage Studio',
        actionLabel: 'New Hero',
        action: () => setIsHeroComposerOpen(true),
        refresh: () => {
          loadProducts();
          loadCategories();
          loadFeaturedCategories();
          loadHeroes();
          loadNewArrivalRules();
          loadTrendingProducts();
        },
      }
    : activeView === 'categories'
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
      : activeView === 'orders'
        ? {
            eyebrow: 'Checkout Operations',
            title: 'Orders',
            actionLabel: 'Refresh Orders',
            action: loadOrders,
            refresh: loadOrders,
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

  function handleHeroChange(event) {
    const { name, value, type, checked } = event.target;
    setHeroForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleFeaturedCategoryChange(event) {
    const { name, value, type, checked } = event.target;
    setFeaturedCategoryForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleNewArrivalRuleChange(event) {
    const { name, value, type, checked } = event.target;
    setNewArrivalRuleForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleTrendingProductChange(event) {
    const { name, value, type, checked } = event.target;
    setTrendingProductForm((current) => ({
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
        response = await authFetch(editingProductId ? FRONTEND_API.admin.products.update(editingProductId) : FRONTEND_API.admin.products.create, {
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
        const payload = buildCategoryPayload(categoryForm);
        if (editingCategoryId && editingCategoryInitial && payload.isActive === editingCategoryInitial.isActive) {
          delete payload.isActive;
        }

        response = await authFetch(editingCategoryId ? FRONTEND_API.admin.categories.update(editingCategoryId) : FRONTEND_API.admin.categories.create, {
          method: editingCategoryId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
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
      setToast({ type: 'success', message: editingCategoryId ? 'Category updated successfully.' : 'Category created successfully.' });
      setCategoryForm(INITIAL_CATEGORY_FORM);
      setEditingCategoryId(null);
      setEditingCategoryInitial(null);
      setIsCategoryComposerOpen(false);
      await Promise.all([loadCategories(), loadParentOptions()]);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, editingCategoryId ? 'Something went wrong while updating the category.' : 'Something went wrong while creating the category.') });
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
        const payload = buildTagPayload(tagForm);
        if (editingTagId && editingTagInitial && payload.isActive === editingTagInitial.isActive) {
          delete payload.isActive;
        }

        response = await authFetch(editingTagId ? FRONTEND_API.admin.tags.update(editingTagId) : FRONTEND_API.admin.tags.create, {
          method: editingTagId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
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
      setToast({ type: 'success', message: editingTagId ? 'Tag updated successfully.' : 'Tag created successfully.' });
      setTagForm(INITIAL_TAG_FORM);
      setEditingTagId(null);
      setEditingTagInitial(null);
      setIsTagComposerOpen(false);
      await loadTags();
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, editingTagId ? 'Something went wrong while updating the tag.' : 'Something went wrong while creating the tag.') });
    } finally {
      setIsSubmittingTag(false);
    }
  }

  async function handleHeroSubmit(event) {
    event.preventDefault();
    setIsSubmittingHero(true);

    try {
      const payload = buildHomepageHeroPayload(heroForm, editingHeroInitial, Boolean(editingHeroId));
      let response;

      try {
        response = await authFetch(editingHeroId ? FRONTEND_API.admin.homepage.hero.update(editingHeroId) : FRONTEND_API.admin.homepage.hero.create, {
          method: editingHeroId ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Something went wrong while saving the hero.'));
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.message || data.error || 'Request failed.';
        throw new Error(normalizeRequestError(message, 'Something went wrong while saving the hero.'));
      }

      setLastResponse(data);
      setToast({ type: 'success', message: editingHeroId ? 'Hero updated successfully.' : 'Hero created successfully.' });
      setHeroForm(INITIAL_HOMEPAGE_HERO_FORM);
      setEditingHeroId(null);
      setEditingHeroInitial(null);
      setIsHeroComposerOpen(false);
      await loadHeroes();
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Something went wrong while saving the hero.') });
    } finally {
      setIsSubmittingHero(false);
    }
  }

  async function handleFeaturedCategorySubmit(event) {
    event.preventDefault();
    setIsSubmittingFeaturedCategory(true);

    try {
      const payload = buildHomepageFeaturedCategoryPayload(
        featuredCategoryForm,
        editingFeaturedCategoryInitial,
        Boolean(editingFeaturedCategoryId),
      );
      let response;

      try {
        response = await authFetch(
          editingFeaturedCategoryId
            ? FRONTEND_API.admin.homepage.featuredCategories.update(editingFeaturedCategoryId)
            : FRONTEND_API.admin.homepage.featuredCategories.create,
          {
            method: editingFeaturedCategoryId ? 'PATCH' : 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Something went wrong while saving the featured category.'));
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.message || data.error || 'Request failed.';
        throw new Error(normalizeRequestError(message, 'Something went wrong while saving the featured category.'));
      }

      setLastResponse(data);
      setToast({
        type: 'success',
        message: editingFeaturedCategoryId ? 'Featured category updated successfully.' : 'Featured category created successfully.',
      });
      setFeaturedCategoryForm(INITIAL_HOMEPAGE_FEATURED_CATEGORY_FORM);
      setEditingFeaturedCategoryId(null);
      setEditingFeaturedCategoryInitial(null);
      setIsFeaturedCategoryComposerOpen(false);
      await loadFeaturedCategories();
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Something went wrong while saving the featured category.') });
    } finally {
      setIsSubmittingFeaturedCategory(false);
    }
  }

  async function handleTrendingProductSubmit(event) {
    event.preventDefault();
    setIsSubmittingTrendingProduct(true);

    try {
      const payload = buildHomepageTrendingProductPayload(
        trendingProductForm,
        editingTrendingProductInitial,
        Boolean(editingTrendingProductId),
      );
      let response;

      try {
        response = await authFetch(
          editingTrendingProductId
            ? FRONTEND_API.admin.homepage.trendingProducts.update(editingTrendingProductId)
            : FRONTEND_API.admin.homepage.trendingProducts.create,
          {
            method: editingTrendingProductId ? 'PATCH' : 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Something went wrong while saving the trending product.'));
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.message || data.error || 'Request failed.';
        throw new Error(normalizeRequestError(message, 'Something went wrong while saving the trending product.'));
      }

      setLastResponse(data);
      setToast({
        type: 'success',
        message: editingTrendingProductId ? 'Trending product updated successfully.' : 'Trending product created successfully.',
      });
      setTrendingProductForm(INITIAL_HOMEPAGE_TRENDING_PRODUCT_FORM);
      setEditingTrendingProductId(null);
      setEditingTrendingProductInitial(null);
      setIsTrendingProductComposerOpen(false);
      await loadTrendingProducts();
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Something went wrong while saving the trending product.') });
    } finally {
      setIsSubmittingTrendingProduct(false);
    }
  }

  async function handleNewArrivalRuleSubmit(event) {
    event.preventDefault();
    setIsSubmittingNewArrivalRule(true);

    try {
      const payload = buildHomepageNewArrivalPayload(
        newArrivalRuleForm,
        editingNewArrivalRuleInitial,
        Boolean(editingNewArrivalRuleId),
      );
      let response;

      try {
        response = await authFetch(
          editingNewArrivalRuleId
            ? FRONTEND_API.admin.homepage.newArrivals.update(editingNewArrivalRuleId)
            : FRONTEND_API.admin.homepage.newArrivals.create,
          {
            method: editingNewArrivalRuleId ? 'PATCH' : 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Something went wrong while saving the arrivals rule.'));
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.message || data.error || 'Request failed.';
        throw new Error(normalizeRequestError(message, 'Something went wrong while saving the arrivals rule.'));
      }

      setLastResponse(data);
      setToast({
        type: 'success',
        message: editingNewArrivalRuleId ? 'New arrivals rule updated successfully.' : 'New arrivals rule created successfully.',
      });
      setNewArrivalRuleForm(INITIAL_HOMEPAGE_NEW_ARRIVAL_FORM);
      setEditingNewArrivalRuleId(null);
      setEditingNewArrivalRuleInitial(null);
      setIsNewArrivalComposerOpen(false);
      await loadNewArrivalRules();
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Something went wrong while saving the arrivals rule.') });
    } finally {
      setIsSubmittingNewArrivalRule(false);
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
      compareAt: product.compareAt > 0 ? String(product.compareAt) : '',
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
        response = await authFetch(`/api/v1/admin/products/${product.id}/product`, {
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
        response = await authFetch('/api/v1/admin/products/status/update-product', {
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

  function openEntityDetails(title, subtitle, fields, actions = []) {
    setDetailModal({ title, subtitle, fields, actions });
  }

  function handleViewHero(hero) {
    openEntityDetails(hero.title || 'Hero', 'Homepage Hero', [
      { label: 'Eyebrow', value: hero.eyebrow || 'Not set' },
      { label: 'CTA Label', value: hero.ctaLabel || 'Not set' },
      { label: 'CTA Url', value: hero.ctaUrl || 'Not set' },
      { label: 'Product Link', value: hero.linkProductId || 'Not linked' },
      { label: 'Category Link', value: hero.linkCategoryId || 'Not linked' },
      { label: 'State', value: hero.isActive ? 'Active' : 'Inactive' },
      { label: 'Order', value: hero.displayOrder ?? 'Not set' },
    ], [
      {
        label: 'Edit',
        onClick: () => {
          setDetailModal(null);
          handleEditHero(hero);
        },
      },
      {
        label: 'Delete',
        tone: 'danger',
        onClick: () => {
          setDetailModal(null);
          handleDeleteHero(hero);
        },
      },
    ]);
  }

  function handleViewHomepageFeaturedCategory(featuredCategory) {
    openEntityDetails(featuredCategory.categoryName || 'Featured category', 'Homepage Featured Category', [
      { label: 'Caption', value: featuredCategory.caption || 'Not set' },
      { label: 'Image Url', value: featuredCategory.imageUrl || 'Not set' },
      { label: 'Emphasis', value: featuredCategory.emphasis || 'REGULAR' },
      { label: 'Category', value: featuredCategory.categoryName || 'Not linked' },
      { label: 'State', value: featuredCategory.isActive ? 'Active' : 'Inactive' },
      { label: 'Order', value: featuredCategory.displayOrder ?? 'Not set' },
    ], [
      {
        label: 'Edit',
        onClick: () => {
          setDetailModal(null);
          handleEditFeaturedCategory(featuredCategory);
        },
      },
      {
        label: 'Delete',
        tone: 'danger',
        onClick: () => {
          setDetailModal(null);
          handleDeleteFeaturedCategory(featuredCategory);
        },
      },
    ]);
  }

  function handleViewHomepageTrendingProduct(trendingProduct) {
    const linkedProduct = products.find((item) => String(item.id) === String(trendingProduct.productId));

    openEntityDetails(linkedProduct?.name || 'Trending product', 'Homepage Trending Product', [
      { label: 'Label', value: trendingProduct.label || 'Not set' },
      { label: 'Linked Product', value: linkedProduct?.name || trendingProduct.productId || 'Missing' },
      { label: 'Category', value: linkedProduct?.category || 'Not set' },
        { label: 'Price', value: linkedProduct ? `Rs ${Number(linkedProduct.price || 0).toFixed(2)}` : 'Not set' },
        { label: 'Compare-at', value: linkedProduct?.compareAt > 0 ? `Rs ${Number(linkedProduct.compareAt).toFixed(2)}` : 'Not set' },
        { label: 'State', value: trendingProduct.isActive ? 'Active' : 'Inactive' },
        { label: 'Order', value: trendingProduct.displayOrder ?? 'Not set' },
      ], [
        {
          label: 'Edit',
          onClick: () => {
            setDetailModal(null);
            handleEditTrendingProduct(trendingProduct);
          },
        },
        {
          label: 'Delete',
          tone: 'danger',
          onClick: () => {
            setDetailModal(null);
            handleDeleteTrendingProduct(trendingProduct);
          },
        },
      ]);
  }

  function handleViewHomepageNewArrivalRule(rule) {
    openEntityDetails(`Limit ${rule.limitCount || 0}`, 'Homepage New Arrivals Rule', [
      { label: 'Category', value: rule.categoryName || 'All categories' },
      { label: 'Tag', value: rule.tagName || 'All tags' },
      { label: 'Only Active', value: rule.onlyActive ? 'Yes' : 'No' },
      { label: 'State', value: rule.isActive ? 'Active' : 'Inactive' },
    ], [
      {
        label: 'Edit',
        onClick: () => {
          setDetailModal(null);
          handleEditNewArrivalRule(rule);
        },
      },
      {
        label: 'Delete',
        tone: 'danger',
        onClick: () => {
          setDetailModal(null);
          handleDeleteNewArrivalRule(rule);
        },
      },
    ]);
  }

  async function handleViewCategory(category) {
    try {
      const data = await fetchJson(`/api/v1/admin/categories/${category.id}/category`, 'Failed to load category details.');
      const resolvedCategory = mapBackendCategory(data);

      openEntityDetails(resolvedCategory.name, 'Category Details', [
        { label: 'Slug', value: resolvedCategory.slug },
        { label: 'Parent', value: resolvedCategory.parentName || 'Root' },
        { label: 'Description', value: resolvedCategory.description || 'No description' },
        { label: 'State', value: resolvedCategory.isActive ? 'Active' : 'Inactive' },
      ]);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load category details.') });
    }
  }

  async function handleEditCategory(category) {
    try {
      const data = await fetchJson(`/api/v1/admin/categories/${category.id}/category`, 'Failed to load category details.');
      const resolvedCategory = mapBackendCategory(data);

      setEditingCategoryId(resolvedCategory.id);
      setEditingCategoryInitial({
        isActive: Boolean(resolvedCategory.isActive),
      });
      setCategoryForm({
        name: resolvedCategory.name || '',
        description: resolvedCategory.description || '',
        parentId: resolvedCategory.parentId ? String(resolvedCategory.parentId) : '',
        isActive: Boolean(resolvedCategory.isActive),
      });
      setIsCategoryComposerOpen(true);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load category details.') });
    }
  }

  async function handleDeleteCategory(category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    try {
      let response;

      try {
        response = await authFetch(`/api/v1/admin/categories/${category.id}/category`, {
          method: 'DELETE',
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Failed to delete category.'));
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(normalizeRequestError(text, 'Failed to delete category.'));
      }

      setCategories((current) => current.filter((item) => item.id !== category.id));
      setParentOptions((current) => current.filter((item) => item.id !== category.id));
      setToast({ type: 'success', message: 'Category deleted successfully.' });
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to delete category.') });
    }
  }

  async function handleViewTag(tag) {
    try {
      const data = await fetchJson(`/api/v1/admin/tags/${tag.id}/tag`, 'Failed to load tag details.');
      const resolvedTag = mapBackendTag(data);

      openEntityDetails(resolvedTag.name, 'Tag Details', [
        { label: 'Slug', value: resolvedTag.slug },
        { label: 'Description', value: resolvedTag.description || 'No description' },
        { label: 'State', value: resolvedTag.isActive ? 'Active' : 'Inactive' },
      ]);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load tag details.') });
    }
  }

  async function handleOrderAdminAction(order, endpoint, payload, successMessage) {
    try {
      let response;

      try {
        response = await authFetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, successMessage));
      }

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message = typeof data === 'string' ? data : data.message || successMessage;
        throw new Error(normalizeRequestError(message, successMessage));
      }

      setLastResponse(data);
      setDetailModal(null);
      await loadOrders();
      setToast({ type: 'success', message: typeof data === 'string' ? data : data.message || successMessage });
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, successMessage) });
    }
  }

  async function handleViewOrder(order) {
    try {
      const data = await fetchJson(FRONTEND_API.admin.orders.byId(order.id), 'Failed to load order details.');
      const resolvedOrder = mapBackendOrderAdmin(data);

      openEntityDetails(resolvedOrder.orderCode, 'Order Details', [
        { label: 'Order Id', value: resolvedOrder.id },
        { label: 'Customer', value: resolvedOrder.customerName || resolvedOrder.customerPhone || resolvedOrder.customerEmail || resolvedOrder.sessionId || 'Not provided' },
        { label: 'Email', value: resolvedOrder.customerEmail || 'Not provided' },
        { label: 'Phone', value: resolvedOrder.customerPhone || 'Not provided' },
        { label: 'Session', value: resolvedOrder.sessionId || 'Not provided' },
        { label: 'Items', value: resolvedOrder.itemCount },
        { label: 'Total', value: `${resolvedOrder.currencyCode} ${resolvedOrder.grandTotalAmount.toFixed(2)}` },
        { label: 'Order Status', value: resolvedOrder.status },
        { label: 'Payment Provider', value: resolvedOrder.paymentProvider || 'Not submitted' },
        { label: 'Payment Status', value: resolvedOrder.paymentVerificationStatus || 'Not submitted' },
        { label: 'Transaction Ref', value: resolvedOrder.transactionReference || 'Not submitted' },
        { label: 'Payer Mobile', value: resolvedOrder.payerMobile || 'Not submitted' },
      ], [
        {
          label: 'Verify',
          onClick: () => handleOrderAdminAction(
            resolvedOrder,
            FRONTEND_API.admin.orders.verify,
            {
              orderId: resolvedOrder.id,
              orderStatus: 'PAYMENT_VERIFIED',
              paymentStatus: 'VERIFIED',
              paymentMethod: resolvedOrder.paymentProvider || 'ESEWA',
            },
            'Failed to verify order.',
          ),
        },
        {
          label: 'Process',
          onClick: () => handleOrderAdminAction(
            resolvedOrder,
            FRONTEND_API.admin.orders.process,
            {
              orderId: resolvedOrder.id,
              orderStatus: 'PROCESSING',
              paymentStatus: 'VERIFIED',
              paymentMethod: resolvedOrder.paymentProvider || 'ESEWA',
            },
            'Failed to process order.',
          ),
        },
        {
          label: 'Cancel',
          tone: 'danger',
          onClick: () => handleOrderAdminAction(
            resolvedOrder,
            FRONTEND_API.admin.orders.cancel,
            {
              orderId: resolvedOrder.id,
              orderStatus: 'CANCELLED',
              paymentStatus: 'REJECTED',
              paymentMethod: resolvedOrder.paymentProvider || 'ESEWA',
            },
            'Failed to cancel order.',
          ),
        },
      ]);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load order details.') });
    }
  }

  async function handleEditTag(tag) {
    try {
      const data = await fetchJson(`/api/v1/admin/tags/${tag.id}/tag`, 'Failed to load tag details.');
      const resolvedTag = mapBackendTag(data);

      setEditingTagId(resolvedTag.id);
      setEditingTagInitial({
        isActive: Boolean(resolvedTag.isActive),
      });
      setTagForm({
        name: resolvedTag.name || '',
        description: resolvedTag.description || '',
        isActive: Boolean(resolvedTag.isActive),
      });
      setIsTagComposerOpen(true);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load tag details.') });
    }
  }

  async function handleDeleteTag(tag) {
    if (!window.confirm(`Delete tag "${tag.name}"?`)) {
      return;
    }

    try {
      let response;

      try {
        response = await authFetch(`/api/v1/admin/tags/${tag.id}/tag`, {
          method: 'DELETE',
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Failed to delete tag.'));
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(normalizeRequestError(text, 'Failed to delete tag.'));
      }

      setTags((current) => current.filter((item) => item.id !== tag.id));
      setToast({ type: 'success', message: 'Tag deleted successfully.' });
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to delete tag.') });
    }
  }

  async function handleEditHero(hero) {
    try {
      const data = await fetchJson(`/api/v1/admin/homepage/hero/${hero.id}/hero`, 'Failed to load hero details.');
      const resolvedHero = mapBackendHomepageHero(data);

      setEditingHeroId(resolvedHero.id);
      setEditingHeroInitial({
        ...resolvedHero,
        unlinkProduct: false,
        unlinkCategory: false,
      });
      setHeroForm({
        ...INITIAL_HOMEPAGE_HERO_FORM,
        ...resolvedHero,
        unlinkProduct: false,
        unlinkCategory: false,
      });
      setIsHeroComposerOpen(true);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load hero details.') });
    }
  }

  async function handleDeleteHero(hero) {
    if (!window.confirm(`Delete hero "${hero.title}"?`)) {
      return;
    }

    try {
      let response;

      try {
        response = await authFetch(`/api/v1/admin/homepage/hero/${hero.id}/hero`, {
          method: 'DELETE',
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Failed to delete hero.'));
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(normalizeRequestError(text, 'Failed to delete hero.'));
      }

      setHeroes((current) => current.filter((item) => item.id !== hero.id));
      setToast({ type: 'success', message: 'Hero deleted successfully.' });
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to delete hero.') });
    }
  }

  async function handleEditFeaturedCategory(featuredCategory) {
    try {
      const data = await fetchJson(`/api/v1/admin/homepage/featured-categories/${featuredCategory.id}`, 'Failed to load featured category details.');
      const resolvedFeaturedCategory = mapBackendHomepageFeaturedCategory(data);

      setEditingFeaturedCategoryId(resolvedFeaturedCategory.id);
      setEditingFeaturedCategoryInitial(resolvedFeaturedCategory);
      setFeaturedCategoryForm({
        ...INITIAL_HOMEPAGE_FEATURED_CATEGORY_FORM,
        ...resolvedFeaturedCategory,
      });
      setIsFeaturedCategoryComposerOpen(true);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load featured category details.') });
    }
  }

  async function handleDeleteFeaturedCategory(featuredCategory) {
    if (!window.confirm(`Delete featured category tile for "${featuredCategory.categoryName}"?`)) {
      return;
    }

    try {
      let response;

      try {
        response = await authFetch(`/api/v1/admin/homepage/featured-categories/${featuredCategory.id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Failed to delete featured category.'));
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(normalizeRequestError(text, 'Failed to delete featured category.'));
      }

      setFeaturedCategories((current) => current.filter((item) => item.id !== featuredCategory.id));
      setToast({ type: 'success', message: 'Featured category deleted successfully.' });
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to delete featured category.') });
    }
  }

  async function handleEditTrendingProduct(trendingProduct) {
    try {
      const data = await fetchJson(`/api/v1/admin/homepage/trending-products/${trendingProduct.id}`, 'Failed to load trending product details.');
      const resolvedTrendingProduct = mapBackendHomepageTrendingProduct(data);

      setEditingTrendingProductId(resolvedTrendingProduct.id);
      setEditingTrendingProductInitial(resolvedTrendingProduct);
      setTrendingProductForm({
        ...INITIAL_HOMEPAGE_TRENDING_PRODUCT_FORM,
        ...resolvedTrendingProduct,
      });
      setIsTrendingProductComposerOpen(true);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load trending product details.') });
    }
  }

  async function handleDeleteTrendingProduct(trendingProduct) {
    const productName = products.find((item) => String(item.id) === trendingProduct.productId)?.name || 'this trending product';
    if (!window.confirm(`Delete trending item for "${productName}"?`)) {
      return;
    }

    try {
      let response;

      try {
        response = await authFetch(`/api/v1/admin/homepage/trending-products/${trendingProduct.id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Failed to delete trending product.'));
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(normalizeRequestError(text, 'Failed to delete trending product.'));
      }

      setHomepageTrendingProducts((current) => current.filter((item) => item.id !== trendingProduct.id));
      setToast({ type: 'success', message: 'Trending product deleted successfully.' });
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to delete trending product.') });
    }
  }

  async function handleEditNewArrivalRule(rule) {
    try {
      const data = await fetchJson(`/api/v1/admin/homepage/new-arrivals/${rule.id}`, 'Failed to load new arrivals rule details.');
      const resolvedRule = mapBackendHomepageNewArrivalRule(data);

      setEditingNewArrivalRuleId(resolvedRule.id);
      setEditingNewArrivalRuleInitial(resolvedRule);
      setNewArrivalRuleForm({
        ...INITIAL_HOMEPAGE_NEW_ARRIVAL_FORM,
        ...resolvedRule,
      });
      setIsNewArrivalComposerOpen(true);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load new arrivals rule details.') });
    }
  }

  async function handleDeleteNewArrivalRule(rule) {
    if (!window.confirm('Delete this new arrivals rule?')) {
      return;
    }

    try {
      let response;

      try {
        response = await authFetch(`/api/v1/admin/homepage/new-arrivals/${rule.id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        throw new Error(normalizeRequestError(error, 'Failed to delete new arrivals rule.'));
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(normalizeRequestError(text, 'Failed to delete new arrivals rule.'));
      }

      setHomepageNewArrivalRules((current) => current.filter((item) => item.id !== rule.id));
      setToast({ type: 'success', message: 'New arrivals rule deleted successfully.' });
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to delete new arrivals rule.') });
    }
  }

  if (!hasAdminAccess) {
    return (
      <>
        {toast ? <Toast type={toast.type} message={toast.message} /> : null}
        <AdminAccessGate
          isAuthenticated={isAuthenticated}
          onGoLogin={() => { window.location.href = '/'; }}
          onGoStorefront={() => { window.location.href = '/'; }}
        />
      </>
    );
  }

  return (
    <div className="app-shell">
      {toast ? <Toast type={toast.type} message={toast.message} /> : null}
        {detailModal ? (
          <EntityDetailsModal
            actions={detailModal.actions}
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
          mode={editingCategoryId ? 'edit' : 'create'}
          onChange={handleCategoryChange}
          onClose={() => {
            setIsCategoryComposerOpen(false);
            setEditingCategoryId(null);
            setEditingCategoryInitial(null);
            setCategoryForm(INITIAL_CATEGORY_FORM);
          }}
          onSubmit={handleCategorySubmit}
          parentOptions={parentOptions}
        />
      ) : null}
      {isTagComposerOpen ? (
        <TagComposer
          form={tagForm}
          isSubmitting={isSubmittingTag}
          mode={editingTagId ? 'edit' : 'create'}
          onChange={handleTagChange}
          onClose={() => {
            setIsTagComposerOpen(false);
            setEditingTagId(null);
            setEditingTagInitial(null);
            setTagForm(INITIAL_TAG_FORM);
          }}
          onSubmit={handleTagSubmit}
        />
      ) : null}
      {isHeroComposerOpen ? (
        <HomepageHeroComposer
          categories={categories}
          form={heroForm}
          isSubmitting={isSubmittingHero}
          mode={editingHeroId ? 'edit' : 'create'}
          onChange={handleHeroChange}
          onClose={() => {
            setIsHeroComposerOpen(false);
            setEditingHeroId(null);
            setEditingHeroInitial(null);
            setHeroForm(INITIAL_HOMEPAGE_HERO_FORM);
          }}
          onSubmit={handleHeroSubmit}
          products={products}
        />
      ) : null}
      {isNewArrivalComposerOpen ? (
        <HomepageNewArrivalComposer
          categories={categories}
          form={newArrivalRuleForm}
          isSubmitting={isSubmittingNewArrivalRule}
          mode={editingNewArrivalRuleId ? 'edit' : 'create'}
          onChange={handleNewArrivalRuleChange}
          onClose={() => {
            setIsNewArrivalComposerOpen(false);
            setEditingNewArrivalRuleId(null);
            setEditingNewArrivalRuleInitial(null);
            setNewArrivalRuleForm(INITIAL_HOMEPAGE_NEW_ARRIVAL_FORM);
          }}
          onSubmit={handleNewArrivalRuleSubmit}
          tags={tags}
        />
      ) : null}
      {isFeaturedCategoryComposerOpen ? (
        <HomepageFeaturedCategoryComposer
          categories={categories}
          form={featuredCategoryForm}
          isSubmitting={isSubmittingFeaturedCategory}
          mode={editingFeaturedCategoryId ? 'edit' : 'create'}
          onChange={handleFeaturedCategoryChange}
          onClose={() => {
            setIsFeaturedCategoryComposerOpen(false);
            setEditingFeaturedCategoryId(null);
            setEditingFeaturedCategoryInitial(null);
            setFeaturedCategoryForm(INITIAL_HOMEPAGE_FEATURED_CATEGORY_FORM);
          }}
          onSubmit={handleFeaturedCategorySubmit}
        />
      ) : null}
      {isTrendingProductComposerOpen ? (
        <HomepageTrendingProductComposer
          form={trendingProductForm}
          isSubmitting={isSubmittingTrendingProduct}
          mode={editingTrendingProductId ? 'edit' : 'create'}
          onChange={handleTrendingProductChange}
          onClose={() => {
            setIsTrendingProductComposerOpen(false);
            setEditingTrendingProductId(null);
            setEditingTrendingProductInitial(null);
            setTrendingProductForm(INITIAL_HOMEPAGE_TRENDING_PRODUCT_FORM);
          }}
          onSubmit={handleTrendingProductSubmit}
          products={products}
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

        {activeView === 'homepage' ? (
            <HomepageView
              categories={categories}
              featuredCategories={featuredCategories}
              heroes={heroes}
            isLoadingNewArrivalRules={isLoadingNewArrivalRules}
            isLoadingFeaturedCategories={isLoadingFeaturedCategories}
            isLoadingHeroes={isLoadingHeroes}
            isLoadingTrendingProducts={isLoadingTrendingProducts}
            onAddFeaturedCategory={() => setIsFeaturedCategoryComposerOpen(true)}
            onAddNewArrivalRule={() => setIsNewArrivalComposerOpen(true)}
            onAddTrendingProduct={() => setIsTrendingProductComposerOpen(true)}
            onDeleteFeaturedCategory={handleDeleteFeaturedCategory}
            onDeleteNewArrivalRule={handleDeleteNewArrivalRule}
            onEditFeaturedCategory={handleEditFeaturedCategory}
            onAddHero={() => setIsHeroComposerOpen(true)}
            onDeleteHero={handleDeleteHero}
              onDeleteTrendingProduct={handleDeleteTrendingProduct}
              onEditHero={handleEditHero}
              onEditNewArrivalRule={handleEditNewArrivalRule}
              onEditTrendingProduct={handleEditTrendingProduct}
              onViewFeaturedCategory={handleViewHomepageFeaturedCategory}
              onViewHero={handleViewHero}
              onViewNewArrivalRule={handleViewHomepageNewArrivalRule}
              onViewTrendingProduct={handleViewHomepageTrendingProduct}
              newArrivalRules={homepageNewArrivalRules}
              products={products}
              tags={tags}
            trendingProducts={homepageTrendingProducts}
          />
        ) : activeView === 'products' ? (
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
        ) : activeView === 'orders' ? (
          <OrdersView
            isLoadingOrders={isLoadingOrders}
            onRefreshOrders={loadOrders}
            onViewOrder={handleViewOrder}
            orderSummary={orderSummary}
            orders={orders}
          />
        ) : activeView === 'categories' ? (
          <CategoriesView
            categories={categories}
            categorySummary={categorySummary}
            isLoadingCategories={isLoadingCategories}
            onAddCategory={() => setIsCategoryComposerOpen(true)}
            onDeleteCategory={handleDeleteCategory}
            onEditCategory={handleEditCategory}
            onViewCategory={handleViewCategory}
            parentOptions={parentOptions}
          />
        ) : (
          <TagsView
            isLoadingTags={isLoadingTags}
            onAddTag={() => setIsTagComposerOpen(true)}
            onDeleteTag={handleDeleteTag}
            onEditTag={handleEditTag}
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
