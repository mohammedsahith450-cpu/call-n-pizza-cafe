import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  /**
   * Generate a unique cart key for an item.
   * For sized items (pizza), key includes the size.
   */
  const getCartKey = (itemId, size) =>
    size ? `${itemId}-${size}` : itemId;

  /**
   * Add item to cart.
   * If item (with same size) already exists, increment quantity.
   */
  const addItem = useCallback((menuItem, selectedSize = null) => {
    const price = selectedSize
      ? menuItem.sizes.find((s) => s.label === selectedSize)?.price
      : menuItem.price;

    const cartKey = getCartKey(menuItem.id, selectedSize);

    setItems((prev) => {
      const existing = prev.find((i) => i.cartKey === cartKey);
      if (existing) {
        return prev.map((i) =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          cartKey,
          id: menuItem.id,
          name: menuItem.name,
          image: menuItem.image,
          size: selectedSize,
          price,
          quantity: 1,
        },
      ];
    });

    setIsCartOpen(true);
  }, []);

  /**
   * Remove item from cart completely.
   */
  const removeItem = useCallback((cartKey) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  }, []);

  /**
   * Update item quantity.
   * If quantity reaches 0, remove the item.
   */
  const updateQuantity = useCallback((cartKey, delta) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.cartKey === cartKey
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  /**
   * Clear entire cart.
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Calculate total.
   */
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
