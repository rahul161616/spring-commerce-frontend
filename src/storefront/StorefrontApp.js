import { useEffect, useState } from 'react';
import { fetchPublicProductBySlug, fetchPublicProducts, fetchStorefrontContent } from '../api/public/storefront';
import './storefront.css';

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
          <button type="button">Profile</button>
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

function StorefrontCartBox() {
  return (
    <button type="button" className="storefront-cart-box" aria-label="Cart preview">
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
        <strong>1 Item</strong>
      </div>
    </button>
  );
}

function ProductDetailPage({ brandName, product, isLoading, isSidebarOpen, onOpenSidebar, onCloseSidebar }) {
  const gallery = product?.image ? [product.image, product.image, product.image] : [];

  return (
    <div className="storefront-shell">
      <StorefrontSidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <header className="storefront-topbar">
        <div className="storefront-topbar-inner">
          <BurgerButton onClick={onOpenSidebar} />
          <div className="storefront-wordmark">{brandName}</div>
          <div className="storefront-topbar-actions">
            <button type="button" className="storefront-icon-button" aria-label="Search">
              Search
            </button>
            <StorefrontCartBox />
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
                  <button type="button" className="storefront-detail-primary">Add to Bag</button>
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
        <button type="button" onClick={() => { window.location.href = '/'; }}>Home</button>
        <button type="button" className="is-active">Shop</button>
        <button type="button">Wishlist</button>
        <button type="button">Cart</button>
        <button type="button">History</button>
      </nav>
    </div>
  );
}

function ProductsPage({ brandName, products, isLoading, isSidebarOpen, onOpenSidebar, onCloseSidebar }) {
  return (
    <div className="storefront-shell">
      <StorefrontSidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      <header className="storefront-topbar">
        <div className="storefront-topbar-inner">
          <BurgerButton onClick={onOpenSidebar} />
          <div className="storefront-wordmark">{brandName}</div>
          <div className="storefront-topbar-actions">
            <nav className="storefront-nav">
              <a href="/">Home</a>
              <a href="/products">Shop</a>
              <a href="#about">About</a>
            </nav>
            <StorefrontCartBox />
          </div>
        </div>
      </header>

      <main className="storefront-main storefront-products-page">
        <section className="storefront-products-hero storefront-products-hero-centered">
          <p className="storefront-products-kicker">Shop</p>
          <h1>All Products</h1>
          <p>Browse the full catalog in the same visual language as the homepage. This page is ready for your public product flow.</p>
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
        <button type="button" onClick={() => { window.location.href = '/'; }}>Home</button>
        <button type="button" className="is-active">Shop</button>
        <button type="button">Wishlist</button>
        <button type="button">Cart</button>
        <button type="button">History</button>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = window.location.pathname;
  const productSlug = pathname.startsWith('/products/') ? pathname.replace('/products/', '') : null;

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      setIsLoading(true);
      setIsProductsLoading(true);

      const [nextContent, nextProducts] = await Promise.all([
        fetchStorefrontContent(),
        fetchPublicProducts(),
      ]);

      if (isMounted) {
        setContent(nextContent);
        setProducts(nextProducts);
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

  const heroSlides = content.heroSlides;
  const categories = content.featuredCategories;
  const trendingItems = content.trendingProducts;
  const arrivals = content.newArrivals;
  const brandName = content.brandName;
  const quote = content.quote;
  const quoteCaption = content.quoteCaption;
  if (pathname.startsWith('/products')) {
    if (productSlug) {
      return (
        <ProductDetailPage
          brandName={brandName}
          product={selectedProduct}
          isLoading={isProductDetailLoading}
          isSidebarOpen={isSidebarOpen}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      );
    }

    return (
      <ProductsPage
        brandName={brandName}
        products={products}
        isLoading={isProductsLoading}
        isSidebarOpen={isSidebarOpen}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      />
    );
  }

  return (
    <div className="storefront-shell">
      <StorefrontSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <header className="storefront-topbar">
        <div className="storefront-topbar-inner">
          <BurgerButton onClick={() => setIsSidebarOpen(true)} />
          <div className="storefront-wordmark">{brandName}</div>
          <div className="storefront-topbar-actions">
            <nav className="storefront-nav">
              <a href="#hero">Home</a>
              <a href="/products">Shop</a>
              <a href="#arrivals">About</a>
            </nav>
            <StorefrontCartBox />
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
              <article key={item.title} className="storefront-product-card">
                <div className="storefront-product-image-wrap">
                  <img src={item.image} alt={item.title} />
                  <button type="button" className="storefront-favorite">Like</button>
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
              </article>
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
              <article key={item.title} className="storefront-arrival-card">
                <div className="storefront-arrival-image-wrap">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="storefront-arrival-copy">
                  <h3>{item.title}</h3>
                  <p>{item.family}</p>
                  <strong>{item.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="storefront-newsletter">
          <div className="storefront-newsletter-card">
            <span className="storefront-newsletter-icon">Mail</span>
            <h2>Join The Circle</h2>
            <p>Get early access to drops, exclusive lookbooks, and invitations to our gallery events.</p>
            <div className="storefront-newsletter-form">
              <input type="email" placeholder="Your email address" />
              <button type="button">Subscribe</button>
            </div>
          </div>
        </section>
      </main>

      <nav className="storefront-mobile-nav">
        <button type="button" className="is-active">Home</button>
        <button type="button" onClick={() => { window.location.href = '/products'; }}>Shop</button>
        <button type="button">Wishlist</button>
        <button type="button">Cart</button>
        <button type="button">History</button>
      </nav>
    </div>
  );
}

export default StorefrontApp;
