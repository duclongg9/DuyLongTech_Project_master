import { useState, useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'

const WS_URL = 'http://localhost:8080/ws'
const API = 'http://localhost:8080/api'

/**
 * Hook: Lắng nghe Kiosk Order real-time qua WebSocket STOMP
 */
function useKioskOrders() {
  const [orders, setOrders] = useState([])
  const [newOrder, setNewOrder] = useState(null)
  const clientRef = useRef(null)

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ WebSocket connected to Tablet POS')
        client.subscribe('/topic/kiosk-orders', (message) => {
          const order = JSON.parse(message.body)
          setOrders(prev => [order, ...prev])
          setNewOrder(order)
          playNotificationSound()
        })
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame.headers?.message)
      }
    })
    client.activate()
    clientRef.current = client

    // Load existing orders
    fetch(`${API}/kiosk/orders`).then(r => r.json()).then(setOrders).catch(() => {})

    return () => { if (clientRef.current) clientRef.current.deactivate() }
  }, [])

  const clearNewOrder = useCallback(() => setNewOrder(null), [])
  return { orders, newOrder, clearNewOrder }
}

/**
 * Phát âm thanh "Ting!" khi có đơn mới
 */
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    // Note 1: "Ting" high
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(1200, ctx.currentTime)
    gain1.gain.setValueAtTime(0.4, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.3)

    // Note 2: "Ting" higher (harmony)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1600, ctx.currentTime + 0.15)
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.15)
    osc2.stop(ctx.currentTime + 0.5)
  } catch (e) { /* AudioContext not available */ }
}

const fmt = n => Number(n)?.toLocaleString('vi-VN')

