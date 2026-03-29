import { useEffect, useMemo, useState } from 'react';

function ProductDetailsModal({ isLoading, onClose, onDelete, onEdit, product }) {
  const images = useMemo(() => product?.images?.length ? product.images : [], [product]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const activeImage = images[activeIndex] || null;
  const stockTone = product?.stockQuantity === 0
    ? 'danger'
    : product?.stockQuantity <= 10
      ? 'warning'
      : 'success';

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id]);

  function showImage(nextIndex) {
    if (!images.length) {
      return;
    }

    const boundedIndex = (nextIndex + images.length) % images.length;
    setActiveIndex(boundedIndex);
  }

  function handleTouchStart(event) {
    setTouchStartX(event.changedTouches[0]?.clientX ?? null);
  }

  function handleTouchEnd(event) {
    const endX = event.changedTouches[0]?.clientX ?? null;
    if (touchStartX == null || endX == null) {
      return;
    }

    const deltaX = endX - touchStartX;
    if (Math.abs(deltaX) < 30) {
      return;
    }

    showImage(deltaX < 0 ? activeIndex + 1 : activeIndex - 1);
  }

  return (
    <div className="composer-backdrop" role="presentation" onClick={onClose}>
      <section
        className="composer-panel product-details-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Product details"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-header">
          <div>
            <p className="eyebrow">Product Details</p>
            <h3>{isLoading ? 'Loading product...' : product?.name || 'Product detail'}</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>Close</button>
        </div>

        {isLoading ? (
          <div className="detail-empty">Loading product information...</div>
        ) : product ? (
          <div className="product-detail-layout">
            <div className="detail-gallery-shell">
              <div
                className="detail-gallery-stage"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {activeImage ? (
                  <img src={activeImage.imageUrl} alt={product.name} className="detail-gallery-image" />
                ) : (
                  <div className="detail-gallery-fallback">No product images yet.</div>
                )}
              </div>

              {images.length > 1 ? (
                <div className="detail-gallery-thumbs">
                  {images.map((image, index) => (
                    <button
                      key={image.id || `${image.imageUrl}-${index}`}
                      type="button"
                      className={`detail-thumb ${index === activeIndex ? 'is-active' : ''}`}
                      onClick={() => showImage(index)}
                    >
                      <img src={image.imageUrl} alt={`${product.name} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="detail-copy">
              <div className="detail-heading">
                <span className="product-badge">{product.category}</span>
                <span className={`status-pill ${stockTone}`}>
                  {product.stockQuantity === 0 ? 'Out of Stock' : product.stockQuantity <= 10 ? 'Low Stock' : 'In Stock'}
                </span>
              </div>

              <div className="detail-price">${product.price.toFixed(2)}</div>

              <div className="detail-grid">
                <div className="detail-field">
                  <span>Slug</span>
                  <strong>{product.sku}</strong>
                </div>
                <div className="detail-field">
                  <span>Stock Quantity</span>
                  <strong>{product.stockQuantity}</strong>
                </div>
                <div className="detail-field">
                  <span>Images</span>
                  <strong>{images.length}</strong>
                </div>
                <div className="detail-field">
                  <span>Tags</span>
                  <strong>{product.tags.length || 0}</strong>
                </div>
              </div>

              <div className="detail-tags">
                <span>Tag List</span>
                <div className="detail-tag-row">
                  {product.tags.length ? product.tags.map((tag) => (
                    <span key={tag} className="detail-tag">{tag}</span>
                  )) : <span className="detail-tag muted">No tags assigned</span>}
                </div>
              </div>

              <div className="detail-actions">
                <button type="button" className="primary-button compact" onClick={() => onEdit(product)}>
                  Update Product
                </button>
                <button type="button" className="ghost-button detail-danger" onClick={() => onDelete(product)}>
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="detail-empty">Product details could not be loaded.</div>
        )}
      </section>
    </div>
  );
}

export default ProductDetailsModal;
