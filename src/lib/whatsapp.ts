import siteConfig from '@/data/site-config.json';
import type { Order } from '@/types/order';

export function buildWhatsAppOrderUrl(order: Order): string {
  const itemsList = order.items
    .map(i => `- ${i.title} (${i.selectedSize}, ${i.selectedColour}) x${i.quantity}`)
    .join('\n');

  const message =
    `*New Order: ${order.orderId}*\n\n` +
    `*Customer Details:*\n` +
    `Name: ${order.customer.firstName} ${order.customer.lastName}\n` +
    `Phone: ${order.customer.phone}\n` +
    `Email: ${order.customer.email}\n\n` +
    `*Delivery Address:*\n` +
    `${order.customer.address}\n` +
    `${order.customer.city}, ${order.customer.province} ${order.customer.postalCode}\n\n` +
    `*Items Ordered:*\n` +
    `${itemsList}\n\n` +
    `*Subtotal:* $${order.subtotal.toFixed(2)} CAD\n` +

    `*Delivery:* ${order.deliveryCharge !== null ? '$' + order.deliveryCharge.toFixed(2) + ' CAD' : 'Quote Requested'}\n` +
    `*Tax:* $${order.taxAmount.toFixed(2)} CAD\n` +

    `*Total:* $${order.total.toFixed(2)} CAD\n\n` +
    `*Payment Method:* Cash on Delivery (COD)\n` +
    `*Notes:* ${order.customer.notes || 'None'}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodedMessage}`;
}
