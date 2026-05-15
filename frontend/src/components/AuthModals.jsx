/**
 * AuthModals — Modal đăng nhập & đăng ký
 * Props: modal, setModal, doAuth
 */
export default function AuthModals({ modal, setModal, doAuth }) {
  if (modal === 'login') return (
    <div className="modal-overlay" onClick={() => setModal(null)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Đăng Nhập</h2>
        <form onSubmit={e => doAuth(e, false)}>
          <div className="form-group"><label className="form-label">Tên đăng nhập</label>
            <input name="username" className="input" required /></div>
          <div className="form-group"><label className="form-label">Mật khẩu</label>
            <input name="password" type="password" className="input" required /></div>
          <button className="btn btn-cta btn-lg btn-block">ĐĂNG NHẬP</button>
        </form>
        <p className="text-center text-sm mt-2 text-dim">Chưa có tài khoản?{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setModal('register')}>Đăng ký ngay</span></p>
      </div>
    </div>
  )

  if (modal === 'register') return (
    <div className="modal-overlay" onClick={() => setModal(null)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Đăng Ký Tài Khoản</h2>
        <form onSubmit={e => doAuth(e, true)}>
          <div className="form-group"><label className="form-label">Tên đăng nhập</label>
            <input name="username" className="input" required /></div>
          <div className="form-group"><label className="form-label">Mật khẩu (≥6 ký tự)</label>
            <input name="password" type="password" className="input" required /></div>
          <div className="form-group"><label className="form-label">Họ tên</label>
            <input name="fullName" className="input" /></div>
          <div className="form-group"><label className="form-label">Số điện thoại</label>
            <input name="phone" className="input" /></div>
          <button className="btn btn-cta btn-lg btn-block">ĐĂNG KÝ</button>
        </form>
        <p className="text-center text-sm mt-2 text-dim">Đã có tài khoản?{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
            onClick={() => setModal('login')}>Đăng nhập</span></p>
      </div>
    </div>
  )

  return null
}
