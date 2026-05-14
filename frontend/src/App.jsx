import { useState } from 'react'
import './App.css'

// Custom Hooks
import { useProducts } from './hooks/useProducts'
import { useAuth } from './hooks/useAuth'
import { useCart } from './hooks/useCart'

// Components
import Header from './components/Header'
import Footer from './components/Footer'
import AuthModals from './components/AuthModals'
import { SosButton, SosModal } from './components/SosModal'
import PrintTicketModal from './components/PrintTicketModal'

// Pages
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import StaffPage from './pages/StaffPage'
import AiPage from './pages/AiPage'
import SeoPage from './pages/SeoPage'

// Apps (Other modules)
import TechnicianApp from './TechnicianApp'
import './TechnicianApp.css'
import KioskApp from './KioskApp'
import TabletPOS from './TabletPOS'
import './KioskPOS.css'
import AdminDashboard from './AdminDashboard'
import ShipperApp from './ShipperApp'
import './AdminShipper.css'
import PcBuilderApp from './PcBuilderApp'

export default function App() {
  const [page, setPage] = useState('home')
  const [sel, setSel] = useState(null)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [ticket, setTicket] = useState(null)

  const { products, uiSettings } = useProducts()
  
  const notify = m => { setToast(m); setTimeout(() => setToast(null), 3000) }
  
  const { user, doAuth, logout } = useAuth(notify, setModal, setPage)
  const { cart, config, setConfig, addToCart, removeFromCart, setCart, cartTotal, calcPrice } = useCart(notify)

  const goHome = () => { setPage('home'); setSel(null) }

  return (
    <div>
      <Header user={user} uiSettings={uiSettings} cart={cart} setPage={setPage} setModal={setModal} onLogout={logout} />

      {page === 'home' && <HomePage products={products} uiSettings={uiSettings} setPage={setPage} setSel={setSel} setConfig={setConfig} />}
      {page === 'pdp' && <ProductPage sel={sel} config={config} setConfig={setConfig} addToCart={addToCart} calcPrice={calcPrice} />}
      {page === 'cart' && <CartPage cart={cart} removeFromCart={removeFromCart} cartTotal={cartTotal} setPage={setPage} setModal={setModal} user={user} />}
      {(page === 'shipping' || page === 'payment') && <CheckoutPage page={page} setPage={setPage} cart={cart} cartTotal={cartTotal} setCart={setCart} notify={notify} />}
      
      {page === 'staff' && <StaffPage products={products} setTicket={setTicket} setModal={setModal} notify={notify} />}
      {page === 'ai' && <AiPage products={products} setSel={setSel} setConfig={setConfig} setPage={setPage} />}
      {page === 'seo' && <SeoPage products={products} notify={notify} />}

      {/* Sub-Apps */}
      {page === 'tech' && <TechnicianApp onBack={goHome} />}
      {page === 'pcbuild' && <PcBuilderApp onBack={goHome} />}
      {page === 'kiosk' && <KioskApp onBack={goHome} />}
      {page === 'pos' && <TabletPOS onBack={goHome} />}
      {page === 'admin' && user?.role === 'ADMIN' && <AdminDashboard user={user} onBack={goHome} />}
      {page === 'shipper' && user?.role === 'SHIPPER' && <ShipperApp user={user} onBack={goHome} />}

      {/* Shared UI */}
      {['home', 'pdp', 'cart', 'shipping', 'payment', 'staff', 'ai', 'seo'].includes(page) && (
        <Footer uiSettings={uiSettings} />
      )}

      {/* Modals & Overlays */}
      <AuthModals modal={modal} setModal={setModal} doAuth={doAuth} />
      <SosButton user={user} setModal={setModal} />
      <SosModal user={user} modal={modal} setModal={setModal} />
      <PrintTicketModal modal={modal} setModal={setModal} ticket={ticket} />

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
