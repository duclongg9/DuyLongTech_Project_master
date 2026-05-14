/**
 * PrintTicketModal Component
 * In phiếu tiếp nhận dịch vụ
 */
export default function PrintTicketModal({ modal, setModal, ticket }) {
  if (modal !== 'print' || !ticket) return null

  return (
    <div className="modal-overlay" onClick={() => setModal(null)}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="print-ticket">
          <h3 style={{ textAlign: 'center' }}>DUY LONG TECH</h3>
          <p style={{ textAlign: 'center', fontSize: '0.8rem' }}>123 Giải Phóng, Hà Nội · 0988.888.888</p>
          <hr style={{ margin: '12px 0' }} />
          <h4 style={{ textAlign: 'center' }}>PHIẾU {ticket.type === 'Warranty' ? 'BẢO HÀNH' : 'SỬA CHỮA'}</h4>
          <hr style={{ margin: '12px 0' }} />
          <p><strong>Mã phiếu:</strong> {ticket.ticketCode}</p>
          <p><strong>Khách hàng:</strong> {ticket.customerName}</p>
          <p><strong>Sản phẩm:</strong> {ticket.productName}</p>
          <p><strong>Tình trạng:</strong> {ticket.issue || 'N/A'}</p>
          <p><strong>Ngày tiếp nhận:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
          <hr style={{ margin: '12px 0' }} />
          <p style={{ fontSize: '0.75rem', textAlign: 'center' }}>Quý khách vui lòng giữ phiếu này khi nhận máy.</p>
        </div>
        <div className="flex gap-1 mt-2">
          <button className="btn btn-cta" style={{ flex: 1 }} onClick={() => window.print()}>🖨️ IN PHIẾU</button>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModal(null)}>ĐÓNG</button>
        </div>
      </div>
    </div>
  )
}
