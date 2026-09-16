import { useState, useMemo } from 'react';
import { useMenu } from '../context/MenuContext';
import SectionHeading from '../components/SectionHeading';
import CategoryFilter from '../components/CategoryFilter';
import FoodCard from '../components/FoodCard';
import './Menu.css';

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { items, categories } = useMenu();

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

      <section className="section menu-page__content">
        <div className="container">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          {filteredItems.length === 0 ? (
            <div className="menu-page__empty">
              <span className="menu-page__empty-icon">🍽️</span>
              <p>No items in this category yet.</p>
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
