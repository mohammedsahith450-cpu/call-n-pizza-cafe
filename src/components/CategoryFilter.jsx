import { useRef, useEffect } from 'react';
import './CategoryFilter.css';

export default function CategoryFilter({ categories, activeCategory, onSelect }) {
  const trackRef = useRef(null);

  // BUG 2 FIX: On desktop, mouse-wheel events scroll the page vertically by default.
  // This handler intercepts wheel events over the category bar and converts them into
  // horizontal scroll, making the category navigation work with a mouse on desktop.
  // Mobile touch-scroll is unaffected — the native -webkit-overflow-scrolling handles it.
  useEffect(() => {
    const el = trackRef.current?.parentElement; // the .category-filter wrapper
    if (!el) return;

    const onWheel = (e) => {
      // Only intercept when the track actually overflows (i.e. scrollable)
      if (el.scrollWidth <= el.clientWidth) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div className="category-filter" id="category-filter">
      <div className="category-filter__track" ref={trackRef}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-filter__btn ${activeCategory === cat.id ? 'category-filter__btn--active' : ''}`}
            onClick={() => onSelect(cat.id)}
            id={`cat-btn-${cat.id}`}
          >
            <span className="category-filter__icon">{cat.icon}</span>
            <span className="category-filter__label">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
