import { condLabel, fmt } from '../constants'

/**
 * CartPage Component
 * Props: cart, removeFromCart, updateQuantity, cartTotal, setPage, setModal, user
 */
export default function CartPage({ cart, removeFromCart, updateQuantity, cartTotal, setPage, setModal, user }) {
  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <div className="steps">
        <div className="step active"><span className="num">1</span>Giỏ hàng</div><div className="step-line" />
        <div className="step"><span className="num">2</span>Giao hàng</div><div className="step-line" />
        <div className="step"><span className="num">3</span>Xác nhận</div>
      </div>
      <div className="card" style={{ padding: 24 }}>
        <h2>Giỏ hàng ({cart.reduce((s, it) => s + (it.quantity || 1), 0)} sản phẩm)</h2>
        {cart.length === 0 ? (
          <div className="text-center mt-4" style={{ padding: '40px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🛒</div>
            <p className="text-dim">Chưa có sản phẩm nào trong giỏ hàng</p>
            <button className="btn btn-outline mt-3" onClick={() => setPage('home')}>← Tiếp tục mua sắm</button>
          </div>
        ) : <>
          {cart.map((it, i) => (
            <div key={i} className="cart-item" style={{ padding: '16px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 16, alignItems: 'center' }}>
              <img
                src={it.imageUrl || `https://placehold.co/100x75/1E293B/06B6D4?text=${encodeURIComponent(it.brand || '?')}`}
                alt=""
                style={{ width: 100, height: 75, objectFit: 'cover', borderRadius: 8, background: 'var(--bg-dark)' }}
              />
              <div style={{ flex: 1 }}>
                <h4 style={{ marginBottom: 4 }}>{it.name}</h4>
                <p className="text-dim text-xs">{Object.values(it.selectedOptions || {}).join(' · ')}</p>
                {it.condition && <p className="text-dim text-xs">{condLabel(it.condition)} · BH {it.warrantyMonths} tháng</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 140 }}>
                <div className="cart-item-price" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {fmt((it.quantity || 1) * it.finalPrice)}₫
                </div>
                {(it.quantity || 1) > 1 && (
                  <div className="text-dim text-xs">{it.quantity} × {fmt(it.finalPrice)}₫</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 8, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                  <button
                    onClick={() => updateQuantity(i, (it.quantity || 1) - 1)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, transition: 'background 0.2s' }}
                    onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={e => e.target.style.background = 'transparent'}
                  >−</button>
                  <div style={{ padding: '6px 8px', fontSize: '0.9rem', minWidth: 28, textAlign: 'center', fontWeight: 700, borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                    {it.quantity || 1}
                  </div>
                  <button
                    onClick={() => updateQuantity(i, (it.quantity || 1) + 1)}
                    style={{ background: 'transparent', border: 'none', color: '#fff', padding: '6px 14px', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, transition: 'background 0.2s' }}
                    onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={e => e.target.style.background = 'transparent'}
                  >+</button>
                </div>
                <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)', fontSize: '0.75rem' }} onClick={() => removeFromCart(i)}>🗑 Xóa</button>
              </div>
            </div>
          ))}

          {/* Tổng */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, padding: '16px 0', borderTop: '2px solid var(--border)' }}>
            <div>
              <h3>Tổng cộng</h3>
              <span className="text-dim text-xs">{cart.reduce((s, it) => s + (it.quantity || 1), 0)} sản phẩm</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--accent)', letterSpacing: '-0.5px' }}>{fmt(cartTotal)}₫</h3>
          </div>
          <button className="btn btn-cta btn-lg btn-block btn-shimmer mt-2" onClick={() => setPage('shipping')}>
            TIẾP TỤC ĐẶT HÀNG →
          </button>
        </>}
      </div>
    </div>
  )
}
