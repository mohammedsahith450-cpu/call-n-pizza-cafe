import './CategoryFilter.css';

export default function CategoryFilter({ categories, activeCategory, onSelect }) {
  return (
    <div className="category-filter" id="category-filter">
      <div className="category-filter__track">
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
