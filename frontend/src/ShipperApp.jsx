import { useState, useEffect, useRef } from 'react'
import SockJS from 'sockjs-client/dist/sockjs'
import { Client } from '@stomp/stompjs'
const API = 'http://localhost:8080/api'
const WS_URL = 'http://localhost:8080/ws'

/**
 * Canvas Watermark — Chèn GPS + DateTime vào ảnh chụp
 */
function addWatermark(file, lat, lng) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        // Watermark background bar
        const barH = Math.max(60, img.height * 0.06)
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(0, img.height - barH, img.width, barH)

        // Watermark text
        const fontSize = Math.max(14, img.width * 0.018)
        ctx.font = `bold ${fontSize}px 'Courier New', monospace`
        ctx.fillStyle = '#FFD700'
        const now = new Date()
        const dateStr = now.toLocaleString('vi-VN', { hour12: false })
        const gpsStr = lat ? `📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}` : '📍 GPS N/A'
        
        ctx.fillText(`${gpsStr}  |  🕐 ${dateStr}`, 12, img.height - barH + fontSize + 8)
        ctx.font = `${fontSize * 0.8}px 'Courier New', monospace`
        ctx.fillStyle = '#ccc'
        ctx.fillText('DuyLongTech — e-POD Proof of Delivery', 12, img.height - 10)

        canvas.toBlob((blob) => {
          resolve(new File([blob], 'proof_' + Date.now() + '.jpg', { type: 'image/jpeg' }))
        }, 'image/jpeg', 0.85)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function ShipperApp({ user, onBack }) {
  const [wallet, setWallet] = useState(null)
  const [txs, setTxs] = useState([])
  const [tab, setTab] = useState('deliver') // deliver|wallet|history
  const [gps, setGps] = useState(null)
  const [gpsStatus, setGpsStatus] = useState('loading')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [amount, setAmount] = useState('')
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [sosEvent, setSosEvent] = useState(null)
  const fileRef = useRef(null)
  const clientRef = useRef(null)

  useEffect(() => {
    // 1. Connect WebSocket for SOS
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/sos-dispatch', (msg) => {
          const data = JSON.parse(msg.body)
          setSosEvent(data)
          // Phát còi báo động HTML5
          const audio = new Audio('https://www.soundjay.com/buttons/sounds/beep-01a.mp3')
          audio.loop = true
          audio.play().then(() => window.sosAudio = audio).catch(()=>{})
        })
      }
    })
    client.activate()
    clientRef.current = client

    // 2. Fetch Wallet
    if (user?.id) {
      fetch(`${API}/shipper/wallet/${user.id}`).then(r=>r.json()).then(setWallet).catch(()=>{})
      fetch(`${API}/shipper/wallet/${user.id}/transactions`).then(r=>r.json()).then(setTxs).catch(()=>{})
    }
    // 3. Get GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsStatus('ok') },
        () => setGpsStatus('denied'),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else { setGpsStatus('unsupported') }

    return () => { if (clientRef.current) clientRef.current.deactivate() }
  }, [user])

  const acceptSos = () => {
    if (window.sosAudio) { window.sosAudio.pause(); window.sosAudio.currentTime = 0; }
    // Mở Google Maps
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${sosEvent.lat},${sosEvent.lng}`, '_blank')
    setSosEvent(null)
  }

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Apply watermark
    const watermarked = await addWatermark(file, gps?.lat, gps?.lng)
    setPhoto(watermarked)
    setPhotoPreview(URL.createObjectURL(watermarked))
  }

  const submitDelivery = async () => {
    if (!amount || Number(amount) <= 0) return alert('Nhập số tiền ship!')
    setLoading(true)
    try {
      // TODO: In production, upload photo to S3 first, then pass URL
      const res = await fetch(`${API}/shipper/delivery`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          userId: user.id,
          amount: Number(amount),
          orderId: orderId || undefined,
          latitude: gps?.lat,
          longitude: gps?.lng,
          proofImageUrl: photo ? 'local://proof_' + Date.now() : null
        })
      })
      const data = await res.json()
      setResult(data)
      setWallet(w => w ? {...w, balance: data.newBalance, deliveryCount: data.deliveryCount} : w)
      // Reload transactions
      fetch(`${API}/shipper/wallet/${user.id}/transactions`).then(r=>r.json()).then(setTxs).catch(()=>{})
      // Reset form
      setAmount(''); setOrderId(''); setPhoto(null); setPhotoPreview(null)
    } catch(e) { alert('Lỗi kết nối!') }
    setLoading(false)
  }

  const fmt = n => Number(n)?.toLocaleString('vi-VN')

  return (
    <div className={`shipper-app ${sosEvent ? 'sos-active' : ''}`}>
      {/* MÀN HÌNH SOS KHẨN CẤP */}
      {sosEvent && (
        <div className="sos-overlay">
          <div className="sos-alert-box">
            <h1 className="sos-title">🚨 CÓ LỆNH CỨU NÉT KHẨN CẤP!</h1>
            <div className="sos-info">
              <p><strong>Khách hàng:</strong> {sosEvent.customerName}</p>
              <p><strong>SĐT:</strong> {sosEvent.phone}</p>
              <p><strong>Địa chỉ:</strong> {sosEvent.address}</p>
              <p><strong>Máy cần giao:</strong> <span className="sos-device">{sosEvent.backupDevice}</span></p>
            </div>
            <button className="sos-accept-btn" onClick={acceptSos}>
              🔥 NHẬN LỆNH CHẠY NGAY
            </button>
          </div>
        </div>
      )}

      <div className="sh-header">
        <button className="sh-back" onClick={onBack}>←</button>
        <h1>🚚 Shipper App</h1>
        <span className="sh-user">{user?.fullName}</span>
      </div>

      <div className="sh-tabs">
        <button className={`sh-tab ${tab==='deliver'?'active':''}`} onClick={()=>setTab('deliver')}>📦 Giao hàng</button>
        <button className={`sh-tab ${tab==='wallet'?'active':''}`} onClick={()=>setTab('wallet')}>💰 Ví</button>
        <button className={`sh-tab ${tab==='history'?'active':''}`} onClick={()=>setTab('history')}>📜 Lịch sử</button>
      </div>

      {/* DELIVERY FORM */}
      {tab==='deliver' && (
        <div className="sh-deliver">
          {/* GPS Status */}
          <div className={`sh-gps ${gpsStatus}`}>
            {gpsStatus==='ok' && <>📍 Vị trí: {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}</>}
            {gpsStatus==='loading' && <>⏳ Đang lấy vị trí GPS...</>}
            {gpsStatus==='denied' && <>❌ GPS bị từ chối — Vui lòng bật định vị</>}
            {gpsStatus==='unsupported' && <>⚠️ Trình duyệt không hỗ trợ GPS</>}
          </div>

          {/* Camera Capture */}
          <div className="sh-camera-section">
            <h3>📸 Chụp ảnh giao hàng (e-POD)</h3>
            <input ref={fileRef} type="file" accept="image/*" capture="environment"
              onChange={handlePhoto} className="sh-file-input" id="proof-photo" />
            <label htmlFor="proof-photo" className="sh-camera-btn">
              {photoPreview ? '📷 Chụp lại' : '📷 MỞ CAMERA'}
            </label>
            {photoPreview && (
              <div className="sh-preview">
                <img src={photoPreview} alt="Proof" />
                <p className="sh-preview-label">✅ Ảnh đã chèn watermark GPS + Thời gian</p>
              </div>
            )}
          </div>

          {/* Delivery Form */}
          <div className="sh-form">
            <label className="sh-label">Mã đơn hàng</label>
            <input className="sh-input" value={orderId} onChange={e=>setOrderId(e.target.value)}
              placeholder="VD: KSK-98600 (không bắt buộc)" />
            
            <label className="sh-label">💰 Số tiền ship thu hộ *</label>
            <input className="sh-input sh-input-amount" type="number" value={amount}
              onChange={e=>setAmount(e.target.value)} placeholder="VD: 50000" />

            <button className="sh-submit" onClick={submitDelivery} disabled={loading || !amount}>
              {loading ? '⏳ Đang xử lý...' : '✅ XÁC NHẬN GIAO HÀNG'}
            </button>
          </div>

          {result && (
            <div className="sh-result">
              <p>✅ {result.message}</p>
              <p>💰 Số dư mới: <strong>{fmt(result.newBalance)}₫</strong></p>
            </div>
          )}
        </div>
      )}

      {/* WALLET */}
      {tab==='wallet' && (
        <div className="sh-wallet">
          <div className="sh-balance-card">
            <div className="sh-balance-label">Số dư chờ thanh toán</div>
            <div className="sh-balance-amount">{fmt(wallet?.balance || 0)}₫</div>
          </div>
          <div className="sh-wallet-stats">
            <div className="sh-ws"><span>Tổng đã thu</span><strong>{fmt(wallet?.totalCollected || 0)}₫</strong></div>
            <div className="sh-ws"><span>Đã thanh toán</span><strong>{fmt(wallet?.totalSettled || 0)}₫</strong></div>
            <div className="sh-ws"><span>Số đơn giao</span><strong>{wallet?.deliveryCount || 0}</strong></div>
          </div>
          <p className="sh-wallet-note">💡 Admin sẽ thanh toán công nợ cho bạn định kỳ.<br/>Liên hệ quản lý nếu cần thanh toán gấp.</p>
        </div>
      )}

      {/* HISTORY */}
      {tab==='history' && (
        <div className="sh-history">
          <h3>📜 Lịch sử giao dịch</h3>
          {txs.length === 0 ? <p className="sh-empty">Chưa có giao dịch</p> :
            txs.map((t,i) => (
              <div key={i} className={`sh-tx ${t.type==='DELIVERY_COLLECT'?'collect':'settle'}`}>
                <div className="sh-tx-header">
                  <span className={`sh-tx-type ${t.type==='DELIVERY_COLLECT'?'green':'red'}`}>
                    {t.type==='DELIVERY_COLLECT' ? '📦 Thu ship' : '💸 Thanh toán'}
                  </span>
                  <span className="sh-tx-time">{new Date(t.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="sh-tx-amount">
                  <span className={t.amount >= 0 ? 'green' : 'red'}>
                    {t.amount >= 0 ? '+' : ''}{fmt(t.amount)}₫
                  </span>
                </div>
                <div className="sh-tx-meta">
                  {t.orderId && <span>📋 {t.orderId}</span>}
                  <span>💰 {fmt(t.balanceBefore)}₫ → {fmt(t.balanceAfter)}₫</span>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}
