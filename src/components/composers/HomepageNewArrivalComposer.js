function HomepageNewArrivalComposer({
  categories,
  form,
  isSubmitting,
  mode = 'create',
  onChange,
  onClose,
  onSubmit,
  tags,
}) {
  const isEdit = mode === 'edit';
  const ruleStateLabel = form.isActive ? 'Active' : 'Inactive';

  return (
    <div className="composer-backdrop" role="dialog" aria-modal="true">
      <div className="composer-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{isEdit ? 'Edit New Arrivals Rule' : 'New New Arrivals Rule'}</p>
            <h3>{isEdit ? 'Update arrivals rule' : 'Create arrivals rule'}</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>Close</button>
        </div>

        <form className="composer-form" onSubmit={onSubmit}>
          <div className="field-grid">
            <label className="field">
              <span>Limit Count</span>
              <input min="1" name="limitCount" type="number" value={form.limitCount} onChange={onChange} required />
            </label>

            <label className="field">
              <span>Category</span>
              <select name="categoryId" value={form.categoryId} onChange={onChange}>
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Tag</span>
              <select name="tagId" value={form.tagId} onChange={onChange}>
                <option value="">All tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="homepage-composer-toggles">
            <label className="toggle-row compact-toggle">
              <input name="onlyActive" type="checkbox" checked={form.onlyActive} onChange={onChange} />
              <span>Use only active products</span>
            </label>
            <label className="toggle-row compact-toggle">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={onChange} />
              <span>{`Rule status: ${ruleStateLabel}`}</span>
            </label>
          </div>

          <div className="composer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button compact" disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Rule' : 'Create Rule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HomepageNewArrivalComposer;
