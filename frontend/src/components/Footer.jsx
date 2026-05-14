/**
 * Footer Component — Professional, clean
 */
export default function Footer({ uiSettings }) {
  return (
    <>
      <section className="container mt-5">
        <div className="card p-4 text-center">
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Hỗ trợ kỹ thuật</h3>
          <p className="text-sm text-dim mt-1">Hotline: 0912.345.678 (Zalo/Viber) · Email: cskh@duylongtech.vn</p>
        </div>
      </section>

      <footer className="footer mt-5">
        <div className="container text-center">
          <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>{uiSettings.footerText}</p>
          <p className="text-xs mt-2" style={{ color: '#8E8EA0' }}>© {new Date().getFullYear()} Máy Tính Duy Long. Phát triển bởi DuyLongTech Team</p>
        </div>
      </footer>
    </>
  )
}
