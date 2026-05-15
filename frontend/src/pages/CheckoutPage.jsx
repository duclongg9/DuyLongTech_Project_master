import { useState, useEffect, useRef } from 'react'
import { fmt } from '../constants'

const API = 'http://localhost:8080/api'

/**
 * CheckoutPage Component
 * Flow: shipping → verify (OTP) → payment (review + confirm)
 * Props: page, setPage, cart, cartTotal, setCart, notify
 */
export default function CheckoutPage({ page, setPage, cart, cartTotal, setCart, notify }) {
  const [shipping, setShipping] = useState({ name: '', phone: '', email: '', address: '' })
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // OTP state
  const [otpCode, setOtpCode] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  // Timers
  const [resendCooldown, setResendCooldown] = useState(0) // countdown seconds
  const [expiryCountdown, setExpiryCountdown] = useState(0) // 45s countdown
  const resendRef = useRef(null)
  const expiryRef = useRef(null)

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (resendRef.current) clearInterval(resendRef.current)
      if (expiryRef.current) clearInterval(expiryRef.current)
    }
  }, [])

  const startResendTimer = () => {
    setResendCooldown(30)
    if (resendRef.current) clearInterval(resendRef.current)
    resendRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(resendRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const startExpiryTimer = () => {
    setExpiryCountdown(45)
    if (expiryRef.current) clearInterval(expiryRef.current)
    expiryRef.current = setInterval(() => {
      setExpiryCountdown(prev => {
        if (prev <= 1) { clearInterval(expiryRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const sendOtp = async () => {
    setOtpError('')
    setOtpSending(true)
    try {
      const res = await fetch(`${API}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: shipping.phone, email: shipping.email })
      })
      const data = await res.json()
      if (!res.ok) {
        setOtpError(data.error || 'Lỗi gửi OTP')
        if (data.retryAfter) setResendCooldown(data.retryAfter)
      } else {
        setOtpSent(true)
        setOtpCode('')
        startResendTimer()
        startExpiryTimer()
        notify('📨 Mã OTP đã được gửi!')
      }
    } catch (e) {
      setOtpError('Không thể kết nối máy chủ')
    }
    setOtpSending(false)
  }

  const verifyOtp = async () => {
    setOtpError('')
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 chữ số')
      return
    }
    setOtpVerifying(true)
    try {
      const res = await fetch(`${API}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: shipping.phone, email: shipping.email, code: otpCode })
      })
      const data = await res.json()
      if (data.verified) {
        notify('✅ Xác thực thành công!')
        setPage('payment')
      } else {
        setOtpError(data.error || 'Mã OTP không đúng')
      }
    } catch (e) {
      setOtpError('Không thể kết nối máy chủ')
    }
    setOtpVerifying(false)
  }

  const submitOrder = async () => {
    try {
      await fetch(`${API}/kiosk/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: shipping.name || 'Khách Web',
          customerPhone: shipping.phone,
          customerEmail: shipping.email,
          source: 'WEB',
          items: cart.map(c => ({
            productId: c.id,
            name: c.name,
            ram: Object.values(c.selectedOptions || {})[0] || 'N/A',
            ssd: Object.values(c.selectedOptions || {})[1] || 'N/A',
            price: c.finalPrice,
            warrantyMonths: c.warrantyMonths || 12,
            quantity: c.quantity || 1
          })),
          totalAmount: cartTotal,
          paymentMethod,
          address: shipping.address
        })
      })
    } catch (e) {
      console.error(e)
    }
    setCart([])
    setPage('home')
    notify('✅ Đặt hàng thành công! Nhân viên sẽ kiểm tra và xác nhận.')
  }

  const goToVerify = () => {
    if (!shipping.name || !shipping.phone || !shipping.email || !shipping.address) {
      return alert('Vui lòng nhập đầy đủ thông tin')
    }
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
      return alert('Email không hợp lệ')
    }
    // Validate phone (Vietnamese)
    if (!/^(0|\+84)\d{9,10}$/.test(shipping.phone.replace(/\s/g, ''))) {
      return alert('Số điện thoại không hợp lệ')
    }
    setOtpSent(false)
    setOtpCode('')
    setOtpError('')
    setPage('verify')
  }

  /* ═══════════════════════════════════════════════
   *  STEP 2: Thông tin giao hàng
   * ═══════════════════════════════════════════════ */
  if (page === 'shipping') return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <StepsBar active={2} />
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ marginBottom: 20 }}>📝 Thông tin đặt hàng</h2>
        <div className="form-group">
          <label className="form-label">Họ tên *</label>
          <input className="input" value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })} placeholder="Nguyễn Văn A" required />
        </div>
        <div className="grid g2">
          <div className="form-group">
            <label className="form-label">Số điện thoại *</label>
            <input className="input" value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} placeholder="0912 345 678" required />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="input" type="email" value={shipping.email} onChange={e => setShipping({ ...shipping, email: e.target.value })} placeholder="email@example.com" required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Địa chỉ nhận hàng *</label>
          <textarea className="input" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP" required />
        </div>
        <p className="text-dim text-xs mt-1" style={{ lineHeight: 1.6 }}>
          🔒 Hệ thống sẽ gửi mã xác thực (OTP) qua email và SMS để bảo vệ đơn hàng của bạn.
          Bạn không cần đăng ký tài khoản.
        </p>
        <div className="flex gap-1 mt-3">
          <button className="btn btn-outline" onClick={() => setPage('cart')}>← Quay lại</button>
          <button className="btn btn-cta btn-lg" style={{ flex: 1 }} onClick={goToVerify}>
            TIẾP TỤC XÁC THỰC →
          </button>
        </div>
      </div>
    </div>
  )

  /* ═══════════════════════════════════════════════
   *  STEP 2.5: Xác thực OTP
   * ═══════════════════════════════════════════════ */
  if (page === 'verify') return (
    <div className="container mt-4" style={{ maxWidth: 520 }}>
      <StepsBar active={2} verifying />
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔐</div>
        <h2 style={{ marginBottom: 8 }}>Xác thực thông tin</h2>
        <p className="text-dim text-sm" style={{ marginBottom: 24, lineHeight: 1.6 }}>
          Mã xác thực 6 chữ số sẽ được gửi tới<br />
          <strong style={{ color: 'var(--accent)' }}>📱 {shipping.phone}</strong> và <strong style={{ color: 'var(--accent)' }}>📧 {shipping.email}</strong>
        </p>

        {!otpSent ? (
          /* Chưa gửi OTP — hiển thị nút gửi */
          <button
            className="btn btn-cta btn-lg btn-block"
            onClick={sendOtp}
            disabled={otpSending}
          >
            {otpSending ? '⏳ Đang gửi...' : '📨 GỬI MÃ XÁC THỰC'}
          </button>
        ) : (
          /* Đã gửi OTP — hiển thị form nhập */
          <>
            {/* Expiry timer */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20,
              color: expiryCountdown <= 10 ? 'var(--danger)' : 'var(--text-secondary)',
              fontSize: '0.85rem', fontWeight: 600
            }}>
              <span>⏱ Mã hết hạn sau:</span>
              <span style={{ 
                fontFamily: 'monospace', fontSize: '1rem',
                color: expiryCountdown <= 10 ? 'var(--danger)' : 'var(--accent)',
                fontWeight: 800
              }}>
                {expiryCountdown > 0 ? `00:${String(expiryCountdown).padStart(2, '0')}` : 'Hết hạn!'}
              </span>
            </div>

            {/* OTP Input */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input
                className="input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '')
                  if (val.length <= 6) setOtpCode(val)
                }}
                placeholder="● ● ● ● ● ●"
                style={{
                  textAlign: 'center', fontSize: '1.8rem', letterSpacing: '0.8rem',
                  fontWeight: 800, fontFamily: 'monospace',
                  padding: '16px 20px',
                  background: 'rgba(255,255,255,0.05)',
                  border: otpError ? '2px solid var(--danger)' : '2px solid var(--border)',
                  borderRadius: 12
                }}
                autoFocus
              />
            </div>

            {/* Error message */}
            {otpError && (
              <div style={{
                background: 'var(--danger-bg)', color: 'var(--danger)',
                padding: '10px 16px', borderRadius: 8, marginBottom: 16,
                fontSize: '0.85rem', fontWeight: 600
              }}>
                ⚠️ {otpError}
              </div>
            )}

            {/* Verify button */}
            <button
              className="btn btn-cta btn-lg btn-block"
              onClick={verifyOtp}
              disabled={otpVerifying || otpCode.length !== 6 || expiryCountdown === 0}
              style={{ marginBottom: 16 }}
            >
              {otpVerifying ? '⏳ Đang xác thực...' : '✅ XÁC NHẬN MÃ'}
            </button>

            {/* Resend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
              <span className="text-dim text-sm">Không nhận được mã?</span>
              {resendCooldown > 0 ? (
                <span className="text-dim text-sm" style={{ fontWeight: 600 }}>
                  Gửi lại sau <span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>{resendCooldown}s</span>
                </span>
              ) : (
                <button
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--accent)',
                    cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit',
                    textDecoration: 'underline'
                  }}
                  onClick={sendOtp}
                  disabled={otpSending}
                >
                  {otpSending ? 'Đang gửi...' : '🔄 Gửi lại mã'}
                </button>
              )}
            </div>
          </>
        )}

        <div className="flex gap-1 mt-4" style={{ justifyContent: 'center' }}>
          <button className="btn btn-outline btn-sm" onClick={() => setPage('shipping')}>← Sửa thông tin</button>
        </div>
      </div>
    </div>
  )

  /* ═══════════════════════════════════════════════
   *  STEP 3: Review đơn hàng + Chọn thanh toán
   * ═══════════════════════════════════════════════ */
  if (page === 'payment') return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <StepsBar active={3} />

      {/* Review đơn hàng */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>📋 Review đơn hàng</h3>
        {cart.map((it, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={it.imageUrl || `https://placehold.co/60x45/1E293B/06B6D4?text=${encodeURIComponent(it.brand || '?')}`} alt="" style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 6, background: 'var(--bg-dark)' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{it.name}</div>
                <div className="text-dim text-xs">{Object.values(it.selectedOptions || {}).join(' · ')}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="text-dim text-xs">SL: {it.quantity || 1} × {fmt(it.finalPrice)}₫</div>
              <div className="fw-700" style={{ color: 'var(--accent)' }}>{fmt((it.quantity || 1) * it.finalPrice)}₫</div>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
          <span className="text-dim">Phí giao hàng</span>
          <span className="tag tag-green">Miễn phí</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <h3>Tổng thanh toán</h3>
          <h3 style={{ color: 'var(--accent)', fontSize: '1.4rem' }}>{fmt(cartTotal)}₫</h3>
        </div>
      </div>

      {/* Thông tin giao hàng (tóm tắt) */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>📦 Giao đến</h3>
          <div className="flex gap-1">
            <span className="tag tag-green">✓ Đã xác thực</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPage('shipping')}>Sửa</button>
          </div>
        </div>
        <div className="mt-2 text-sm">
          <div><strong>{shipping.name}</strong> — {shipping.phone}</div>
          <div className="text-dim">{shipping.email}</div>
          <div className="text-dim">{shipping.address}</div>
        </div>
      </div>

      {/* Hình thức thanh toán */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>💳 Hình thức thanh toán</h3>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '14px 16px',
          border: paymentMethod === 'cash' ? '2px solid var(--accent)' : '1px solid var(--border)',
          borderRadius: 10, background: paymentMethod === 'cash' ? 'rgba(0, 240, 255, 0.06)' : 'rgba(255,255,255,0.02)',
          marginBottom: 12, transition: 'all 0.2s'
        }}>
          <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} style={{ accentColor: 'var(--accent)' }} />
          <div>
            <div style={{ fontWeight: 600 }}>💵 Tiền mặt (COD)</div>
            <div className="text-dim text-xs">Thanh toán khi nhận hàng tại cửa hàng hoặc giao tận nơi</div>
          </div>
        </label>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '14px 16px',
          border: paymentMethod === 'transfer' ? '2px solid var(--accent)' : '1px solid var(--border)',
          borderRadius: 10, background: paymentMethod === 'transfer' ? 'rgba(0, 240, 255, 0.06)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s'
        }}>
          <input type="radio" name="payment" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} style={{ accentColor: 'var(--accent)' }} />
          <div>
            <div style={{ fontWeight: 600 }}>🏦 Chuyển khoản ngân hàng</div>
            <div className="text-dim text-xs">Nhân viên sẽ gửi thông tin tài khoản sau khi xác nhận đơn</div>
          </div>
        </label>
      </div>

      {/* Nút đặt hàng */}
      <div className="flex gap-1">
        <button className="btn btn-outline" onClick={() => setPage('shipping')}>← Quay lại</button>
        <button className="btn btn-cta btn-lg btn-shimmer" style={{ flex: 1 }} onClick={submitOrder}>
          ✅ XÁC NHẬN ĐẶT HÀNG
        </button>
      </div>
    </div>
  )

  return null
}

/* ═══════════════════════════════════════════════
 *  Reusable StepsBar component
 * ═══════════════════════════════════════════════ */
function StepsBar({ active, verifying }) {
  return (
    <div className="steps">
      <div className={`step ${active >= 1 ? 'active' : ''}`}>
        <span className="num">{active > 1 ? '✓' : '1'}</span>Giỏ hàng
      </div>
      <div className="step-line" />
      <div className={`step ${active >= 2 ? 'active' : ''}`}>
        <span className="num">{active > 2 ? '✓' : '2'}</span>
        {verifying ? 'Xác thực OTP' : 'Thông tin'}
      </div>
      <div className="step-line" />
      <div className={`step ${active >= 3 ? 'active' : ''}`}>
        <span className="num">3</span>Xác nhận
      </div>
    </div>
  )
}
