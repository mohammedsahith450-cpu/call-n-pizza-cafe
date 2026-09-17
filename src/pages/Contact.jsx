import { useState } from 'react';
import { PhoneCall, MapPin, Clock, Car, ShieldCheck } from 'lucide-react';
import {
  WhatsAppFilledIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from '../components/icons/SocialIcons';
import restaurantConfig from '../config/restaurantConfig';
import { useRestaurantSettings } from '../context/RestaurantSettingsContext';
import SectionHeading from '../components/SectionHeading';
import './Contact.css';

export default function Contact() {
  const { settings } = useRestaurantSettings();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleWhatsAppSend = (e) => {
    e.preventDefault();
    const text = encodeURIComponent(
      `Hello Call N Pizza Cafe,\n\nName: ${formData.name || 'Customer'}\nPhone: ${formData.phone || 'N/A'}\nMessage: ${formData.message || 'I would like to inquire about ordering.'}`
    );
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${text}`, '_blank');
  };

  const displayHours = settings.openingHours || `${settings.openingTime} – ${settings.closingTime}`;
  const restaurantAddress = settings.address || restaurantConfig.address;

  return (
    <main className="contact-page" id="contact-page">
      {/* ── Hero Banner ── */}
      <section className="contact-hero">
        <div className="container">
          <SectionHeading
            title="Contact Us"
            subtitle="Order freshly baked pizzas, crispy fried chicken & burgers, or visit our cafe in Eravanchery, Manavalanallur"
          />

          {/* ── Clean Compact Icon Actions ── */}
          <div className="contact-clean-actions" id="contact-clean-actions">
            <div className="contact-icon-buttons">
              {/* Phone Icon Button */}
              <div className="contact-icon-btn-wrap">
                <a
                  href={settings.phoneTel}
                  className="contact-icon-btn contact-icon-btn--phone"
                  id="contact-phone-icon-btn"
                  aria-label={`Call ${settings.phone}`}
                >
                  <PhoneCall size={22} />
                </a>
                <span className="contact-tooltip">Call {settings.phone}</span>
              </div>

              {/* WhatsApp Icon Button */}
              <div className="contact-icon-btn-wrap">
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-icon-btn contact-icon-btn--whatsapp"
                  id="contact-whatsapp-icon-btn"
                  aria-label="WhatsApp Order"
                >
                  <WhatsAppFilledIcon size={22} />
                </a>
                <span className="contact-tooltip">WhatsApp Order</span>
              </div>
            </div>

            {/* Direct Phone Display */}
            <div className="contact-phone-line">
              <span className="contact-phone-label">Phone: </span>
              <a href={settings.phoneTel} className="contact-phone-val">
                {settings.phone}
              </a>
            </div>

            {/* Social Links */}
            <div className="contact-social-row">
              <a
                href={restaurantConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-icon-btn contact-social-icon-btn--facebook"
                id="contact-facebook-btn"
                title="Follow Call N Pizza Cafe on Facebook"
                aria-label="Facebook"
              >
                <FacebookIcon size={18} />
                <span>Facebook</span>
              </a>
              <a
                href={restaurantConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-icon-btn contact-social-icon-btn--instagram"
                id="contact-instagram-btn"
                title="Follow us on Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
                <span>Instagram</span>
              </a>
              <a
                href={restaurantConfig.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-icon-btn contact-social-icon-btn--youtube"
                id="contact-youtube-btn"
                title="Watch our YouTube Channel"
                aria-label="YouTube"
              >
                <YoutubeIcon size={18} />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Detail Grid: Hours & Location + Message Form ── */}
      <section className="section contact-section-main">
        <div className="container">
          <div className="contact-details-grid">
            {/* Info Column */}
            <div className="contact-info-panel">
              <h3 className="contact-panel__title">Location & Hours</h3>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="contact-info-item__icon">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4>Address</h4>
                    <p>{restaurantAddress}</p>
                    <p className="contact-info-tamil">{restaurantConfig.addressTamil}</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-item__icon">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4>Working Hours</h4>
                    <p>{settings.daysOpen}: {displayHours}</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-item__icon">
                    <Car size={20} />
                  </div>
                  <div>
                    <h4>Home Delivery</h4>
                    <p>Home delivery available across Eravanchery, Manavalanallur, Tamil Nadu 609501 & surrounding areas</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-item__icon">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4>Certification</h4>
                    <p className="contact-info-badge">100% Halal Certified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Message Form */}
            <div className="contact-form-panel">
              <h3 className="contact-panel__title">Send Us a Message</h3>
              <p className="contact-form__subtitle">
                Have a question or custom catering order? Reach our counter instantly on WhatsApp ({settings.phone}).
              </p>

              <form onSubmit={handleWhatsAppSend} className="contact-form" id="contact-quick-form">
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="e.g. Rahul"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Your Mobile Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message / Order Details</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    placeholder="e.g. Inquiring about ordering 2 Fried Chicken 4 Pcs and 2 Veg Pizzas..."
                    value={formData.message}
                    onChange={handleChange}
                    className="form-input form-textarea"
                  />
                </div>

                <button
                  type="submit"
                  className="contact-form__submit-btn"
                  id="contact-form-submit-btn"
                >
                  <WhatsAppFilledIcon size={18} />
                  <span>Send on WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
