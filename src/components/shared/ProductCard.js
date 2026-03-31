function ProductCard({ onSelect, product }) {
  const status = product.stockQuantity === 0
    ? { label: 'Out of Stock', className: 'danger' }
    : product.stockQuantity <= 10
      ? { label: 'Low Stock', className: 'warning' }
      : { label: 'In Stock', className: 'success' };
  const productStatus = product.status || 'DRAFT';

  return (
    <button type="button" className="product-card product-card-button" onClick={() => onSelect(product.id)}>
      <div className="product-visual">
        <div className="product-card-topline">
          <span className="product-badge">{product.category}</span>
          <span className={`status-pill product-state-pill is-${productStatus.toLowerCase()}`}>{productStatus}</span>
        </div>
        <div className="product-placeholder has-image">
          {product.primaryImageUrl ? (
            <img src={product.primaryImageUrl} alt={product.name} className="product-image" />
          ) : (
            <span>{product.imageLabel}</span>
          )}
        </div>
      </div>

      <div className="product-content">
        <div className="product-row">
          <div>
            <h3>{product.name}</h3>
            <p>{product.description?.trim() ? product.description : 'No description provided.'}</p>
          </div>
          <div className="price-block">
            <strong>${product.price.toFixed(2)}</strong>
            {product.compareAt > product.price ? (
              <small className="price-compare">${product.compareAt.toFixed(2)}</small>
            ) : null}
            <span className={`status-pill ${status.className}`}>{status.label}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default ProductCard;
