/**
 * Header Component — Clean professional design
 * Props: user, uiSettings, cart, setPage, setModal, onLogout
 */
export default function Header({ user, uiSettings, cart, setPage, setModal, onLogout }) {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="logo" onClick={() => setPage('home')}>
          {uiSettings.headerLogo || 'DuyLong'}<span>Tech</span>
        </div>

        <div className="search-bar">
          <input placeholder="Tìm Dell Latitude, ThinkPad X1, MacBook M2..." />
        </div>

        <div className="header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setPage('pcbuild')}>
            Build PC
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setPage('ai')}>
            Tư vấn AI
          </button>

          {/* Cart */}
          <div className="cart-icon" onClick={() => setPage('cart')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>

          {user ? (
            <div className="user-menu admin-dropdown">
              <div className="avatar-circle">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="user-greeting">{user.fullName?.split(' ').pop()}</span>
              
              <div className="admin-dropdown-menu">
                {user.role === 'ADMIN' && (
                  <>
                    <div className="menu-header">QUẢN TRỊ VIÊN</div>
                    <div onClick={() => setPage('admin')}>Dashboard</div>
                    <div onClick={() => setPage('kiosk')}>Kiosk Mode</div>
                    <div onClick={() => setPage('pos')}>Máy POS</div>
                    <div onClick={() => setPage('tech')}>Kỹ thuật (KTV)</div>
                    <div onClick={() => setPage('seo')}>SEO Editor</div>
                  </>
                )}
                {user.role === 'STAFF' && (
                  <>
                    <div className="menu-header">CÔNG CỤ NHÂN VIÊN</div>
                    <div onClick={() => setPage('kiosk')}>Kiosk Mode</div>
                    <div onClick={() => setPage('pos')}>Máy POS</div>
                    <div onClick={() => setPage('tech')}>Kỹ thuật (KTV)</div>
                  </>
                )}
                {user.role === 'SHIPPER' && (
                  <div onClick={() => setPage('shipper')}>🛵 Giao hàng</div>
                )}
                <div className="menu-divider"></div>
                <div onClick={onLogout} style={{ color: 'var(--danger)' }}>Thoát tài khoản</div>
              </div>
            </div>
          ) : (
            <button className="btn btn-accent btn-sm" onClick={() => setModal('login')}>Đăng nhập</button>
          )}
        </div>
      </div>
    </header>
  )
}
