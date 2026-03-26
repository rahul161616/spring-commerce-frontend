import EmptyCard from '../components/shared/EmptyCard';
import LoadingCard from '../components/shared/LoadingCard';
import ProductCard from '../components/shared/ProductCard';
import SummaryCard from '../components/shared/SummaryCard';

function ProductsView({ isLoadingProducts, onAddProduct, products, productSummary, tags }) {
  return (
    <>
      <section className="summary-grid">
        <SummaryCard label="Total Products" value={productSummary.totalProducts} tone="default" />
        <SummaryCard label="Low Stock" value={productSummary.lowStock} tone="warning" />
        <SummaryCard label="Out of Stock" value={productSummary.outOfStock} tone="danger" />
        <SummaryCard label="Tag Options" value={tags.length} tone="accent" />
      </section>

      <section className="catalog-grid">
        {isLoadingProducts ? (
          <LoadingCard label="Loading catalog..." />
        ) : products.length ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <EmptyCard label="No products available yet." />
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
