export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  priceAdjustment: number; // For VND, this is an integer
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  price: number; // VND, integer
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProductDTO = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants' | 'isActive'> & {
  variants?: (Omit<ProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt' | 'sku'> & { sku?: string })[];
};

export type UpdateProductDTO = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants'>> & {
  variants?: (Omit<ProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt' | 'sku'> & { id?: string; sku?: string })[];
  isActive?: boolean;
};
