import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Product, CreateProductDTO, UpdateProductDTO, ProductVariant } from '@/domain/entities/Product';
import { ProductRow, ProductVariantRow } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';
import { generateSlug, generateSKU } from '@/lib/utils';

interface ProductDTO {
  category_id?: string;
  title?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  image_url?: string | null;
  is_active?: boolean;
  updated_at?: string;
}

export class SupabaseProductRepository implements IProductRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Product | null> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('slug', slug)
      .single();
    
    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findAll(filters?: { 
    categoryId?: string; 
    search?: string; 
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ products: Product[]; total: number }> {
    const supabase = this.supabase;
    let query = supabase
      .from('products')
      .select('*, variants:product_variants(*)', { count: 'exact' })
      .is('deleted_at', null);

    if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
    if (filters?.isActive !== undefined) query = query.eq('is_active', filters.isActive);
    if (filters?.search) query = query.ilike('title', `%${filters.search}%`);
    
    if (filters?.limit) {
      const from = filters.offset || 0;
      const to = from + filters.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    return {
      products: (data as ProductRow[] || []).map((row) => this.mapToEntity(row)),
      total: count || 0
    };
  }

  async create(data: CreateProductDTO): Promise<Product> {
    const supabase = this.supabase;
    
    const serializedDescription = JSON.stringify({
      description: data.description || '',
      demoUrl: data.demoUrl || '',
      sourceCodeUrl: data.sourceCodeUrl || '',
      techStack: data.techStack || []
    });

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        category_id: data.categoryId,
        title: data.title,
        slug: data.slug || generateSlug(data.title),
        description: serializedDescription,
        price: Math.floor(data.price), // Ensure integer VND
        stock: 999999, // Infinite digital inventory
        image_url: data.imageUrl,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);

    // Create base inventory item for digital product with infinite quantity
    await supabase.from('inventory_items').insert({
      product_id: product.id,
      variant_id: null,
      sku: `${product.slug}-BASE`,
      quantity: 999999
    });

    return this.findById(product.id) as Promise<Product>;
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    const supabase = this.supabase;
    
    const existingProduct = await this.findById(id);
    if (!existingProduct) throw new Error("Sản phẩm không tồn tại.");

    const mergedDesc = {
      description: data.description !== undefined ? data.description : existingProduct.description,
      demoUrl: data.demoUrl !== undefined ? data.demoUrl : existingProduct.demoUrl,
      sourceCodeUrl: data.sourceCodeUrl !== undefined ? data.sourceCodeUrl : existingProduct.sourceCodeUrl,
      techStack: data.techStack !== undefined ? data.techStack : existingProduct.techStack
    };

    const serializedDescription = JSON.stringify(mergedDesc);

    const dbData: ProductDTO = {};
    if (data.categoryId) dbData.category_id = data.categoryId;
    if (data.title) {
      dbData.title = data.title;
      if (!data.slug) dbData.slug = generateSlug(data.title);
    }
    if (data.slug) dbData.slug = data.slug;
    dbData.description = serializedDescription;
    if (data.price !== undefined) dbData.price = Math.floor(data.price);
    dbData.stock = 999999;
    if (data.imageUrl !== undefined) dbData.image_url = data.imageUrl;
    if (data.isActive !== undefined) dbData.is_active = data.isActive;
    dbData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('products')
      .update(dbData)
      .eq('id', id);

    if (error) throw new Error(`Database error: ${error.message}`);

    // Sync base inventory
    await supabase
      .from('inventory_items')
      .update({ quantity: 999999 })
      .eq('product_id', id)
      .is('variant_id', null);
    
    return this.findById(id) as Promise<Product>;
  }

  async delete(id: string): Promise<void> {
    const supabase = this.supabase;
    const { error } = await supabase
      .from('products')
      .update({ 
        deleted_at: new Date().toISOString(),
        is_active: false 
      })
      .eq('id', id);

    if (error) throw new Error(`Database error: ${error.message}`);
  }

  async addVariant(productId: string, variant: Omit<ProductVariant, 'id' | 'productId' | 'createdAt' | 'updatedAt'>): Promise<void> {
    // No-op for digital marketplace, but keep interface compatibility
    return;
  }

  private mapToEntity(row: ProductRow): Product {
    let parsedDesc = {
      description: row.description || "",
      demoUrl: "",
      sourceCodeUrl: "",
      techStack: [] as string[]
    };
    
    try {
      if (row.description && (row.description.startsWith('{') || row.description.startsWith('['))) {
        const data = JSON.parse(row.description);
        if (data && typeof data === 'object') {
          parsedDesc = {
            description: data.description || '',
            demoUrl: data.demoUrl || '',
            sourceCodeUrl: data.sourceCodeUrl || '',
            techStack: Array.isArray(data.techStack) ? data.techStack : []
          };
        }
      }
    } catch (_e) {
      // Graceful fallback
    }

    return {
      id: row.id,
      categoryId: row.category_id,
      title: row.title,
      slug: row.slug,
      description: parsedDesc.description,
      price: typeof row.price === 'string' ? parseInt(row.price) : row.price,
      stock: row.stock,
      imageUrl: row.image_url || undefined,
      isActive: row.is_active,
      demoUrl: parsedDesc.demoUrl,
      sourceCodeUrl: parsedDesc.sourceCodeUrl,
      techStack: parsedDesc.techStack,
      variants: row.variants?.map((v) => ({
        id: v.id,
        productId: v.product_id,
        sku: v.sku,
        name: v.name,
        priceAdjustment: typeof v.price_adjustment === 'string' ? parseInt(v.price_adjustment) : v.price_adjustment,
        stockQuantity: v.stock_quantity,
        createdAt: new Date(v.created_at),
        updatedAt: new Date(v.updated_at),
      })),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
