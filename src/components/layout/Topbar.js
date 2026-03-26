function Topbar({ activeView }) {
  return (
    <header className="topbar">
      <div className="search-shell">
        <span className="search-icon">Search</span>
        <input
          type="search"
          placeholder={activeView === 'categories' ? 'Search categories...' : activeView === 'tags' ? 'Search tags...' : 'Search catalog...'}
        />
      </div>
      <nav className="top-links">
        <button type="button">Shades</button>
        <button type="button">Clothes</button>
        <button type="button">Tech</button>
      </nav>
      <div className="top-icons">
        <button type="button">Alerts</button>
        <button type="button">Profile</button>
      </div>
    </header>
  );
}

export default Topbar;