export default function TabletPOS({ onBack }) {
  const { orders, newOrder, clearNewOrder } = useKioskOrders()
  const [printOrder, setPrintOrder] = useState(null)

  const handleConfirmPrint = (order) => {
    setPrintOrder(order)
    // Wait for DOM render, then trigger print
    setTimeout(() => window.print(), 300)
  }

  return (
    <div className="tablet-pos">
      {/* Header */}
      <div className="pos-header">
        <button className="pos-back" onClick={onBack}>←</button>
        <h1>📱 Tablet POS — Quầy Bán Hàng</h1>
        <div className="pos-status">
          <span className="pos-ws-dot"></span> Real-time
        </div>
      </div>

      {/* New Order Modal (WebSocket event) */}
      {newOrder && (
        <div className="pos-modal-overlay" onClick={clearNewOrder}>
          <div className="pos-modal" onClick={e => e.stopPropagation()}>
            <div className="pos-modal-header">
              <span className="pos-alert-icon">🔔</span>
              <h2>ĐƠN HÀNG MỚI TỪ KIOSK!</h2>
            </div>
            <div className="pos-modal-body">
              <div className="pos-order-id">{newOrder.orderId}</div>
              <div className="pos-order-time">⏰ {newOrder.createdAt}</div>
              <div className="pos-customer">
                <span>👤 {newOrder.customerName}</span>
                <span>📞 {newOrder.customerPhone}</span>
              </div>
              <div className="pos-items">
                {newOrder.items?.map((item, i) => (
                  <div key={i} className="pos-item">
                    <div className="pos-item-name">{item.name}</div>
                    <div className="pos-item-config">RAM {item.ram} · SSD {item.ssd}</div>
                    <div className="pos-item-price">{fmt(item.price)}₫</div>
                  </div>
                ))}
              </div>
              <div className="pos-total">
                <span>TỔNG</span>
                <span>{fmt(newOrder.totalAmount)}₫</span>
              </div>
            </div>
            <div className="pos-modal-actions">
              <button className="pos-btn-print" onClick={() => { clearNewOrder(); handleConfirmPrint(newOrder) }}>
                🖨️ XÁC NHẬN & IN PHIẾU
              </button>
              <button className="pos-btn-dismiss" onClick={clearNewOrder}>
                Xem sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order List */}
      <div className="pos-orders">
        <h3 className="pos-section-title">📋 Đơn hàng Kiosk ({orders.length})</h3>
        {orders.length === 0 ? (
          <div className="pos-empty">
            <div className="pos-empty-icon">📡</div>
            <p>Đang chờ đơn hàng từ Kiosk...</p>
            <p className="pos-empty-sub">Hệ thống sẽ tự động báo âm thanh khi có đơn mới</p>
          </div>
        ) : (
          orders.map((o, i) => (
            <div key={i} className={`pos-order-card ${o.status === 'PENDING' ? 'pending' : ''}`}>
              <div className="poc-header">
                <span className="poc-id">{o.orderId}</span>
                <span className={`poc-status ${o.status?.toLowerCase()}`}>{o.status}</span>
                <span className="poc-time">{o.createdAt}</span>
              </div>
              <div className="poc-customer">
                👤 {o.customerName} · 📞 {o.customerPhone}
              </div>
              <div className="poc-items">
                {o.items?.map((item, j) => (
                  <div key={j} className="poc-item">
                    <span>{item.name} ({item.ram}/{item.ssd})</span>
                    <span>{fmt(item.price)}₫</span>
                  </div>
                ))}
              </div>
              <div className="poc-footer">
                <span className="poc-total">Tổng: {fmt(o.totalAmount)}₫</span>
                <button className="pos-btn-sm" onClick={() => handleConfirmPrint(o)}>🖨️ In phiếu</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ===== PRINT-ONLY: Biên lai A5 (148×210mm) ===== */}
      {printOrder && (
        <div className="print-receipt" id="receipt">
          {/* === HEADER === */}
          <div className="a5-header">
            <div className="a5-logo">
              <h1>DUY LONG TECH</h1>
              <p className="a5-slogan">Laptop & PC — Uy tín · Chất lượng · Bảo hành tận tâm</p>
            </div>
            <div className="a5-shop-info">
              <p>📍 123 Giải Phóng, Hai Bà Trưng, Hà Nội</p>
              <p>📞 Hotline: 0988.888.888 · 🌐 duylongtech.com.vn</p>
            </div>
          </div>

          <div className="a5-divider-double"></div>

          {/* === TIÊU ĐỀ PHIẾU === */}
          <h2 className="a5-title">PHIẾU ĐẶT HÀNG</h2>
          <p className="a5-subtitle">Mã đơn: <strong>{printOrder.orderId}</strong> · {printOrder.createdAt}</p>

          <div className="a5-divider"></div>

          {/* === THÔNG TIN KHÁCH HÀNG === */}
          <div className="a5-section">
            <h3>THÔNG TIN KHÁCH HÀNG</h3>
            <table className="a5-info-table">
              <tbody>
                <tr><td className="a5-label">Họ tên:</td><td>{printOrder.customerName}</td></tr>
                <tr><td className="a5-label">Số điện thoại:</td><td><strong>{printOrder.customerPhone}</strong></td></tr>
                {printOrder.customerEmail && <tr><td className="a5-label">Email:</td><td>{printOrder.customerEmail}</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="a5-divider"></div>

          {/* === CHI TIẾT SẢN PHẨM === */}
          <div className="a5-section">
            <h3>CHI TIẾT SẢN PHẨM</h3>
            <table className="a5-product-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Sản phẩm</th>
                  <th>Cấu hình</th>
                  <th className="right">Đơn giá</th>
                </tr>
              </thead>
              <tbody>
                {printOrder.items?.map((item, i) => (
                  <tr key={i}>
                    <td className="center">{i + 1}</td>
                    <td><strong>{item.name}</strong></td>
                    <td>RAM {item.ram} · SSD {item.ssd}</td>
                    <td className="right">{fmt(item.price)}₫</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="a5-total-row">
                  <td colSpan="3"><strong>TỔNG CỘNG</strong></td>
                  <td className="right"><strong>{fmt(printOrder.totalAmount)}₫</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="a5-divider"></div>

          {/* === THÔNG TIN BẢO HÀNH === */}
          <div className="a5-section">
            <h3>🛡️ THÔNG TIN BẢO HÀNH</h3>
            <table className="a5-info-table">
              <tbody>
                <tr><td className="a5-label">Loại BH:</td><td>Bảo hành tại cửa hàng</td></tr>
                <tr><td className="a5-label">Thời hạn:</td><td><strong>12 tháng</strong> (kể từ ngày mua)</td></tr>
                <tr><td className="a5-label">Bắt đầu:</td><td>{printOrder.warrantyStartDate || new Date().toLocaleDateString('vi-VN')}</td></tr>
                <tr><td className="a5-label">Kết thúc:</td><td><strong>{printOrder.warrantyEndDate || '—'}</strong></td></tr>
              </tbody>
            </table>
            <div className="a5-warranty-terms">
              <p><strong>Điều kiện bảo hành:</strong></p>
              <ul>
                <li>✅ Bảo hành miễn phí lỗi phần cứng do nhà sản xuất</li>
                <li>✅ Hỗ trợ kỹ thuật phần mềm trọn đời</li>
                <li>❌ Không BH: vào nước, rơi vỡ, can thiệp ngoài cửa hàng</li>
                <li>❌ Không BH: cháy nổ do nguồn điện, thiên tai</li>
                <li>📋 Mang kèm phiếu này khi yêu cầu bảo hành</li>
                <li>🌐 Tra cứu bảo hành online: <strong>duylongtech.com.vn/bao-hanh</strong></li>
              </ul>
            </div>
          </div>

          <div className="a5-divider"></div>

          {/* === THÔNG TIN TÀI KHOẢN === */}
          <div className="a5-section a5-account-section">
            <h3>🔐 TÀI KHOẢN KHÁCH HÀNG</h3>
            <p className="a5-account-desc">Hệ thống đã tự động tạo tài khoản cho bạn. Đăng nhập để:</p>
            <ul className="a5-account-features">
              <li>📦 Theo dõi đơn hàng & trạng thái</li>
              <li>🛡️ Gửi yêu cầu bảo hành online</li>
              <li>📜 Xem lịch sử mua hàng & dịch vụ</li>
              <li>🎁 Nhận ưu đãi dành riêng cho khách cũ</li>
            </ul>
            <div className="a5-account-box">
              <div className="a5-account-row">
                <span className="a5-acc-label">🌐 Truy cập:</span>
                <span className="a5-acc-value">duylongtech.com.vn</span>
              </div>
              <div className="a5-account-row">
                <span className="a5-acc-label">👤 Tài khoản:</span>
                <span className="a5-acc-value a5-mono">{printOrder.accountUsername || printOrder.customerPhone}</span>
              </div>
              {printOrder.accountPassword && (
                <div className="a5-account-row">
                  <span className="a5-acc-label">🔑 Mật khẩu:</span>
                  <span className="a5-acc-value a5-mono">{printOrder.accountPassword}</span>
                </div>
              )}
              <p className="a5-acc-note">⚠️ Vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên</p>
            </div>
          </div>

          <div className="a5-divider-double"></div>

          {/* === CHÂN PHIẾU === */}
          <div className="a5-footer">
            <div className="a5-signature-row">
              <div className="a5-sig-col">
                <p className="a5-sig-title">Khách hàng</p>
                <p className="a5-sig-sub">(Ký, ghi rõ họ tên)</p>
                <div className="a5-sig-space"></div>
              </div>
              <div className="a5-sig-col">
                <p className="a5-sig-title">Nhân viên bán hàng</p>
                <p className="a5-sig-sub">(Ký, ghi rõ họ tên)</p>
                <div className="a5-sig-space"></div>
              </div>
            </div>
            <div className="a5-thanks">
              <p>★ Cảm ơn Quý khách đã tin tưởng DUY LONG TECH! ★</p>
              <p className="a5-thanks-sub">Hỗ trợ kỹ thuật 24/7: 0988.888.888 · fb.com/duylongtech</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
