function TagComposer({ form, isSubmitting, mode = 'create', onChange, onClose, onSubmit }) {
  const isEdit = mode === 'edit';
  const tagStateLabel = form.isActive ? 'Active' : 'Inactive';
  const tagStateHint = form.isActive
    ? 'Turn this off to make the tag inactive.'
    : 'Turn this on to make the tag active.';

  return (
    <div className="composer-backdrop" role="dialog" aria-modal="true">
      <div className="composer-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">{isEdit ? 'Edit Tag' : 'New Tag'}</p>
            <h3>{isEdit ? 'Update tag' : 'Create tag'}</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose}>Close</button>
        </div>

        <form className="composer-form" onSubmit={onSubmit}>
          <div className="field-grid">
            <label className="field field-full">
              <span>Name</span>
              <input name="name" value={form.name} onChange={onChange} placeholder="Summer" required />
            </label>

            <label className="field field-full">
              <span>Description</span>
              <textarea name="description" value={form.description} onChange={onChange} placeholder="Seasonal collection marker" required />
            </label>
          </div>

          <label className="toggle-row">
            <input name="isActive" type="checkbox" checked={form.isActive} onChange={onChange} />
            <span>{`Tag status: ${tagStateLabel}`}</span>
            <small>{tagStateHint}</small>
          </label>

          <div className="composer-actions">
            <button type="button" className="ghost-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button compact" disabled={isSubmitting}>
              {isSubmitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Tag' : 'Create Tag')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TagComposer;
