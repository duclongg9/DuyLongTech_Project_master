import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { motion, AnimatePresence } from 'framer-motion'

const API = 'https://duylongtech-project-master.onrender.com/api'

const COMP_ICONS = {
  MAINBOARD: '🔲', CPU: '🧠', RAM: '💾', SSD: '💿', GPU: '🎮', BATTERY: '🔋',
  WIFI: '📶', SCREEN: '🖥️'
}
const COMP_LABELS = {
  MAINBOARD: 'Mainboard', CPU: 'Bộ xử lý', RAM: 'Bộ nhớ', SSD: 'Ổ cứng',
  GPU: 'Card đồ họa', BATTERY: 'Pin', WIFI: 'WiFi', SCREEN: 'Màn hình'
}
const STATUS_COLOR = { OK: '#34C759', FAULTY: '#FF3B30', REPLACED: '#FF9500' }

export default function TechnicianApp({ onBack }) {
  const [scanning, setScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [device, setDevice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const scannerRef = useRef(null)
  const scannerInstanceRef = useRef(null)

  // Start camera QR scanner
  const startScanner = async () => {
    setScanning(true)
    setError(null)
    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerInstanceRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' }, // Camera sau
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleScan(decodedText)
          stopScanner()
        },
        () => {} // ignore failures
      )
    } catch (err) {
      setError('Không thể truy cập Camera. Vui lòng cấp quyền Camera cho trình duyệt.')
      setScanning(false)
    }
  }

  const stopScanner = () => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.stop().catch(() => {})
      scannerInstanceRef.current = null
    }
    setScanning(false)
  }

  useEffect(() => {
    return () => { if (scannerInstanceRef.current) scannerInstanceRef.current.stop().catch(() => {}) }
  }, [])

  // Lookup device by serial/QR
  const handleScan = async (code) => {
    setLoading(true)
    setError(null)
    setDevice(null)
    try {
      const res = await fetch(`${API}/technician/scan/${encodeURIComponent(code)}`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Không tìm thấy')
      }
      const data = await res.json()
      setDevice(data)
      // Auto-open all sections
      const sections = {}
      if (data.components) Object.keys(data.components).forEach(k => sections[k] = true)
      setOpenSections(sections)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (key) => setOpenSections(p => ({ ...p, [key]: !p[key] }))

  const condLabel = c => ({ LIKE_NEW_99:'Like New 99%', GOOD_95:'Đẹp 95%', GOOD_90:'Tốt 90%', FAIR_80:'TB 80%', NEW:'Mới 100%' }[c]||c)

  return (
    <div className="tech-app">
      {/* Mobile Header */}
      <div className="tech-header">
        <button className="tech-back" onClick={onBack}>←</button>
        <h1>🔧 App Kỹ Thuật Viên</h1>
        <span className="tech-badge">v2.0</span>
      </div>

      {/* VIP Banner (Framer Motion) */}
      <AnimatePresence>
        {device?.customer?.isVip && (
          <motion.div
            className="vip-banner"
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="vip-crown">👑</div>
            <div className="vip-info">
              <h3>Khách VIP: {device.customer.customerName}</h3>
              <p>📞 {device.customer.phone} · VIP từ {device.customer.vipSince}</p>
            </div>
            <div className="vip-privileges">
              {device.customer.privileges?.map((p, i) => (
                <motion.div
                  key={i}
                  className="vip-priv-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  {p}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanner Section */}
      {!device && (
        <div className="tech-scanner-section">
          <div className="scanner-container">
            {scanning ? (
              <div className="scanner-active">
                <div id="qr-reader" ref={scannerRef}></div>
                <div className="scanner-frame">
                  <div className="corner tl"></div><div className="corner tr"></div>
                  <div className="corner bl"></div><div className="corner br"></div>
                  <div className="scan-line"></div>
                </div>
                <button className="btn-scanner-stop" onClick={stopScanner}>✕ Đóng Camera</button>
              </div>
            ) : (
              <div className="scanner-idle">
                <div className="scanner-icon">📸</div>
                <h2>Quét mã QR thiết bị</h2>
                <p>Đưa camera vào mã QR trên vỏ máy (Mã Mẹ)</p>
                <button className="btn-scan" onClick={startScanner}>
                  📷 MỞ CAMERA QUÉT MÃ
                </button>

                <div className="divider"><span>hoặc nhập thủ công</span></div>

                <div className="manual-input">
                  <input
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    placeholder="Nhập Serial Number (VD: SN-DL7420-A001)"
                    onKeyDown={e => e.key === 'Enter' && manualInput && handleScan(manualInput)}
                  />
                  <button
                    className="btn-manual"
                    disabled={!manualInput || loading}
                    onClick={() => handleScan(manualInput)}
                  >
                    {loading ? '⏳' : '🔍'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <motion.div className="tech-error" initial={{opacity:0}} animate={{opacity:1}}>
              ❌ {error}
            </motion.div>
          )}
        </div>
      )}

      {/* Device Tree View */}
      {device && (
        <motion.div
          className="device-tree"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Device Header (Mã Mẹ) */}
          <div className="device-header-card">
            <div className="device-status-bar">
              <span className={`status-dot ${device.status === 'AVAILABLE' ? 'green' : 'orange'}`}></span>
              <span>{device.status}</span>
              <span className="device-condition">{condLabel(device.condition)}</span>
            </div>
            <h2>{device.name}</h2>
            <div className="device-serial">
              <span className="label">S/N (Mã Mẹ):</span>
              <span className="mono">{device.serialNumber}</span>
            </div>
            <div className="device-meta-grid">
              <div><span className="label">BH</span><span>{device.warrantyMonths} tháng ({device.warrantyType === 'BRAND' ? 'Hãng' : 'Shop'})</span></div>
              <div><span className="label">Hết hạn</span><span>{device.warrantyEnd || 'N/A'}</span></div>
            </div>
            {device.warrantyNote && <div className="warranty-note-bar">⚠️ {device.warrantyNote}</div>}
            {device.conditionNote && <div className="condition-note-bar">📋 {device.conditionNote}</div>}
          </div>

          {/* Accordion: Components Tree */}
          <h3 className="section-title">🔩 Cây linh kiện ({Object.values(device.components || {}).flat().length} Mã Con)</h3>

          {Object.entries(device.components || {}).map(([type, items]) => (
            <div key={type} className="accordion-group">
              <button className="accordion-header" onClick={() => toggleSection(type)}>
                <span className="acc-icon">{COMP_ICONS[type] || '📦'}</span>
                <span className="acc-title">{COMP_LABELS[type] || type}</span>
                <span className="acc-count">{items.length}</span>
                <span className={`acc-arrow ${openSections[type] ? 'open' : ''}`}>▼</span>
              </button>

              <AnimatePresence>
                {openSections[type] && (
                  <motion.div
                    className="accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {items.map((comp, idx) => (
                      <div key={idx} className="component-card">
                        <div className="comp-top">
                          <span className="comp-name">{comp.name}</span>
                          <span className="comp-status" style={{ background: STATUS_COLOR[comp.status] || '#888' }}>
                            {comp.status}
                          </span>
                        </div>
                        <div className="comp-details">
                          <div><span className="label">S/N:</span><span className="mono">{comp.serialNumber}</span></div>
                          <div><span className="label">NSX:</span><span>{comp.manufacturer}</span></div>
                          {comp.specs && <div><span className="label">Specs:</span><span>{comp.specs}</span></div>}
                          {comp.techNote && <div className="tech-note">📝 {comp.techNote}</div>}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Actions */}
          <div className="tech-actions">
            <button className="btn-action primary" onClick={() => { setDevice(null); setManualInput('') }}>
              📸 QUÉT MÁY KHÁC
            </button>
            <button className="btn-action secondary" onClick={onBack}>
              ← VỀ TRANG CHÍNH
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
