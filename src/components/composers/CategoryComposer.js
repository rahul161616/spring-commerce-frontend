function CategoryComposer({ form, isLoadingParentOptions, isSubmitting, mode = 'create', onChange, onClose, onSubmit, parentOptions }) {
  const isEdit = mode === 'edit';
  const categoryStateLabel = form.isActive ? 'Active' : 'Inactive';
  const categoryStateHint = form.isActive
    ? 'Turn this off to make the category inactive.'
    : 'Turn this on to make the category active.';

  return (
    <div className="composer-backdrop" role="dialog" aria-modal="true">
      <div className="composer-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{isEdit ? 'Edit Category' : 'New Category'}</p>
            <h3>{isEdit ? 'Update category' : 'Create category'}</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>Close</button>
        </div>

        <form className="composer-form" onSubmit={onSubmit}>
          <div className="field-grid">
            <label className="field field-full">
              <span>Name</span>
              <input name="name" value={form.name} onChange={onChange} placeholder="Eyewear" required />
            </label>

            <label className="field field-full">
              <span>Description</span>
              <textarea name="description" value={form.description} onChange={onChange} placeholder="Premium eyewear collection" required />
            </label>

            <label className="field field-full">
              <span>Parent Category</span>
              <select name="parentId" value={form.parentId} onChange={onChange} disabled={isLoadingParentOptions}>
                <option value="">No parent (root category)</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.parentName ? `${option.parentName} > ${option.name}` : option.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="toggle-row">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={onChange} />
            <span>{`Category status: ${categoryStateLabel}`}</span>
            <small>{categoryStateHint}</small>
          </label>

          <div className="composer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button compact" disabled={isSubmitting || isLoadingParentOptions}>
              {isSubmitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryComposer;
