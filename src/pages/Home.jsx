import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Car,
  Utensils,
  Truck,
  Smile,
  ShieldCheck,
  Flame,
  Pizza,
  BookOpen,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';
import restaurantConfig from '../config/restaurantConfig';
import { useMenu } from '../context/MenuContext';
import { useRestaurantSettings } from '../context/RestaurantSettingsContext';
import SectionHeading from '../components/SectionHeading';
import FoodCard from '../components/FoodCard';
import Button from '../components/Button';
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  WhatsAppFilledIcon,
} from '../components/icons/SocialIcons';
import './Home.css';

const highlights = [
  {
    icon: <Utensils size={22} className="home-hl__icon" />,
    title: 'Delicious Food',
    desc: 'Artisan pizzas, burgers & crispy chicken made fresh to order',
  },
  {
    icon: <Truck size={22} className="home-hl__icon" />,
    title: 'Fast Delivery',
    desc: 'Prompt home delivery hot and fresh to your door',
  },
  {
    icon: <ShieldCheck size={22} className="home-hl__icon" />,
    title: 'Halal Certified',
    desc: '100% Halal certified meats & genuine ingredients',
  },
  {
    icon: <Smile size={22} className="home-hl__icon" />,
    title: 'Happy Customers',
    desc: 'Loved by families & food lovers across the region',
  },
];

const whyChooseUs = [
  {
    icon: '☪',
    title: 'Halal Certified',
    desc: 'All our meat and ingredients are 100% Halal certified for your complete peace of mind.',
  },
  {
    icon: '🍕',
    title: 'Delicious Pizzas & Burgers',
    desc: 'Handcrafted fresh dough, rich sauces, premium cheese, and mouthwatering toppings daily.',
  },
  {
    icon: '⚡',
    title: 'Fast Delivery',
    desc: 'Hot and fresh doorstep delivery to ensure you enjoy every single bite at its best.',
  },
  {
    icon: '❤️',
    title: 'Happy Customers',
    desc: 'Serving high quality meals that keep thousands of local foodies smiling.',
  },
];

