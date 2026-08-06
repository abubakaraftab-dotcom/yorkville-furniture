import type { CartItem } from "./product";

export interface OrderFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
}

export interface Order {
  orderId: string;
  customer: OrderFormData;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number | null;
  taxRate: number;
  taxAmount: number;
  total: number;
  orderDate: string;
  status: "pending";
  paymentMethod: "COD";
}
