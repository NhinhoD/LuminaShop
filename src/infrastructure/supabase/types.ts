export interface ProductRow {
  id: string;
  category_id: string;
  title: Record<string, string>;
  slug: string;
  description: Record<string, string>;
  demo_url?: string;
  source_code_url?: string;
  tech_stack?: string[];
  price: string | number;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  variants?: ProductVariantRow[];
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  price_adjustment: string | number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface InventoryItemRow {
  id: string;
  product_id: string;
  variant_id: string | null;
  sku: string;
  quantity: number;
  reserved: number;
  location?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  user_id: string | null;
  status: 'pending' | 'completed' | 'cancelled';
  total_amount: string | number;
  contact_email: string | null;
  contact_phone: string | null;
  shipping_address: unknown;
  payment_method: 'cod' | 'vnpay' | 'momo';
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItemRow[];
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price_at_purchase: string | number;
  product_snapshot?: unknown;
  created_at: string;
  product?: { title: Record<string, string> };
}

export interface CartRow {
  id: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  items?: CartItemRow[];
}

export interface CartItemRow {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: ProductRow;
  variant?: ProductVariantRow;
}

export interface CategoryRow {
  id: string;
  name: Record<string, string>;
  slug: string;
  description: Record<string, string> | null;
  created_at: string;
  updated_at: string;
  products?: { count: number }[];
}

export interface PaymentRow {
  id: string;
  order_id: string;
  method: string;
  status: string;
  amount: number | string;
  transaction_id?: string | null;
  webhook_payload?: unknown;
  created_at: string;
}
