import restaurantConfig from '../config/restaurantConfig';

/**
 * Build formatted WhatsApp order message according to client specification.
 */
export function buildWhatsAppMessage(cartItems, total) {
  let message = 'Hello Call N Pizza Cafe,\n\n';
  message += 'I would like to place an order.\n\n';
  message += 'Items:\n';

  cartItems.forEach((item) => {
    const sizeStr = item.size ? ` - ${item.size}` : '';
    message += `- ${item.name}${sizeStr} x${item.quantity}\n`;
  });

  message += `\nTotal: ₹${total}\n\n`;
  message += 'Customer Name: \n';
  message += 'Customer Phone: \n';
  message += 'Delivery Address: \n\n';
  message += 'Please confirm my order.';

  return message;
}

/**
 * Generate a WhatsApp click-to-chat URL with the formatted order.
 */
export function getWhatsAppUrl(cartItems, total) {
  const message = buildWhatsAppMessage(cartItems, total);
  const encoded = encodeURIComponent(message);
  const number = restaurantConfig.whatsappNumber; // '919944399984'
  return `https://wa.me/${number}?text=${encoded}`;
}

/**
 * Generate a simple WhatsApp contact URL (no message).
 */
export function getWhatsAppContactUrl() {
  const number = restaurantConfig.whatsappNumber;
  return `https://wa.me/${number}`;
}
