export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  // Denormalized for ease of display in UI if needed, 
  // though usually fetched via join
  productTitle?: string;
  productPrice?: number;
  productImageUrl?: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}
