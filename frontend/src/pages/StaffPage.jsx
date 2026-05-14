import { condLabel } from '../constants'

/**
 * StaffPage Component
 * Props: products, setTicket, setModal, notify
 */
export default function StaffPage({ products, setTicket, setModal, notify }) {
  const handleTicketSubmit = (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    setTicket({
      ticketCode: 'TK' + Date.now(),
      customerName: fd.get('cname'),
      productName: fd.get('pname'),
      type: fd.get('type'),
      issue: fd.get('issue')
    })
    setModal('print')
    notify('✅ Đã tạo phiếu!')
  }

  return (
    <div className="container mt-4">
      <div className="grid g2">
        <div className="card" style={{ padding: 24 }}>
          <h3 className="mb-2">Tiếp nhận Bảo hành / Sửa chữa</h3>
          <form onSubmit={handleTicketSubmit}>
            <div className="form-group"><label className="form-label">Khách hàng</label><input name="cname" className="input" placeholder="Tên / SĐT" required /></div>
            <div className="form-group"><label className="form-label">Sản phẩm</label><input name="pname" className="input" placeholder="Model / Serial Number" required /></div>
            <div className="form-group"><label className="form-label">Loại dịch vụ</label><select name="type" className="input"><option value="Warranty">Bảo hành (Miễn phí)</option><option value="Service">Sửa chữa (Tính phí)</option></select></div>
            <div className="form-group"><label className="form-label">Mô tả lỗi</label><textarea name="issue" className="input" placeholder="Mô tả chi tiết tình trạng máy" /></div>
            <button className="btn btn-cta btn-lg btn-block">TẠO PHIẾU & IN</button>
          </form>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 className="mb-2">Sản phẩm trong kho</h3>
          <p className="text-sm text-dim mb-2">Tổng: {products.length} máy</p>
          {products.slice(0, 5).map(p => <div key={p.id} className="flex-between text-sm" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div><strong>{p.name}</strong><br /><span className="text-dim">{p.serialNumber} · {condLabel(p.condition)}</span></div>
            <span className={`tag ${p.status === 'AVAILABLE' ? 'tag-green' : 'tag-red'}`}>{p.status}</span>
          </div>)}
        </div>
      </div>
    </div>
  )
}
