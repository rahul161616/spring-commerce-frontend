function HomepageHeroComposer({
  categories,
  form,
  isSubmitting,
  mode = 'create',
  onChange,
  onClose,
  onSubmit,
  products,
}) {
  const isEdit = mode === 'edit';
  const heroStateLabel = form.isActive ? 'Active' : 'Inactive';

  return (
    <div className="composer-backdrop" role="dialog" aria-modal="true">
      <div className="composer-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{isEdit ? 'Edit Hero' : 'New Hero'}</p>
            <h3>{isEdit ? 'Update homepage hero' : 'Create homepage hero'}</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>Close</button>
        </div>

        <form className="composer-form" onSubmit={onSubmit}>
          <div className="field-grid">
            <label className="field">
              <span>Eyebrow</span>
              <input name="eyebrow" value={form.eyebrow} onChange={onChange} placeholder="New Stock" required />
            </label>

            <label className="field">
              <span>CTA Label</span>
              <input name="ctaLabel" value={form.ctaLabel} onChange={onChange} placeholder="Shop Collection" required />
            </label>

            <label className="field field-full">
              <span>Title</span>
              <input name="title" value={form.title} onChange={onChange} placeholder="The Autumn Revision" required />
            </label>

            <label className="field field-full">
              <span>Supporting Text</span>
              <textarea name="supportingText" value={form.supportingText} onChange={onChange} placeholder="Editorial support copy for the hero campaign." rows={4} />
            </label>

            <label className="field field-full">
              <span>Image URL</span>
              <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://example.com/hero.jpg" required />
            </label>

            <label className="field field-full">
              <span>CTA URL</span>
              <input name="ctaUrl" value={form.ctaUrl} onChange={onChange} placeholder="/collections/autumn-revision" required />
            </label>

            <label className="field">
              <span>Linked Product</span>
              <select name="linkProductId" value={form.linkProductId} onChange={onChange} disabled={form.unlinkProduct}>
                <option value="">No linked product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Linked Category</span>
              <select name="linkCategoryId" value={form.linkCategoryId} onChange={onChange} disabled={form.unlinkCategory}>
                <option value="">No linked category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="homepage-composer-toggles">
            <label className="toggle-row compact-toggle">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={onChange} />
              <span>{`Hero status: ${heroStateLabel}`}</span>
            </label>
            <label className="toggle-row compact-toggle">
              <input name="unlinkProduct" type="checkbox" checked={form.unlinkProduct} onChange={onChange} />
              <span>Unlink product</span>
            </label>
            <label className="toggle-row compact-toggle">
              <input name="unlinkCategory" type="checkbox" checked={form.unlinkCategory} onChange={onChange} />
              <span>Unlink category</span>
            </label>
          </div>

          <div className="composer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button compact" disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Hero' : 'Create Hero')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HomepageHeroComposer;
