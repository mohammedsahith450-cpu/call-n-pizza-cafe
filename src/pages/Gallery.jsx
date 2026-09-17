import { useState, useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import Lightbox from '../components/Lightbox';
import Button from '../components/Button';
import { useRestaurantSettings } from '../context/RestaurantSettingsContext';
import { galleryService } from '../services/galleryService';
import './Gallery.css';

export default function Gallery() {
  const { settings } = useRestaurantSettings();
  const [galleryImages, setGalleryImages] = useState(() => galleryService.getPublicItems());
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    galleryService.fetchItems().then(() => {
      if (isMounted) setGalleryImages(galleryService.getPublicItems());
    });

    const handleUpdate = () => {
      if (isMounted) setGalleryImages(galleryService.getPublicItems());
    };
    window.addEventListener('gallery-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('gallery-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Derive active categories dynamically from admin-managed data
  const uniqueCategories = Array.from(
    new Set(galleryImages.map((img) => img.category || 'Other'))
  ).filter(Boolean);
  const categories = ['All', ...uniqueCategories];

  const filteredImages =
    activeFilter === 'All'
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeFilter);

  return (
    <main className="gallery-page" id="gallery-page">
      {/* ── Hero ── */}
      <section className="gallery-hero">
        <div className="container">
          <SectionHeading
            title="Our Food Gallery"
            subtitle="Take a peek at our handcrafted pizzas, gourmet burgers, and fresh cafe delicacies"
          />

          {/* Filter Pills */}
          {categories.length > 1 && (
            <div className="gallery-filters" id="gallery-filters">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`gallery-filter-btn ${activeFilter === cat ? 'gallery-filter-btn--active' : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Gallery Grid ── */}
      <section className="section">
        <div className="container">
          {filteredImages.length === 0 ? (
            <div className="gallery-empty" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No photos found in this category.</p>
              <p style={{ fontSize: '0.9rem' }}>Check back soon as our chefs upload fresh photo updates!</p>
            </div>
          ) : (
            <div className="gallery-grid" id="gallery-grid">
              {filteredImages.map((item) => (
                <div
                  key={item.id}
                  className="gallery-item animate-fade-in-up"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="gallery-item__image-wrap">
                    <img src={item.image} alt={item.title} className="gallery-item__img" />
                    <div className="gallery-item__overlay">
                      <span className="gallery-item__zoom-icon">🔍</span>
                      <h3 className="gallery-item__title">{item.title}</h3>
                      {item.description && (
                        <p className="gallery-item__caption">{item.description}</p>
                      )}
                      <span className="gallery-item__badge">{item.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Action CTA */}
          <div className="gallery-cta">
            <h3>Hungry after browsing?</h3>
            <p>Order directly to your door or call our team!</p>
            <div className="gallery-cta__buttons">
              <Button
                variant="whatsapp"
                size="lg"
                href={settings.whatsappUrl}
                target="_blank"
                icon="💬"
                id="gallery-whatsapp-btn"
              >
                WhatsApp Order ({settings.phone})
              </Button>
              <Button
                variant="outline"
                size="lg"
                href={settings.phoneTel}
                icon="📞"
                id="gallery-call-btn"
              >
                Call Now ({settings.phone})
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <Lightbox
          image={selectedImage.image}
          alt={`${selectedImage.title} - ${selectedImage.description || ''}`}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </main>
  );
}
