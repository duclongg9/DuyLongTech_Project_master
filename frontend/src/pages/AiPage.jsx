import { useState } from 'react'
import { API } from '../api/client'
import { condLabel, condClass, fmt } from '../constants'

/**
 * Parse AI raw text → clean HTML
 * Supports: **bold**, ## heading, bullet/numbered lists, ---
 */
function parseAiResponse(text) {
  if (!text) return ''
  return text
    .split('\n')
    .map(line => {
      const t = line.trim()
      if (!t) return '<div style="height:6px"></div>'
      if (t.startsWith('### ')) return `<h4 style="margin:14px 0 5px;font-size:0.95rem;font-weight:700;color:var(--text-primary)">${t.slice(4)}</h4>`
      if (t.startsWith('## ')) return `<h3 style="margin:16px 0 6px;font-size:1.05rem;font-weight:700;color:var(--text-primary);border-bottom:1px solid var(--border-light);padding-bottom:5px">${t.slice(3)}</h3>`
      if (t.startsWith('# ')) return `<h2 style="margin:18px 0 8px;font-size:1.15rem;font-weight:700">${t.slice(2)}</h2>`
      if (t === '---' || t === '***') return '<hr style="border:none;border-top:1px solid var(--border-light);margin:14px 0"/>'
      if (/^[-*•]\s/.test(t)) {
        const content = t.replace(/^[-*•]\s+/, '')
        return `<div style="display:flex;gap:8px;padding:3px 0 3px 6px"><span style="color:var(--brand);font-weight:700;flex-shrink:0">›</span><span>${applyInline(content)}</span></div>`
      }
      if (/^\d+[.)]\s/.test(t)) {
        const m = t.match(/^(\d+)[.)]\s+(.*)/)
        if (m) return `<div style="display:flex;gap:8px;padding:3px 0 3px 6px"><span style="color:var(--brand);font-weight:700;min-width:18px">${m[1]}.</span><span>${applyInline(m[2])}</span></div>`
      }
      return `<p style="margin:3px 0;line-height:1.7">${applyInline(t)}</p>`
    })
    .join('')
}

function applyInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700;color:var(--text-primary)">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:var(--text-secondary)">$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:var(--bg);padding:1px 6px;border-radius:4px;font-size:0.85em;font-family:monospace">$1</code>')
}

