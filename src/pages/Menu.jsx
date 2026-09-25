import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMenu } from '../context/MenuContext';
import SectionHeading from '../components/SectionHeading';
import CategoryFilter from '../components/CategoryFilter';
import FoodCard from '../components/FoodCard';
import './Menu.css';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState(urlCategory || 'all');
  const { items, categories } = useMenu();
  const contentSectionRef = useRef(null);

  // Sync state if URL query param changes
  useEffect(() => {
    if (urlCategory) {
      setActiveCategory(urlCategory);
      // Smoothly scroll down to menu filter if arriving via deep-link
      if (contentSectionRef.current) {
        setTimeout(() => {
          contentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      setActiveCategory('all');
    }
  }, [urlCategory]);

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: catId });
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Don't show items with 0 price if unconfirmed
      if (item.price === 0 && (!item.sizes || item.sizes.length === 0)) {
        return false;
      }
      if (activeCategory === 'all') return true;
      return item.category === activeCategory;
    });
  }, [items, activeCategory]);

  const activeCategoryMeta = categories.find((c) => c.id === activeCategory);

  return (
    <main className="menu-page" id="menu-page">
      <section className="menu-page__hero">
        <div className="container">
          <SectionHeading
            title="Our Menu"
            subtitle="Explore our delicious selection of pizzas, burgers, fried chicken, momos, drinks and more"
          />
        </div>
      </section>

      <section className="section menu-page__content" ref={contentSectionRef} id="menu-content">
        <div className="container">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onSelect={handleSelectCategory}
          />

          {filteredItems.length === 0 ? (
            <div className="menu-page__empty" id="menu-empty-state">
              <span className="menu-page__empty-icon">
                {activeCategoryMeta?.icon || '🍽️'}
              </span>
              <p>No items in {activeCategoryMeta?.name || 'this category'} yet.</p>
            </div>
          ) : (
            <div className="menu-page__grid">
              {filteredItems.map((item, i) => (
                <div
                  key={item.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <FoodCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
