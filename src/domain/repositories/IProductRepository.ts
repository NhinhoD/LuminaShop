import { Product, CreateProductDTO, UpdateProductDTO } from '../entities/Product';

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findAll(filters?: { 
    categoryId?: string; 
    search?: string; 
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }>;
  create(data: CreateProductDTO): Promise<Product>;
  update(id: string, data: UpdateProductDTO): Promise<Product>;
  delete(id: string): Promise<void>;
  
  // Variant management
  addVariant(productId: string, variant: Omit<Product, 'id' | 'productId' | 'createdAt' | 'updatedAt'>): Promise<void>;
}
