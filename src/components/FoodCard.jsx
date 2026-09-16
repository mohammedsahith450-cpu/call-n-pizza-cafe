import { useState, useCallback } from 'react';
import { ImageOff } from 'lucide-react';
import { useCart } from '../context/CartContext';
import PizzaSizeSelector from './PizzaSizeSelector';
import './FoodCard.css';

export default function FoodCard({ item }) {
  const { addItem } = useCart();
  const hasSizes = item.sizes && item.sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState(
    hasSizes ? item.sizes[0].label : null
  );
  const [imgError, setImgError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isAvailable = item.available !== false;

  const currentPrice = hasSizes
    ? item.sizes.find((s) => s.label === selectedSize)?.price
    : item.price;

  const handleAdd = useCallback(() => {
    if (!isAvailable) return;
    addItem(item, selectedSize);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 600);
  }, [item, selectedSize, addItem, isAvailable]);

  const hasImage = Boolean(item.image && !imgError);

  return (
    <div className={`food-card ${!isAvailable ? 'food-card--unavailable' : ''}`} id={`food-card-${item.id}`}>
      <div className="food-card__image-wrapper">
        {hasImage ? (
          <img
            src={item.image}
            alt={item.name}
            className="food-card__image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="food-card__placeholder">
            <ImageOff className="food-card__placeholder-icon" size={32} />
            <span className="food-card__placeholder-text">No Image Available</span>
          </div>
        )}

        {isAvailable ? (
          <div className="food-card__price-badge">₹{currentPrice}</div>
        ) : (
          <div className="food-card__status-badge">Currently Unavailable</div>
        )}
      </div>

      <div className="food-card__content">
        <h3 className="food-card__name">{item.name}</h3>
        {item.description && (
          <p className="food-card__desc">{item.description}</p>
        )}

        {hasSizes && (
          <PizzaSizeSelector
            sizes={item.sizes}
            selectedSize={selectedSize}
            onSelectSize={isAvailable ? setSelectedSize : () => {}}
            disabled={!isAvailable}
          />
        )}

        <button
          className={`food-card__add-btn ${
            !isAvailable
              ? 'food-card__add-btn--disabled'
              : isAdding
              ? 'food-card__add-btn--added'
              : ''
          }`}
          onClick={handleAdd}
          disabled={!isAvailable}
          id={`add-btn-${item.id}`}
        >
          {!isAvailable ? 'Currently Unavailable' : isAdding ? '✓ Added!' : '+ Add to Order'}
        </button>
      </div>
    </div>
  );
}
