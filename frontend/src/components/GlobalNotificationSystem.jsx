import { useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'

const WS_URL = 'wss://duylongtech-project-master.onrender.com/ws'
const API = 'https://duylongtech-project-master.onrender.com/api'

// Helper to parse order time
const parseOrderTime = (str) => {
  try {
    const [time, date] = str.split(' ')
    const [h, m, s] = time.split(':').map(Number)
    const [d, mo, y] = date.split('/').map(Number)
    return new Date(y, mo - 1, d, h, m, s)
  } catch(e) { return new Date() }
}

/**
 * Phát âm thanh CẢNH BÁO mạnh khi có đơn hàng mới
 */
export function playNotificationSound() {
  try { navigator.vibrate?.([300, 100, 300, 100, 500]) } catch(e) {}
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime
    for (let round = 0; round < 3; round++) {
      const base = now + round * 1.2
      const notes = [880, 1100, 1320]
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = round === 2 ? 'triangle' : 'square'
        osc.frequency.setValueAtTime(freq, base + i * 0.18)
        gain.gain.setValueAtTime(0, base + i * 0.18)
        gain.gain.linearRampToValueAtTime(0.35, base + i * 0.18 + 0.02)
        gain.gain.setValueAtTime(0.35, base + i * 0.18 + 0.12)
        gain.gain.exponentialRampToValueAtTime(0.001, base + i * 0.18 + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(base + i * 0.18)
        osc.stop(base + i * 0.18 + 0.3)
      })
    }
  } catch (e) {}
}

export default function GlobalNotificationSystem({ user, setPage }) {
  const [newOrder, setNewOrder] = useState(null)
  const clientRef = useRef(null)
  const checkIntervalRef = useRef(null)
  const lastRingRef = useRef({}) // { orderId: lastRingTimestamp }

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      if (clientRef.current) clientRef.current.deactivate()
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
      return
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/kiosk-orders', (message) => {
          const order = JSON.parse(message.body)
          setNewOrder(order)
          playNotificationSound()
        })
      }
    })
    client.activate()
    clientRef.current = client

    // Check every second to match the 5-minute countdown exactly
    checkIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/kiosk/orders`)
        const orders = await res.json()
        const seenIds = new Set(JSON.parse(localStorage.getItem('pos_seen_ids') || '[]'))
        const checkedIds = new Set(JSON.parse(localStorage.getItem('pos_checked_ids') || '[]'))
        
        const now = Date.now()
        let shouldRing = false
        let reminderOrder = null

        for (const o of orders) {
          if (seenIds.has(o.orderId) || checkedIds.has(o.orderId)) continue

          const startTime = parseOrderTime(o.createdAt).getTime()
          const diffMs = now - startTime
          const intervalMs = 5 * 60 * 1000
          
          // If order is at least 5 mins old and we hit a 5-min multiple
          if (diffMs >= intervalMs) {
            const msInCycle = diffMs % intervalMs
            // If we are at the very beginning of a 5-min cycle (first 2 seconds window)
            // AND we haven't rung for this cycle yet
            const cycleCount = Math.floor(diffMs / intervalMs)
            const lastCycle = lastRingRef.current[o.orderId] || 0
            
            if (msInCycle < 2000 && cycleCount > lastCycle) {
              shouldRing = true
              reminderOrder = o
              lastRingRef.current[o.orderId] = cycleCount
              break 
            }
          }
        }

        if (shouldRing && reminderOrder) {
          setNewOrder(reminderOrder)
          playNotificationSound()
        }
      } catch (e) { console.error(e) }
    }, 1000)

    return () => {
      if (clientRef.current) clientRef.current.deactivate()
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
    }
  }, [user])

  if (!newOrder) return null

  return (
    <div className="global-notification-overlay" onClick={() => setNewOrder(null)}>
      <div className="global-notification-popup" onClick={e => e.stopPropagation()}>
        <div className="gn-header">
          <span className="gn-icon">🔔</span>
          <h3>CẢNH BÁO ĐƠN CHƯA XEM!</h3>
        </div>
        <div className="gn-body">
          <div className="gn-order-id">{newOrder.orderId}</div>
          <div className="gn-customer"><strong>{newOrder.customerName}</strong> · {newOrder.customerPhone}</div>
          <div className="gn-total">Tổng tiền: {Number(newOrder.totalAmount).toLocaleString('vi-VN')}₫</div>
        </div>
        <div className="gn-actions">
          <button className="gn-btn-view" onClick={() => { setPage('pos'); setNewOrder(null) }}>
            ĐI TỚI MÀN HÌNH POS
          </button>
          <button className="gn-btn-close" onClick={() => setNewOrder(null)}>Đóng</button>
        </div>
      </div>
    </div>
  )
}
