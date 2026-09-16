import restaurantConfig from '../config/restaurantConfig';
import { useMenu } from '../context/MenuContext';
import { useRestaurantSettings } from '../context/RestaurantSettingsContext';
import SectionHeading from '../components/SectionHeading';
import FoodCard from '../components/FoodCard';
import Button from '../components/Button';
import './Home.css';

const whyChooseUs = [
  {
    icon: '☪',
    title: 'Halal Certified',
    desc: 'All our meat and ingredients are 100% Halal certified for your peace of mind.',
  },
  {
    icon: '🍕',
    title: 'Fresh Ingredients',
    desc: 'We use only the freshest ingredients, prepared daily for maximum flavour.',
  },
  {
    icon: '🚗',
    title: 'Home Delivery',
    desc: 'Get your favourite food delivered right to your doorstep.',
  },
  {
    icon: '⭐',
    title: 'Premium Quality',
    desc: 'Every dish is crafted with care to deliver a restaurant-quality experience.',
  },
];

export default function Home() {
  const { items } = useMenu();
  const { settings } = useRestaurantSettings();
  const featuredItems = items.filter((item) => item.featured && item.available !== false);

  const displayHours = settings.openingHours || `${settings.openingTime} – ${settings.closingTime}`;

  return (
    <main className="home" id="home-page">
      {/* ── Hero ─────────────────────────────── */}
      <section className="hero" id="hero">
        <div className="hero__bg" />
        <div className="hero__content container">
          <div className="hero__logo-wrapper animate-fade-in-up">
            <img
              src={restaurantConfig.logo}
              alt={restaurantConfig.name}
              className="hero__logo"
            />
          </div>

          {/* Dynamic Open / Closed Status Pill */}
          <div className="hero__status-badge-wrap animate-fade-in-up">
            <span
              className={`hero-status-pill ${settings.isOpen ? 'hero-status-pill--open' : 'hero-status-pill--closed'}`}
              id="hero-open-status"
            >
              {settings.isOpen ? '🟢 Open Now' : '🔴 Currently Closed'}
            </span>
          </div>

          <h1 className="hero__title animate-fade-in-up delay-1">
            {restaurantConfig.name}
          </h1>
          <p className="hero__subtitle animate-fade-in-up delay-2">
            Delicious Pizzas, Burgers, Fried Chicken & More — Freshly Made, Halal Certified
          </p>
          <div className="hero__buttons animate-fade-in-up delay-3">
            <Button variant="primary" size="lg" href="/menu" icon="🍕" id="hero-menu-btn">
              View Menu
            </Button>
            <Button
              variant="whatsapp"
              size="lg"
              href={settings.whatsappUrl}
              target="_blank"
              icon="💬"
              id="hero-whatsapp-btn"
            >
              WhatsApp Order
            </Button>
            <Button
              variant="outline"
              size="lg"
              href={settings.phoneTel}
              icon="📞"
              id="hero-call-btn"
            >
              Call Now ({settings.phone})
            </Button>
          </div>
          <div className="hero__info animate-fade-in-up delay-4">
            <div className="hero__info-item">
              <span className="hero__info-icon">📞</span>
              <a href={settings.phoneTel} style={{ color: 'inherit', textDecoration: 'none' }}>
                {settings.phone}
              </a>
            </div>
            <div className="hero__info-item">
              <span className="hero__info-icon">🕐</span>
              <span>{displayHours}</span>
            </div>
            <div className="hero__info-item">
              <span className="hero__info-icon">🚗</span>
              <span>Home Delivery Available</span>
            </div>
            <div className="hero__info-item">
              <span className="hero__info-icon">☪</span>
              <span>Halal Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Food ────────────────────── */}
      <section className="section" id="featured-food">
        <div className="container">
          <SectionHeading
            title="Our Specialties"
            subtitle="The most popular items from our menu, loved by thousands of customers"
          />
          <div className="home__featured-grid">
            {featuredItems.slice(0, 8).map((item, i) => (
              <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <FoodCard item={item} />
              </div>
            ))}
          </div>
          <div className="home__featured-cta">
            <Button variant="outline" size="lg" href="/menu" icon="📖">
              View Full Menu
            </Button>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────── */}
      <section className="section section--alt" id="about-section">
        <div className="container">
          <div className="home__about">
            <div className="home__about-content">
              <SectionHeading title="About Us" centered={false} />
              <p className="home__about-text">
                Welcome to <strong>{restaurantConfig.name}</strong> — your favourite destination for
                mouth-watering pizzas, juicy burgers, crispy fried chicken, steaming momos, and refreshing
                beverages in Vishnupuram.
              </p>
              <p className="home__about-text">
                We take pride in serving 100% Halal certified food made from the freshest ingredients.
                Whether you're dining in or ordering delivery, we promise a delicious experience every time.
              </p>
              <div className="home__about-features">
                <div className="home__about-feature">
                  <span>📍</span>
                  <span>{restaurantConfig.address}</span>
                </div>
                <div className="home__about-feature">
                  <span>🕐</span>
                  <span>Open {displayHours}, {settings.daysOpen}</span>
                </div>
              </div>
            </div>
            <div className="home__about-image-area">
              <img src={restaurantConfig.logo} alt={restaurantConfig.name} className="home__about-logo" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────── */}
      <section className="section" id="why-choose-us">
        <div className="container">
          <SectionHeading
            title="Why Choose Us"
            subtitle="What makes Call N Pizza Cafe the best choice for your next meal"
          />
          <div className="home__why-grid">
            {whyChooseUs.map((item, i) => (
              <div
                key={i}
                className="home__why-card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="home__why-icon">{item.icon}</span>
                <h3 className="home__why-title">{item.title}</h3>
                <p className="home__why-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="home__cta section" id="cta-section">
        <div className="container">
          <div className="home__cta-content">
            <h2 className="home__cta-title">Craving Something Delicious?</h2>
            <p className="home__cta-subtitle">
              Order now and enjoy our mouth-watering food — delivered fresh to your doorstep!
            </p>
            <div className="home__cta-buttons">
              <Button variant="primary" size="lg" href="/menu" icon="📖" id="cta-menu-btn">
                View Menu
              </Button>
              <Button
                variant="whatsapp"
                size="lg"
                href={restaurantConfig.whatsappUrl}
                target="_blank"
                icon="💬"
                id="cta-whatsapp-btn"
              >
                WhatsApp Order
              </Button>
              <Button
                variant="outline"
                size="lg"
                href={restaurantConfig.phoneTel}
                icon="📞"
                id="cta-call-btn"
              >
                Call Now ({restaurantConfig.phoneDisplay})
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
