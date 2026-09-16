import { Link } from 'react-router-dom';
import { Phone, Clock, MapPin, Car, ShieldCheck } from 'lucide-react';
import { WhatsAppFilledIcon, InstagramIcon, YoutubeIcon } from './icons/SocialIcons';
import restaurantConfig from '../config/restaurantConfig';
import { useRestaurantSettings } from '../context/RestaurantSettingsContext';
import './Footer.css';

const footerLinks = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useRestaurantSettings();
  const displayHours = settings.openingHours || `${settings.openingTime} – ${settings.closingTime}`;

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <img src={restaurantConfig.logo} alt={restaurantConfig.name} className="footer__logo" />
            <h3 className="footer__name">{restaurantConfig.name}</h3>
            <p className="footer__desc">{restaurantConfig.description}</p>
            {restaurantConfig.isHalal && (
              <span className="footer__halal">
                <ShieldCheck size={14} /> 100% Halal Certified
              </span>
            )}
          </div>

          {/* Quick Links */}
          <div className="footer__section">
            <h4 className="footer__heading">Quick Links</h4>
            <ul className="footer__links">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer__link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__section">
            <h4 className="footer__heading">Contact</h4>
            <ul className="footer__contact">
              <li>
                <span className="footer__contact-icon">
                  <Phone size={16} />
                </span>
                <a href={settings.phoneTel} className="footer__link" id="footer-phone-link">
                  {settings.phone}
                </a>
              </li>
              <li>
                <span className="footer__contact-icon">
                  <WhatsAppFilledIcon size={16} />
                </span>
                <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="footer__link" id="footer-whatsapp-link">
                  WhatsApp Order
                </a>
              </li>
              <li>
                <span className="footer__contact-icon">
                  <InstagramIcon size={16} />
                </span>
                <a href={restaurantConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="footer__link" id="footer-instagram-link">
                  Instagram
                </a>
              </li>
              <li>
                <span className="footer__contact-icon">
                  <YoutubeIcon size={16} />
                </span>
                <a href={restaurantConfig.youtubeUrl} target="_blank" rel="noopener noreferrer" className="footer__link" id="footer-youtube-link">
                  YouTube
                </a>
              </li>
            </ul>
          </div>

          {/* Hours & Location */}
          <div className="footer__section">
            <h4 className="footer__heading">Hours & Location</h4>
            <div className="footer__info">
              <p>
                <span className="footer__contact-icon">
                  <Clock size={16} />
                </span>
                <span>{settings.daysOpen}: {displayHours}</span>
              </p>
              <p>
                <span className="footer__contact-icon">
                  <MapPin size={16} />
                </span>
                <span>{restaurantConfig.address}</span>
              </p>
              {restaurantConfig.homeDelivery && (
                <p className="footer__delivery">
                  <span className="footer__contact-icon">
                    <Car size={16} />
                  </span>
                  <span>Home Delivery Available</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {currentYear} {restaurantConfig.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
