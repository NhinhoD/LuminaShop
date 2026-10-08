export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  priceAdjustment: number;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  categoryId: string;
  title: Record<string, string>;
  slug: string;
  description: Record<string, string>;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  demoUrl: string;
  sourceCodeUrl: string;
  techStack: string[];
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
