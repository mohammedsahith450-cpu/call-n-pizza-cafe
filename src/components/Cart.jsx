import { useEffect } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
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
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Tell document.body whether bottom cart is visible so floating buttons can adjust position
  useEffect(() => {
    if (itemCount > 0 && !isCartOpen) {
      document.body.classList.add('has-bottom-cart');
    } else {
      document.body.classList.remove('has-bottom-cart');
    }
    return () => {
      document.body.classList.remove('has-bottom-cart');
    };
  }, [itemCount, isCartOpen]);

  const whatsappUrl = items.length > 0 ? getWhatsAppUrl(items, total) : '#';

  return (
    <>
      {/* ── Sticky Bottom Cart Bar (Only shown when cart has > 0 items and drawer is closed) ── */}
      {itemCount > 0 && !isCartOpen && (
        <aside
          className="bottom-cart-bar animate-slide-up"
          id="bottom-cart-bar"
          aria-label="Current cart summary"
          onClick={() => setIsCartOpen(true)}
        >
          <div className="bottom-cart-bar__content">
            <div className="bottom-cart-bar__info">
              <span className="bottom-cart-bar__icon-box">
                <ShoppingBag size={20} className="bottom-cart-bar__icon" />
              </span>
              <div className="bottom-cart-bar__meta">
                <span className="bottom-cart-bar__count" id="bottom-cart-count">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="bottom-cart-bar__divider">|</span>
                <span className="bottom-cart-bar__total" id="bottom-cart-total">
                  ₹{total}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="bottom-cart-bar__btn"
              id="bottom-cart-view-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsCartOpen(true);
              }}
            >
              <span>View Cart</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </aside>
      )}

      {/* ── Cart Drawer Modal ── */}
      {isCartOpen && (
        <div
          className="cart-overlay"
          onClick={() => setIsCartOpen(false)}
          id="cart-overlay"
        >
          <div
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()}
            id="cart-drawer"
          >
            {/* Header */}
            <div className="cart-drawer__header">
              <h2 className="cart-drawer__title">
                🛒 Your Order
                {itemCount > 0 && <span className="cart-drawer__count">({itemCount})</span>}
              </h2>
              <button
                className="cart-drawer__close"
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
                id="cart-close-btn"
              >
                ✕
              </button>
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
                  <span className="cart-drawer__total-amount" id="cart-drawer-total">
                    ₹{total}
                  </span>
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

                <button
                  className="cart-drawer__clear-btn"
                  onClick={clearCart}
                  id="cart-clear-btn"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
