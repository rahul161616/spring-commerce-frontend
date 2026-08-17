import { useEffect, useState } from 'react';
import {
  addItemToCart,
  createPublicOrder,
  createOrGetCart,
  fetchPublicOrderByCode,
  fetchPublicProductBySlug,
  fetchPublicProducts,
  fetchOwnProfile,
  fetchStorefrontContent,
  loginPublicUser,
  removeCartItem,
  signUpPublicUser,
  submitPaymentSubmission,
  updateOwnProfile,
  updateCartItemQuantity,
} from '../api/public/storefront';
import Toast from '../components/shared/Toast';
import { getCartSessionId } from '../utils/cartSession';
import './storefront.css';

const ACTIVE_ORDER_STORAGE_KEY = 'active_order_checkout';
const AUTH_STORAGE_KEY = 'storefront_auth_session';

function goTo(path) {
  window.location.href = path;
}

function normalizeRequestError(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage;
  }

  if (typeof error === 'string') {
    return error || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  return fallbackMessage;
}

function getStoredAuthSession() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    return JSON.parse(rawSession);
  } catch (error) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function getAuthNoticeFromReason(reason) {
  if (reason === 'login-required') {
    return 'Login first to access the storefront.';
  }

  if (reason === 'session-expired') {
    return 'Your session expired. Login again to continue.';
  }

  return '';
}

