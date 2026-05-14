import { useState } from 'react'
import { fmt } from '../constants'

/**
 * CheckoutPage Component (Handles shipping and payment steps)
 * Props: page, setPage, cart, cartTotal, setCart, notify
 */
export default function CheckoutPage({ page, setPage, cart, cartTotal, setCart, notify }) {
  const [shipping, setShipping] = useState({ name: '', phone: '', address: '' })

  if (page === 'shipping') return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <div className="steps"><div className="step active"><span className="num">✓</span>Giỏ hàng</div><div className="step-line" /><div className="step active"><span className="num">2</span>Giao hàng</div><div className="step-line" /><div className="step"><span className="num">3</span>Thanh toán</div></div>
      <div className="card" style={{ padding: 24 }}>
        <h2>Thông tin giao hàng</h2>
        <div className="form-group mt-2"><label className="form-label">Họ tên *</label><input className="input" value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })} required /></div>
        <div className="form-group"><label className="form-label">Số điện thoại *</label><input className="input" value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} required /></div>
        <div className="form-group"><label className="form-label">Địa chỉ nhận hàng *</label><textarea className="input" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP" required /></div>
        <div className="flex gap-1 mt-2">
          <button className="btn btn-outline" onClick={() => setPage('cart')}>← Quay lại</button>
          <button className="btn btn-cta btn-lg" style={{ flex: 1 }} onClick={() => { if (!shipping.name || !shipping.phone || !shipping.address) return alert('Vui lòng nhập đầy đủ'); setPage('payment') }}>TIẾP TỤC →</button>
        </div>
      </div>
    </div>
  )

  if (page === 'payment') return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <div className="steps"><div className="step active"><span className="num">✓</span>Giỏ hàng</div><div className="step-line" /><div className="step active"><span className="num">✓</span>Giao hàng</div><div className="step-line" /><div className="step active"><span className="num">3</span>Thanh toán</div></div>
      <div className="grid g2">
        <div className="card" style={{ padding: 24 }}>
          <h3>Đơn hàng</h3>
          {cart.map((it, i) => <div key={i} className="flex-between mt-1 text-sm"><span>{it.name}</span><span className="fw-700">{fmt(it.finalPrice)}₫</span></div>)}
          <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid var(--border-light)' }} />
          <div className="flex-between"><span>Giao hàng</span><span className="tag tag-green">Miễn phí</span></div>
          <div className="flex-between mt-1"><h3>Tổng thanh toán</h3><h3 style={{ color: 'var(--cta)' }}>{fmt(cartTotal)}₫</h3></div>
        </div>
        <div className="card text-center" style={{ padding: 24 }}>
          <h3>Quét mã VietQR</h3>
          <img src={`https://img.vietqr.io/image/vcb-0011004455667-compact2.png?amount=${cartTotal}&addInfo=DH${Date.now()}&accountName=DUY%20LONG%20TECH`} style={{ width: 200, margin: '16px auto', borderRadius: 8 }} alt="QR" />
          <p className="text-sm text-dim">Nội dung CK: DH{Date.now().toString().slice(-6)}</p>
          <button className="btn btn-cta btn-lg btn-block mt-2" onClick={() => { setCart([]); setPage('home'); notify('✅ Đặt hàng thành công! Chúng tôi sẽ liên hệ xác nhận.') }}>XÁC NHẬN ĐÃ THANH TOÁN</button>
        </div>
      </div>
    </div>
  )

  return null
}
