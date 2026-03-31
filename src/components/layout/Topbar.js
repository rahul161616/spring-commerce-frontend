function Topbar({ activeView, onToggleSidebar }) {
  const viewLabel = activeView === 'homepage'
    ? 'Homepage Studio'
    : activeView === 'categories'
      ? 'Taxonomy'
      : activeView === 'tags'
        ? 'Tag Control'
        : 'Product Catalog';

  return (
    <header className="topbar">
      <div className="topbar-leading">
        <button type="button" className="menu-toggle" onClick={onToggleSidebar} aria-label="Toggle navigation">
          <span className="burger-line" />
          <span className="burger-line" />
          <span className="burger-line" />
        </button>
        <div className="topbar-context">
          <span className="context-pill live">Admin Live</span>
          <span className="context-pill">{viewLabel}</span>
          <span className="context-text">Ready for desktop and phone review</span>
        </div>
      </div>
      <div className="search-shell">
        <span className="search-icon">Search</span>
        <input
          type="search"
          placeholder={
            activeView === 'homepage'
              ? 'Search homepage sections...'
              : activeView === 'categories'
                ? 'Search categories...'
                : activeView === 'tags'
                  ? 'Search tags...'
                  : 'Search catalog...'
          }
        />
      </div>
      <div className="top-icons">
        <button type="button">Alerts</button>
        <button type="button">Profile</button>
      </div>
    </header>
  );
}

export default Topbar;
