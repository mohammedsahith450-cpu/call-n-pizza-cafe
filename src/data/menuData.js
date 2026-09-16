/**
 * ============================================
 * MENU DATA
 * ============================================
 *
 * All food items for Call N Pizza Cafe.
 *
 * Structure is designed to be easily replaced
 * with Supabase database queries later.
 *
 * Each item has:
 * - id (unique)
 * - name
 * - description
 * - category
 * - image (path in /public/images/food/)
 * - price (for single-size items)
 * - sizes (for pizza / multi-size items)
 * - available (boolean)
 * - featured (boolean — shown on home page)
 *
 * Items marked available: false will NOT appear
 * on the public menu.
 * ============================================
 */

export const categories = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'burger', name: 'Burger', icon: '🍔' },
  { id: 'fried-chicken', name: 'Fried Chicken', icon: '🍗' },
  { id: 'chicken-specials', name: 'Chicken Specials', icon: '🍖' },
  { id: 'sandwich-wrap', name: 'Sandwich & Wrap', icon: '🌯' },
  { id: 'momo', name: 'Momo', icon: '🥟' },
  { id: 'mojito-juices', name: 'Mojito & Juices', icon: '🍹' },
  { id: 'milkshakes', name: 'Milkshakes', icon: '🥤' },
  { id: 'fries', name: 'Fries', icon: '🍟' },
];

