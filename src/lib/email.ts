import emailjs from '@emailjs/browser';
import type { Order } from '@/types/order';

// Send order notification to store owner
export async function sendOwnerNotification(order: Order): Promise<void> {
  // If keys are not set, we log to console for development testing
  if (
    !process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
    !process.env.NEXT_PUBLIC_EMAILJS_OWNER_TEMPLATE_ID ||
    !process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
  ) {
    console.log("EmailJS Owner Notification (Simulated in Dev):", {
      service: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template: process.env.NEXT_PUBLIC_EMAILJS_OWNER_TEMPLATE_ID,
      payload: {
        order_id: order.orderId,
        customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
        customer_email: order.customer.email,
        customer_phone: order.customer.phone,
        customer_address: `${order.customer.address}, ${order.customer.city}, ${order.customer.province} ${order.customer.postalCode}`,
        items_list: order.items.map(i =>
          `${i.title} (${i.selectedSize}, ${i.selectedColour}) x${i.quantity} - $${(i.price * i.quantity).toFixed(2)}`
        ).join('\n'),
        subtotal: `$${order.subtotal.toFixed(2)}`,
        tax: `$${order.taxAmount.toFixed(2)}`,
        total: `$${order.total.toFixed(2)}`,
        notes: order.customer.notes || 'None',
      }
    });
    return;
  }

  await emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
    process.env.NEXT_PUBLIC_EMAILJS_OWNER_TEMPLATE_ID!,
    {
      order_id: order.orderId,
      customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
      customer_email: order.customer.email,
      customer_phone: order.customer.phone,
      customer_address: `${order.customer.address}, ${order.customer.city}, ${order.customer.province} ${order.customer.postalCode}`,
      items_list: order.items.map(i =>
        `${i.title} (${i.selectedSize}, ${i.selectedColour}) x${i.quantity} - $${(i.price * i.quantity).toFixed(2)}`
      ).join('\n'),
      subtotal: `$${order.subtotal.toFixed(2)}`,
      tax: `$${order.taxAmount.toFixed(2)}`,
      total: `$${order.total.toFixed(2)}`,
      notes: order.customer.notes || 'None',
    },
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
  );
}

// Send confirmation email to customer
export async function sendCustomerConfirmation(order: Order): Promise<void> {
  if (
    !process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
    !process.env.NEXT_PUBLIC_EMAILJS_CUSTOMER_TEMPLATE_ID ||
    !process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
  ) {
    console.log("EmailJS Customer Confirmation (Simulated in Dev):", {
      service: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template: process.env.NEXT_PUBLIC_EMAILJS_CUSTOMER_TEMPLATE_ID,
      payload: {
        to_email: order.customer.email,
        customer_name: order.customer.firstName,
        order_id: order.orderId,
        items_summary: order.items.map(i => `${i.title} x${i.quantity}`).join(', '),
        total: `$${order.total.toFixed(2)} CAD`,
        payment_method: 'Cash on Delivery',
        delivery_estimate: '5-10 business days',
      }
    });
    return;
  }

  await emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
    process.env.NEXT_PUBLIC_EMAILJS_CUSTOMER_TEMPLATE_ID!,
    {
      to_email: order.customer.email,
      customer_name: order.customer.firstName,
      order_id: order.orderId,
      items_summary: order.items.map(i => `${i.title} x${i.quantity}`).join(', '),
      total: `$${order.total.toFixed(2)} CAD`,
      payment_method: 'Cash on Delivery',
      delivery_estimate: '5-10 business days',
    },
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
  );
}
