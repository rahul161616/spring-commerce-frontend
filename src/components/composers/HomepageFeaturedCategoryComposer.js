function HomepageFeaturedCategoryComposer({
  categories,
  form,
  isSubmitting,
  mode = 'create',
  onChange,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === 'edit';
  const categoryStateLabel = form.isActive ? 'Active' : 'Inactive';
  const emphasisOptions = ['LARGE', 'REGULAR', 'WIDE'];

  return (
    <div className="composer-backdrop" role="dialog" aria-modal="true">
      <div className="composer-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{isEdit ? 'Edit Featured Category' : 'New Featured Category'}</p>
            <h3>{isEdit ? 'Update homepage category tile' : 'Create homepage category tile'}</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>Close</button>
        </div>

        <form className="composer-form" onSubmit={onSubmit}>
          <div className="field-grid">
            <label className="field field-full">
              <span>Category</span>
              <select name="categoryId" value={form.categoryId} onChange={onChange} required>
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Emphasis</span>
              <select name="emphasis" value={form.emphasis} onChange={onChange} required>
                {emphasisOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="field field-full">
              <span>Caption</span>
              <input name="caption" value={form.caption} onChange={onChange} placeholder="Elevated essentials" required />
            </label>

            <label className="field field-full">
              <span>Image URL</span>
              <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://example.com/category.jpg" required />
            </label>
          </div>

          <label className="toggle-row">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={onChange} />
            <span>{`Featured tile status: ${categoryStateLabel}`}</span>
          </label>

          <div className="composer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button compact" disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Tile' : 'Create Tile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HomepageFeaturedCategoryComposer;
