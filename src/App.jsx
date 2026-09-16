import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PhoneCall } from 'lucide-react';
import { WhatsAppFilledIcon } from './components/icons/WhatsAppIcon';
import { CartProvider } from './context/CartContext';
import { MenuProvider } from './context/MenuContext';
import { RestaurantSettingsProvider, useRestaurantSettings } from './context/RestaurantSettingsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './components/Cart';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import './App.css';

// Automatically scroll to top on page navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Clean compact floating contact icon buttons
function FloatingQuickActions() {
  const { settings } = useRestaurantSettings();

  return (
    <aside className="floating-actions" aria-label="Quick contact actions">
      {/* Call Floating Action */}
      <div className="floating-btn-wrap">
        <a
          href={settings.phoneTel}
          className="floating-btn floating-btn--call"
          id="floating-call-btn"
          aria-label={`Call ${settings.phone}`}
        >
          <PhoneCall size={20} />
        </a>
        <span className="floating-tooltip">Call {settings.phone}</span>
      </div>

      {/* WhatsApp Floating Action */}
      <div className="floating-btn-wrap">
        <a
          href={settings.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-btn floating-btn--whatsapp"
          id="floating-whatsapp-btn"
          aria-label="WhatsApp Order"
        >
          <WhatsAppFilledIcon size={20} />
        </a>
        <span className="floating-tooltip">WhatsApp Order</span>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <RestaurantSettingsProvider>
      <MenuProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <div className="app-container">
              <Navbar />
              <div className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <Footer />
              <Cart />
              <FloatingQuickActions />
            </div>
          </Router>
        </CartProvider>
      </MenuProvider>
    </RestaurantSettingsProvider>
  );
}
