/**
 * ============================================
 * RESTAURANT CONFIGURATION
 * ============================================
 * 
 * Single source of truth for Call N Pizza Cafe.
 * Values here propagate to every component.
 * ============================================
 */

const restaurantConfig = {
  // ── Business Info ──────────────────────────
  name: 'Call N Pizza Cafe',
  nameTamil: 'கால் என் பீட்சா கஃபே',
  tagline: 'Delicious Pizza, Burgers & More',
  description:
    'Call N Pizza Cafe brings you the finest pizzas, burgers, fried chicken, momos, and refreshing beverages — all prepared with premium ingredients and served with love. Halal certified and home delivery available.',
  
  // ── Contact ────────────────────────────────
  phone: '9944399984',
  phoneDisplay: '99443 99984',
  phoneTel: 'tel:+919944399984',
  whatsappNumber: '919944399984',
  whatsappUrl: 'https://wa.me/919944399984',

  // ── Social Media ───────────────────────────
  instagramUrl:
    'https://www.instagram.com/call_n_plzza_cafe?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==',
  youtubeUrl:
    'https://youtube.com/@callnpizzacafe?si=IOiLp_V5zweGuSmY',
  googleMapsUrl:
    'https://maps.google.com/?q=NU+Complex,+Iravancheri+Main+Road,+Vishnupuram',

  // ── Website ────────────────────────────────
  website: 'www.callnpizzacafe.com',

  // ── Location ───────────────────────────────
  address: 'NU Complex, Iravancheri Main Road, Vishnupuram',
  addressTamil: 'NU காம்ப்ளெக்ஸ், இரவாஞ்செரி மெயின்ரோடு, விஷ்ணுபுரம்',

  // ── Operating Hours ────────────────────────
  openingHours: '10:00 AM – 10:00 PM',
  openingTime: '10:00 AM',
  closingTime: '10:00 PM',
  daysOpen: 'Every Day',

  // ── Features ───────────────────────────────
  isHalal: true,
  homeDelivery: true,

  // ── Branding ───────────────────────────────
  logo: '/logo.png',

  // ── Currency ───────────────────────────────
  currency: '₹',
};

export default restaurantConfig;
