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
        client.subscribe('/topic/kiosk-orders', (message) => {
          const order = JSON.parse(message.body)
          setOrders(prev => [order, ...prev])
          setNewOrder(order)
        })
        client.subscribe('/topic/kiosk-orders-update', (message) => {
          const updatedOrder = JSON.parse(message.body)
          setOrders(prev => prev.map(o => o.orderId === updatedOrder.orderId ? updatedOrder : o))
        })
      }
    })
    client.activate()
    clientRef.current = client
    fetch(`${API}/kiosk/orders`).then(r => r.json()).then(setOrders).catch(() => {})
    return () => { if (clientRef.current) clientRef.current.deactivate() }
  }, [])

  const clearNewOrder = useCallback(() => setNewOrder(null), [])
  return { orders, newOrder, clearNewOrder, setOrders }
}

const fmt = n => Number(n)?.toLocaleString('vi-VN')

// Parse "HH:mm:ss dd/MM/yyyy" to Date object
const parseOrderTime = (str) => {
  try {
    const [time, date] = str.split(' ')
    const [h, m, s] = time.split(':').map(Number)
    const [d, mo, y] = date.split('/').map(Number)
    return new Date(y, mo - 1, d, h, m, s)
  } catch(e) { return new Date() }
}

/**
 * Component: Bộ đếm ngược 5 phút cho mỗi đơn hàng
 * Đếm ngược đến lần nhắc nhở tiếp theo (chu kỳ 5 phút)
 */
function OrderTimer({ createdAt }) {
  const [timeLeft, setTimeLeft] = useState('')
  
  useEffect(() => {
    const startTime = parseOrderTime(createdAt).getTime()
    const update = () => {
      const now = Date.now()
      const diffMs = now - startTime
      const intervalMs = 5 * 60 * 1000 // 5 phút
      
      // Tính thời gian còn lại trong chu kỳ 5 phút hiện tại
      const msInCurrentCycle = diffMs % intervalMs
      const msRemaining = intervalMs - msInCurrentCycle
      
      const mins = Math.floor(msRemaining / 60000)
      const secs = Math.floor((msRemaining % 60000) / 1000)
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
    }
    update()
    const itv = setInterval(update, 1000)
    return () => clearInterval(itv)
  }, [createdAt])

  return <span className="poc-timer">🔔 Nhắc lại sau: {timeLeft}</span>
}

