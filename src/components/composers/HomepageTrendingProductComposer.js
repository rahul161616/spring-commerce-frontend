function HomepageTrendingProductComposer({
  form,
  isSubmitting,
  mode = 'create',
  onChange,
  onClose,
  onSubmit,
  products,
}) {
  const isEdit = mode === 'edit';
  const productStateLabel = form.isActive ? 'Active' : 'Inactive';

  return (
    <div className="composer-backdrop" role="dialog" aria-modal="true">
      <div className="composer-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{isEdit ? 'Edit Trending Product' : 'New Trending Product'}</p>
            <h3>{isEdit ? 'Update trending rail item' : 'Create trending rail item'}</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>Close</button>
        </div>

        <form className="composer-form" onSubmit={onSubmit}>
          <div className="field-grid">
            <label className="field field-full">
              <span>Product</span>
              <select name="productId" value={form.productId} onChange={onChange} required>
                <option value="">Choose a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </label>

            <label className="field field-full">
              <span>Label</span>
              <input name="label" value={form.label} onChange={onChange} placeholder="Performance" />
            </label>
          </div>

          <label className="toggle-row">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={onChange} />
            <span>{`Trending item status: ${productStateLabel}`}</span>
          </label>

          <div className="composer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button compact" disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HomepageTrendingProductComposer;