function isAuthExpiredError(error) {
  return error?.code === 'AUTH_EXPIRED';
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isProfileComplete(profile) {
  return Boolean(profile && hasText(profile.name) && hasText(profile.phone) && hasText(profile.address));
}

function buildProfileForm(profile) {
  return {
    name: profile?.name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    imageUrl: profile?.imageUrl || '',
  };
}

function StorefrontSidebar({ isOpen, onClose }) {
  return (
    <>
      <div className={`storefront-sidebar-backdrop${isOpen ? ' is-open' : ''}`} onClick={onClose} />
      <aside className={`storefront-sidebar${isOpen ? ' is-open' : ''}`}>
        <div className="storefront-sidebar-head">
          <strong>SHADES</strong>
          <button type="button" className="storefront-icon-button" onClick={onClose} aria-label="Close menu">
            Close
          </button>
        </div>
        <nav className="storefront-sidebar-nav">
          <button type="button" onClick={() => goTo('/profile')}>Profile</button>
          <button type="button">Settings</button>
          <button type="button">History</button>
          <button type="button">Wishlist</button>
        </nav>
      </aside>
    </>
  );
}

function BurgerButton({ onClick }) {
  return (
    <button type="button" className="storefront-icon-button storefront-burger-button" aria-label="Open menu" onClick={onClick}>
      <span />
      <span />
      <span />
    </button>
  );
}

function SignUpPage({
  brandName,
  form,
  isSubmitting,
  isPasswordVisible,
  isSidebarOpen,
  onChange,
  onCloseSidebar,
  onOpenSidebar,
  onSubmit,
  onTogglePasswordVisibility,
  onToast,
}) {
  return (
    <div className="storefront-shell storefront-auth-shell">
      <StorefrontSidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <header className="storefront-auth-topbar">
        <button type="button" className="storefront-icon-button" onClick={() => goTo('/')} aria-label="Close sign up">
          Close
        </button>
        <button type="button" className="storefront-wordmark" onClick={() => goTo('/')}>{brandName}</button>
        <button type="button" className="storefront-auth-help" onClick={() => onToast({ type: 'info', message: 'Help center will be connected with auth support.' })}>
          Help
        </button>
      </header>

      <main className="storefront-auth-main">
        <div className="storefront-auth-grid">
          <section className="storefront-auth-visual">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtQtcAPY7bddarFR9wYIeklNsixeEPYGA6DxY6dN-aQ-TKCjVn91FsIyBc8Flp72iCxXrwGuZ4y9jVD7XQm4PhNRFlYRjEF7_TL9gYCuxBeFsQ7Rczv5qiA89_AcZZM9r61TUHEKUfe_Vem0HJ1arYLvrCib1R66RqeA6pUZJXUdKwbAKawDR7Sp4h3xzysHemvzvzaYJPzY_rPPHSmy-1Exe4GVe9MZ_mxuGq1MPK6Eh4_ij4C0NORMXjy2JGg47pISUA1kIgAbyR"
              alt="Luxury retail interior"
            />
            <div className="storefront-auth-visual-overlay">
              <h1>Define Your Aesthetic.</h1>
              <p>
                Join our exclusive community of curators and tastemakers. Experience fashion through a new lens of digital craftsmanship.
              </p>
            </div>
          </section>

          <section className="storefront-auth-panel">
            <div className="storefront-auth-copy">
              <span className="storefront-auth-kicker">The Digital Atelier</span>
              <h2>Create Account</h2>
              <p>Enter your details to begin your journey.</p>
            </div>

            <form className="storefront-auth-form" onSubmit={onSubmit}>
              <label className="storefront-auth-field">
                <span>Full Name</span>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Alexander McQueen"
                  value={form.fullName}
                  onChange={onChange}
                />
              </label>

              <label className="storefront-auth-field">
                <span>Email Address</span>
                <input
                  name="email"
                  type="email"
                  placeholder="alexander@atelier.com"
                  value={form.email}
                  onChange={onChange}
                />
              </label>

              <label className="storefront-auth-field">
                <span>Password</span>
                <div className="storefront-auth-password-wrap">
                  <input
                    name="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={onChange}
                  />
                  <button type="button" className="storefront-auth-password-toggle" onClick={onTogglePasswordVisibility}>
                    {isPasswordVisible ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <button type="submit" className="storefront-auth-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="storefront-auth-divider">
              <span />
              <strong>Or continue with</strong>
              <span />
            </div>

            <div className="storefront-auth-socials">
              <button type="button" className="storefront-auth-social" onClick={() => onToast({ type: 'info', message: 'Google sign up will be added with the auth backend.' })}>
                Google
              </button>
              <button type="button" className="storefront-auth-social" onClick={() => onToast({ type: 'info', message: 'Apple sign up will be added with the auth backend.' })}>
                Apple
              </button>
            </div>

            <p className="storefront-auth-footer">
              Already have an account?
              <button type="button" onClick={() => goTo('/login')}>
                Login
              </button>
            </p>
          </section>
        </div>
      </main>

      <footer className="storefront-auth-footer-bar">
        <p>© 2024 SHADES Global Services. All rights reserved.</p>
      </footer>

      <button type="button" className="storefront-auth-mobile-menu" onClick={onOpenSidebar} aria-label="Open menu">
        Menu
      </button>
    </div>
  );
}

function LoginPage({
  brandName,
  form,
  isSubmitting,
  isPasswordVisible,
  isSidebarOpen,
  onChange,
  onCloseSidebar,
  onOpenSidebar,
  onSubmit,
  onTogglePasswordVisibility,
  onToast,
}) {
  return (
    <div className="storefront-shell storefront-auth-shell">
      <StorefrontSidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <header className="storefront-auth-topbar">
        <button type="button" className="storefront-icon-button" onClick={() => goTo('/')} aria-label="Close login">
          Close
        </button>
        <button type="button" className="storefront-wordmark" onClick={() => goTo('/')}>{brandName}</button>
        <button type="button" className="storefront-auth-help" onClick={() => onToast({ type: 'info', message: 'Help center will be connected with auth support.' })}>
          Help
        </button>
      </header>

      <main className="storefront-auth-main">
        <div className="storefront-auth-grid">
          <section className="storefront-auth-visual">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtQtcAPY7bddarFR9wYIeklNsixeEPYGA6DxY6dN-aQ-TKCjVn91FsIyBc8Flp72iCxXrwGuZ4y9jVD7XQm4PhNRFlYRjEF7_TL9gYCuxBeFsQ7Rczv5qiA89_AcZZM9r61TUHEKUfe_Vem0HJ1arYLvrCib1R66RqeA6pUZJXUdKwbAKawDR7Sp4h3xzysHemvzvzaYJPzY_rPPHSmy-1Exe4GVe9MZ_mxuGq1MPK6Eh4_ij4C0NORMXjy2JGg47pISUA1kIgAbyR"
              alt="Luxury retail interior"
            />
            <div className="storefront-auth-visual-overlay">
              <h1>Return To The Circle.</h1>
              <p>
                Sign in to continue your journey, manage your orders, and move through checkout with a saved account.
              </p>
            </div>
          </section>

          <section className="storefront-auth-panel">
            <div className="storefront-auth-copy">
              <span className="storefront-auth-kicker">Member Access</span>
              <h2>Login</h2>
              <p>Use your email and password to access your account.</p>
            </div>

            <form className="storefront-auth-form" onSubmit={onSubmit}>
              <label className="storefront-auth-field">
                <span>Email Address</span>
                <input
                  name="email"
                  type="email"
                  placeholder="alexander@atelier.com"
                  value={form.email}
                  onChange={onChange}
                />
              </label>

              <label className="storefront-auth-field">
                <span>Password</span>
                <div className="storefront-auth-password-wrap">
                  <input
                    name="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={onChange}
                  />
                  <button type="button" className="storefront-auth-password-toggle" onClick={onTogglePasswordVisibility}>
                    {isPasswordVisible ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <button type="submit" className="storefront-auth-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing In...' : 'Login'}
              </button>
            </form>

            <div className="storefront-auth-divider">
              <span />
              <strong>Or continue with</strong>
              <span />
            </div>

            <div className="storefront-auth-socials">
              <button type="button" className="storefront-auth-social" onClick={() => onToast({ type: 'info', message: 'Google sign in will be added with the auth backend.' })}>
                Google
              </button>
              <button type="button" className="storefront-auth-social" onClick={() => onToast({ type: 'info', message: 'Apple sign in will be added with the auth backend.' })}>
                Apple
              </button>
            </div>

            <p className="storefront-auth-footer">
              Need an account?
              <button type="button" onClick={() => goTo('/signup')}>
                Sign Up
              </button>
            </p>
          </section>
        </div>
      </main>

      <footer className="storefront-auth-footer-bar">
        <p>© 2024 SHADES Global Services. All rights reserved.</p>
      </footer>

      <button type="button" className="storefront-auth-mobile-menu" onClick={onOpenSidebar} aria-label="Open menu">
        Menu
      </button>
    </div>
  );
}

function ProfilePage({
  brandName,
  cart,
  profile,
  isEditing,
  isLoading,
  isSaving,
  form,
  isSidebarOpen,
  onChange,
  onOpenSidebar,
  onCloseSidebar,
  onCancelEdit,
  onCompleteProfile,
  onLogout,
  onSubmit,
}) {
  return (
    <div className="storefront-shell">
      <StorefrontSidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <header className="storefront-topbar">
        <div className="storefront-topbar-inner">
          <BurgerButton onClick={onOpenSidebar} />
          <button type="button" className="storefront-wordmark" onClick={() => goTo('/')}>{brandName}</button>
          <div className="storefront-topbar-actions">
            <StorefrontCartBox cart={cart} />
          </div>
        </div>
      </header>

      <main className="storefront-main storefront-orders-page">
        <section className="storefront-orders-hero">
          <h1>My Profile</h1>
          <p>Review your account details connected to this storefront session.</p>
        </section>

        {isLoading ? (
          <section className="storefront-orders-card">
            <span className="skeleton-line short" />
            <span className="skeleton-line medium" />
            <span className="skeleton-line" />
            <span className="skeleton-line medium" />
          </section>
        ) : (
          <section className="storefront-orders-card">
            <div className="storefront-orders-card-head">
              <div>
                <span className="storefront-orders-code">Account</span>
                <h2>{isEditing ? 'Complete Profile' : profile?.name || 'Unnamed User'}</h2>
              </div>
              <div className="storefront-orders-side">
                <span className="storefront-orders-pill">Member</span>
              </div>
            </div>

            {isEditing ? (
              <form className="storefront-auth-form" onSubmit={onSubmit}>
                <label className="storefront-auth-field">
                  <span>Full Name</span>
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Your full name"
                  />
                </label>

                <label className="storefront-auth-field">
                  <span>Phone</span>
                  <input
                    name="phone"
                    type="text"
                    value={form.phone}
                    onChange={onChange}
                    placeholder="98XXXXXXXX"
                  />
                </label>

                <label className="storefront-auth-field">
                  <span>Address</span>
                  <input
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={onChange}
                    placeholder="Your address"
                  />
                </label>

                <label className="storefront-auth-field">
                  <span>Image URL</span>
                  <input
                    name="imageUrl"
                    type="text"
                    value={form.imageUrl}
                    onChange={onChange}
                    placeholder="/uploads/profile/avatar.png"
                  />
                </label>

                <div className="storefront-detail-actions">
                  <button type="button" className="storefront-detail-secondary" onClick={onCancelEdit}>
                    Cancel
                  </button>
                  <button type="submit" className="storefront-detail-primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="storefront-orders-grid">
                <article>
                  <span>Name</span>
                  <strong>{profile?.name || 'Not available'}</strong>
                </article>
                <article>
                  <span>Email</span>
                  <strong>{profile?.email || 'Not available'}</strong>
                </article>
                <article>
                  <span>Phone</span>
                  <strong>{profile?.phone || 'Not available'}</strong>
                </article>
                <article>
                  <span>Address</span>
                  <strong>{profile?.address || 'Not available'}</strong>
                </article>
              </div>
            )}

            <div className="storefront-detail-actions">
              <button type="button" className="storefront-detail-secondary" onClick={() => goTo('/')}>
                Back To Home
              </button>
              <button type="button" className="storefront-detail-secondary" onClick={onCompleteProfile}>
                Complete My Profile
              </button>
              <button type="button" className="storefront-detail-primary" onClick={onLogout}>
                Logout
              </button>
            </div>
          </section>
        )}
      </main>

      <nav className="storefront-mobile-nav">
        <button type="button" onClick={() => { goTo('/'); }}>Home</button>
        <button type="button" onClick={() => { goTo('/products'); }}>Shop</button>
        <button type="button" onClick={() => { goTo('/cart'); }}>Cart</button>
        <button type="button" className="is-active">Profile</button>
        <button type="button" onClick={onLogout}>Logout</button>
      </nav>
    </div>
  );
}

function StorefrontCartBox({ cart }) {
  const itemCount = cart?.itemCount || 0;
  const summaryLabel = itemCount === 1 ? '1 Item' : `${itemCount} Items`;

  return (
    <button type="button" className="storefront-cart-box" aria-label="Cart preview" onClick={() => goTo('/cart')}>
      <div className="storefront-cart-case" aria-hidden="true">
        <div className="storefront-cart-case-lid" />
        <div className="storefront-cart-case-body">
          <span className="storefront-cart-glasses">
            <span />
            <span />
            <i />
          </span>
        </div>
      </div>
      <div className="storefront-cart-copy">
        <span>Cart</span>
        <strong>{summaryLabel}</strong>
      </div>
    </button>
  );
}

function resolveCartItemImage(item, products) {
  return products.find((product) => product.id === item.productId)?.image || products[0]?.image || '';
}

function isProductAlreadyInCart(cart, productId) {
  if (!productId) {
    return false;
  }

  return Boolean(cart?.items?.some((item) => item.productId === productId));
}

function ProductDetailPage({
  brandName,
  cart,
  product,
  isLoading,
  isAddingToCart,
  isInCart,
  isSidebarOpen,
  onAddToCart,
  onOpenSidebar,
  onCloseSidebar,
}) {
  const gallery = product?.image ? [product.image, product.image, product.image] : [];

  return (
    <div className="storefront-shell">
      <StorefrontSidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <header className="storefront-topbar">
        <div className="storefront-topbar-inner">
          <BurgerButton onClick={onOpenSidebar} />
          <button type="button" className="storefront-wordmark" onClick={() => goTo('/')}>{brandName}</button>
          <div className="storefront-topbar-actions">
            <button type="button" className="storefront-icon-button" aria-label="Search">
              Search
            </button>
            <StorefrontCartBox cart={cart} />
          </div>
        </div>
        <div className="storefront-detail-back-row">
          <button
            type="button"
            className="storefront-icon-button storefront-detail-back-button"
            aria-label="Back"
            onClick={() => window.history.back()}
          >
            Back
          </button>
        </div>
      </header>

      <main className="storefront-main storefront-detail-page">
        {isLoading ? (
          <section className="storefront-detail-grid">
            <div className="storefront-detail-visuals">
              <div className="storefront-detail-stage skeleton-block" />
              <div className="storefront-detail-thumb skeleton-block" />
              <div className="storefront-detail-thumb skeleton-block" />
            </div>
            <div className="storefront-detail-panel">
              <span className="skeleton-line short" />
              <span className="skeleton-line medium" />
              <span className="skeleton-line short" />
              <span className="skeleton-line" />
              <span className="skeleton-line medium" />
            </div>
          </section>
        ) : product ? (
          <>
            <section className="storefront-detail-grid">
              <div className="storefront-detail-visuals">
                <div className="storefront-detail-stage">
                  <img src={product.image} alt={product.name} />
                  <button type="button" className="storefront-detail-tryon">Preview Piece</button>
                </div>
                {gallery.slice(1).map((image, index) => (
                  <div key={`${product.id}-detail-${index}`} className="storefront-detail-thumb">
                    <img src={image} alt={`${product.name} detail ${index + 1}`} />
                  </div>
                ))}
              </div>

              <div className="storefront-detail-panel">
                <header className="storefront-detail-header">
                  <div>
                    <p className="storefront-detail-kicker">{product.categoryName || 'Public Collection'}</p>
                    <h1>{product.name}</h1>
                  </div>
                  <button type="button" className="storefront-detail-favorite" aria-label="Save product">
                    Save
                  </button>
                </header>

                <div className="storefront-detail-pricing">
                  <strong>{product.price}</strong>
                  {product.compareAt && product.compareAt !== product.price ? <span>{product.compareAt}</span> : null}
                </div>

                <p className="storefront-detail-description">
                  {product.shortDescription || product.description || 'Product narrative will appear here once the backend detail endpoint is ready.'}
                </p>

                <div className="storefront-detail-highlights">
                  <div>Lifetime warranty</div>
                  <div>Express delivery</div>
                </div>

                <div className="storefront-detail-actions">
                  <button
                    type="button"
                    className="storefront-detail-primary"
                    onClick={() => onAddToCart(product)}
                    disabled={isAddingToCart || isInCart}
                  >
                    {isInCart ? 'Already in Bag' : isAddingToCart ? 'Adding...' : 'Add to Bag'}
                  </button>
                  <button type="button" className="storefront-detail-secondary">Find in Boutique</button>
                </div>
              </div>
            </section>

            <section className="storefront-detail-craft">
              <h2>The Craft</h2>
              <div className="storefront-detail-craft-grid">
                <article>
                  <h3>Materiality</h3>
                  <p>{product.description || 'Premium materials and product construction details will surface here from the backend.'}</p>
                </article>
                <article>
                  <h3>Category</h3>
                  <p>{product.categoryName || 'Category details will appear here.'}</p>
                </article>
                <article>
                  <h3>Availability</h3>
                  <p>{typeof product.stockQuantity === 'number' ? `${product.stockQuantity} units available` : 'Stock details will appear here.'}</p>
                </article>
              </div>
            </section>
          </>
        ) : (
          <section className="storefront-detail-empty">
            <h1>Product not found</h1>
            <p>The requested product is not available in the current public feed.</p>
            <a href="/products" className="storefront-detail-backlink">Back to Shop</a>
          </section>
        )}
      </main>

      <nav className="storefront-mobile-nav">
        <button type="button" onClick={() => { goTo('/'); }}>Home</button>
        <button type="button" className="is-active">Shop</button>
        <button type="button">Wishlist</button>
        <button type="button" onClick={() => { goTo('/cart'); }}>Cart</button>
        <button type="button">History</button>
      </nav>
    </div>
  );
}

function ProductsPage({ brandName, cart, products, isLoading, isSidebarOpen, onOpenSidebar, onCloseSidebar }) {
  return (
    <div className="storefront-shell">
      <StorefrontSidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <header className="storefront-topbar">
        <div className="storefront-topbar-inner">
          <BurgerButton onClick={onOpenSidebar} />
          <button type="button" className="storefront-wordmark" onClick={() => goTo('/')}>{brandName}</button>
          <div className="storefront-topbar-actions">
            <nav className="storefront-nav">
              <a href="/">Home</a>
              <a href="/products">Shop</a>
              <a href="#about">About</a>
            </nav>
            <StorefrontCartBox cart={cart} />
          </div>
        </div>
      </header>

      <main className="storefront-main storefront-products-page">
        <section className="storefront-products-hero storefront-products-hero-centered">
          <p className="storefront-products-kicker">Shop</p>
          <h1>All Products</h1>
        </section>

        <section className="storefront-products-toolbar">
          <div className="storefront-products-filter-pill">All Products</div>
          <div className="storefront-products-filter-pill">Newest</div>
          <div className="storefront-products-filter-pill">Featured</div>
        </section>

        <section className="storefront-products-grid">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <article key={`product-skeleton-${index}`} className="storefront-products-card">
                  <div className="storefront-products-image skeleton-block" />
                  <div className="storefront-products-copy">
                    <span className="storefront-products-meta skeleton-line short" />
                    <span className="storefront-products-title skeleton-line" />
                    <span className="storefront-products-title skeleton-line medium" />
                    <span className="storefront-products-price skeleton-line short" />
                  </div>
                </article>
              ))
            : products.map((product) => (
                <a key={product.id} href={product.href} className="storefront-products-card storefront-products-card-link">
                  <div className="storefront-products-image-wrap">
                    <img
                      className="storefront-products-image"
                      src={product.image}
                      alt={product.name}
                    />
                  </div>
                  <div className="storefront-products-copy">
                    <p className="storefront-products-meta">{product.categoryName}</p>
                    <h3 className="storefront-products-name">{product.name}</h3>
                    <p className="storefront-products-description">{product.shortDescription}</p>
                    <div className="storefront-products-price-row">
                      <strong>{product.price}</strong>
                      {product.compareAt && product.compareAt !== product.price ? <span>{product.compareAt}</span> : null}
                    </div>
                  </div>
                </a>
              ))}
        </section>
      </main>

      <nav className="storefront-mobile-nav">
        <button type="button" onClick={() => { goTo('/'); }}>Home</button>
        <button type="button" className="is-active">Shop</button>
        <button type="button">Wishlist</button>
        <button type="button" onClick={() => { goTo('/cart'); }}>Cart</button>
        <button type="button">History</button>
      </nav>
    </div>
  );
}

