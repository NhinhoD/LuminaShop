export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export type PaymentMethod = 'cod' | 'vnpay' | 'momo';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
}

export interface ProductSnapshot {
  title: string;
  image?: string;
  image_url?: string;
  variantName?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  priceAtPurchase: number;
  productTitle?: string;
  productSnapshot?: ProductSnapshot;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  contactEmail?: string;
  contactPhone?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
