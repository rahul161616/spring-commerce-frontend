function Sidebar({ activeView, isOpen, navItems, onChangeView, onClose }) {
  return (
    <>
      <button
        type="button"
        className={`sidebar-scrim ${isOpen ? 'is-visible' : ''}`}
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="brand-block">
        <span className="brand-mark">SC</span>
        <div>
          <p className="eyebrow">Atelier Admin</p>
          <h1>Spring Commerce</h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activeView === item.id ? 'is-active' : ''} ${item.disabled ? 'is-disabled' : ''}`}
            onClick={() => {
              if (item.disabled) {
                return;
              }

              onChangeView(item.id);
              onClose();
            }}
            disabled={item.disabled}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="profile-card">
        <div className="avatar-ring">A</div>
        <div>
          <strong>Admin Profile</strong>
          <p>Retail management workspace</p>
        </div>
      </div>
      </aside>
    </>
  );
}

export default Sidebar;