function CartPage({
  brandName,
  cart,
  products,
  isCartUpdating,
  isOrderCreating,
  isSidebarOpen,
  onCartQuantityChange,
  onCheckout,
  onOpenSidebar,
  onCloseSidebar,
}) {
  const cartItems = cart?.items || [];
  const suggestions = products.filter((product) => !cartItems.some((item) => item.productId === product.id)).slice(0, 4);

  return (
    <div className="storefront-shell">
      <StorefrontSidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <header className="storefront-topbar">
        <div className="storefront-topbar-inner">
          <BurgerButton onClick={onOpenSidebar} />
          <button type="button" className="storefront-wordmark" onClick={() => goTo('/')}>{brandName}</button>
          <div className="storefront-topbar-actions">
            <button type="button" className="storefront-bag-button" aria-label="Shopping bag">
              <span className="storefront-bag-icon" aria-hidden="true" />
              <span className="storefront-bag-badge">{cart?.itemCount || 0}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="storefront-main storefront-cart-page">
        <section className="storefront-cart-hero">
          <span className="storefront-cart-kicker">Your Selection</span>
          <h1>Shopping Bag</h1>
          <p>A curated collection of your future essentials. Review your pieces before checkout.</p>
        </section>

        <section className="storefront-cart-list">
          {cartItems.length ? (
            cartItems.map((item) => (
              <article key={item.id || item.productId} className="storefront-cart-item">
                <div className="storefront-cart-item-image-wrap">
                  <img className="storefront-cart-item-image" src={resolveCartItemImage(item, products)} alt={item.productName} />
                </div>
                <div className="storefront-cart-item-copy">
                  <div className="storefront-cart-item-head">
                    <div>
                      <h3>{item.productName}</h3>
                      <p>{products.find((product) => product.id === item.productId)?.categoryName || 'Curated Piece'}</p>
                    </div>
                    <strong>{item.priceLabel}</strong>
                  </div>
                  <div className="storefront-cart-item-actions">
                    <div className="storefront-cart-quantity-pill">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => onCartQuantityChange(item, item.quantity - 1)}
                        disabled={isCartUpdating}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => onCartQuantityChange(item, item.quantity + 1)}
                        disabled={isCartUpdating}
                      >
                        +
                      </button>
                    </div>
                    <button type="button" className="storefront-cart-remove" onClick={() => onCartQuantityChange(item, 0)} disabled={isCartUpdating}>
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <article className="storefront-cart-empty">
              <h2>Your bag is still empty</h2>
              <p>Add a few pieces from the shop and they will appear here.</p>
              <button type="button" className="storefront-detail-primary" onClick={() => goTo('/products')}>
                Continue Shopping
              </button>
            </article>
          )}
        </section>

        {suggestions.length ? (
          <section className="storefront-cart-suggestions">
            <h2>You might also like</h2>
            <div className="storefront-cart-suggestions-grid">
              {suggestions.map((product) => (
                <a key={product.id} href={product.href} className="storefront-cart-suggestion-card">
                  <div className="storefront-cart-suggestion-image-wrap">
                    <img className="storefront-cart-suggestion-image" src={product.image} alt={product.name} />
                  </div>
                  <p>{product.name}</p>
                  <span>{product.price}</span>
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      {cartItems.length ? <div className="storefront-cart-summary-shell">
        <div className="storefront-cart-summary">
          <div className="storefront-cart-summary-head">
            <div>
              <span>Estimated Total</span>
              <strong>{cart?.grandTotalLabel || 'Rs 0.00'}</strong>
            </div>
            <div className="storefront-cart-summary-note">
              <p>Taxes and Shipping</p>
              <small>Calculated at next step</small>
            </div>
          </div>
          <button type="button" className="storefront-cart-checkout" onClick={onCheckout} disabled={isOrderCreating}>
            {isOrderCreating ? 'Preparing Order...' : 'Proceed to Checkout'}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div> : null}

      <nav className="storefront-mobile-nav">
        <button type="button" onClick={() => { goTo('/products'); }}>Shop</button>
        <button type="button" className="is-active">Cart</button>
        <button type="button">Pay</button>
        <button type="button">Member</button>
        <button type="button">More</button>
      </nav>
    </div>
  );
}

function getOrderStatusMeta(status) {
  switch (status) {
    case 'PAYMENT_SUBMITTED':
      return {
        label: 'Pending Approval',
        note: 'Payment proof submitted successfully. Our team is reviewing the transaction now.',
      };
    case 'PAYMENT_VERIFIED':
      return {
        label: 'Payment Verified',
        note: 'Your payment has been verified and the order is moving into processing.',
      };
    case 'PAYMENT_REJECTED':
      return {
        label: 'Payment Rejected',
        note: 'The submitted payment could not be verified. Please resubmit or contact support.',
      };
    default:
      return {
        label: 'Pending Payment',
        note: 'Complete the payment steps to move this order forward.',
      };
  }
}

function PaymentPage({ brandName, order, cart, isSidebarOpen, onOpenSidebar, onCloseSidebar, onOrderUpdate, onToast }) {
  const [transactionReference, setTransactionReference] = useState('');
  const [payerMobile, setPayerMobile] = useState('');
  const [receiptImageUrl, setReceiptImageUrl] = useState('');
  const [paymentState, setPaymentState] = useState({ isSubmitting: false, submission: null, error: '' });
  return (
    <div className="storefront-shell">
      <StorefrontSidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <header className="storefront-topbar">
        <div className="storefront-topbar-inner">
          <BurgerButton onClick={onOpenSidebar} />
          <button type="button" className="storefront-wordmark" onClick={() => goTo('/')}>{brandName}</button>
          <div className="storefront-topbar-actions">
            <button type="button" className="storefront-bag-button" aria-label="Shopping bag" onClick={() => goTo('/cart')}>
              <span className="storefront-bag-icon" aria-hidden="true" />
              <span className="storefront-bag-badge">{order?.itemCount || cart?.itemCount || 0}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="storefront-main storefront-pay-page">
        <section className="storefront-pay-summary">
          <span className="storefront-pay-kicker">Checkout Summary</span>
          <h2>{order?.grandTotalLabel || 'Rs 0.00'}</h2>
          <p>Order #{order?.orderCode || 'AT-00000'}</p>
        </section>

        <section className="storefront-pay-qr-card">
          <div className="storefront-pay-qr-frame">
            <div className="storefront-pay-qr-grid" aria-hidden="true">
              {Array.from({ length: 25 }).map((_, index) => (
                <span key={`qr-${index}`} className={index % 3 === 0 || index % 7 === 0 ? 'is-filled' : ''} />
              ))}
            </div>
          </div>
          <p>
            Scan this code with your banking app to initiate the secure transfer to
            <strong> SHADES Collective Ltd.</strong>
          </p>
        </section>

        <section className="storefront-pay-verification">
          <div className="storefront-pay-divider">
            <span />
            <strong>Verification</strong>
            <span />
          </div>

          <div className="storefront-pay-field">
            <label htmlFor="transaction-id">Transaction ID</label>
            <input
              id="transaction-id"
              type="text"
              placeholder="Enter the 12-digit reference number"
              value={transactionReference}
              onChange={(event) => {
                setTransactionReference(event.target.value);
                setPaymentState((current) => ({ ...current, error: '' }));
              }}
            />
          </div>

          <div className="storefront-pay-field">
            <label htmlFor="payer-mobile">Payer Mobile</label>
            <input
              id="payer-mobile"
              type="text"
              placeholder="98XXXXXXXX"
              value={payerMobile}
              onChange={(event) => {
                setPayerMobile(event.target.value);
                setPaymentState((current) => ({ ...current, error: '' }));
              }}
            />
          </div>

          <div className="storefront-pay-field">
            <label htmlFor="receipt-url">Receipt URL</label>
            <input
              id="receipt-url"
              type="text"
              placeholder="Paste uploaded receipt URL"
              value={receiptImageUrl}
              onChange={(event) => {
                setReceiptImageUrl(event.target.value);
                setPaymentState((current) => ({ ...current, error: '' }));
              }}
            />
          </div>

          <div className="storefront-pay-field">
            <label>Proof of Transfer</label>
            <button type="button" className="storefront-pay-upload">
              <span aria-hidden="true">↑</span>
              <small>Submit Screenshot</small>
            </button>
          </div>

          <button
            type="button"
            className="storefront-pay-complete"
            disabled={paymentState.isSubmitting}
            onClick={async () => {
              if (paymentState.isSubmitting) {
                return;
              }

              if (!order?.orderCode) {
                const message = 'Create an order from the cart before submitting payment verification.';
                setPaymentState((current) => ({
                  ...current,
                  error: message,
                }));
                if (onToast) {
                  onToast({ type: 'error', message });
                }
                return;
              }

              if (!transactionReference.trim()) {
                const message = 'Transaction ID is required before submitting verification.';
                setPaymentState((current) => ({
                  ...current,
                  error: message,
                }));
                if (onToast) {
                  onToast({ type: 'error', message });
                }
                return;
              }

              try {
                setPaymentState((current) => ({ ...current, isSubmitting: true, error: '' }));
                const submission = await submitPaymentSubmission(order.orderCode, {
                  provider: 'ESEWA',
                  paidAmount: order.grandTotalAmount,
                  payerMobile: payerMobile.trim(),
                  transactionReference: transactionReference.trim(),
                  receiptImageUrl: receiptImageUrl.trim(),
                  remarks: 'Submitted from public pay page',
                });
                setPaymentState({ isSubmitting: false, submission, error: '' });
                if (onOrderUpdate) {
                  onOrderUpdate({
                    ...order,
                    status: 'PAYMENT_SUBMITTED',
                  });
                }
                window.localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
                if (onToast) {
                  onToast({ type: 'success', message: 'Payment verification submitted successfully.' });
                }
                goTo(`/orders/${order.orderCode}`);
              } catch (error) {
                const message = normalizeRequestError(error, 'Payment submission failed.');
                setPaymentState((current) => ({
                  ...current,
                  isSubmitting: false,
                  error: message,
                }));
                if (onToast) {
                  onToast({ type: 'error', message });
                }
              }
            }}
          >
            {paymentState.isSubmitting ? 'Submitting...' : 'Complete Verification'}
            <span aria-hidden="true">→</span>
          </button>

          <div className="storefront-pay-note">
            <i aria-hidden="true">i</i>
            <div>
              <strong>{paymentState.submission?.verificationStatus || 'Pending Approval'}</strong>
              <p>
                {paymentState.submission
                  ? 'Payment proof submitted. Our team will verify the transaction and update your order status.'
                  : 'Once submitted, our team will verify your transaction within 2-4 business hours. You\'ll receive a confirmation email once the order status is updated.'}
              </p>
            </div>
          </div>

          {paymentState.error ? (
            <p className="storefront-pay-error" role="alert">{paymentState.error}</p>
          ) : null}
        </section>
      </main>

      <nav className="storefront-mobile-nav">
        <button type="button" onClick={() => { goTo('/products'); }}>Shop</button>
        <button type="button" onClick={() => { goTo('/cart'); }}>Cart</button>
        <button type="button" className="is-active">Pay</button>
        <button type="button">Member</button>
        <button type="button">More</button>
      </nav>
    </div>
  );
}

function OrdersPage({
  brandName,
  cart,
  order,
  isLoading,
  isSidebarOpen,
  onOpenSidebar,
  onCloseSidebar,
}) {
  const statusMeta = getOrderStatusMeta(order?.status);

  return (
    <div className="storefront-shell">
      <StorefrontSidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <header className="storefront-topbar">
        <div className="storefront-topbar-inner">
          <BurgerButton onClick={onOpenSidebar} />
          <button type="button" className="storefront-wordmark" onClick={() => goTo('/')}>{brandName}</button>
          <div className="storefront-topbar-actions">
            <button type="button" className="storefront-bag-button" aria-label="Shopping bag" onClick={() => goTo('/cart')}>
              <span className="storefront-bag-icon" aria-hidden="true" />
              <span className="storefront-bag-badge">{cart?.itemCount || 0}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="storefront-main storefront-orders-page">
        <section className="storefront-orders-hero">
          <h1>Order Status</h1>
          <p>Track the current state of your order and payment review.</p>
        </section>

        {isLoading ? (
          <section className="storefront-orders-card">
            <span className="skeleton-line short" />
            <span className="skeleton-line medium" />
            <span className="skeleton-line" />
            <span className="skeleton-line medium" />
          </section>
        ) : order ? (
          <section className="storefront-orders-card">
            <div className="storefront-orders-card-head">
              <div>
                <span className="storefront-orders-code">Order #{order.orderCode}</span>
                <h2>{statusMeta.label}</h2>
              </div>
              <div className="storefront-orders-side">
                <span className="storefront-orders-pill">{statusMeta.label}</span>
                <strong>{order.grandTotalLabel}</strong>
              </div>
            </div>

            <div className="storefront-orders-progress">
              <div className={`storefront-orders-step is-complete`}>
                <div className="storefront-orders-step-dot">1</div>
                <span>Ordered</span>
              </div>
              <div className={`storefront-orders-step${order.status !== 'PENDING_PAYMENT' ? ' is-complete' : ''}`}>
                <div className="storefront-orders-step-dot">2</div>
                <span>Payment Submitted</span>
              </div>
              <div className={`storefront-orders-step${order.status === 'PAYMENT_VERIFIED' ? ' is-complete' : ''}`}>
                <div className="storefront-orders-step-dot">3</div>
                <span>Verification</span>
              </div>
            </div>

            <div className="storefront-orders-grid">
              <article>
                <span>Status</span>
                <strong>{order.status || 'PENDING_PAYMENT'}</strong>
              </article>
              <article>
                <span>Items</span>
                <strong>{order.itemCount || 0}</strong>
              </article>
              <article>
                <span>Currency</span>
                <strong>{order.currencyCode || 'NRS'}</strong>
              </article>
              <article>
                <span>Amount</span>
                <strong>{order.grandTotalLabel}</strong>
              </article>
            </div>

            <div className="storefront-orders-note">
              <i aria-hidden="true">i</i>
              <p>{statusMeta.note}</p>
            </div>
          </section>
        ) : (
          <section className="storefront-orders-empty">
            <h2>Order not found</h2>
            <p>The requested order is not available in the current public session.</p>
            <button type="button" className="storefront-detail-primary" onClick={() => goTo('/products')}>
              Continue Shopping
            </button>
          </section>
        )}
      </main>

      <nav className="storefront-mobile-nav">
        <button type="button" onClick={() => { goTo('/products'); }}>Shop</button>
        <button type="button" className="is-active">Orders</button>
        <button type="button" onClick={() => { goTo('/pay'); }}>Pay</button>
        <button type="button">Member</button>
        <button type="button">More</button>
      </nav>
    </div>
  );
}

function StorefrontApp() {
  const [content, setContent] = useState({
    brandName: 'SHADES',
    quote: 'Your daily dose of style and substance.',
    quoteCaption: 'Established SHADES',
    heroSlides: [],
    featuredCategories: [],
    trendingProducts: [],
    newArrivals: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductDetailLoading, setIsProductDetailLoading] = useState(false);
  const [cart, setCart] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isOrderDetailsLoading, setIsOrderDetailsLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPaymentProfileChecking, setIsPaymentProfileChecking] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    imageUrl: '',
  });
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isCartUpdating, setIsCartUpdating] = useState(false);
  const [isOrderCreating, setIsOrderCreating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [signUpForm, setSignUpForm] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [authSession, setAuthSession] = useState(() => getStoredAuthSession());
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const authReason = searchParams.get('reason') || '';
  const isCartPage = pathname === '/cart';
  const isPayPage = pathname === '/pay';
  const isSignupPage = pathname === '/signup';
  const isLoginPage = pathname === '/login';
  const isProfilePage = pathname === '/profile';
  const orderCode = pathname.startsWith('/orders/') ? pathname.replace('/orders/', '') : null;
  const isOrdersPage = Boolean(orderCode);
  const productSlug = pathname.startsWith('/products/') ? pathname.replace('/products/', '') : null;
  const isAuthenticated = Boolean(authSession?.accessToken || authSession?.token);
  const isProtectedRoute = !isLoginPage && !isSignupPage;

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  useEffect(() => {
    if (!isProtectedRoute) {
      if (isAuthenticated && !authReason) {
        goTo('/');
      }
      return;
    }

    if (!isAuthenticated) {
      goTo('/login?reason=login-required');
    }
  }, [authReason, isAuthenticated, isProtectedRoute]);

  useEffect(() => {
    if (!isLoginPage) {
      return;
    }

    const notice = getAuthNoticeFromReason(authReason);
    if (notice) {
      setToast({ type: 'error', message: notice });
      window.history.replaceState({}, '', '/login');
    }
  }, [authReason, isLoginPage]);

  useEffect(() => {
    if (!isProfilePage || authReason !== 'profile-required') {
      return;
    }

    setIsProfileEditing(true);
    setToast({ type: 'error', message: 'Complete your profile before proceeding to payment.' });
    window.history.replaceState({}, '', '/profile');
  }, [authReason, isProfilePage]);

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      const sessionId = getCartSessionId();
      setIsLoading(true);
      setIsProductsLoading(true);

      const [nextContent, nextProducts, nextCart] = await Promise.all([
        fetchStorefrontContent(),
        fetchPublicProducts(),
        createOrGetCart(sessionId),
      ]);

      if (isMounted) {
        setContent(nextContent);
        setProducts(nextProducts);
        setCart(nextCart);
        const storedOrder = window.localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY);
        if (storedOrder) {
          setActiveOrder(JSON.parse(storedOrder));
        }
        setIsLoading(false);
        setIsProductsLoading(false);
      }
    }

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProductDetail() {
      if (!productSlug) {
        setSelectedProduct(null);
        setIsProductDetailLoading(false);
        return;
      }

      setIsProductDetailLoading(true);
      const cachedProduct = products.find(
        (product) => product.slug === productSlug || product.href === `/products/${productSlug}`
      );
      const nextProduct = await fetchPublicProductBySlug(productSlug);

      if (isMounted) {
        setSelectedProduct(nextProduct || cachedProduct || null);
        setIsProductDetailLoading(false);
      }
    }

    loadProductDetail();

    return () => {
      isMounted = false;
    };
  }, [productSlug, products]);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      if (!orderCode) {
        setOrderDetails(null);
        setIsOrderDetailsLoading(false);
        return;
      }

      try {
        setIsOrderDetailsLoading(true);
        const nextOrder = await fetchPublicOrderByCode(orderCode);
        if (isMounted) {
          setOrderDetails(nextOrder);
          setIsOrderDetailsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setOrderDetails(null);
          setIsOrderDetailsLoading(false);
          setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load order details.') });
        }
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderCode]);

  useEffect(() => {
    let isMounted = true;

    async function loadOwnProfile() {
      if (!isProfilePage || !isAuthenticated) {
        setProfile(null);
        setIsProfileLoading(false);
        return;
      }

      try {
        setIsProfileLoading(true);
        const nextProfile = await fetchOwnProfile();
        if (isMounted) {
          setProfile(nextProfile || null);
          setProfileForm(buildProfileForm(nextProfile));
          setIsProfileLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setProfile(null);
          setIsProfileLoading(false);
          if (!isAuthExpiredError(error)) {
            setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to load your profile.') });
          }
        }
      }
    }

    loadOwnProfile();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isProfilePage]);

  useEffect(() => {
    let isMounted = true;

    async function guardPaymentProfile() {
      if (!isPayPage || !isAuthenticated || !activeOrder?.orderCode) {
        setIsPaymentProfileChecking(false);
        return;
      }

      try {
        setIsPaymentProfileChecking(true);
        const nextProfile = await fetchOwnProfile();
        if (!isMounted) {
          return;
        }

        setProfile(nextProfile || null);
        setProfileForm(buildProfileForm(nextProfile));

        if (!isProfileComplete(nextProfile)) {
          setIsProfileEditing(true);
          goTo('/profile?reason=profile-required');
          return;
        }

        setIsPaymentProfileChecking(false);
      } catch (error) {
        if (isMounted && !isAuthExpiredError(error)) {
          setIsPaymentProfileChecking(false);
          setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to verify your profile.') });
        }
      }
    }

    guardPaymentProfile();

    return () => {
      isMounted = false;
    };
  }, [activeOrder?.orderCode, isAuthenticated, isPayPage]);

  useEffect(() => {
    if (!isPayPage || isLoading) {
      return;
    }

    if (!activeOrder?.orderCode) {
      setToast({ type: 'error', message: 'Start checkout from the cart before opening the payment page.' });
      goTo('/cart');
    }
  }, [activeOrder, isLoading, isPayPage]);

  const heroSlides = content.heroSlides;
  const categories = content.featuredCategories;
  const trendingItems = content.trendingProducts;
  const arrivals = content.newArrivals;
  const brandName = content.brandName;
  const quote = content.quote;
  const quoteCaption = content.quoteCaption;

  async function handleAddToCart(product) {
    if (!product?.id || isAddingToCart) {
      return;
    }

    try {
      setIsAddingToCart(true);
      const sessionId = getCartSessionId();
      const nextCart = await addItemToCart({
        sessionId,
        productId: product.id,
        quantity: 1,
        currencyCode: 'NRS',
      });
      setCart(nextCart);
    } finally {
      setIsAddingToCart(false);
    }
  }

  async function handleCartQuantityChange(item, nextQuantity) {
    if (!item?.id || nextQuantity < 0 || isCartUpdating) {
      return;
    }

    try {
      setIsCartUpdating(true);
      const nextCart = nextQuantity === 0
        ? await removeCartItem(item.id)
        : await updateCartItemQuantity(item.id, nextQuantity);
      setCart(nextCart);
    } finally {
      setIsCartUpdating(false);
    }
  }

  async function handleCheckout() {
    if (!cart?.itemCount || isOrderCreating) {
      return;
    }

    try {
      setIsOrderCreating(true);
      const nextProfile = await fetchOwnProfile();
      setProfile(nextProfile || null);
      setProfileForm(buildProfileForm(nextProfile));

      if (!isProfileComplete(nextProfile)) {
        setIsProfileEditing(true);
        setToast({ type: 'error', message: 'Complete your profile before proceeding to payment.' });
        goTo('/profile?reason=profile-required');
        return;
      }

      const sessionId = getCartSessionId();
      const nextOrder = await createPublicOrder({ sessionId });
      setActiveOrder(nextOrder);
      window.localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, JSON.stringify(nextOrder));
      goTo('/pay');
    } finally {
      setIsOrderCreating(false);
    }
  }

  function handleSignUpChange(event) {
    const { name, value } = event.target;
    setSignUpForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleLoginChange(event) {
    const { name, value } = event.target;
    setLoginForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSignUpSubmit(event) {
    event.preventDefault();

    if (!signUpForm.fullName.trim() || !signUpForm.email.trim() || !signUpForm.password.trim()) {
      setToast({ type: 'error', message: 'Fill in full name, email, and password to continue.' });
      return;
    }

    try {
      setIsAuthSubmitting(true);
      const response = await signUpPublicUser(signUpForm);
      setToast({ type: 'success', message: response?.message || 'Account created successfully. Login to continue.' });
      setSignUpForm({
        fullName: '',
        email: '',
        password: '',
      });
      window.setTimeout(() => {
        goTo('/login');
      }, 500);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Sign up failed.') });
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setToast({ type: 'error', message: 'Enter email and password to continue.' });
      return;
    }

    try {
      setIsAuthSubmitting(true);
      const response = await loginPublicUser(loginForm);
      const nextAuthSession = {
        email: loginForm.email.trim(),
        token: response?.token || response?.accessToken || '',
        accessToken: response?.accessToken || response?.token || '',
        refreshToken: response?.refreshToken || '',
      };
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuthSession));
      setAuthSession(nextAuthSession);
      setToast({ type: 'success', message: response?.message || 'Login successful.' });
      setLoginForm({
        email: '',
        password: '',
      });
      window.setTimeout(() => {
        goTo('/');
      }, 500);
    } catch (error) {
      setToast({ type: 'error', message: normalizeRequestError(error, 'Login failed.') });
    } finally {
      setIsAuthSubmitting(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
    setAuthSession(null);
    setProfile(null);
    goTo('/login');
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;
    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleCompleteProfile() {
    setProfileForm(buildProfileForm(profile));
    setIsProfileEditing(true);
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();

    try {
      setIsProfileSaving(true);
      const nextProfile = await updateOwnProfile(profileForm);
      setProfile(nextProfile || null);
      setProfileForm(buildProfileForm(nextProfile));
      setIsProfileEditing(false);
      setToast({ type: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      if (!isAuthExpiredError(error)) {
        setToast({ type: 'error', message: normalizeRequestError(error, 'Failed to update your profile.') });
      }
    } finally {
      setIsProfileSaving(false);
    }
  }

  if (isSignupPage) {
    return (
      <>
        {toast ? <Toast type={toast.type} message={toast.message} /> : null}
        <SignUpPage
          brandName={brandName}
          form={signUpForm}
          isSubmitting={isAuthSubmitting}
          isPasswordVisible={isPasswordVisible}
          isSidebarOpen={isSidebarOpen}
          onChange={handleSignUpChange}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onSubmit={handleSignUpSubmit}
          onTogglePasswordVisibility={() => setIsPasswordVisible((current) => !current)}
          onToast={setToast}
        />
      </>
    );
  }

  if (isLoginPage) {
    return (
      <>
        {toast ? <Toast type={toast.type} message={toast.message} /> : null}
        <LoginPage
          brandName={brandName}
          form={loginForm}
          isSubmitting={isAuthSubmitting}
          isPasswordVisible={isPasswordVisible}
          isSidebarOpen={isSidebarOpen}
          onChange={handleLoginChange}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onSubmit={handleLoginSubmit}
          onTogglePasswordVisibility={() => setIsPasswordVisible((current) => !current)}
          onToast={setToast}
        />
      </>
    );
  }

  if (isProtectedRoute && !isAuthenticated) {
    return null;
  }

  if (isProfilePage) {
    return (
      <>
        {toast ? <Toast type={toast.type} message={toast.message} /> : null}
        <ProfilePage
          brandName={brandName}
          cart={cart}
          profile={profile}
          isEditing={isProfileEditing}
          isLoading={isProfileLoading}
          isSaving={isProfileSaving}
          form={profileForm}
          isSidebarOpen={isSidebarOpen}
          onChange={handleProfileChange}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onCancelEdit={() => setIsProfileEditing(false)}
          onCompleteProfile={handleCompleteProfile}
          onLogout={handleLogout}
          onSubmit={handleProfileSubmit}
        />
      </>
    );
  }

  if (isPayPage) {
    if (!activeOrder?.orderCode || isPaymentProfileChecking || !isProfileComplete(profile)) {
      return null;
    }

    return (
      <>
        {toast ? <Toast type={toast.type} message={toast.message} /> : null}
        <PaymentPage
          brandName={brandName}
          order={activeOrder}
          cart={cart}
          isSidebarOpen={isSidebarOpen}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onOrderUpdate={(nextOrder) => {
            setActiveOrder(nextOrder);
            window.localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, JSON.stringify(nextOrder));
          }}
          onToast={setToast}
        />
      </>
    );
  }

  if (isOrdersPage) {
    return (
      <>
        {toast ? <Toast type={toast.type} message={toast.message} /> : null}
        <OrdersPage
          brandName={brandName}
          cart={cart}
          order={orderDetails}
          isLoading={isOrderDetailsLoading}
          isSidebarOpen={isSidebarOpen}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      </>
    );
  }

  if (isCartPage) {
    return (
      <>
        {toast ? <Toast type={toast.type} message={toast.message} /> : null}
        <CartPage
          brandName={brandName}
          cart={cart}
          products={products}
          isCartUpdating={isCartUpdating}
          isOrderCreating={isOrderCreating}
          isSidebarOpen={isSidebarOpen}
          onCartQuantityChange={handleCartQuantityChange}
          onCheckout={handleCheckout}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      </>
    );
  }

  if (pathname.startsWith('/products')) {
    if (productSlug) {
      return (
        <>
          {toast ? <Toast type={toast.type} message={toast.message} /> : null}
          <ProductDetailPage
            brandName={brandName}
            cart={cart}
            product={selectedProduct}
            isLoading={isProductDetailLoading}
            isAddingToCart={isAddingToCart}
            isInCart={isProductAlreadyInCart(cart, selectedProduct?.id)}
            isSidebarOpen={isSidebarOpen}
            onAddToCart={handleAddToCart}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onCloseSidebar={() => setIsSidebarOpen(false)}
          />
        </>
      );
    }

    return (
      <>
        {toast ? <Toast type={toast.type} message={toast.message} /> : null}
        <ProductsPage
          brandName={brandName}
          cart={cart}
          products={products}
          isLoading={isProductsLoading}
          isSidebarOpen={isSidebarOpen}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      {toast ? <Toast type={toast.type} message={toast.message} /> : null}
      <div className="storefront-shell">
      <StorefrontSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <header className="storefront-topbar">
        <div className="storefront-topbar-inner">
          <BurgerButton onClick={() => setIsSidebarOpen(true)} />
          <button type="button" className="storefront-wordmark" onClick={() => goTo('/')}>{brandName}</button>
          <div className="storefront-topbar-actions">
            <nav className="storefront-nav">
              <a href="#hero">Home</a>
              <a href="/products">Shop</a>
              <a href="#arrivals">About</a>
            </nav>
            <StorefrontCartBox cart={cart} />
          </div>
        </div>
      </header>

      <main className="storefront-main">
        <section className="storefront-quote">
          <div className="storefront-quote-line" />
          <div className="storefront-quote-copy">
            <p>"{quote}"</p>
            <span>{quoteCaption}</span>
          </div>
        </section>

        <section id="hero" className="storefront-hero">
          {isLoading ? <div className="storefront-loading-banner">Loading the public storefront...</div> : null}
          {heroSlides.map((slide) => (
            <article key={slide.title} className="storefront-hero-card">
              <img src={slide.image} alt={slide.title} />
              <div className="storefront-hero-overlay">
                <span>{slide.eyebrow}</span>
                <h1>{slide.title}</h1>
                <a href={slide.href}>{slide.ctaLabel}</a>
              </div>
            </article>
          ))}
        </section>

        <section id="collections" className="storefront-categories">
          {categories.map((category) => (
            <article
              key={category.name}
              className={`storefront-category-card${category.emphasis === 'large' ? ' is-large' : ''}${category.emphasis === 'wide' ? ' is-wide' : ''}`}
            >
              <img src={category.image} alt={category.name} />
              <div className="storefront-category-overlay">
                <h2>{category.name}</h2>
                <p>{category.caption}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="storefront-section">
          <div className="storefront-section-head">
            <div>
              <div className="storefront-section-title-row">
                <h2>Trending</h2>
                <span className="storefront-timer">04:59:12</span>
              </div>
              <p>Most wanted pieces this week</p>
            </div>
            <button type="button" className="storefront-link-button">View All</button>
          </div>
          <div className="storefront-scroll-row">
            {trendingItems.map((item) => (
              <a key={item.title} href={item.href} className="storefront-product-card storefront-home-product-link">
                <div className="storefront-product-image-wrap">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="storefront-product-meta">
                  <div>
                    <p>{item.family}</p>
                    <h3>{item.title}</h3>
                  </div>
                  <div className="storefront-price-block">
                    <strong>{item.price}</strong>
                    {item.compareAt && item.compareAt !== item.price ? <span>{item.compareAt}</span> : null}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section id="arrivals" className="storefront-arrivals">
          <div className="storefront-section-head is-arrivals">
            <div>
              <h2>New Arrivals</h2>
              <p>Direct from our studio to your doorstep. Fresh designs dropped daily for the conscious curator.</p>
            </div>

          </div>
          <div className="storefront-scroll-row">
            {arrivals.map((item) => (
              <a key={item.title} href={item.href} className="storefront-arrival-card storefront-home-product-link">
                <div className="storefront-arrival-image-wrap">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="storefront-arrival-copy">
                  <h3>{item.title}</h3>
                  <p>{item.family}</p>
                  <strong>{item.price}</strong>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="storefront-newsletter">
          <div className="storefront-newsletter-card">
            <span className="storefront-newsletter-icon">Contact</span>
            <h2>Contact Info</h2>
            <p>Reach us directly for product questions, order support, and collaboration inquiries.</p>
            <div className="storefront-contact-grid">
              <a href="mailto:rahulsewa1616@gmail.com">
                <span>Email</span>
                <strong>rahulsewa1616@gmail.com</strong>
              </a>
              <a href="tel:9815158185">
                <span>Phone</span>
                <strong>9815158185</strong>
              </a>
              <a href="https://www.instagram.com/rahulsewa07/?hl=en" target="_blank" rel="noreferrer">
                <span>Instagram</span>
                <strong>@rahulsewa07</strong>
              </a>
              <a href="https://www.facebook.com/ra.hul.509643/" target="_blank" rel="noreferrer">
                <span>Facebook</span>
                <strong>ra.hul.509643</strong>
              </a>
            </div>
          </div>
        </section>
      </main>

      <nav className="storefront-mobile-nav">
        <button type="button" className="is-active">Home</button>
        <button type="button" onClick={() => { goTo('/products'); }}>Shop</button>
        <button type="button">Wishlist</button>
        <button type="button" onClick={() => { goTo('/cart'); }}>Cart</button>
        <button type="button">History</button>
      </nav>
      </div>
    </>
  );
}

export default StorefrontApp;
