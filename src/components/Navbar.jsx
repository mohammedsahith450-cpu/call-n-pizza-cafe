import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, ShoppingBag, Menu as MenuIcon, X as CloseIcon } from 'lucide-react';
import { WhatsAppFilledIcon } from './icons/WhatsAppIcon';
import { useCart } from '../context/CartContext';
import { useRestaurantSettings } from '../context/RestaurantSettingsContext';
import restaurantConfig from '../config/restaurantConfig';
import './Navbar.css';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount, setIsCartOpen } = useCart();
  const { settings } = useRestaurantSettings();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`} id="main-nav">
      <div className="navbar__container container">
        {/* Logo */}
        <Link to="/" className="navbar__logo" id="nav-logo" title={restaurantConfig.name}>
          <img
            src={restaurantConfig.logo}
            alt={restaurantConfig.name}
            className="navbar__logo-img"
          />
          <div className="navbar__logo-text">
            <span className="navbar__brand">{restaurantConfig.name}</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar__links" id="nav-links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`navbar__link ${location.pathname === link.to ? 'navbar__link--active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="navbar__actions">
          <a
            href={settings.phoneTel}
            className="navbar__call-btn"
            id="nav-call-btn"
            title={`Call ${settings.phone}`}
          >
            <Phone size={15} className="navbar__call-icon" />
            <span className="navbar__call-text">{settings.phone}</span>
          </a>

          <button
            className="navbar__cart-btn"
            onClick={() => setIsCartOpen(true)}
            id="nav-cart-btn"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="navbar__cart-badge">{itemCount}</span>
            )}
          </button>

          <Link to="/menu" className="navbar__order-btn" id="nav-order-btn">
            Order Now
          </Link>

          {/* Hamburger */}
          <button
            className={`navbar__hamburger ${isMenuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            id="nav-hamburger"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="navbar__mobile-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="navbar__mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="navbar__mobile-header">
              <div className="navbar__mobile-branding">
                <img src={restaurantConfig.logo} alt={restaurantConfig.name} className="navbar__mobile-logo" />
                <span className="navbar__mobile-title">{restaurantConfig.name}</span>
              </div>
              <button className="navbar__mobile-close" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                <CloseIcon size={22} />
              </button>
            </div>
            <ul className="navbar__mobile-links">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`navbar__mobile-link ${location.pathname === link.to ? 'navbar__mobile-link--active' : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="navbar__mobile-actions">
              <a
                href={settings.phoneTel}
                className="navbar__mobile-call-btn"
                id="nav-mobile-call-btn"
              >
                <Phone size={18} /> Call {settings.phone}
              </a>
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="navbar__mobile-whatsapp-btn"
                id="nav-mobile-whatsapp-btn"
              >
                <WhatsAppFilledIcon size={18} /> WhatsApp Order
              </a>
              <Link to="/menu" className="navbar__mobile-order-btn" onClick={() => setIsMenuOpen(false)}>
                Order Now
              </Link>
              <button className="navbar__mobile-cart-btn" onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }}>
                <ShoppingBag size={18} /> View Cart {itemCount > 0 && `(${itemCount})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
