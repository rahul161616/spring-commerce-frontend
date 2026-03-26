function Sidebar({ activeView, onChangeView }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <span className="brand-mark">SC</span>
        <div>
          <p className="eyebrow">Atelier Admin</p>
          <h1>Spring Commerce</h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button type="button" className="nav-item">Dashboard</button>
        <button type="button" className="nav-item">Orders</button>
        <button type="button" className={`nav-item ${activeView === 'products' ? 'is-active' : ''}`} onClick={() => onChangeView('products')}>
          Products
        </button>
        <button type="button" className={`nav-item ${activeView === 'categories' ? 'is-active' : ''}`} onClick={() => onChangeView('categories')}>
          Categories
        </button>
        <button type="button" className={`nav-item ${activeView === 'tags' ? 'is-active' : ''}`} onClick={() => onChangeView('tags')}>
          Tags
        </button>
        <button type="button" className="nav-item">Customers</button>
        <button type="button" className="nav-item">Settings</button>
      </nav>

      <div className="profile-card">
        <div className="avatar-ring">A</div>
        <div>
          <strong>Admin Profile</strong>
          <p>Retail management workspace</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
