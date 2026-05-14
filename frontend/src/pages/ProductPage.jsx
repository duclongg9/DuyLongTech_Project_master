import { condLabel, condClass, fmt } from '../constants'

/**
 * Product Details Page — Professional Tech Store
 */
export default function ProductPage({ sel, config, setConfig, addToCart, calcPrice }) {
  if (!sel) return null

  const related = [sel, sel, sel, sel];

  return (
    <div className="container">
      <div className="pdp-layout">
        {/* Left Column: Gallery */}
        <div className="pdp-left">
          <div className="pdp-gallery-main">
            <img src={sel.imageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'} alt={sel.name} />
            <div className="gallery-reflection"></div>
          </div>
          <div className="pdp-thumbs">
            <div className="active"><img src={sel.imageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} alt="" /></div>
            <div><img src="https://images.unsplash.com/photo-1593642702821-c823b13eb295?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="" /></div>
            <div><img src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="" /></div>
            <div><img src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" alt="" /></div>
          </div>
          {sel.conditionNote && (
            <div className="promo-box mt-3">
              📋 <strong>Tình trạng thực tế:</strong> {sel.conditionNote}
            </div>
          )}
        </div>

        {/* Right Column: Info */}
        <div className="pdp-right">
          <div className="flex gap-1 mb-2">
            <span className={`tag ${condClass(sel.condition)}`}>{condLabel(sel.condition)}</span>
            {sel.warrantyType === 'BRAND' && <span className="tag tag-blue">Còn BH chính hãng</span>}
          </div>
          
          <h1 className="pdp-title">{sel.name}</h1>
          <p className="pdp-description">{sel.description}</p>

          {/* Quick Specs / Feature Cards */}
          <div className="feature-grid">
            <div className="feature-card">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
              <span>{sel.cpuModel}</span>
              <small>Vi xử lý</small>
            </div>
            <div className="feature-card">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              <span>{sel.ramAmount}</span>
              <small>RAM {sel.ramType}</small>
            </div>
            <div className="feature-card">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
              <span>{sel.storageMain}</span>
              <small>Ổ cứng SSD</small>
            </div>
            <div className="feature-card">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              <span>{sel.displaySize}</span>
              <small>{sel.displayRes}</small>
            </div>
          </div>

          {/* Config Area */}
          <div className="pdp-control-panel">
            <div className="price-section flex-between">
              {sel.callForPrice ? (
                <div>
                  <div className="pdp-price" style={{ color: 'var(--accent)' }}>Liên hệ báo giá</div>
                  <p style={{ color: '#A0A0B0' }}>{sel.priceNote}</p>
                </div>
              ) : (
                <div>
                  <div className="pdp-price">{fmt(calcPrice(sel))}₫</div>
                  {sel.priceNegotiable && <span className="tag tag-yellow">Có thể thương lượng</span>}
                </div>
              )}
            </div>

            <div className="config-container">
              <div className="config-title">Cấu hình tùy chọn</div>
              
              <div className="config-group">
                <label>Bộ nhớ RAM</label>
                <div className="config-options">
                  {['8GB', '16GB', '32GB'].map(r => (
                    <div key={r} className={`config-pill ${config.ram === r ? 'active' : ''}`} onClick={() => setConfig({ ...config, ram: r })}>
                      {r} {r !== sel.ramAmount && r === '16GB' ? '(+800k)' : r !== sel.ramAmount && r === '32GB' ? '(+2tr)' : ''}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="config-group mt-3">
                <label>Ổ cứng SSD</label>
                <div className="config-options">
                  {[sel.storageMain, '512GB SSD', '1TB SSD'].filter((v, i, a) => a.indexOf(v) === i).map(s => (
                    <div key={s} className={`config-pill ${config.ssd === s ? 'active' : ''}`} onClick={() => setConfig({ ...config, ssd: s })}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="cta-wrapper">
              {!sel.callForPrice ? (
                <button className="btn btn-cta btn-block btn-shimmer" onClick={() => addToCart(sel)}>
                  THÊM VÀO GIỎ HÀNG
                </button>
              ) : (
                <a href="tel:0988888888" className="btn btn-call btn-block btn-shimmer" style={{ background: 'var(--accent)' }}>
                  📞 GỌI NGAY: 0988.888.888
                </a>
              )}
            </div>
            
            {/* Trust Badges */}
            <div className="trust-badges-row">
              <div className="trust-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Hàng chính hãng</span>
              </div>
              <div className="trust-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>Bảo hành {sel.warrantyMonths}T</span>
              </div>
              <div className="trust-badge">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span>Giao tốc hành 2H</span>
              </div>
            </div>
          </div>

          <div className="zebra-table-wrapper mt-5">
            <table className="zebra-table">
              <tbody>
                <tr><td>CPU</td><td>{sel.cpuFullName || sel.cpuModel}</td></tr>
                <tr><td>Cores</td><td>{sel.cpuCores}C/{sel.cpuThreads}T · {sel.cpuBaseClock}–{sel.cpuBoostClock} · TDP {sel.cpuTdp}</td></tr>
                <tr><td>RAM</td><td>{sel.ramAmount} {sel.ramType} {sel.ramSpeed} {sel.ramSlots ? <CheckIcon /> : <CrossIcon />} Còn slot</td></tr>
                <tr><td>Ổ cứng</td><td>{sel.storageMain} {sel.storageSlot ? <CheckIcon /> : <CrossIcon />} Thêm được</td></tr>
                <tr><td>Màn hình</td><td>{sel.displaySize} {sel.displayRes} {sel.displayPanel} {sel.displayHz}</td></tr>
                <tr><td>GPU</td><td>{sel.gpuName}</td></tr>
                <tr><td>Cổng kết nối</td><td>{sel.ports}</td></tr>
                <tr><td>Pin</td><td>{sel.battery}</td></tr>
                <tr><td>Hệ điều hành</td><td>{sel.os}</td></tr>
                {sel.serialNumber && <tr><td>Số Serial</td><td style={{ fontFamily: 'monospace' }}>{sel.serialNumber}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="related-section">
        <h2>Sản phẩm tương tự</h2>
        <div className="grid g4">
          {related.map((p, i) => (
            <div key={i} className="product-card">
              <div className="thumb"><img src={p.imageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&w=400&q=80'} alt={p.name} /></div>
              <div className="body">
                <span className={`tag ${condClass(p.condition)}`}>{condLabel(p.condition)}</span>
                <h3>{p.name}</h3>
                <p className="specs">{p.cpuModel} · {p.ramAmount} · {p.storageMain}</p>
                <p className="price">{fmt(p.basePrice)}₫</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const CheckIcon = () => (
  <svg className="icon-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const CrossIcon = () => (
  <svg className="icon-cross" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
