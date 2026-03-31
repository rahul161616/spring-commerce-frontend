function ProductComposer({ categories, form, isLoadingCategories, isLoadingTags, isSubmitting, mode = 'create', onChange, onClose, onSubmit, onTagToggle, tags }) {
  const hasCategories = categories.length > 0;
  const hasTags = tags.length > 0;
  const isEdit = mode === 'edit';

  return (
    <div className="composer-backdrop" role="dialog" aria-modal="true">
      <div className="composer-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{isEdit ? 'Edit Product' : 'New Product'}</p>
            <h3>{isEdit ? 'Update product' : 'Create product'}</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>Close</button>
        </div>

        <form className="composer-form" onSubmit={onSubmit}>
          <div className="field-grid">
            <label className="field">
              <span>Name</span>
              <input name="name" value={form.name} onChange={onChange} placeholder="Bay" required />
            </label>

            <label className="field">
              <span>Price</span>
              <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} required />
            </label>

            <label className="field">
              <span>Compare-at price</span>
              <input
                name="compareAt"
                type="number"
                step="0.01"
                min="0"
                value={form.compareAt}
                onChange={onChange}
                placeholder="Optional"
              />
            </label>

            <label className="field field-full">
              <span>Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Glass for men"
                required={!isEdit}
              />
            </label>

            <label className="field">
              <span>Stock quantity</span>
              <input name="stockQuantity" type="number" min="0" value={form.stockQuantity} onChange={onChange} required />
            </label>

            <label className="field">
              <span>Category</span>
              <select name="categoryId" value={form.categoryId} onChange={onChange} required disabled={isLoadingCategories || !hasCategories}>
                {isLoadingCategories ? <option value="">Loading categories...</option> : null}
                {!isLoadingCategories && !hasCategories ? <option value="">No categories available</option> : null}
                {!isLoadingCategories && hasCategories
                  ? categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))
                  : null}
              </select>
            </label>

            <div className="field field-full">
              <span>Tags</span>
              <div className="selection-grid">
                {isLoadingTags ? <div className="selection-empty">Loading tags...</div> : null}
                {!isLoadingTags && !hasTags ? <div className="selection-empty">No tags available</div> : null}
                {!isLoadingTags && hasTags
                  ? tags.map((tag) => {
                    const checked = form.tagIds.includes(tag.id);

                    return (
                      <label key={tag.id} className={`selection-chip ${checked ? 'is-selected' : ''}`}>
                        <input type="checkbox" checked={checked} onChange={() => onTagToggle(tag.id)} />
                        <span>{tag.name}</span>
                      </label>
                    );
                  })
                  : null}
              </div>
              <small>Selected tags are submitted as tag ID values.</small>
            </div>

            <label className="field field-full">
              <span>Image URIs</span>
              <textarea
                name="imageUris"
                value={form.imageUris}
                onChange={onChange}
                placeholder={"https://example.com/image-1.jpg\nhttps://example.com/image-2.jpg"}
              />
              <small>Enter one image URI per line. The first image is marked as primary automatically.</small>
            </label>
          </div>

          <label className="toggle-row">
            <input name="isFeatured" type="checkbox" checked={form.isFeatured} onChange={onChange} />
            <span>Feature this product</span>
          </label>

          <div className="composer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button compact" disabled={isSubmitting || isLoadingCategories || !hasCategories}>
              {isSubmitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductComposer;
