import { useState, useEffect, useRef, useCallback } from 'react'
import { condLabel, condClass, fmt } from '../constants'
import { EditableText, EditableImage } from '../components/EditableElements'
import { useVisualEditor } from '../components/VisualEditorContext'
import { API } from '../api/client'

const DEFAULT_FEEDBACKS = [
  { id: 1, quote: '"Máy đẹp như mới, nhân viên tư vấn cực kỳ nhiệt tình. Đã mua chiếc ThinkPad thứ 2 tại đây và luôn hài lòng."', name: 'Chị Dung', position: 'Trưởng phòng Marketing', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', stars: 5 },
  { id: 2, quote: '"Lúc đầu hơi ngại mua máy cũ, nhưng xem chế độ bảo hành 12 tháng 1 đổi 1 của shop là yên tâm quẹt thẻ liền."', name: 'Anh Tâm', position: 'DevOps Engineer', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80', stars: 5 },
  { id: 3, quote: '"Giao hàng hỏa tốc trong 2 tiếng, có kỹ thuật viên support cài sẵn đầy đủ phần mềm. Rất đáng tiền!"', name: 'Bạn Linh', position: 'Sinh viên FPT', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', stars: 5 },
]

// ===== PRODUCT CAROUSEL =====
function ProductCarousel({ items, onSelect, isAdmin, onEdit, onDelete }) {
  const trackRef = useRef(null)
  const [page, setPage] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [perPage, setPerPage] = useState(4)

  useEffect(() => {
    const handleResize = () => setPerPage(window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 4)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalPages = Math.ceil(items.length / perPage) || 1

  const goTo = useCallback((p) => {
    const next = ((p % totalPages) + totalPages) % totalPages
    setPage(next)
  }, [totalPages])

  useEffect(() => {
    if (isPaused || totalPages <= 1) return
    const id = setInterval(() => goTo(page + 1), 5000)
    return () => clearInterval(id)
  }, [page, isPaused, totalPages, goTo])

  return (
    <div className="carousel-wrap" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="carousel-viewport" style={{ overflow: 'hidden', width: '100%' }}>
        <div 
          ref={trackRef} 
          className="carousel-track" 
          style={{ 
            display: 'flex', 
            transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
            transform: `translateX(-${page * 100}%)`
          }}
        >
          {Array.from({ length: totalPages }).map((_, pi) => (
            <div 
              key={pi} 
              style={{ 
                flex: '0 0 100%', 
                display: 'grid', 
                gridTemplateColumns: `repeat(${perPage}, 1fr)`, 
                gap: '24px', 
                padding: '0 4px' 
              }}
            >
              {items.slice(pi * perPage, pi * perPage + perPage).map(p => (
                <div key={p.id} className="product-card" style={{ cursor: 'pointer', position: 'relative' }}>
                  {p.priceNegotiable && <div className="badge badge-sale">Giá Sốc</div>}
                  {!p.priceNegotiable && p.condition === 'NEW' && <div className="badge badge-new">Mới 100%</div>}
                  {!p.priceNegotiable && p.condition === 'LIKE_NEW' && <div className="badge badge-likenew">Like New 99%</div>}
                  <div className="thumb" onClick={() => onSelect(p)}>
                    <img src={p.imageUrl || 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=400&q=80'} alt={p.name} />
                    <div className="quick-specs-hover">
                      <div className="quick-spec-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>{p.cpuModel}</div>
                      <div className="quick-spec-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>{p.ramAmount} RAM</div>
                      <div className="quick-spec-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>{p.storageMain}</div>
                    </div>
                  </div>
                  <div className="body" onClick={() => onSelect(p)}>
                    <span className={`tag ${condClass(p.condition)}`}>{condLabel(p.condition)}</span>
                    <h3>{p.name}</h3>
                    <p className="specs">{p.displaySize} • {p.displayRes}</p>
                    {p.callForPrice
                      ? <p className="price" style={{ fontSize: '1.2rem' }}>Liên hệ báo giá</p>
                      : <div className="price-wrapper mt-2"><span className="price">{fmt(p.basePrice)}₫</span>{p.priceNegotiable && <span className="original-price">{fmt(p.basePrice * 1.15)}₫</span>}</div>
                    }
                    <p className="gift-text mt-2">🎁 Tặng Balo + Chuột không dây</p>
                  </div>
                  {isAdmin && (
                    <div className="admin-card-actions">
                      <button className="aca-btn aca-edit" onClick={(e) => { e.stopPropagation(); onEdit(p) }} title="Sửa">✎</button>
                      <button className="aca-btn aca-del" onClick={(e) => { e.stopPropagation(); onDelete(p) }} title="Xóa">✕</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {totalPages > 1 && (
        <>
          <button className="carousel-arrow carousel-prev" onClick={() => goTo(page - 1)}>‹</button>
          <button className="carousel-arrow carousel-next" onClick={() => goTo(page + 1)}>›</button>
          <div className="carousel-dots">{Array.from({ length: totalPages }).map((_, i) => (
            <span key={i} className={`dot ${i === page ? 'active' : ''}`} onClick={() => goTo(i)} />
          ))}</div>
        </>
      )}
    </div>
  )
}

// ===== PRODUCT EDIT MODAL =====
function ProductModal({ product, onClose, onSave }) {
  const isNew = !product?.id
  const [form, setForm] = useState(product || { name: '', brand: '', basePrice: 0, cpuModel: '', ramAmount: '', storageMain: '', displaySize: '', displayRes: '', imageUrl: '', condition: 'NEW', inStock: true })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    try {
      const url = isNew ? `${API}/admin/products` : `${API}/admin/products/${product.id}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { onSave(); onClose() }
    } catch (e) { alert('Lỗi: ' + e.message) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <h2>{isNew ? '➕ Thêm Sản Phẩm' : '✏️ Sửa Sản Phẩm'}</h2>
        <div className="form-group"><label className="form-label">Tên</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">Hãng</label><input className="input" value={form.brand || ''} onChange={e => set('brand', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Giá (₫)</label><input className="input" type="number" value={form.basePrice || 0} onChange={e => set('basePrice', +e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">CPU</label><input className="input" value={form.cpuModel || ''} onChange={e => set('cpuModel', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">RAM</label><input className="input" value={form.ramAmount || ''} onChange={e => set('ramAmount', e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">Ổ cứng</label><input className="input" value={form.storageMain || ''} onChange={e => set('storageMain', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Tình trạng</label>
            <select className="input" value={form.condition || 'NEW'} onChange={e => set('condition', e.target.value)}>
              <option value="NEW">Mới 100%</option><option value="LIKE_NEW">Like New 99%</option><option value="GOOD_95">Đẹp 95%</option><option value="GOOD_90">Tốt 90%</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">Màn hình</label><input className="input" value={form.displaySize || ''} onChange={e => set('displaySize', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Độ phân giải</label><input className="input" value={form.displayRes || ''} onChange={e => set('displayRes', e.target.value)} /></div>
        </div>
        <div className="form-group"><label className="form-label">URL hình ảnh</label><input className="input" value={form.imageUrl || ''} onChange={e => set('imageUrl', e.target.value)} /></div>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="btn btn-dark btn-block" onClick={onClose}>Hủy</button>
          <button className="btn btn-cta btn-block" onClick={handleSave}>{isNew ? 'Thêm' : 'Lưu'}</button>
        </div>
      </div>
    </div>
  )
}

// ===== FEEDBACK EDIT MODAL =====
function FeedbackModal({ fb, onClose, onSave }) {
  const isNew = !fb
  const [form, setForm] = useState(fb || { quote: '', name: '', position: '', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', stars: 5 })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <h2>{isNew ? '➕ Thêm Đánh Giá' : '✏️ Sửa Đánh Giá'}</h2>
        <div className="form-group"><label className="form-label">Nội dung đánh giá</label><textarea className="input" rows={3} value={form.quote} onChange={e => set('quote', e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">Tên khách hàng</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Chức danh</label><input className="input" value={form.position} onChange={e => set('position', e.target.value)} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">URL Avatar</label><input className="input" value={form.avatar} onChange={e => set('avatar', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Số sao (1-5)</label><input className="input" type="number" min={1} max={5} value={form.stars} onChange={e => set('stars', +e.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="btn btn-dark btn-block" onClick={onClose}>Hủy</button>
          <button className="btn btn-cta btn-block" onClick={() => { onSave(form); onClose() }}>{isNew ? 'Thêm' : 'Lưu'}</button>
        </div>
      </div>
    </div>
  )
}

// ===== MAIN HOMEPAGE =====
export default function HomePage({ products, uiSettings, setPage, setSel, setConfig, user, notify }) {
  const [tab, setTab] = useState('All')
  const [productModal, setProductModal] = useState(null) // null | 'new' | product
  const [feedbackModal, setFeedbackModal] = useState(null) // null | 'new' | { index, fb }
  const [feedbacks, setFeedbacks] = useState(DEFAULT_FEEDBACKS)

  const isAdmin = user?.role === 'ADMIN'
  const brands = ['All', ...new Set(products.map(p => p.brand))]
  const filtered = tab === 'All' ? products : products.filter(p => p.brand === tab)

  const handleSelectProduct = (p) => { setSel(p); setConfig({}); setPage('pdp') }
  const handleDeleteProduct = async (p) => {
    if (!confirm(`Xóa sản phẩm "${p.name}"?`)) return
    try {
      await fetch(`${API}/admin/products/${p.id}`, { method: 'DELETE' })
      notify?.('✅ Đã xóa sản phẩm')
      window.location.reload()
    } catch (e) { alert('Lỗi: ' + e.message) }
  }
  const handleProductSaved = () => { notify?.('✅ Đã lưu sản phẩm'); window.location.reload() }

  // Feedback CRUD
  const addFeedback = (fb) => setFeedbacks(prev => [...prev, { ...fb, id: Date.now() }])
  const updateFeedback = (idx, fb) => setFeedbacks(prev => prev.map((f, i) => i === idx ? { ...f, ...fb } : f))
  const deleteFeedback = (idx) => { if (confirm('Xóa đánh giá này?')) setFeedbacks(prev => prev.filter((_, i) => i !== idx)) }

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-bento">
          <div className="hero-main-card">
            <div className="hero-text">
              <h1><EditableText settingKey="home.hero.title" defaultText="Đỉnh Cao Công Nghệ" /><br /><span><EditableText settingKey="home.hero.subtitle" defaultText="Chạm Tay Tới Tương Lai" /></span></h1>
              <p><EditableText settingKey="home.hero.description" defaultText="Khám phá bộ sưu tập laptop cao cấp với hiệu năng vượt trội. Thiết kế mỏng nhẹ, sang trọng, sẵn sàng đồng hành cùng bạn chinh phục mọi thử thách." /></p>
              <div className="hero-actions">
                <button className="btn btn-cta btn-lg" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>Khám Phá Ngay</button>
                <button className="btn btn-neon-cyan btn-lg" onClick={() => setPage('pcbuild')}>Đấu Trường Hiệu Năng</button>
              </div>
            </div>
          </div>
          <div className="bento-side">
            <div className="bento-card" onClick={() => { setTab('Apple'); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }}>
              <EditableImage settingKey="home.bento.img1" src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80" alt="MacBook" className="bg-img" />
              <div className="card-content"><h3><EditableText settingKey="home.bento.title1" defaultText="Sáng Tạo Bất Tận" /></h3><p><EditableText settingKey="home.bento.desc1" defaultText="MacBook Pro & Air" /></p></div>
            </div>
            <div className="bento-card" onClick={() => { setTab('Asus'); document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) }}>
              <EditableImage settingKey="home.bento.img2" src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80" alt="Gaming" className="bg-img" />
              <div className="card-content"><h3><EditableText settingKey="home.bento.title2" defaultText="Sức Mạnh Tối Đa" /></h3><p><EditableText settingKey="home.bento.desc2" defaultText="Gaming ROG & Legion" /></p></div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAND */}
      <div className="trust-band">
        <div className="container trust-inner">
          <div className="trust-item"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg><EditableText tag="span" settingKey="home.trust.1" defaultText="12 Tháng 1 Đổi 1" /></div>
          <div className="trust-item"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg><EditableText tag="span" settingKey="home.trust.2" defaultText="Đổi Trả 7 Ngày" /></div>
          <div className="trust-item"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg><EditableText tag="span" settingKey="home.trust.3" defaultText="Trả Góp 0%" /></div>
          <div className="trust-item"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg><EditableText tag="span" settingKey="home.trust.4" defaultText="Freeship Toàn Quốc" /></div>
        </div>
      </div>

      {/* PRODUCTS CAROUSEL */}
      <section className="container mt-5" id="products" style={{ marginBottom: '80px' }}>
        <div className="flex-between mb-4 flex-wrap gap-3">
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Sản phẩm nổi bật</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isAdmin && <button className="btn btn-cta btn-sm" onClick={() => setProductModal('new')}>＋ Thêm sản phẩm</button>}
            <div className="brand-nav">
              {brands.map(b => (<div key={b} className={`brand-item ${tab === b ? 'active' : ''}`} onClick={() => setTab(b)}>{b === 'All' ? 'Tất Cả' : b.toUpperCase()}</div>))}
            </div>
          </div>
        </div>
        <ProductCarousel items={filtered} onSelect={handleSelectProduct} isAdmin={isAdmin} onEdit={(p) => setProductModal(p)} onDelete={handleDeleteProduct} />
      </section>

      {/* FEEDBACK SECTION WITH CRUD */}
      <section className="container mt-5 mb-5 feedback-section">
        <div className="flex-between mb-4">
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', flex: 1 }}>
            <EditableText settingKey="home.feedback.title" defaultText="Trải nghiệm khách hàng" />
          </h2>
          {isAdmin && <button className="btn btn-cta btn-sm" onClick={() => setFeedbackModal('new')}>＋ Thêm đánh giá</button>}
        </div>
        <div className="grid g3">
          {feedbacks.map((fb, idx) => (
            <div key={fb.id} className="feedback-card" style={{ position: 'relative' }}>
              <div className="stars">{'★'.repeat(fb.stars)}{'☆'.repeat(5 - fb.stars)}</div>
              <p className="quote">{fb.quote}</p>
              <div className="customer">
                <div className="avatar"><img src={fb.avatar} alt="Avatar" /></div>
                <div><strong>{fb.name}</strong><br /><span>{fb.position}</span></div>
              </div>
              {isAdmin && (
                <div className="admin-card-actions" style={{ top: 8, right: 8 }}>
                  <button className="aca-btn aca-edit" onClick={() => setFeedbackModal({ index: idx, fb })} title="Sửa">✎</button>
                  <button className="aca-btn aca-del" onClick={() => deleteFeedback(idx)} title="Xóa">✕</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ZALO */}
      <div className="sticky-contact">
        <a href="https://zalo.me/0988888888" target="_blank" rel="noreferrer" className="fab-zalo">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M21.364 12.015c0-4.606-4.237-8.344-9.458-8.344-5.22 0-9.459 3.738-9.459 8.344 0 4.605 4.239 8.344 9.459 8.344 1.256 0 2.45-.224 3.55-.632l4.135 1.488-.868-3.376c1.685-1.424 2.641-3.486 2.641-5.824z"></path></svg>
        </a>
      </div>

      {/* MODALS */}
      {productModal && <ProductModal product={productModal === 'new' ? null : productModal} onClose={() => setProductModal(null)} onSave={handleProductSaved} />}
      {feedbackModal && <FeedbackModal fb={feedbackModal === 'new' ? null : feedbackModal.fb} onClose={() => setFeedbackModal(null)} onSave={(data) => feedbackModal === 'new' ? addFeedback(data) : updateFeedback(feedbackModal.index, data)} />}
    </>
  )
}
