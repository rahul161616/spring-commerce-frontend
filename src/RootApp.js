import { useEffect, useState } from 'react';
import AdminApp from './features/admin/AdminApp';
import StorefrontApp from './features/storefront/StorefrontApp';

function resolveRoute(pathname) {
  if (pathname.startsWith('/admin')) {
    return 'admin';
  }

  return 'storefront';
}

function normalizeLegacyStorefrontPath() {
  if (!window.location.pathname.startsWith('/storefront')) {
    return window.location.pathname;
  }

  const nextPath = window.location.pathname.replace(/^\/storefront/, '') || '/';
  const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;
  window.history.replaceState({}, '', nextUrl);
  return nextPath;
}

function RootApp() {
  const [activeApp, setActiveApp] = useState(() => resolveRoute(normalizeLegacyStorefrontPath()));

  useEffect(() => {
    function handleLocationChange() {
      setActiveApp(resolveRoute(window.location.pathname));
    }

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  return activeApp === 'admin' ? <AdminApp /> : <StorefrontApp />;
}

export default RootApp;
