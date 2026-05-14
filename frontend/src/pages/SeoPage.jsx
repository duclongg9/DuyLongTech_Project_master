import { useState } from 'react'
import { API } from '../api/client'
import { condLabel } from '../constants'

/**
 * Parse markdown text from AI → clean HTML
 */
function parseMarkdown(text) {
  if (!text) return ''
  return text
    .split('\n')
    .map(line => {
      const t = line.trim()
      if (!t) return '<div style="height:6px"></div>'
      if (t.startsWith('#### ')) return `<h4 style="margin:12px 0 4px;font-size:0.92rem;font-weight:700">${t.slice(5)}</h4>`
      if (t.startsWith('### ')) return `<h4 style="margin:14px 0 5px;font-size:0.95rem;font-weight:700">${t.slice(4)}</h4>`
      if (t.startsWith('## ')) return `<h3 style="margin:18px 0 6px;font-size:1.1rem;font-weight:700;border-bottom:1px solid var(--border-light);padding-bottom:5px">${t.slice(3)}</h3>`
      if (t.startsWith('# ')) return `<h2 style="margin:20px 0 8px;font-size:1.25rem;font-weight:700">${t.slice(2)}</h2>`
      if (t === '---' || t === '***') return '<hr style="border:none;border-top:1px solid var(--border-light);margin:14px 0"/>'
      if (/^[-*•]\s/.test(t)) {
        const content = t.replace(/^[-*•]\s+/, '')
        return `<div style="display:flex;gap:8px;padding:3px 0 3px 8px"><span style="color:var(--brand);font-weight:700">›</span><span>${applyInline(content)}</span></div>`
      }
      if (/^\d+[.)]\s/.test(t)) {
        const m = t.match(/^(\d+)[.)]\s+(.*)/)
        if (m) return `<div style="display:flex;gap:8px;padding:3px 0 3px 8px"><span style="color:var(--brand);font-weight:700;min-width:18px">${m[1]}.</span><span>${applyInline(m[2])}</span></div>`
      }
      return `<p style="margin:3px 0;line-height:1.75">${applyInline(t)}</p>`
    })
    .join('')
}

function applyInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:700">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:var(--text-secondary)">$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:var(--bg);padding:1px 6px;border-radius:4px;font-size:0.85em;font-family:monospace">$1</code>')
}

/**
 * SeoPage Component
 * Props: products, notify
 */
export default function SeoPage({ products, notify }) {
  const [seoResult, setSeoResult] = useState(null)
  const [seoLoading, setSeoLoading] = useState(false)
  const [seoProductId, setSeoProductId] = useState('')

  const generateSeo = () => {
    if (!seoProductId) return
    setSeoLoading(true)
    setSeoResult(null)
    fetch(`${API}/products/${seoProductId}/ai/seo`)
      .then(r => {
        if (!r.ok) throw new Error('API Error')
        return r.json()
      })
      .then(d => { setSeoResult(d); setSeoLoading(false) })
      .catch(() => {
        alert('Có lỗi xảy ra hoặc AI đang quá tải, vui lòng thử lại sau!')
        setSeoLoading(false)
      })
  }

  // Copy bài viết dưới dạng text thuần (bỏ markdown)
  const copyArticle = () => {
    if (!seoResult?.article) return
    navigator.clipboard.writeText(seoResult.article)
    notify('Đã sao chép bài viết!')
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 880 }}>
      {/* Form */}
      <div className="card" style={{ padding: '28px 24px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>AI SEO Generator</h2>
        <p className="text-dim mt-1" style={{ fontSize: '0.88rem' }}>Chọn sản phẩm, AI sẽ tự động sinh bài viết chuẩn SEO với Meta Title, Description, FAQ.</p>
        <div className="flex gap-1 mt-3">
          <select className="input" value={seoProductId} onChange={e => setSeoProductId(e.target.value)} style={{ flex: 1 }}>
            <option value="">— Chọn sản phẩm —</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({condLabel(p.condition)})</option>)}
          </select>
          <button className="btn btn-cta" disabled={!seoProductId || seoLoading} onClick={generateSeo}>
            {seoLoading ? 'Đang tạo...' : 'Tạo bài SEO'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {seoLoading && (
        <div className="card mt-3" style={{ padding: 24, textAlign: 'center' }}>
          <p className="text-dim" style={{ fontSize: '0.9rem' }}>AI đang phân tích sản phẩm và viết bài...</p>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)',
                animation: `dotPulse 1.2s ease-in-out ${i * 0.15}s infinite`
              }} />
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {seoResult && !seoLoading && (
        <div className="mt-3">
          {/* Meta Tags */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14 }}>Meta Tags</h3>
            <div className="form-group">
              <label className="form-label">Meta Title</label>
              <input className="input" value={seoResult.metaTitle} readOnly style={{ background: 'var(--bg)' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Meta Description</label>
              <textarea className="input" value={seoResult.metaDescription} readOnly style={{ minHeight: 60, background: 'var(--bg)' }} />
            </div>
            <p className="text-sm text-dim">Số từ: ~{seoResult.wordCount > 0 ? seoResult.wordCount : 'N/A'}</p>
          </div>

          {/* Article */}
          <div className="card mt-2" style={{ padding: 24 }}>
            <div className="flex-between" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Bài viết SEO</h3>
              <button className="btn btn-outline btn-sm" onClick={copyArticle}>Sao chép</button>
            </div>
            <div
              style={{
                background: 'var(--bg)', padding: '20px 22px', borderRadius: 'var(--radius)',
                lineHeight: 1.75, fontSize: '0.92rem', color: 'var(--text-primary)',
                border: '1px solid var(--border-light)'
              }}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(seoResult.article) }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
