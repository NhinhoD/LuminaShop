export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  COD = 'cod',
  VNPAY = 'vnpay',
  MOMO = 'momo',
  PAYOS = 'payos'
}
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  ward?: string;
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
  productTitle?: Record<string, string>;
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