export default function Home() {
  const { items } = useMenu();
  const { settings } = useRestaurantSettings();
  const featuredItems = items.filter(
    (item) => Boolean(item.show_on_homepage !== undefined ? item.show_on_homepage : item.featured)
  );

  const displayHours = settings.openingHours || `${settings.openingTime} – ${settings.closingTime}`;
  const restaurantAddress = settings.address || restaurantConfig.address;

  return (
    <main className="home" id="home-page">
      {/* ── 1. Existing Pizza Hero ────────────────────────── */}
      <section className="hero" id="hero">
        {/* Dark readability gradient overlay on the left */}
        <div className="hero__overlay" aria-hidden="true" />

        <div className="container hero__container">
          {/* Halal Badge positioned at top right */}
          <div className="hero__halal-pill" id="hero-halal-badge">
            <ShieldCheck size={20} className="hero__halal-icon" />
            <span>100% Halal Certified</span>
          </div>

          {/* Left Column Content Area */}
          <div className="hero__content animate-fade-in-up">
            {/* Logo and Status Badges */}
            <div className="hero__brand-header">
              <div className="hero__logo-wrapper">
                <img
                  src={restaurantConfig.logo}
                  alt={restaurantConfig.name}
                  className="hero__logo"
                />
              </div>
              <div className="hero__brand-badges">
                <span className="hero__badge">
                  <Flame size={15} /> FRESH &amp; HOT PIZZAS
                </span>
                <span
                  className={`hero__status-pill ${
                    settings.isOpen ? 'hero__status-pill--open' : 'hero__status-pill--closed'
                  }`}
                  id="hero-open-status"
                >
                  <span className="hero__status-dot" />
                  {settings.isOpen ? 'Open Now' : 'Currently Closed'}
                </span>
              </div>
            </div>

            {/* Hero Main Headline */}
            <h1 className="hero__title">
              Taste the Passion in <br className="hero__title-br" />
              <span className="hero__title-red">Every Slice</span>
            </h1>

            {/* Description Subtitle */}
            <p className="hero__subtitle">
              Welcome to <strong>{restaurantConfig.name}</strong>. Enjoy handcrafted artisan pizzas,
              flavour-packed burgers, crispy fried chicken, and delicious sides — freshly prepared
              with 100% Halal certified ingredients.
            </p>

            {/* Exact Required Address Banner */}
            <div className="hero__address-pill" id="hero-address">
              <MapPin size={18} className="hero__address-icon" />
              <span>{restaurantAddress}</span>
            </div>

            {/* Action Buttons Row — red pizza icon button navigates directly to Pizza category */}
            <div className="hero__buttons">
              <Link
                to="/menu?category=pizza"
                className="hero-btn hero-btn--order"
                id="hero-order-btn"
                title="Order Pizza"
                aria-label="Order Pizza"
              >
                <Pizza size={22} className="hero-btn__icon" />
                <span className="hero-btn__text">Order Now</span>
              </Link>
              <Link
                to="/menu"
                className="hero-btn hero-btn--menu"
                id="hero-menu-btn"
                title="View Menu"
                aria-label="View Menu"
              >
                <BookOpen size={22} className="hero-btn__icon hero-btn__menu-icon" />
                <span className="hero-btn__text">View Menu</span>
              </Link>
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-btn hero-btn--whatsapp"
                id="hero-whatsapp-btn"
                title="WhatsApp Order"
                aria-label="WhatsApp Order"
              >
                <WhatsAppFilledIcon size={24} className="hero-btn__icon" />
                <span className="hero-btn__text">WhatsApp Order</span>
              </a>
              <a
                href={settings.phoneTel}
                className="hero-btn hero-btn--call"
                id="hero-call-btn"
                title={`Call ${settings.phone}`}
                aria-label={`Call ${settings.phone}`}
              >
                <PhoneCall size={22} className="hero-btn__icon hero-btn__call-icon" />
                <span className="hero-btn__text">Call: {settings.phone}</span>
              </a>
            </div>

            {/* Social Media Pill Buttons */}
            <div className="hero__social-row">
              <span className="hero__social-label">Follow Us:</span>
              <a
                href={restaurantConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero__social-pill hero__social-pill--facebook"
                id="hero-facebook-link"
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
                className="hero__social-pill hero__social-pill--instagram"
                id="hero-instagram-link"
                title="Follow Call N Pizza Cafe on Instagram"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
                <span>Instagram</span>
              </a>
              <a
                href={restaurantConfig.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero__social-pill hero__social-pill--youtube"
                id="hero-youtube-link"
                title="Watch Call N Pizza Cafe on YouTube"
                aria-label="YouTube"
              >
                <YoutubeIcon size={18} />
                <span>YouTube</span>
              </a>
            </div>
          </div>

          {/* Distressed Red Brush Ribbon Badge on Bottom Right */}
          <div className="hero__brush-ribbon" aria-hidden="true">
            <span className="hero__brush-text">MORE PIZZA IS IMPOSSIBLE</span>
          </div>
        </div>
      </section>

      {/* ── 2. New Shawarma Specialty Section ────────────── */}
      <section className="home__shawarma-section" id="shawarma-specialty">
        <div className="home__shawarma-backdrop" aria-hidden="true">
          <img
            src="/images/shawarma-hero-clean.jpg"
            alt="Call N Pizza Cafe Shawarma Specialty"
            className="home__shawarma-img"
          />
          <div className="home__shawarma-overlay" />
        </div>

        <div className="container home__shawarma-container">
          <div className="home__shawarma-card animate-fade-in-up">
            <span className="home__shawarma-badge">OUR SPECIALTY</span>
            <h2 className="home__shawarma-title">SHAWARMA</h2>
            <p className="home__shawarma-subtitle">Authentic taste, unforgettable flavour</p>
            <div className="home__shawarma-actions">
              <Link
                to="/menu?category=shawarma"
                className="hero-btn hero-btn--order home__shawarma-btn"
                id="shawarma-order-btn"
                title="Order Shawarma Now"
                aria-label="Order Shawarma Now"
              >
                <span>Order Now</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Existing Homepage Features (Highlights) ────── */}
      <section className="home__highlights-section" id="homepage-features">
        <div className="container">
          <div className="home__highlights-grid">
            {highlights.map((h, i) => (
              <div key={i} className="home-hl__card">
                <div className="home-hl__icon-box">{h.icon}</div>
                <div className="home-hl__info">
                  <h3 className="home-hl__title">{h.title}</h3>
                  <p className="home-hl__desc">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Existing Homepage Content ─────────────────── */}
      {/* 4a. About Us Section */}
      <section className="section section--alt home__about-section" id="about-section">
        <div className="container">
          <div className="home__about">
            <div className="home__about-content">
              <span className="home__section-tag">Authentic Taste</span>
              <SectionHeading title="About Call N Pizza Cafe" centered={false} />
              <p className="home__about-text">
                Welcome to <strong>{restaurantConfig.name}</strong> — your ultimate destination for
                mouth-watering pizzas, crispy fried chicken, juicy burgers, steaming momos, and chilled
                beverages in Eravanchery, Manavalanallur.
              </p>
              <p className="home__about-text">
                Every meal is prepared with fresh ingredients, crafted with care, and 100% Halal
                certified. Whether you are dining with family, taking away, or ordering quick home
                delivery, we guarantee exceptional quality and friendly service every time.
              </p>
              <div className="home__about-features">
                <div className="home__about-feature">
                  <MapPin size={20} className="home__feature-icon" />
                  <div>
                    <strong>Address:</strong> {restaurantAddress}
                  </div>
                </div>
                <div className="home__about-feature">
                  <Clock size={20} className="home__feature-icon" />
                  <div>
                    <strong>Working Hours:</strong> Open {displayHours}, {settings.daysOpen}
                  </div>
                </div>
                <div className="home__about-feature">
                  <Car size={20} className="home__feature-icon" />
                  <div>
                    <strong>Home Delivery:</strong> Available across Eravanchery &amp; nearby locations
                  </div>
                </div>
              </div>
            </div>
            <div className="home__about-image-area">
              <div className="home__about-img-frame">
                <img
                  src="/images/pizza-dish.jpg"
                  alt={restaurantConfig.name}
                  className="home__about-img"
                />
                <div className="home__about-logo-stamp">
                  <img
                    src={restaurantConfig.logo}
                    alt={restaurantConfig.name}
                    className="home__about-stamp-img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4b. Why Choose Us Section */}
      <section className="section home__why-section" id="why-choose-us">
        <div className="container">
          <SectionHeading
            title="Why Choose Us"
            subtitle="What makes Call N Pizza Cafe your favourite neighborhood food spot"
          />
          <div className="home__why-grid">
            {whyChooseUs.map((item, i) => (
              <div
                key={i}
                className="home__why-card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <span className="home__why-icon">{item.icon}</span>
                <h3 className="home__why-title">{item.title}</h3>
                <p className="home__why-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4c. Call To Action Section */}
      <section className="home__cta section" id="cta-section">
        <div className="container">
          <div className="home__cta-card">
            <h2 className="home__cta-title">Ready for Fresh &amp; Delicious Pizza?</h2>
            <p className="home__cta-subtitle">
              Order now on WhatsApp or call our friendly counter for quick doorstep delivery!
            </p>
            <div className="home__cta-buttons">
              <Button variant="primary" size="lg" href="/menu" icon="🍕" id="cta-menu-btn">
                Order Now
              </Button>
              <Button
                variant="whatsapp"
                size="lg"
                href={settings.whatsappUrl}
                target="_blank"
                icon="💬"
                id="cta-whatsapp-btn"
              >
                WhatsApp Order
              </Button>
              <Button
                variant="outline"
                size="lg"
                href={settings.phoneTel}
                icon="📞"
                id="cta-call-btn"
              >
                Call: {settings.phone}
              </Button>
            </div>
            {/* Social media connections */}
            <div className="home__cta-socials">
              <span>Connect with us:</span>
              <a
                href={restaurantConfig.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="home__cta-soc-btn"
                title="Facebook"
              >
                <FacebookIcon size={16} /> Facebook
              </a>
              <a
                href={restaurantConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="home__cta-soc-btn"
                title="Instagram"
              >
                <InstagramIcon size={16} /> Instagram
              </a>
              <a
                href={restaurantConfig.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="home__cta-soc-btn"
                title="YouTube"
              >
                <YoutubeIcon size={16} /> YouTube
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Existing real homepage/featured food items ──── */}
      {featuredItems.length > 0 && (
        <section className="section home__featured-section" id="featured-food">
          <div className="container">
            <SectionHeading
              title="Chef's Special Picks"
              subtitle="The most popular items from our menu, loved by thousands of happy customers"
            />
            <div className="home__featured-grid">
              {featuredItems.map((item, i) => (
                <div
                  key={item.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <FoodCard item={item} />
                </div>
              ))}
            </div>
            <div className="home__featured-cta">
              <Button variant="primary" size="lg" href="/menu" icon="📖">
                View Full Menu
              </Button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
