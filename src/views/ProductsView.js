import EmptyCard from '../components/shared/EmptyCard';
import LoadingCard from '../components/shared/LoadingCard';
import ProductCard from '../components/shared/ProductCard';
import SummaryCard from '../components/shared/SummaryCard';

function ProductsView({
  activeStatusFilter,
  isLoadingProducts,
  onAddProduct,
  onSelectProduct,
  onStatusFilterChange,
  productFilters,
  products,
  productSummary,
  tags,
}) {
  return (
    <>
      <section className="summary-grid">
        <SummaryCard label="Total Products" value={productSummary.totalProducts} tone="default" />
        <SummaryCard label="Low Stock" value={productSummary.lowStock} tone="warning" />
        <SummaryCard label="Out of Stock" value={productSummary.outOfStock} tone="danger" />
        <SummaryCard label="Tag Options" value={tags.length} tone="accent" />
      </section>

      <section className="product-filter-row" aria-label="Product status filters">
        {productFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className={`product-filter-chip ${activeStatusFilter === filter.id ? 'is-active' : ''}`}
            onClick={() => onStatusFilterChange(filter.id)}
          >
            <span>{filter.label}</span>
            <strong>{filter.count}</strong>
          </button>
        ))}
      </section>

      <section className="catalog-grid">
        {isLoadingProducts ? (
          <LoadingCard label="Loading catalog..." />
        ) : products.length ? (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))
        ) : (
          <EmptyCard label={activeStatusFilter === 'ALL' ? 'No products available yet.' : `No ${activeStatusFilter.toLowerCase()} products found.`} />
        )}

        <button type="button" className="add-card" onClick={onAddProduct}>
          <span>+</span>
          <strong>Add New Product</strong>
        </button>
      </section>
    </>
  );
}

export default ProductsView;
