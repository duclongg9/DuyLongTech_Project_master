import { condLabel, fmt } from '../constants'

/**
 * CartPage Component
 * Props: cart, removeFromCart, cartTotal, setPage, setModal, user
 */
export default function CartPage({ cart, removeFromCart, cartTotal, setPage, setModal, user }) {
  return (
    <div className="container mt-4" style={{ maxWidth: 800 }}>
      <div className="steps">
        <div className="step active"><span className="num">1</span>Giỏ hàng</div><div className="step-line" />
        <div className="step"><span className="num">2</span>Giao hàng</div><div className="step-line" />
        <div className="step"><span className="num">3</span>Thanh toán</div>
      </div>
      <div className="card" style={{ padding: 24 }}>
        <h2>Giỏ hàng ({cart.length})</h2>
        {cart.length === 0 ? <p className="text-dim mt-2">Chưa có sản phẩm nào</p> : <>
          {cart.map((it, i) => <div key={i} className="cart-item">
            <img src={it.imageUrl || `https://placehold.co/160x120/F5F5F7/1D1D1F?text=${encodeURIComponent(it.brand)}`} alt="" />
            <div className="cart-item-info"><h4>{it.name}</h4><p>{it.selectedRam} · {it.selectedSsd}</p><p>{condLabel(it.condition)} · BH {it.warrantyMonths} tháng</p></div>
            <div><div className="cart-item-price">{fmt(it.finalPrice)}₫</div><button className="btn btn-outline btn-sm mt-1" onClick={() => removeFromCart(i)}>Xóa</button></div>
          </div>)}
          <div className="flex-between mt-3"><h3>Tổng cộng</h3><h3 style={{ fontSize: '1.4rem' }}>{fmt(cartTotal)}₫</h3></div>
          <button className="btn btn-cta btn-lg btn-block mt-2" onClick={() => { if (!user) return setModal('login'); setPage('shipping') }}>TIẾP TỤC</button>
        </>}
      </div>
    </div>
  )
}
