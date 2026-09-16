import './PizzaSizeSelector.css';

export default function PizzaSizeSelector({ sizes, selectedSize, onSelectSize, disabled = false }) {
  return (
    <div className="size-selector" id="size-selector">
      {sizes.map((size) => (
        <button
          key={size.label}
          type="button"
          disabled={disabled}
          className={`size-selector__btn ${selectedSize === size.label ? 'size-selector__btn--active' : ''}`}
          onClick={() => onSelectSize(size.label)}
        >
          <span className="size-selector__label">{size.label}</span>
          <span className="size-selector__price">₹{size.price}</span>
        </button>
      ))}
    </div>
  );
}
