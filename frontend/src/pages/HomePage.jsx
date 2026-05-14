import { useState } from 'react'
import { condLabel, condClass, fmt } from '../constants'

/**
 * HomePage — Luxury E-commerce storefront
 */
export default function HomePage({ products, uiSettings, setPage, setSel, setConfig }) {
  const [tab, setTab] = useState('All')

  const brands = ['All', ...new Set(products.map(p => p.brand))]
  const filtered = tab === 'All' ? products : products.filter(p => p.brand === tab)

  return (
    <>
      <section className="hero">
        <div className="container hero-bento">
          {/* Main Bento Box */}
          <div className="hero-main-card">
            <div className="hero-text">
              <h1>Đỉnh Cao Công Nghệ<br /><span>Chạm Tay Tới Tương Lai</span></h1>
              <p>Khám phá bộ sưu tập laptop cao cấp với hiệu năng vượt trội. Thiết kế mỏng nhẹ, sang trọng, sẵn sàng đồng hành cùng bạn chinh phục mọi thử thách.</p>
              <div className="hero-actions">
                <button className="btn btn-cta btn-lg" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
                  Khám Phá Ngay
                </button>
                <button className="btn btn-neon-cyan btn-lg" onClick={() => setPage('pcbuild')}>
                  Đấu Trường Hiệu Năng
                </button>
              </div>
            </div>
          </div>

          {/* Side Bento Boxes */}
          <div className="bento-side">
            <div className="bento-card" onClick={() => { setTab('Apple'); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }}>
              <img className="bg-img" src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80" alt="MacBook" />
              <div className="card-content">
                <h3>Sáng Tạo Bất Tận</h3>
                <p>MacBook Pro & Air</p>
              </div>
            </div>
            <div className="bento-card" onClick={() => { setTab('Asus'); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }}>
              <img className="bg-img" src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80" alt="Gaming" />
              <div className="card-content">
                <h3>Sức Mạnh Tối Đa</h3>
                <p>Gaming ROG & Legion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="trust-band">
        <div className="container trust-inner">
          <div className="trust-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span>12 Tháng 1 Đổi 1</span>
          </div>
          <div className="trust-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            <span>Đổi Trả 7 Ngày</span>
          </div>
          <div className="trust-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            <span>Trả Góp 0%</span>
          </div>
          <div className="trust-item">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
            <span>Freeship Toàn Quốc</span>
          </div>
        </div>
      </div>

      <section className="container mt-5" id="products" style={{ marginBottom: '80px' }}>
        <div className="flex-between mb-4 flex-wrap gap-3">
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Sản phẩm nổi bật</h2>
          <div className="brand-nav">
            {brands.map(b => (
              <div
                key={b}
                className={`brand-item ${tab === b ? 'active' : ''}`}
                onClick={() => setTab(b)}
              >
                {b === 'All' ? 'Tất Cả' : b.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid g4">
          {filtered.map(p => (
            <div key={p.id} className="product-card" onClick={() => { setSel(p); setConfig({ ram: p.ramAmount, ssd: p.storageMain }); setPage('pdp') }}>
              {/* Sale Badge */}
              {p.priceNegotiable && <div className="badge badge-sale">Giá Sốc</div>}
              {!p.priceNegotiable && p.condition === 'NEW' && <div className="badge badge-new">Mới 100%</div>}
              {!p.priceNegotiable && p.condition === 'LIKE_NEW' && <div className="badge badge-likenew">Like New 99%</div>}
              
              <div className="thumb">
                <img src={p.imageUrl || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=400&q=80'} alt={p.name} />
                
                {/* Quick Specs Hover Effect */}
                <div className="quick-specs-hover">
                  <div className="quick-spec-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                    {p.cpuModel}
                  </div>
                  <div className="quick-spec-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    {p.ramAmount} RAM
                  </div>
                  <div className="quick-spec-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                    {p.storageMain}
                  </div>
                </div>
              </div>

              <div className="body">
                <span className={`tag ${condClass(p.condition)}`}>{condLabel(p.condition)}</span>
                <h3>{p.name}</h3>
                <p className="specs">{p.displaySize} • {p.displayRes}</p>
                {p.callForPrice
                  ? <p className="price" style={{ fontSize: '1.2rem' }}>Liên hệ báo giá</p>
                  : (
                    <div className="price-wrapper mt-2">
                      <span className="price">{fmt(p.basePrice)}₫</span>
                      {p.priceNegotiable && <span className="original-price">{fmt(p.basePrice * 1.15)}₫</span>}
                    </div>
                  )
                }
                <p className="gift-text mt-2">🎁 Tặng Balo + Chuột không dây</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section: Khách hàng tin tưởng */}
      <section className="container mt-5 mb-5 feedback-section">
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: '32px' }}>Trải nghiệm khách hàng</h2>
        <div className="grid g3">
          <div className="feedback-card">
            <div className="stars">★★★★★</div>
            <p className="quote">"Máy đẹp như mới, nhân viên tư vấn cực kỳ nhiệt tình. Đã mua chiếc ThinkPad thứ 2 tại đây và luôn hài lòng."</p>
            <div className="customer">
              <div className="avatar"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" alt="Avatar"/></div>
              <div><strong>Chị Dung</strong><br/><span>Trưởng phòng Marketing</span></div>
            </div>
          </div>
          <div className="feedback-card">
            <div className="stars">★★★★★</div>
            <p className="quote">"Lúc đầu hơi ngại mua máy cũ, nhưng xem chế độ bảo hành 12 tháng 1 đổi 1 của shop là yên tâm quẹt thẻ liền."</p>
            <div className="customer">
              <div className="avatar"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80" alt="Avatar"/></div>
              <div><strong>Anh Tâm</strong><br/><span>DevOps Engineer</span></div>
            </div>
          </div>
          <div className="feedback-card">
            <div className="stars">★★★★★</div>
            <p className="quote">"Giao hàng hỏa tốc trong 2 tiếng, có kỹ thuật viên support cài sẵn đầy đủ phần mềm. Rất đáng tiền!"</p>
            <div className="customer">
              <div className="avatar"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="Avatar"/></div>
              <div><strong>Bạn Linh</strong><br/><span>Sinh viên FPT</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Contact Zalo */}
      <div className="sticky-contact">
        <a href="https://zalo.me/0988888888" target="_blank" rel="noreferrer" className="fab-zalo">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M21.364 12.015c0-4.606-4.237-8.344-9.458-8.344-5.22 0-9.459 3.738-9.459 8.344 0 4.605 4.239 8.344 9.459 8.344 1.256 0 2.45-.224 3.55-.632l4.135 1.488-.868-3.376c1.685-1.424 2.641-3.486 2.641-5.824z"></path></svg>
        </a>
      </div>
    </>
  )
}