export const menuItems = [
  // ── PIZZA ──────────────────────────────────
  {
    id: 'veg-pizza',
    name: 'Veg Pizza',
    description: 'Fresh vegetables, bell peppers, onions, tomatoes & olives on melted mozzarella cheese',
    category: 'pizza',
    image: '/images/food/veg-pizza.jpg',
    sizes: [
      { label: 'Small', price: 150 },
      { label: 'Medium', price: 230 },
      { label: 'Large', price: 350 },
    ],
    available: true,
    featured: true,
  },
  {
    id: 'chicken-pizza',
    name: 'Chicken Pizza',
    description: 'Tender grilled chicken pieces, bell peppers & onions on a bed of mozzarella',
    category: 'pizza',
    image: '/images/food/chicken-pizza.jpg',
    sizes: [
      { label: 'Small', price: 180 },
      { label: 'Medium', price: 280 },
      { label: 'Large', price: 450 },
    ],
    available: true,
    featured: true,
  },
  {
    id: 'paneer-pizza',
    name: 'Paneer Pizza',
    description: 'Cubes of soft paneer with capsicum, onion & mozzarella on a crispy base',
    category: 'pizza',
    image: '/images/food/paneer-pizza.jpg',
    sizes: [
      { label: 'Small', price: 190 },
      { label: 'Medium', price: 290 },
      { label: 'Large', price: 390 },
    ],
    available: true,
    featured: false,
  },
  {
    id: 'mushroom-pizza',
    name: 'Mushroom Pizza',
    description: 'Sliced mushrooms, herbs & melted mozzarella cheese on a classic pizza base',
    category: 'pizza',
    image: '/images/food/mushroom-pizza.jpg',
    sizes: [
      { label: 'Small', price: 180 },
      { label: 'Medium', price: 280 },
      { label: 'Large', price: 380 },
    ],
    available: true,
    featured: false,
  },

  // ── BURGER ─────────────────────────────────
  {
    id: 'veg-burger',
    name: 'Veg Burger',
    description: 'Crispy veggie patty with fresh lettuce, tomato & cheese in a toasted bun',
    category: 'burger',
    image: '/images/food/veg-burger.jpg',
    price: 70,
    available: true,
    featured: false,
  },
  {
    id: 'chicken-burger',
    name: 'Chicken Burger',
    description: 'Juicy chicken patty with lettuce, mayo & cheese in a sesame bun',
    category: 'burger',
    image: '/images/food/chicken-burger.jpg',
    price: 90,
    available: true,
    featured: true,
  },
  {
    id: 'paneer-burger',
    name: 'Paneer Burger',
    description: 'Grilled paneer patty with fresh veggies & special sauce in a soft bun',
    category: 'burger',
    image: '/images/food/paneer-burger.jpg',
    price: 80,
    available: true,
    featured: false,
  },

  // ── FRIED CHICKEN ──────────────────────────
  {
    id: 'fried-chicken-2pcs',
    name: 'Fried Chicken - 2 Pcs',
    description: 'Two pieces of crispy, golden-fried chicken',
    category: 'fried-chicken',
    image: '/images/food/fried-chicken-2pcs.jpg',
    price: 150,
    available: true,
    featured: false,
  },
  {
    id: 'fried-chicken-4pcs',
    name: 'Fried Chicken - 4 Pcs',
    description: 'Four pieces of crispy, golden-fried chicken — perfect for sharing',
    category: 'fried-chicken',
    image: '/images/food/fried-chicken-4pcs.jpg',
    price: 290,
    available: true,
    featured: true,
  },
  {
    id: 'fried-chicken-6pcs',
    name: 'Fried Chicken - 6 Pcs',
    description: 'Six pieces of crispy, golden-fried chicken — great for a group',
    category: 'fried-chicken',
    image: '/images/food/fried-chicken-6pcs.jpg',
    price: 480,
    available: true,
    featured: false,
  },
  {
    id: 'fried-chicken-8pcs',
    name: 'Fried Chicken - 8 Pcs',
    description: 'Eight pieces of crispy, golden-fried chicken — the ultimate feast',
    category: 'fried-chicken',
    image: '/images/food/fried-chicken-8pcs.jpg',
    price: 580,
    available: true,
    featured: false,
  },

  // ── CHICKEN SPECIALS ───────────────────────
  {
    id: 'chicken-bites-popcorn',
    name: 'Chicken Bites Popcorn',
    description: 'Bite-sized crispy chicken popcorn — irresistibly crunchy',
    category: 'chicken-specials',
    image: '/images/food/chicken-bites-popcorn.jpg',
    price: 0,
    available: false, // Price to confirm with client
    featured: false,
  },
  {
    id: 'chicken-breaded-strips',
    name: 'Chicken Breaded Strips',
    description: 'Golden crispy chicken strips with a crunchy bread coating',
    category: 'chicken-specials',
    image: '/images/food/chicken-breaded-strips.jpg',
    price: 100,
    available: true,
    featured: false,
  },
  {
    id: 'chicken-nuggets-6pcs',
    name: 'Chicken Nuggets - 6 Pcs',
    description: 'Six tender chicken nuggets with a crispy golden coating',
    category: 'chicken-specials',
    image: '/images/food/chicken-nuggets.jpg',
    price: 100,
    available: true,
    featured: false,
  },
  {
    id: 'chicken-breaded-lollipop',
    name: 'Chicken Breaded Lollipop',
    description: 'Crispy breaded chicken lollipops — a crunchy delight',
    category: 'chicken-specials',
    image: '/images/food/chicken-breaded-lollipop.jpg',
    price: 0,
    available: false, // Price to confirm with client
    featured: false,
  },

  // ── SANDWICH & WRAP ────────────────────────
  {
    id: 'paneer-roll-shawarma',
    name: 'Paneer Roll Shawarma',
    description: 'Grilled paneer wrapped in a warm flatbread with fresh veggies & sauces',
    category: 'sandwich-wrap',
    image: '/images/food/paneer-roll-shawarma.jpg',
    price: 90,
    available: true,
    featured: false,
  },
  {
    id: 'chicken-roll-shawarma',
    name: 'Chicken Roll Shawarma',
    description: 'Tender chicken wrapped in a warm flatbread with pickles, veggies & sauces',
    category: 'sandwich-wrap',
    image: '/images/food/chicken-roll-shawarma.jpg',
    price: 80,
    available: true,
    featured: true,
  },
  {
    id: 'veg-classic-sandwich',
    name: 'Veg Classic Sandwich',
    description: 'Classic grilled sandwich with fresh vegetables, cheese & herbs',
    category: 'sandwich-wrap',
    image: '/images/food/veg-classic-sandwich.jpg',
    price: 70,
    available: true,
    featured: false,
  },
  {
    id: 'chicken-sandwich',
    name: 'Chicken Sandwich',
    description: 'Grilled chicken sandwich with lettuce, tomato & creamy mayo',
    category: 'sandwich-wrap',
    image: '/images/food/chicken-sandwich.jpg',
    price: 100,
    available: true,
    featured: false,
  },

  // ── MOMO ───────────────────────────────────
  {
    id: 'chicken-momos-6pcs',
    name: 'Chicken Momos - 6 Pcs',
    description: 'Six steamed chicken-filled momos served with spicy chutney',
    category: 'momo',
    image: '/images/food/chicken-momos.jpg',
    price: 0,
    available: false, // Price to confirm with client
    featured: false,
  },
  {
    id: 'veg-momos-6pcs',
    name: 'Veg Momos - 6 Pcs',
    description: 'Six steamed vegetable momos served with tangy chutney',
    category: 'momo',
    image: '/images/food/veg-momos.jpg',
    price: 70,
    available: true,
    featured: false,
  },
  {
    id: 'paneer-momos-6pcs',
    name: 'Paneer Momos - 6 Pcs',
    description: 'Six steamed paneer-filled momos served with red chutney',
    category: 'momo',
    image: '/images/food/paneer-momos.jpg',
    price: 80,
    available: true,
    featured: false,
  },

  // ── MOJITO & JUICES ────────────────────────
  {
    id: 'blue-mojito',
    name: 'Blue Mojito',
    description: 'Refreshing blue curaçao mojito with lime, mint & crushed ice',
    category: 'mojito-juices',
    image: '/images/food/blue-mojito.jpg',
    price: 70,
    available: true,
    featured: true,
  },
  {
    id: 'lime-mint-mojito',
    name: 'Lime & Mint Mojito',
    description: 'Classic lime & fresh mint mojito with soda and crushed ice',
    category: 'mojito-juices',
    image: '/images/food/lime-mint-mojito.jpg',
    price: 70,
    available: true,
    featured: false,
  },
  {
    id: 'strawberry-mojito',
    name: 'Strawberry Mojito',
    description: 'Sweet strawberry mojito with fresh mint & sparkling soda',
    category: 'mojito-juices',
    image: '/images/food/strawberry-mojito.jpg',
    price: 70,
    available: true,
    featured: false,
  },
  {
    id: 'green-apple-mojito',
    name: 'Green Apple Mojito',
    description: 'Tangy green apple mojito with mint, lime & crushed ice',
    category: 'mojito-juices',
    image: '/images/food/green-apple-mojito.jpg',
    price: 70,
    available: true,
    featured: false,
  },
  {
    id: 'orange-mojito',
    name: 'Orange Mojito',
    description: 'Zesty orange mojito with a burst of citrus & fresh mint',
    category: 'mojito-juices',
    image: '/images/food/orange-mojito.jpg',
    price: 70,
    available: true,
    featured: false,
  },

  // ── MILKSHAKES ─────────────────────────────
  {
    id: 'vanilla-milkshake',
    name: 'Vanilla Milkshake',
    description: 'Creamy vanilla milkshake blended with ice cream & cold milk',
    category: 'milkshakes',
    image: '/images/food/vanilla-milkshake.jpg',
    price: 100,
    available: true,
    featured: false,
  },
  {
    id: 'chocolate-milkshake',
    name: 'Chocolate Milkshake',
    description: 'Rich chocolate milkshake with cocoa, ice cream & whipped cream',
    category: 'milkshakes',
    image: '/images/food/chocolate-milkshake.jpg',
    price: 110,
    available: true,
    featured: true,
  },
  {
    id: 'kitkat-milkshake',
    name: 'KitKat Milkshake',
    description: 'Indulgent KitKat milkshake blended with crushed wafers & ice cream',
    category: 'milkshakes',
    image: '/images/food/kitkat-milkshake.jpg',
    price: 120,
    available: true,
    featured: false,
  },
  {
    id: 'oreo-milkshake',
    name: 'Oreo Milkshake',
    description: 'Thick Oreo cookie milkshake blended with ice cream & crushed biscuits',
    category: 'milkshakes',
    image: '/images/food/oreo-milkshake.jpg',
    price: 120,
    available: true,
    featured: false,
  },
  {
    id: 'strawberry-milkshake',
    name: 'Strawberry Milkshake',
    description: 'Sweet strawberry milkshake with real berry flavour & ice cream',
    category: 'milkshakes',
    image: '/images/food/strawberry-milkshake.jpg',
    price: 100,
    available: true,
    featured: false,
  },

  // ── FRIES ──────────────────────────────────
  {
    id: 'finger-chips-100g',
    name: 'Finger Chips - 100g',
    description: 'Crispy golden finger chips — generously portioned at 100g',
    category: 'fries',
    image: '/images/food/finger-chips.jpg',
    price: 80,
    available: true,
    featured: false,
  },
  {
    id: 'finger-chips-50g',
    name: 'Finger Chips - 50g',
    description: 'Crispy golden finger chips — a snack-size 50g serving',
    category: 'fries',
    image: '/images/food/finger-chips.jpg',
    price: 40,
    available: true,
    featured: false,
  },
];

/**
 * Helper: get only available items
 */
export const getAvailableItems = () =>
  menuItems.filter((item) => item.available);

/**
 * Helper: get featured items for home page
 */
export const getFeaturedItems = () =>
  menuItems.filter((item) => item.available && item.featured);

/**
 * Helper: get items by category
 */
export const getItemsByCategory = (categoryId) => {
  if (categoryId === 'all') return getAvailableItems();
  return menuItems.filter(
    (item) => item.available && item.category === categoryId
  );
};
