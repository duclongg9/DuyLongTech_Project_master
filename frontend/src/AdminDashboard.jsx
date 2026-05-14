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
  const [rmaList, setRmaList] = useState([])
  const [rmaStats, setRmaStats] = useState({})
  const [serials, setSerials] = useState([])
  const [serialSearch, setSerialSearch] = useState('')
  const [serialSearchResult, setSerialSearchResult] = useState(null)
  const [bulkSerials, setBulkSerials] = useState('')
  const [bulkProductId, setBulkProductId] = useState('')
  const [bulkSupplier, setBulkSupplier] = useState('')
  const [bulkInvoice, setBulkInvoice] = useState('')
  
  const [editProduct, setEditProduct] = useState(null)
  const [editComponent, setEditComponent] = useState(null)
  const [inventoryForm, setInventoryForm] = useState({ 
    isNewProduct: false, productId: '', 
    productName: '', brand: '', warrantyMonths: 12, basePrice: 0,
    quantityChange: 0, reason: '', supplier: '', unitPrice: 0, unitOfMeasure: 'Chiếc', referenceId: '' 
  })
  const FAULT_TYPES = [
    {v:'HARDWARE_DEFECT',l:'🔧 Lỗi phần cứng (được BH)'},{v:'USER_DAMAGE',l:'💥 Lỗi người dùng'},
    {v:'LIQUID_DAMAGE',l:'💧 Vào nước / ẩm'},{v:'RUST',l:'🟤 Rỉ sét / Độ ẩm cao'},
    {v:'ESD_DAMAGE',l:'⚡ Tĩnh điện (ESD)'},{v:'INSECT',l:'🐛 Côn trùng xâm nhập'},
    {v:'PSU_DAMAGE',l:'🔥 Nguồn PSU kém chất lượng'},{v:'UNKNOWN',l:'❓ Chưa xác định'}
  ]
  const [rmaForm, setRmaForm] = useState({ rmaType:'RMA_CUSTOMER', serialNumber:'', faultType:'UNKNOWN',
    faultDescription:'', physicalConditionNote:'', warrantyDecision:'WARRANTY_VALID',
    warrantyExclusionReason:'', vendorName:'', productId:'', receivedBy: user?.fullName||'admin' })

  useEffect(() => { loadAll() }, [])

  const loadAll = () => {
    fetch(`${API}/admin/stats`).then(r=>r.json()).then(setStats).catch(()=>{})
    fetch(`${API}/admin/users`).then(r=>r.json()).then(setUsers).catch(()=>{})
    fetch(`${API}/products`).then(r=>r.json()).then(setProducts).catch(()=>{})
    fetch(`${API}/admin/components`).then(r=>r.json()).then(setComponents).catch(()=>{})
    fetch(`${API}/admin/settings`).then(r=>r.json()).then(setSettings).catch(()=>{})
    fetch(`${API}/admin/wallets`).then(r=>r.json()).then(setWallets).catch(()=>{})
    fetch(`${API}/rma`).then(r=>r.json()).then(setRmaList).catch(()=>{})
    fetch(`${API}/rma/stats`).then(r=>r.json()).then(setRmaStats).catch(()=>{})
    fetch(`${API}/serials`).then(r=>r.json()).then(setSerials).catch(()=>{})
  }

  const fmt = n => Number(n)?.toLocaleString('vi-VN')

  const updateRole = async (id, role) => {
    await fetch(`${API}/admin/users/${id}/role`, {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ role })
    })
    loadAll()
  }

  const updateProduct = async (id) => {
    if (!editProduct) return
    await fetch(`${API}/admin/products/${id}`, {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(editProduct)
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

  const submitInventory = async (type) => {
    // type: inbound / outbound
    const payload = {
      isNewProduct: inventoryForm.isNewProduct,
      productId: inventoryForm.productId,
      product: {
        name: inventoryForm.productName,
        brand: inventoryForm.brand,
        warrantyMonths: inventoryForm.warrantyMonths,
        basePrice: inventoryForm.basePrice
      },
      warehouseId: 1, // Mặc định kho tổng
      quantityChange: parseInt(inventoryForm.quantityChange),
      supplier: inventoryForm.supplier,
      unitPrice: parseInt(inventoryForm.unitPrice),
      unitOfMeasure: inventoryForm.unitOfMeasure,
      reason: inventoryForm.reason,
      referenceId: inventoryForm.referenceId
    }

    await fetch(`${API}/admin/inventory/${type}`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    alert(`Đã ${type === 'inbound' ? 'nhập' : 'xuất'} kho thành công!`)
    setInventoryForm({ isNewProduct: false, productId: '', productName: '', brand: '', warrantyMonths: 12, basePrice: 0, quantityChange: 0, reason: '', supplier: '', unitPrice: 0, unitOfMeasure: 'Chiếc', referenceId: '' })
    loadAll()
  }

  const settleWallet = async (walletId) => {
    if (!confirm('Xác nhận thanh toán công nợ cho shipper này?')) return
    const res = await fetch(`${API}/admin/wallets/${walletId}/settle`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ adminUser: user?.username || 'admin', note: 'Thanh toán công nợ' })
    })
    const data = await res.json()
    alert(data.message || data.error)
    loadAll()
  }

  const ROLES = ['ADMIN','STAFF','SHIPPER','CUSTOMER']
  const submitRma = async () => {
    const res = await fetch(`${API}/rma`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(rmaForm) })
    const d = await res.json()
    alert(d.message || d.error)
    if (d.rmaCode) { setRmaForm({ rmaType:'RMA_CUSTOMER', serialNumber:'', faultType:'UNKNOWN', faultDescription:'', physicalConditionNote:'', warrantyDecision:'WARRANTY_VALID', warrantyExclusionReason:'', vendorName:'', productId:'', receivedBy: user?.fullName||'admin' }); loadAll() }
  }
  const updateRmaStatus = async (id, status) => {
    await fetch(`${API}/rma/${id}/status`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status }) })
    loadAll()
  }
  const bulkInboundSerials = async () => {
    const snList = bulkSerials.split(/[\n,;]+/).map(s=>s.trim()).filter(Boolean)
    if (!bulkProductId || snList.length === 0) return alert('Vui lòng chọn sản phẩm và nhập serial!')
    const res = await fetch(`${API}/serials/bulk-inbound`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ productId: bulkProductId, serialNumbers: snList, supplier: bulkSupplier, purchaseInvoice: bulkInvoice, addedBy: user?.fullName||'admin' }) })
    const d = await res.json()
    alert(d.message || d.error)
    setBulkSerials(''); loadAll()
  }
  const lookupSerial = async () => {
    if (!serialSearch.trim()) return
    const res = await fetch(`${API}/serials/lookup/${serialSearch.trim()}`)
    if (res.ok) setSerialSearchResult(await res.json())
    else setSerialSearchResult({ error: 'Không tìm thấy serial này trong hệ thống.' })
  }

  const RMA_STATUS_LABELS = { RECEIVED:'🟡 Tiếp nhận', DIAGNOSING:'🔬 Đang chẩn đoán', APPROVED:'✅ Duyệt BH', SENT_TO_VENDOR:'📤 Gửi hãng', REPAIRED:'🔧 Đã sửa', RETURNED:'📦 Trả khách', CLOSED:'🏁 Đóng', REJECTED:'❌ Từ chối' }
  const SERIAL_STATUS_LABELS = { IN_STOCK:'🟢 Tồn kho', RESERVED:'🟠 Giữ chỗ', SOLD:'🔵 Đã bán', UNDER_REPAIR:'🔧 Đang sửa', SENT_WARRANTY:'📤 Gửi BH', DAMAGED:'⛔ Hỏng', DISPOSED:'🗑️ Thanh lý', ON_LOAN:'🤝 Cho mượn SOS' }

  const tabs = [
    { key: 'stats', label: '📊 Tổng quan' },
    { key: 'users', label: '👥 Tài khoản' },
    { key: 'products', label: '📦 Sản phẩm' },
    { key: 'components', label: '🧩 Linh kiện' },
    { key: 'inventory', label: '🏬 Nhập/Xuất Kho' },
    { key: 'serials', label: '🔢 Serial Number' },
    { key: 'rma', label: '🔁 RMA Bảo Hành' },
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
              <thead><tr><th>ID</th><th>Tên</th><th>Giá</th><th>SL</th><th>Status</th><th>BH</th><th>Sửa</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td className="ad-mono">{fmt(p.basePrice)}₫</td>
                    <td>{p.quantity}</td>
                    <td><span className={`ad-status ${p.status==='AVAILABLE'?'green':'red'}`}>{p.status}</span></td>
                    <td>{p.warrantyMonths} tháng</td>
                    <td>
                      <button className="ad-btn-sm" onClick={()=>setEditProduct({basePrice:p.basePrice,quantity:p.quantity,warrantyMonths:p.warrantyMonths,_id:p.id})}>✏️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {editProduct && (
              <div className="ad-edit-panel">
                <h3>✏️ Sửa sản phẩm #{editProduct._id}</h3>
                <label>Giá: <input type="number" value={editProduct.basePrice} onChange={e=>setEditProduct({...editProduct,basePrice:e.target.value})} /></label>
                <label>Số lượng: <input type="number" value={editProduct.quantity} onChange={e=>setEditProduct({...editProduct,quantity:e.target.value})} /></label>
                <label>BH (tháng): <input type="number" value={editProduct.warrantyMonths} onChange={e=>setEditProduct({...editProduct,warrantyMonths:e.target.value})} /></label>
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

        {/* INVENTORY WMS */}
        {tab==='inventory' && (
          <div className="ad-table-wrap" style={{maxWidth:700}}>
            <h2>🏬 Quản trị nhập/xuất kho (WMS)</h2>
            <div className="ad-edit-panel" style={{display:'block'}}>
              
              <div className="flex gap-2 mb-2">
                <button className={`ad-btn ${!inventoryForm.isNewProduct?'green':'btn-outline'}`} onClick={()=>setInventoryForm({...inventoryForm, isNewProduct:false})}>📦 Nhập hàng ĐÃ CÓ</button>
                <button className={`ad-btn ${inventoryForm.isNewProduct?'green':'btn-outline'}`} onClick={()=>setInventoryForm({...inventoryForm, isNewProduct:true})}>✨ Nhập hàng MỚI TINH</button>
              </div>

              {!inventoryForm.isNewProduct ? (
                <label>Sản phẩm đích (SKU / Tên):
                  <select value={inventoryForm.productId} onChange={e=>setInventoryForm({...inventoryForm,productId:e.target.value})}>
                    <option value="">-- Chọn máy tính / Laptop / Linh kiện --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Tồn: {p.quantity})</option>)}
                  </select>
                </label>
              ) : (
                <div style={{background:'#f8fafc', padding:10, borderRadius:8, border:'1px solid #e2e8f0', marginBottom:12}}>
                  <h4 className="mb-2">Thông tin sản phẩm mới</h4>
                  <div className="grid g2" style={{gap:10}}>
                    <label>Tên sản phẩm: <input type="text" value={inventoryForm.productName} onChange={e=>setInventoryForm({...inventoryForm,productName:e.target.value})} /></label>
                    <label>Thương hiệu: <input type="text" value={inventoryForm.brand} onChange={e=>setInventoryForm({...inventoryForm,brand:e.target.value})} placeholder="Dell, HP..." /></label>
                    <label>Giá bán lẻ (VNĐ): <input type="number" value={inventoryForm.basePrice} onChange={e=>setInventoryForm({...inventoryForm,basePrice:e.target.value})} /></label>
                    <label>BH mặc định (Tháng): <input type="number" value={inventoryForm.warrantyMonths} onChange={e=>setInventoryForm({...inventoryForm,warrantyMonths:e.target.value})} /></label>
                  </div>
                </div>
              )}

              <hr style={{margin:'15px 0', borderColor:'#e2e8f0'}}/>
              <h4 className="mb-2">Chi tiết giao dịch nhập/xuất (Invoice/PO)</h4>
              
              <div className="grid g2" style={{gap:10}}>
                <label>Số lượng (tít mã vạch / gõ):
                  <input type="number" min="1" value={inventoryForm.quantityChange} onChange={e=>setInventoryForm({...inventoryForm,quantityChange:e.target.value})} />
                </label>
                <label>Nhà cung cấp (Supplier):
                  <input type="text" value={inventoryForm.supplier} onChange={e=>setInventoryForm({...inventoryForm,supplier:e.target.value})} placeholder="FPT Synnex, SPC..." />
                </label>
                <label>Đơn giá nhập (Unit Price):
                  <input type="number" value={inventoryForm.unitPrice} onChange={e=>setInventoryForm({...inventoryForm,unitPrice:e.target.value})} />
                </label>
                <label>Đơn vị tính (UOM):
                  <input type="text" value={inventoryForm.unitOfMeasure} onChange={e=>setInventoryForm({...inventoryForm,unitOfMeasure:e.target.value})} placeholder="Chiếc, Bộ..." />
                </label>
                <label>Mã tham chiếu (PO / Invoice):
                  <input type="text" value={inventoryForm.referenceId} onChange={e=>setInventoryForm({...inventoryForm,referenceId:e.target.value})} placeholder="PO-2026-01..." />
                </label>
                <label>Lý do / Ghi chú:
                  <input type="text" value={inventoryForm.reason} onChange={e=>setInventoryForm({...inventoryForm,reason:e.target.value})} placeholder="Nhập kho chính..." />
                </label>
              </div>
              
              <div style={{display:'flex', gap:10, marginTop:20}}>
                <button className="ad-btn green full" onClick={()=>submitInventory('inbound')} disabled={(!inventoryForm.isNewProduct && !inventoryForm.productId) || inventoryForm.quantityChange<=0}>📥 NHẬP KHO</button>
                <button className="ad-btn full" style={{background:'#EF4444', color:'white'}} onClick={()=>submitInventory('outbound')} disabled={inventoryForm.isNewProduct || !inventoryForm.productId || inventoryForm.quantityChange<=0}>📤 XUẤT KHO</button>
              </div>
            </div>
            <p className="text-dim mt-3">Lưu ý: Mọi giao dịch nhập/xuất đều được ghi log với chuẩn nguyên tắc FIFO. Giao dịch sẽ lưu dấu ấn của Supplier và PO tương ứng theo chuẩn kế toán.</p>
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

        {/* SERIAL NUMBER MANAGEMENT */}
        {tab==='serials' && (
          <div className="ad-table-wrap">
            <h2>🔢 Quản lý Serial Number</h2>
            <div className="ad-edit-panel" style={{display:'block', marginBottom:20}}>
              <h4>🔍 Tra cứu Serial (QR Scan / gõ tay)</h4>
              <div style={{display:'flex',gap:8}}>
                <input value={serialSearch} onChange={e=>setSerialSearch(e.target.value)} placeholder="Nhập hoặc quét Serial Number..." style={{flex:1}} onKeyDown={e=>e.key==='Enter'&&lookupSerial()} />
                <button className="ad-btn green" onClick={lookupSerial}>🔍 Tra cứu</button>
              </div>
              {serialSearchResult && (
                <div style={{marginTop:12, padding:12, background: serialSearchResult.error?'#fef2f2':'#f0fdf4', borderRadius:8, border:`1px solid ${serialSearchResult.error?'#fca5a5':'#86efac'}`}}>
                  {serialSearchResult.error ? <p style={{color:'#dc2626'}}>❌ {serialSearchResult.error}</p> : (
                    <div>
                      <p><strong>{serialSearchResult.productName}</strong> — S/N: <code style={{background:'#e2e8f0',padding:'2px 6px',borderRadius:4}}>{serialSearchResult.serialNumber}</code></p>
                      <p>Trạng thái: <strong>{SERIAL_STATUS_LABELS[serialSearchResult.lifecycleStatus]||serialSearchResult.lifecycleStatus}</strong></p>
                      <p>BH: {serialSearchResult.warrantyStart} → {serialSearchResult.warrantyEnd} ({serialSearchResult.warrantyType})</p>
                      {serialSearchResult.binCode && <p>Vị trí kho: <strong>{serialSearchResult.binCode}</strong> — {serialSearchResult.zoneName}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="ad-edit-panel" style={{display:'block', marginBottom:20}}>
              <h4>📥 Nhập hàng loạt Serial (Bulk Scan)</h4>
              <label>Sản phẩm:<select value={bulkProductId} onChange={e=>setBulkProductId(e.target.value)}><option value="">-- Chọn sản phẩm --</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
              <label>Nhà cung cấp:<input value={bulkSupplier} onChange={e=>setBulkSupplier(e.target.value)} placeholder="FPT, SPC..." /></label>
              <label>Mã hóa đơn:<input value={bulkInvoice} onChange={e=>setBulkInvoice(e.target.value)} placeholder="INV-2026-001" /></label>
              <label>Danh sách Serial (mỗi dòng 1 serial, hoặc cách bằng dấu phẩy):<textarea rows={5} value={bulkSerials} onChange={e=>setBulkSerials(e.target.value)} placeholder={"SN-DELL-001\nSN-DELL-002\nSN-DELL-003"} /></label>
              <button className="ad-btn green mt-2" onClick={bulkInboundSerials}>📥 NẠP HÀNG LOẠT</button>
            </div>
            <table className="ad-table">
              <thead><tr><th>Serial</th><th>Sản phẩm</th><th>Trạng thái</th><th>BH đến</th><th>NCC</th><th>Vị trí kho</th></tr></thead>
              <tbody>
                {serials.map(s=>(<tr key={s.id}>
                  <td><code style={{color:'#06B6D4'}}>{s.serialNumber}</code></td>
                  <td>{s.productName}</td>
                  <td><span className={`ad-status ${s.lifecycleStatus==='IN_STOCK'?'green':s.lifecycleStatus==='SOLD'?'':'red'}`}>{SERIAL_STATUS_LABELS[s.lifecycleStatus]||s.lifecycleStatus}</span></td>
                  <td style={{color: s.warrantyEnd && new Date(s.warrantyEnd)<new Date()?'#ef4444':'inherit'}}>{s.warrantyEnd||'—'}</td>
                  <td>{s.supplier||'—'}</td>
                  <td>{s.binCode||'—'}</td>
                </tr>))}
              </tbody>
            </table>
          </div>
        )}

        {/* RMA BẢO HÀNH */}
        {tab==='rma' && (
          <div className="ad-table-wrap">
            <h2>🔁 Quản lý RMA — Bảo hành & Đổi trả</h2>
            <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
              {[['totalActive','🔴 Đang xử lý'],['received','🟡 Mới tiếp nhận'],['sentToVendor','📤 Gửi hãng'],['pendingVendor','⏳ Chờ hãng trả']].map(([k,l])=>(
                <div key={k} style={{background:'#1e293b',padding:'12px 20px',borderRadius:10,textAlign:'center',minWidth:120}}>
                  <div style={{fontSize:'1.8rem',fontWeight:800,color:'#06B6D4'}}>{rmaStats[k]??0}</div>
                  <div style={{fontSize:'0.75rem',color:'#94a3b8'}}>{l}</div>
                </div>
              ))}
            </div>

            <div className="ad-edit-panel" style={{display:'block',marginBottom:24}}>
              <h4>📋 Tạo Phiếu RMA Mới (Tiếp nhận hàng bảo hành)</h4>
              <div className="grid g2" style={{gap:10}}>
                <label>Loại RMA:<select value={rmaForm.rmaType} onChange={e=>setRmaForm({...rmaForm,rmaType:e.target.value})}>
                  <option value="RMA_CUSTOMER">👤 Khách mang đến</option>
                  <option value="RMA_INTERNAL">🏭 Nội bộ phát hiện</option>
                  <option value="RMA_VENDOR">🏢 Gửi trả hãng</option>
                </select></label>
                <label>Serial Number hàng lỗi:<input value={rmaForm.serialNumber} onChange={e=>setRmaForm({...rmaForm,serialNumber:e.target.value})} placeholder="Quét QR hoặc gõ S/N" /></label>
                <label>Sản phẩm liên quan:<select value={rmaForm.productId} onChange={e=>setRmaForm({...rmaForm,productId:e.target.value})}><option value="">-- Chọn nếu không có S/N --</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
                <label>Phân loại lỗi:<select value={rmaForm.faultType} onChange={e=>setRmaForm({...rmaForm,faultType:e.target.value})}>{FAULT_TYPES.map(f=><option key={f.v} value={f.v}>{f.l}</option>)}</select></label>
                <label>Quyết định BH:<select value={rmaForm.warrantyDecision} onChange={e=>setRmaForm({...rmaForm,warrantyDecision:e.target.value})}>
                  <option value="WARRANTY_VALID">✅ Được bảo hành</option>
                  <option value="WARRANTY_EXCLUDED">❌ Loại trừ BH</option>
                  <option value="CHARGEABLE">💰 Sửa có phí</option>
                </select></label>
                <label>Tên hãng BH (nếu gửi):<input value={rmaForm.vendorName} onChange={e=>setRmaForm({...rmaForm,vendorName:e.target.value})} placeholder="Dell, HP, Asus..." /></label>
              </div>
              <label style={{marginTop:10}}>Tình trạng vật lý lúc tiếp nhận (bằng chứng quan trọng):<textarea rows={3} value={rmaForm.physicalConditionNote} onChange={e=>setRmaForm({...rmaForm,physicalConditionNote:e.target.value})} placeholder="Mô tả: nứt vỏ, vết cháy khét, rỉ sét chân board, côn trùng trong máy..." /></label>
              <label>Mô tả lỗi kỹ thuật:<textarea rows={2} value={rmaForm.faultDescription} onChange={e=>setRmaForm({...rmaForm,faultDescription:e.target.value})} placeholder="CPU không nhận, màn hình flicker, không lên nguồn..." /></label>
              {rmaForm.warrantyDecision==='WARRANTY_EXCLUDED' && <label style={{background:'#fef2f2',padding:8,borderRadius:6,display:'block'}}>Lý do loại trừ BH (quan trọng — tránh tranh chấp):<textarea rows={2} value={rmaForm.warrantyExclusionReason} onChange={e=>setRmaForm({...rmaForm,warrantyExclusionReason:e.target.value})} placeholder="Lỗi do bộ nguồn PSU kém chất lượng gây cháy mạch chủ..." /></label>}
              <div style={{background:'#fffbeb',border:'1px solid #fcd34d',borderRadius:8,padding:10,marginTop:10,fontSize:'0.82rem'}}>
                ⚠️ <strong>Lưu ý loại trừ BH:</strong> Rỉ sét (môi trường ẩm), côn trùng xâm nhập, cháy do PSU kém, tĩnh điện ESD — cần chụp ảnh bằng chứng ngay khi tiếp nhận.
              </div>
              <button className="ad-btn green mt-3" onClick={submitRma}>📋 TẠO PHIẾU RMA</button>
            </div>

            <table className="ad-table">
              <thead><tr><th>Mã RMA</th><th>Serial</th><th>Loại lỗi</th><th>Quyết định BH</th><th>Trạng thái</th><th>NV tiếp nhận</th><th>Thao tác</th></tr></thead>
              <tbody>
                {rmaList.map(r=>(<tr key={r.id}>
                  <td><code style={{color:'#f59e0b',fontWeight:700}}>{r.rmaCode}</code></td>
                  <td><code style={{fontSize:'0.8rem'}}>{r.serialNumber||r.productName||'—'}</code></td>
                  <td><span className="ad-role-badge">{FAULT_TYPES.find(f=>f.v===r.faultType)?.l||r.faultType}</span></td>
                  <td><span className={`ad-status ${r.warrantyDecision==='WARRANTY_VALID'?'green':r.warrantyDecision==='CHARGEABLE'?'':'red'}`}>{r.warrantyDecision==='WARRANTY_VALID'?'✅ Được BH':r.warrantyDecision==='WARRANTY_EXCLUDED'?'❌ Loại trừ':'💰 Có phí'}</span></td>
                  <td>{RMA_STATUS_LABELS[r.status]||r.status}</td>
                  <td>{r.receivedBy}</td>
                  <td>
                    <select onChange={e=>e.target.value&&updateRmaStatus(r.id,e.target.value)} defaultValue="">
                      <option value="">Chuyển trạng thái...</option>
                      {Object.entries(RMA_STATUS_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                </tr>))}
              </tbody>
            </table>
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
