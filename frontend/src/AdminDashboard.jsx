import { useState, useEffect } from 'react'
const API = 'http://localhost:8080/api'

export default function AdminDashboard({ user, onBack }) {
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [wallets, setWallets] = useState([])
  const [components, setComponents] = useState([])
  const [settings, setSettings] = useState({ bannerUrl: '', footerText: '', headerLogo: '' })
  const [editProduct, setEditProduct] = useState(null)
  const [editProductOptions, setEditProductOptions] = useState([])
  const [editComponent, setEditComponent] = useState(null)

  useEffect(() => { loadAll() }, [])

  const loadAll = () => {
    fetch(`${API}/admin/stats`).then(r=>r.json()).then(setStats).catch(()=>{})
    fetch(`${API}/admin/users`).then(r=>r.json()).then(setUsers).catch(()=>{})
    fetch(`${API}/products`).then(r=>r.json()).then(setProducts).catch(()=>{})
    fetch(`${API}/admin/components`).then(r=>r.json()).then(setComponents).catch(()=>{})
    fetch(`${API}/admin/settings`).then(r=>r.json()).then(setSettings).catch(()=>{})
    fetch(`${API}/admin/wallets`).then(r=>r.json()).then(setWallets).catch(()=>{})
  }

  const fmt = n => Number(n)?.toLocaleString('vi-VN')

  const updateRole = async (id, role) => {
    await fetch(`${API}/admin/users/${id}/role`, {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ role })
    })
    loadAll()
  }

  const editProductClick = async (p) => {
    setEditProduct({basePrice:p.basePrice, inStock:p.inStock, _id:p.id})
    const res = await fetch(`${API}/admin/products/${p.id}/options`)
    if (res.ok) setEditProductOptions(await res.json())
  }

  const updateProduct = async (id) => {
    if (!editProduct) return
    await fetch(`${API}/admin/products/${id}`, {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(editProduct)
    })
    await fetch(`${API}/admin/products/${id}/options`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(editProductOptions.map(o => ({...o, product: undefined})))
    })
    setEditProduct(null)
    loadAll()
  }

  const saveComponent = async (id) => {
    if (!editComponent) return
    const method = id === 'new' ? 'POST' : 'PUT'
    const url = id === 'new' ? `${API}/admin/components` : `${API}/admin/components/${id}`
    await fetch(url, {
      method, headers: {'Content-Type':'application/json'},
      body: JSON.stringify(editComponent)
    })
    setEditComponent(null)
    loadAll()
  }

  const saveSettings = async () => {
    await fetch(`${API}/admin/settings`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(settings)
    })
    alert('Đã lưu cấu hình UI')
  }



  const tabs = [
    { key: 'stats', label: '📊 Tổng quan' },
    { key: 'users', label: '👥 Tài khoản' },
    { key: 'products', label: '📦 Sản phẩm' },
    { key: 'components', label: '🧩 Linh kiện' },
    { key: 'ui', label: '🎨 Cấu hình Web' },
    { key: 'wallets', label: '💰 Ví Shipper' },
  ]

  return (
    <div className="admin-dash">
      <div className="ad-header">
        <button className="ad-back" onClick={onBack}>←</button>
        <h1>🛠️ Trang Quản Trị</h1>
        <span className="ad-user">👤 {user?.fullName}</span>
      </div>

      <div className="ad-tabs">
        {tabs.map(t => (
          <button key={t.key} className={`ad-tab ${tab===t.key?'active':''}`}
            onClick={()=>setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      <div className="ad-content">
        {/* STATS */}
        {tab==='stats' && stats && (
          <div className="ad-stats-grid">
            <div className="ad-stat-card"><div className="asc-value">{stats.totalUsers}</div><div className="asc-label">Tài khoản</div></div>
            <div className="ad-stat-card"><div className="asc-value">{stats.totalProducts}</div><div className="asc-label">Sản phẩm</div></div>
            <div className="ad-stat-card green"><div className="asc-value">{stats.availableProducts}</div><div className="asc-label">Còn hàng</div></div>
            <div className="ad-stat-card blue"><div className="asc-value">{stats.totalShippers}</div><div className="asc-label">Shipper</div></div>
            <div className="ad-stat-card yellow"><div className="asc-value">{fmt(stats.pendingBalance)}₫</div><div className="asc-label">Công nợ chờ TT</div></div>
          </div>
        )}

        {/* USERS */}
        {tab==='users' && (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead><tr><th>ID</th><th>Username</th><th>Họ tên</th><th>SĐT</th><th>Email</th><th>Role</th><th>Thao tác</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td className="ad-mono">{u.username}</td>
                    <td>{u.fullName}</td>
                    <td>{u.phone}</td>
                    <td>{u.email}</td>
                    <td><span className={`ad-role-badge ${u.role?.toLowerCase()}`}>{u.role}</span></td>
                    <td>
                      <select value={u.role} onChange={e=>updateRole(u.id,e.target.value)} className="ad-role-select">
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PRODUCTS */}
        {tab==='products' && (
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead><tr><th>ID</th><th>Tên</th><th>Giá</th><th>Tình trạng</th><th>Sửa</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td className="ad-mono">{fmt(p.basePrice)}₫</td>
                    <td>
                      <label style={{display:'flex', alignItems:'center', cursor:'pointer'}}>
                        <input type="checkbox" checked={p.inStock} onChange={(e) => {
                          fetch(`${API}/admin/products/${p.id}`, {
                            method: 'PUT', headers: {'Content-Type':'application/json'},
                            body: JSON.stringify({ inStock: e.target.checked })
                          }).then(loadAll)
                        }} />
                        <span style={{marginLeft: 8}} className={`ad-status ${p.inStock?'green':'red'}`}>{p.inStock ? 'Còn hàng' : 'Hết hàng'}</span>
                      </label>
                    </td>
                    <td>
                      <button className="ad-btn-sm" onClick={()=>editProductClick(p)}>✏️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {editProduct && (
              <div className="ad-edit-panel">
                <h3>✏️ Sửa sản phẩm #{editProduct._id}</h3>
                <label>Giá: <input type="number" value={editProduct.basePrice} onChange={e=>setEditProduct({...editProduct,basePrice:e.target.value})} /></label>
                <div style={{marginTop: 15, marginBottom: 15}}>
                  <h4>Tùy chọn cấu hình (Product Options)</h4>
                  {editProductOptions.map((opt, i) => (
                    <div key={i} style={{display:'flex', gap:8, marginBottom:8}}>
                      <input type="text" placeholder="Nhóm (VD: RAM)" value={opt.optionGroup || ''} onChange={e => { const newOpts = [...editProductOptions]; newOpts[i].optionGroup = e.target.value; setEditProductOptions(newOpts); }} />
                      <input type="text" placeholder="Tên (VD: 32GB)" value={opt.optionName || ''} onChange={e => { const newOpts = [...editProductOptions]; newOpts[i].optionName = e.target.value; setEditProductOptions(newOpts); }} />
                      <input type="number" placeholder="Cộng giá" value={opt.priceAdjustment || 0} onChange={e => { const newOpts = [...editProductOptions]; newOpts[i].priceAdjustment = e.target.value; setEditProductOptions(newOpts); }} />
                      <button className="ad-btn red" onClick={() => setEditProductOptions(editProductOptions.filter((_, idx) => idx !== i))}>Xóa</button>
                    </div>
                  ))}
                  <button className="ad-btn" onClick={() => setEditProductOptions([...editProductOptions, { optionGroup:'', optionName:'', priceAdjustment:0 }])}>+ Thêm Option</button>
                </div>
                <div className="ad-edit-actions">
                  <button className="ad-btn green" onClick={()=>updateProduct(editProduct._id)}>💾 Lưu</button>
                  <button className="ad-btn" onClick={()=>setEditProduct(null)}>Huỷ</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMPONENTS */}
        {tab==='components' && (
          <div className="ad-table-wrap">
            <button className="ad-btn green mb-3" onClick={()=>setEditComponent({ name:'', componentType:'', serialNumber:'', status:'AVAILABLE', _id:'new' })}>+ Thêm linh kiện mới</button>
            <table className="ad-table">
              <thead><tr><th>ID</th><th>Mã Serial</th><th>Tên Linh Kiện</th><th>Loại</th><th>Tình trạng</th><th>Sửa</th></tr></thead>
              <tbody>
                {components.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td className="ad-mono" style={{color:'#06B6D4'}}>{c.serialNumber}</td>
                    <td>{c.name}</td>
                    <td><span className="ad-role-badge">{c.componentType}</span></td>
                    <td><span className={`ad-status ${c.status==='AVAILABLE'?'green':'red'}`}>{c.status}</span></td>
                    <td><button className="ad-btn-sm" onClick={()=>setEditComponent({...c, _id: c.id})}>✏️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {editComponent && (
              <div className="ad-edit-panel">
                <h3>{editComponent._id==='new' ? '✨ Thêm Linh Kiện' : `✏️ Sửa Linh Kiện #${editComponent._id}`}</h3>
                <label>Tên: <input type="text" value={editComponent.name} onChange={e=>setEditComponent({...editComponent,name:e.target.value})} /></label>
                <label>Loại (CPU/RAM/VGA): <input type="text" value={editComponent.componentType} onChange={e=>setEditComponent({...editComponent,componentType:e.target.value})} /></label>
                <label>Số Serial: <input type="text" value={editComponent.serialNumber} onChange={e=>setEditComponent({...editComponent,serialNumber:e.target.value})} /></label>
                <label>Trạng thái: 
                  <select value={editComponent.status} onChange={e=>setEditComponent({...editComponent,status:e.target.value})}>
                    <option value="AVAILABLE">Sẵn sàng (OK)</option>
                    <option value="FAULTY">Lỗi (Cần RMA)</option>
                  </select>
                </label>
                <div className="ad-edit-actions">
                  <button className="ad-btn green" onClick={()=>saveComponent(editComponent._id)}>💾 Lưu</button>
                  <button className="ad-btn" onClick={()=>setEditComponent(null)}>Huỷ</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* UI SETTINGS */}
        {tab==='ui' && (
          <div className="ad-table-wrap" style={{maxWidth:600}}>
            <h2>🎨 Quản trị Giao diện (Dynamic Settings)</h2>
            <div className="ad-edit-panel" style={{display:'block'}}>
              <label>Ảnh Banner trang chủ (URL):
                <input type="text" value={settings.bannerUrl || ''} onChange={e=>setSettings({...settings, bannerUrl:e.target.value})} placeholder="https://..." />
              </label>
              <label>Chữ chạy Footer:
                <textarea rows="3" value={settings.footerText || ''} onChange={e=>setSettings({...settings, footerText:e.target.value})} placeholder="Ví dụ: Công ty TNHH Máy tính Duy Long..."></textarea>
              </label>
              <label>Text Logo Header:
                <input type="text" value={settings.headerLogo || ''} onChange={e=>setSettings({...settings, headerLogo:e.target.value})} placeholder="DuyLongTech" />
              </label>
              
              <button className="ad-btn green mt-3 full" onClick={saveSettings}>💾 LƯU CẤU HÌNH WEB</button>
            </div>
            <p className="text-dim mt-3">Khi lưu, React sẽ tự động load các field này qua API và thay thế chữ cứng (hardcode) hiện tại trên Web. Đạt chuẩn Headless CMS.</p>
          </div>
        )}



        {/* WALLETS */}
        {tab==='wallets' && (
          <div className="ad-wallets">
            {wallets.length === 0 ? <p className="ad-empty">Chưa có ví shipper nào</p> :
              wallets.map((w,i) => (
                <div key={i} className="ad-wallet-card">
                  <div className="awc-header">
                    <h3>🚚 {w.shipperName}</h3>
                    <span>📞 {w.shipperPhone}</span>
                  </div>
                  <div className="awc-balance">{fmt(w.balance)}₫</div>
                  <div className="awc-label">Số dư chờ thanh toán</div>
                  <div className="awc-stats">
                    <div><span>Tổng thu:</span> {fmt(w.totalCollected)}₫</div>
                    <div><span>Đã TT:</span> {fmt(w.totalSettled)}₫</div>
                    <div><span>Đơn giao:</span> {w.deliveryCount}</div>
                  </div>
                  <button className="ad-btn green full" onClick={()=>settleWallet(w.id)} disabled={w.balance<=0}>
                    💸 THANH TOÁN ({fmt(w.balance)}₫)
                  </button>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  )
}
