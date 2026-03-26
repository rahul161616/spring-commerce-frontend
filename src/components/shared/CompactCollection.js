function CompactCollection({ addLabel, children, countLabel, emptyLabel, hasItems, isLoading, loadingLabel, onAdd, title }) {
  return (
    <section className="compact-collection">
      <div className="compact-collection-header">
        <div>
          <p className="eyebrow">Dense View</p>
          <h3>{title}</h3>
        </div>
        <div className="compact-collection-actions">
          <span className="compact-count">{countLabel}</span>
          <button type="button" className="primary-button compact dense-action" onClick={onAdd}>
            {addLabel}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="compact-empty">{loadingLabel}</div>
      ) : hasItems ? (
        <div className="compact-table-shell">{children}</div>
      ) : (
        <div className="compact-empty">{emptyLabel}</div>
      )}
    </section>
  );
}

export function CompactTable({ children }) {
  return (
    <div className="compact-table-scroll">
      <table className="compact-table">
        {children}
      </table>
    </div>
  );
}

export function CompactTableHeader({ columns }) {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={column} scope="col">{column}</th>
        ))}
      </tr>
    </thead>
  );
}

export function CategoryRow({ category }) {
  return (
    <tr>
      <td>
        <div className="compact-primary">
          <strong>{category.name}</strong>
          <span>#{category.id}</span>
        </div>
      </td>
      <td className="compact-mono">{category.slug}</td>
      <td>{category.parentName || 'Root'}</td>
      <td className="compact-description-cell">{category.description || 'No description'}</td>
      <td className="compact-state-cell">
        <span className={`status-pill ${category.isActive ? 'success' : 'danger'}`}>
          {category.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
    </tr>
  );
}

export function TagRow({ tag }) {
  return (
    <tr>
      <td>
        <div className="compact-primary">
          <strong>#{tag.name}</strong>
          <span>#{tag.id}</span>
        </div>
      </td>
      <td className="compact-mono">{tag.slug}</td>
      <td className="compact-description-cell">{tag.description || 'No description'}</td>
      <td className="compact-state-cell">
        <span className={`status-pill ${tag.isActive ? 'success' : 'danger'}`}>
          {tag.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
    </tr>
  );
}

export default CompactCollection;
