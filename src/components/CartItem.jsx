import './CartItem.css';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="cart-item" id={`cart-item-${item.cartKey}`}>
      <div className="cart-item__info">
        <h4 className="cart-item__name">{item.name}</h4>
        {item.size && (
          <span className="cart-item__size">Size: {item.size}</span>
        )}
        <span className="cart-item__price">₹{item.price} each</span>
      </div>

      <div className="cart-item__controls">
        <div className="cart-item__qty">
          <button
            className="cart-item__qty-btn"
            onClick={() => onUpdateQuantity(item.cartKey, -1)}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="cart-item__qty-value">{item.quantity}</span>
          <button
            className="cart-item__qty-btn"
            onClick={() => onUpdateQuantity(item.cartKey, 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <span className="cart-item__subtotal">₹{item.price * item.quantity}</span>
        <button
          className="cart-item__remove"
          onClick={() => onRemove(item.cartKey)}
          aria-label={`Remove ${item.name}`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
