import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getWhatsAppUrl } from '../utils/whatsapp';
import CartItem from './CartItem';
import './Cart.css';

export default function Cart() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    total,
    itemCount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const whatsappUrl = items.length > 0 ? getWhatsAppUrl(items, total) : '#';

  return (
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)} id="cart-overlay">
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()} id="cart-drawer">
        {/* Header */}
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">
            🛒 Your Order
            {itemCount > 0 && <span className="cart-drawer__count">({itemCount})</span>}
          </h2>
          <button className="cart-drawer__close" onClick={() => setIsCartOpen(false)} aria-label="Close cart">✕</button>
        </div>

        {/* Body */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <span className="cart-drawer__empty-icon">🍕</span>
              <p>Your cart is empty</p>
              <span className="cart-drawer__empty-hint">Browse our menu and add items!</span>
            </div>
          ) : (
            <div className="cart-drawer__items">
              {items.map((item) => (
                <CartItem
                  key={item.cartKey}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total">
              <span>Total</span>
              <span className="cart-drawer__total-amount">₹{total}</span>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cart-drawer__whatsapp-btn"
              id="cart-whatsapp-btn"
            >
              💬 Order on WhatsApp
            </a>

            <button className="cart-drawer__clear-btn" onClick={clearCart} id="cart-clear-btn">
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
