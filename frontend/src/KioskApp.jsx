import { useState, useEffect } from 'react'
const API = 'http://localhost:8080/api'

const RAM_OPTIONS = [
  { label: '8 GB', value: '8GB', price: 0 },
  { label: '16 GB', value: '16GB', price: 800000 },
  { label: '32 GB', value: '32GB', price: 2500000 },
]
const SSD_OPTIONS = [
  { label: '256 GB', value: '256GB', price: 0 },
  { label: '512 GB', value: '512GB', price: 500000 },
  { label: '1 TB', value: '1TB', price: 1500000 },
]

export default function KioskApp({ onBack }) {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [step, setStep] = useState('browse') // browse|config|cart|done
  const [selected, setSelected] = useState(null)
  const [ramPick, setRamPick] = useState('16GB')
  const [ssdPick, setSsdPick] = useState('512GB')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [orderId, setOrderId] = useState(null)
  const [accountInfo, setAccountInfo] = useState(null)

  useEffect(() => {
    fetch(`${API}/products`).then(r => r.json()).then(d =>
      setProducts(d.filter(p => p.status === 'AVAILABLE' && !p.callForPrice))
    ).catch(() => {})
  }, [])

  const fmt = n => n?.toLocaleString('vi-VN')

  const getPrice = (product) => {
    let base = Number(product?.basePrice) || 0
    const ram = RAM_OPTIONS.find(r => r.value === ramPick)
    const ssd = SSD_OPTIONS.find(s => s.value === ssdPick)
    return base + (ram?.price || 0) + (ssd?.price || 0)
  }

  const addToCart = () => {
    if (!selected) return
    setCart([...cart, {
      ...selected,
      ram: ramPick,
      ssd: ssdPick,
      finalPrice: getPrice(selected)
    }])
    setStep('cart')
  }

  const submitOrder = async () => {
    if (!customerPhone) return
    try {
      const res = await fetch(`${API}/kiosk/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName || 'Khách Kiosk',
          customerPhone,
          customerEmail,
          items: cart.map(c => ({
            productId: c.id,
            name: c.name,
            ram: c.ram,
            ssd: c.ssd,
            price: c.finalPrice,
            warrantyMonths: c.warrantyMonths || 12
          })),
          totalAmount: cart.reduce((s, c) => s + c.finalPrice, 0)
        })
      })
      const data = await res.json()
      setOrderId(data.orderId)
      setAccountInfo(data)
      setStep('done')
    } catch (e) {
      alert('Lỗi kết nối. Vui lòng thử lại.')
    }
  }

  return (
    <div className="kiosk">
      {/* Header */}
      <div className="kiosk-header">
        <div className="kiosk-logo" onClick={onBack}>DuyLong<span>Tech</span></div>
        <div className="kiosk-title">🖥️ Kiosk Tự Phục Vụ</div>
        <div className="kiosk-cart-btn" onClick={() => step !== 'done' && setStep('cart')}>
          🛒 <span className="kiosk-cart-count">{cart.length}</span>
        </div>
      </div>

      {/* Browse Products */}
      {step === 'browse' && (
        <div className="kiosk-browse">
          <h2 className="kiosk-section-title">Chọn laptop bạn quan tâm</h2>
          <div className="kiosk-product-grid">
            {products.map(p => (
              <div key={p.id} className="kiosk-product-card" onClick={() => { setSelected(p); setStep('config') }}>
                <div className="kpc-img">
                  <img src={p.imageUrl || `https://placehold.co/600x400/1E293B/06B6D4?text=${encodeURIComponent(p.brand)}`} alt="" />
                </div>
                <div className="kpc-body">
                  <h3>{p.name}</h3>
                  <p className="kpc-specs">{p.cpuModel} · {p.ramAmount} · {p.storageMain}</p>
                  <div className="kpc-price">{fmt(p.basePrice)}₫</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Config Options */}
      {step === 'config' && selected && (
        <div className="kiosk-config">
          <button className="kiosk-back-btn" onClick={() => setStep('browse')}>← Quay lại</button>
          <h2>{selected.name}</h2>
          <p className="kiosk-desc">{selected.cpuModel} · {selected.description}</p>

          <h3 className="kiosk-opt-label">💾 Chọn RAM</h3>
          <div className="kiosk-option-grid">
            {RAM_OPTIONS.map(r => (
              <div key={r.value} className={`kiosk-option-card ${ramPick === r.value ? 'active' : ''}`}
                onClick={() => setRamPick(r.value)}>
                <div className="koc-value">{r.label}</div>
                <div className="koc-price">{r.price > 0 ? `+${fmt(r.price)}₫` : 'Cơ bản'}</div>
              </div>
            ))}
          </div>

          <h3 className="kiosk-opt-label">💿 Chọn SSD</h3>
          <div className="kiosk-option-grid">
            {SSD_OPTIONS.map(s => (
              <div key={s.value} className={`kiosk-option-card ${ssdPick === s.value ? 'active' : ''}`}
                onClick={() => setSsdPick(s.value)}>
                <div className="koc-value">{s.label}</div>
                <div className="koc-price">{s.price > 0 ? `+${fmt(s.price)}₫` : 'Cơ bản'}</div>
              </div>
            ))}
          </div>

          <div className="kiosk-total-bar">
            <div className="ktb-price">{fmt(getPrice(selected))}₫</div>
            <button className="kiosk-cta" onClick={addToCart}>THÊM VÀO GIỎ HÀNG →</button>
          </div>
        </div>
      )}

      {/* Cart */}
      {step === 'cart' && (
        <div className="kiosk-cart">
          <button className="kiosk-back-btn" onClick={() => setStep('browse')}>← Tiếp tục mua</button>
          <h2>🛒 Giỏ hàng ({cart.length})</h2>

          {cart.length === 0 ? (
            <p className="kiosk-empty">Chưa có sản phẩm. Bấm ← để chọn máy.</p>
          ) : (<>
            {cart.map((c, i) => (
              <div key={i} className="kiosk-cart-item">
                <div className="kci-info">
                  <h4>{c.name}</h4>
                  <p>RAM {c.ram} · SSD {c.ssd}</p>
                </div>
                <div className="kci-price">{fmt(c.finalPrice)}₫</div>
                <button className="kci-remove" onClick={() => setCart(cart.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}

            <div className="kiosk-cart-total">
              <span>Tổng cộng</span>
              <span>{fmt(cart.reduce((s, c) => s + c.finalPrice, 0))}₫</span>
            </div>

            <div className="kiosk-checkout-form">
              <input className="kiosk-input" value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder="Họ tên (không bắt buộc)" />
              <input className="kiosk-input" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                placeholder="📱 Số điện thoại * (dùng làm tài khoản)" required />
              <input className="kiosk-input" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                placeholder="📧 Email (nhận thông tin bảo hành)" />
            </div>

            <button className="kiosk-submit-cta" onClick={submitOrder} disabled={!customerPhone}>
              📢 GỬI YÊU CẦU CHỐT ĐƠN
            </button>
            <p className="kiosk-hint">Nhân viên bán hàng sẽ đến hỗ trợ bạn ngay lập tức!</p>
          </>)}
        </div>
      )}

      {/* Done */}
      {step === 'done' && (
        <div className="kiosk-done">
          <div className="kiosk-done-icon">✅</div>
          <h2>Đã gửi yêu cầu thành công!</h2>
          <p className="kiosk-order-id">Mã đơn: <strong>{orderId}</strong></p>
          <p className="kiosk-done-msg">Nhân viên bán hàng đã nhận được thông báo<br/>và sẽ đến chỗ bạn trong vài phút.</p>
          {accountInfo?.accountPassword && (
            <div className="kiosk-account-box">
              <h3>🔐 Tài khoản đã được tạo tự động</h3>
              <p>Đăng nhập tại <strong>duylongtech.com.vn</strong></p>
              <div className="kiosk-cred"><span>Tài khoản:</span><strong>{accountInfo.accountUsername}</strong></div>
              <div className="kiosk-cred"><span>Mật khẩu:</span><strong>{accountInfo.accountPassword}</strong></div>
              <p className="kiosk-cred-note">Vui lòng ghi nhớ hoặc chụp lại thông tin này.</p>
            </div>
          )}
          <button className="kiosk-cta" onClick={() => { setCart([]); setStep('browse'); setOrderId(null); setAccountInfo(null) }}>
            🔄 MUA TIẾP
          </button>
        </div>
      )}
    </div>
  )
}
