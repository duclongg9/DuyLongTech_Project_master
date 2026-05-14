import { API } from '../api/client'

/**
 * SosModal — Nút nổi và Modal Cứu Nét Khẩn Cấp 24/7
 * Props: user, modal, setModal
 */
export function SosButton({ user, setModal }) {
  if (!user || user.role !== 'CUSTOMER') return null
  return (
    <button className="sos-floating-btn" onClick={() => setModal('sos')}>
      🚨 CỨU NÉT 24/7
    </button>
  )
}

export function SosModal({ user, modal, setModal }) {
  if (modal !== 'sos') return null
  return (
    <div className="modal-overlay" onClick={() => setModal(null)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>🚨 Tech-Care Prime: Cứu Nét Khẩn Cấp</h2>
        <p className="mt-1 mb-2 text-dim">Yêu cầu mượn máy tạm trong thời gian chờ bảo hành. Dành riêng cho thành viên Prime.</p>
        <form onSubmit={e => {
          e.preventDefault()
          if (!navigator.geolocation) return alert('Trình duyệt không hỗ trợ GPS')
          navigator.geolocation.getCurrentPosition(pos => {
            fetch(`${API}/sos/request`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, lat: pos.coords.latitude, lng: pos.coords.longitude, address: e.target.address.value })
            }).then(r => { if (!r.ok) throw new Error(); return r.json() })
              .then(d => {
                if (d.error) alert('❌ ' + d.error)
                else { alert('✅ ' + d.message + '\nMáy được cấp: ' + d.backupDevice); setModal(null) }
              }).catch(() => alert('Lỗi kết nối'))
          }, () => alert('Vui lòng cho phép truy cập vị trí!'))
        }}>
          <div className="form-group">
            <label className="form-label">Địa chỉ hiện tại</label>
            <input name="address" className="input" placeholder="Nhập địa chỉ của bạn..." required />
          </div>
          <button className="btn btn-cta btn-lg btn-block mt-2" style={{ background: '#EF4444' }}>
            🚀 GỌI SHIPPER NGAY
          </button>
        </form>
      </div>
    </div>
  )
}