export default function TabletPOS({ onBack }) {
  const { orders, newOrder, clearNewOrder, setOrders } = useKioskOrders()
  const [printOrder, setPrintOrder] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Persistence for seen/checked status using localStorage
  const [seenIds, setSeenIds] = useState(() => {
    const s = localStorage.getItem('pos_seen_ids')
    return s ? new Set(JSON.parse(s)) : new Set()
  })
  const [checkedIds, setCheckedIds] = useState(() => {
    const s = localStorage.getItem('pos_checked_ids')
    return s ? new Set(JSON.parse(s)) : new Set()
  })

  useEffect(() => {
    localStorage.setItem('pos_seen_ids', JSON.stringify([...seenIds]))
  }, [seenIds])

  useEffect(() => {
    localStorage.setItem('pos_checked_ids', JSON.stringify([...checkedIds]))
  }, [checkedIds])

  const unseenCount = orders.filter(o => !seenIds.has(o.orderId) && !checkedIds.has(o.orderId)).length
  const pendingCount = orders.filter(o => o.status === 'PENDING').length

  const markChecked = (orderId) => {
    setCheckedIds(prev => new Set([...prev, orderId]))
    setSeenIds(prev => new Set([...prev, orderId]))
  }
  const markAllSeen = () => {
    setSeenIds(new Set(orders.map(o => o.orderId)))
  }

  const handleConfirmPrint = (order) => {
    setPrintOrder(order)
    setTimeout(() => window.print(), 300)
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API}/kiosk/order/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o))
        if (status === 'COMPLETED') markChecked(orderId)
        if (selectedOrder?.orderId === orderId) setSelectedOrder(prev => ({ ...prev, status }))
      }
    } catch (e) { console.error(e) }
  }

  return (
    <div className="tablet-pos">
      {/* Header */}
      <div className="pos-header">
        <button className="pos-back" onClick={onBack}>←</button>
        <h1>📱 Tablet POS — Quầy Bán Hàng</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          {unseenCount > 0 && (
            <div className="pos-status-pill unseen-pill">
              <span className="dot"></span> {unseenCount} chưa xem
            </div>
          )}
          {pendingCount > 0 && <div className="pos-status-pill pending-pill">{pendingCount} chờ xử lý</div>}
          <div className="pos-status"><span className="pos-ws-dot"></span> Real-time</div>
        </div>
      </div>

      {/* Main Content: Order List */}
      <div className="pos-orders">
        <div className="pos-section-header">
          <h3 className="pos-section-title">📋 Danh sách đơn hàng ({orders.length})</h3>
          {unseenCount > 0 && <button className="pos-btn-mark-all-sm" onClick={markAllSeen}>✅ Đã xem hết</button>}
        </div>

        {orders.length === 0 ? (
          <div className="pos-empty">📡 Đang chờ đơn hàng...</div>
        ) : (
          <div className="pos-order-grid">
            {orders.map((o, i) => {
              const isSeen = seenIds.has(o.orderId)
              const isChecked = checkedIds.has(o.orderId)
              return (
                <div 
                  key={i} 
                  className={`pos-order-card ${!isSeen && !isChecked ? 'unseen' : ''} ${isChecked ? 'checked' : ''} status-${o.status?.toLowerCase()}`}
                  onClick={() => setSelectedOrder(o)}
                >
                  <div className="poc-header">
                    <span className="poc-id">{o.orderId}</span>
                    <span className={`poc-source source-${o.source?.toLowerCase()}`}>{o.source || 'KIOSK'}</span>
                    {!isSeen && !isChecked && <span className="poc-badge-new">MỚI</span>}
                    <span className={`poc-status status-${o.status?.toLowerCase()}`}>{o.status}</span>
                  </div>
                  <div className="poc-customer"><strong>{o.customerName}</strong> · {o.customerPhone}</div>
                  <div className="poc-summary">
                    {o.items?.length} sản phẩm · {fmt(o.totalAmount)}₫
                  </div>
                  <div className="poc-timer-box">
                    <OrderTimer createdAt={o.createdAt} />
                  </div>
                  <div className="poc-footer">
                    <span className="poc-time">{o.createdAt}</span>
                    <button className="pos-btn-view">Xem chi tiết →</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ═══ Order Detail Modal ═══ */}
      {(selectedOrder || newOrder) && (
        <div className="pos-modal-overlay" onClick={() => { setSelectedOrder(null); clearNewOrder() }}>
          <div className="pos-modal detail-modal" onClick={e => e.stopPropagation()}>
            <div className={`detail-header status-${(selectedOrder || newOrder).status?.toLowerCase()}`}>
              <div className="detail-header-left">
                <h2>Chi tiết đơn {(selectedOrder || newOrder).orderId}</h2>
                <span className="detail-source">Nguồn: {(selectedOrder || newOrder).source}</span>
              </div>
              <button className="detail-close" onClick={() => { setSelectedOrder(null); clearNewOrder() }}>✕</button>
            </div>
            <div className="detail-body">
              <div className="detail-grid">
                <section className="detail-section">
                  <h3>👤 Khách hàng</h3>
                  <p><strong>Họ tên:</strong> {(selectedOrder || newOrder).customerName}</p>
                  <p><strong>SĐT:</strong> {(selectedOrder || newOrder).customerPhone}</p>
                </section>
                <section className="detail-section">
                  <h3>💳 Thanh toán</h3>
                  <p><strong>Phương thức:</strong> {(selectedOrder || newOrder).paymentMethod === 'transfer' ? 'Chuyển khoản' : 'Tiền mặt'}</p>
                  <p><strong>Trạng thái:</strong> <span className={`status-badge status-${(selectedOrder || newOrder).status?.toLowerCase()}`}>{(selectedOrder || newOrder).status}</span></p>
                </section>
              </div>
              <section className="detail-section items-section">
                <h3>📦 Sản phẩm</h3>
                <div className="detail-items">
                  {(selectedOrder || newOrder).items?.map((item, i) => (
                    <div key={i} className="detail-item">
                      <div className="di-info">
                        <span className="di-name">{item.name} {(item.quantity || 1) > 1 ? `×${item.quantity}` : ''}</span>
                        <span className="di-spec">RAM {item.ram} · SSD {item.ssd}</span>
                      </div>
                      <span className="di-price">{fmt(item.price * (item.quantity || 1))}₫</span>
                    </div>
                  ))}
                </div>
                <div className="detail-total"><span>Tổng thanh toán</span><span>{fmt((selectedOrder || newOrder).totalAmount)}₫</span></div>
              </section>
            </div>
            <div className="detail-actions">
              {(selectedOrder || newOrder).status === 'PENDING' && (
                <button className="btn-complete" onClick={() => handleUpdateStatus((selectedOrder || newOrder).orderId, 'COMPLETED')}>
                  ✅ HOÀN TẤT ĐƠN HÀNG
                </button>
              )}
              <button className="btn-print" onClick={() => handleConfirmPrint(selectedOrder || newOrder)}>🖨️ In phiếu</button>
              <button className="btn-cancel" onClick={() => handleUpdateStatus((selectedOrder || newOrder).orderId, 'CANCELLED')}>Huỷ đơn</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Print Receipt ═══ */}
      {printOrder && (
        <div className="print-receipt-modern">
          <div className="receipt-header"><div className="shop-logo">DUY LONG TECH</div></div>
          <div className="receipt-title">BIÊN LAI BÁN HÀNG</div>
          <div className="receipt-meta">
            <div className="meta-row"><span>Mã đơn:</span> <strong>{printOrder.orderId}</strong></div>
            <div className="meta-row"><span>Khách hàng:</span> {printOrder.customerName}</div>
          </div>
          <table className="receipt-table">
            <thead><tr><th>Sản phẩm</th><th className="right">Thành tiền</th></tr></thead>
            <tbody>
              {printOrder.items?.map((item, i) => (
                <tr key={i}>
                  <td><div className="item-name">{item.name}</div><div className="item-spec">{item.ram}/{item.ssd} × {item.quantity || 1}</div></td>
                  <td className="right">{fmt(item.price * (item.quantity || 1))}₫</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="receipt-summary"><div className="summary-row total"><span>TỔNG CỘNG:</span><span>{fmt(printOrder.totalAmount)}₫</span></div></div>
          <div className="receipt-footer"><p className="thanks">Cảm ơn Quý khách!</p></div>
        </div>
      )}
    </div>
  )
}