export default function AiPage({ products, setSel, setConfig, setPage }) {
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  
  // States for interactive cards
  const [budget, setBudget] = useState('15000000')
  const [purpose, setPurpose] = useState('office')
  const [game, setGame] = useState('none')
  const [priority, setPriority] = useState('balanced')

  const handleAiConsult = () => {
    const now = Date.now()
    const recent = (window._aiCalls || []).filter(t => now - t < 60000)
    if (recent.length >= 3) { alert('Bạn đã dùng AI quá 3 lần/phút. Vui lòng chờ...'); return }
    window._aiCalls = [...recent, now]

    setAiLoading(true)
    setAiResult(null)

    fetch(`${API}/products/ai/consult?budget=${budget}&purpose=${purpose}&gameLevel=${game}&priority=${priority}`)
      .then(r => { if (!r.ok) throw new Error('AI failed'); return r.json() })
      .then(d => { setAiResult(d); setAiLoading(false) })
      .catch(() => {
        const bg = Number(budget)
        const matched = products.filter(p => p.basePrice <= bg && p.status === 'AVAILABLE')
        setAiResult({
          advice: 'AI đang bảo trì, hệ thống tự động gợi ý sản phẩm phù hợp ngân sách của bạn.',
          products: matched.map(p => ({ id: p.id, name: p.name, cpu: p.cpuModel, ram: p.ramAmount, storage: p.storageMain, price: p.basePrice, warranty: p.warrantyMonths + 'T', condition: p.condition })),
          matchedCount: matched.length
        })
        setAiLoading(false)
      })
  }

  return (
    <div className="container mt-4 ai-page-wrapper" style={{ maxWidth: 900, position: 'relative' }}>
      <div className="particle-bg"></div>
      
      {/* Form */}
      <div className="ai-form-card" style={{ position: 'relative', zIndex: 2 }}>
        <div className="ai-header text-center mb-5">
          <h2 className="ai-title">Trợ Lý AI Cao Cấp</h2>
          <p className="ai-subtitle">Hệ thống AI được huấn luyện từ kinh nghiệm 10 năm tuyển chọn máy nhập khẩu của Duy Long Tech.</p>
          <div className="ai-badge mt-2">Dựa trên kho hàng 1000+ máy Like New tuyển chọn</div>
        </div>

        <div className="ai-questions">
          {/* Question 1 */}
          <div className="ai-q-group">
            <label>Mục đích sử dụng chính của bạn là gì?</label>
            <div className="option-cards">
              <div className={`opt-card ${purpose === 'office' ? 'active' : ''}`} onClick={() => setPurpose('office')}>
                <div className="icon">💻</div>
                <span>Văn phòng / Code</span>
              </div>
              <div className={`opt-card ${purpose === 'gaming' ? 'active' : ''}`} onClick={() => setPurpose('gaming')}>
                <div className="icon">🎮</div>
                <span>Chơi Game</span>
              </div>
              <div className={`opt-card ${purpose === 'design' ? 'active' : ''}`} onClick={() => setPurpose('design')}>
                <div className="icon">🎨</div>
                <span>Đồ họa / Render</span>
              </div>
            </div>
          </div>

          {/* Question 2 */}
          <div className="ai-q-group mt-4">
            <label>Ngân sách tối đa của bạn?</label>
            <div className="option-cards grid-4">
              <div className={`opt-card sm ${budget === '10000000' ? 'active' : ''}`} onClick={() => setBudget('10000000')}>Dưới 10Tr</div>
              <div className={`opt-card sm ${budget === '15000000' ? 'active' : ''}`} onClick={() => setBudget('15000000')}>10 - 15Tr</div>
              <div className={`opt-card sm ${budget === '20000000' ? 'active' : ''}`} onClick={() => setBudget('20000000')}>15 - 20Tr</div>
              <div className={`opt-card sm ${budget === '30000000' ? 'active' : ''}`} onClick={() => setBudget('30000000')}>20 - 30Tr</div>
              <div className={`opt-card sm ${budget === '50000000' ? 'active' : ''}`} onClick={() => setBudget('50000000')}>30 - 50Tr</div>
              <div className={`opt-card sm ${budget === '100000000' ? 'active' : ''}`} onClick={() => setBudget('100000000')}>Không giới hạn</div>
            </div>
          </div>

          {/* Question 3 */}
          <div className="ai-q-group mt-4">
            <label>Mức độ chơi game?</label>
            <div className="option-cards">
              <div className={`opt-card sm ${game === 'none' ? 'active' : ''}`} onClick={() => setGame('none')}>🚫 Không chơi</div>
              <div className={`opt-card sm ${game === 'light' ? 'active' : ''}`} onClick={() => setGame('light')}>⚡ Nhẹ (LOL, CS2)</div>
              <div className={`opt-card sm ${game === 'heavy' ? 'active' : ''}`} onClick={() => setGame('heavy')}>🔥 Nặng (AAA, GTA V)</div>
            </div>
          </div>

          {/* Question 4 */}
          <div className="ai-q-group mt-4">
            <label>Ưu tiên quan trọng nhất?</label>
            <div className="option-cards">
              <div className={`opt-card sm ${priority === 'balanced' ? 'active' : ''}`} onClick={() => setPriority('balanced')}>Cân bằng</div>
              <div className={`opt-card sm ${priority === 'performance' ? 'active' : ''}`} onClick={() => setPriority('performance')}>Hiệu năng mạnh</div>
              <div className={`opt-card sm ${priority === 'battery' ? 'active' : ''}`} onClick={() => setPriority('battery')}>Pin lâu / Mỏng nhẹ</div>
              <div className={`opt-card sm ${priority === 'price' ? 'active' : ''}`} onClick={() => setPriority('price')}>Giá tốt nhất</div>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button className="btn btn-cta btn-lg btn-shimmer" style={{ padding: '16px 48px', fontSize: '1.2rem', minWidth: '280px' }} onClick={handleAiConsult} disabled={aiLoading}>
            {aiLoading ? <span className="scan-text">🤖 Đang quét kho dữ liệu...</span> : 'BẮT ĐẦU TƯ VẤN AI'}
          </button>
        </div>

        {/* Trust Signals Footer */}
        <div className="ai-trust-signals mt-5">
          <div className="trust-s-item"><span className="icon">🛡️</span> Máy zin 100%</div>
          <div className="trust-s-item"><span className="icon">⭐</span> Bảo hành 12 tháng</div>
          <div className="trust-s-item"><span className="icon">🎧</span> Hỗ trợ 24/7</div>
          <div className="trust-s-item"><span className="icon">🚚</span> Freeship</div>
        </div>
      </div>

      {/* Loading & Result */}
      {aiLoading && (
        <div className="ai-result-card mt-4 loading-glow" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="radar-spinner"></div>
          <p className="mt-3" style={{ color: 'var(--accent)', fontWeight: 600 }}>AI đang phân tích và đối chiếu 1000+ sản phẩm...</p>
        </div>
      )}

      {aiResult && !aiLoading && (
        <div className="mt-4">
          <div className="ai-result-card">
            <div className="flex-between mb-3" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                AI KHUYẾN NGHỊ
              </h3>
            </div>
            <div
              style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.8 }}
              className="ai-response-content"
              dangerouslySetInnerHTML={{ __html: parseAiResponse(aiResult.advice) }}
            />
          </div>

          {aiResult.products?.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Các dòng máy phù hợp nhất ({aiResult.matchedCount})</h3>
              <div className="grid g3">
                {aiResult.products.map(p => (
                  <div key={p.id} className="product-card"
                    onClick={() => { fetch(`${API}/products/${p.id}`).then(r => r.json()).then(d => { setSel(d); setConfig({ ram: d.ramAmount, ssd: d.storageMain }); setPage('pdp') }) }}
                  >
                    <div className="thumb"><img src={p.imageUrl || `https://placehold.co/800x500/121212/00F0FF?text=${encodeURIComponent(p.name)}`} alt={p.name} /></div>
                    <div className="body">
                      <span className={`tag ${condClass(p.condition)}`}>{condLabel(p.condition)}</span>
                      <h3>{p.name}</h3>
                      <p className="specs">{p.cpu} · {p.ram} · {p.storage}</p>
                      <div className="price-wrapper mt-2">
                        <span className="price">{fmt(p.price)}₫</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
