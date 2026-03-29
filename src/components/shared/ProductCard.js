import MetricField from './MetricField';

function ProductCard({ onSelect, product }) {
  const status = product.stockQuantity === 0
    ? { label: 'Out of Stock', className: 'danger' }
    : product.stockQuantity <= 10
      ? { label: 'Low Stock', className: 'warning' }
      : { label: 'In Stock', className: 'success' };

  return (
    <button type="button" className="product-card product-card-button" onClick={() => onSelect(product.id)}>
      <div className="product-visual">
        <span className="product-badge">{product.category}</span>
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
            <p>{product.sku}</p>
          </div>
          <div className="price-block">
            <strong>${product.price.toFixed(2)}</strong>
            <span className={`status-pill ${status.className}`}>{status.label}</span>
          </div>
        </div>

        <div className="metric-grid">
          <MetricField label="Stock Level" value={product.stockQuantity} />
          <MetricField label="Images" value={product.images.length} />
        </div>
      </div>
    </button>
  );
}

export default ProductCard;
