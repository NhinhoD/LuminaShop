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
    
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        category_id: data.categoryId,
        title: data.title,
        slug: data.slug || generateSlug(data.title),
        description: data.description,
        price: Math.floor(data.price), // Ensure integer VND
        stock: data.stock,
        image_url: data.imageUrl,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);

    // Create variants if any
    if (data.variants && data.variants.length > 0) {
      const variantsToInsert = data.variants.map((v) => ({
        product_id: product.id,
        sku: v.sku || generateSKU(data.title, v.name),
        name: v.name,
        price_adjustment: Math.floor(v.priceAdjustment),
        stock_quantity: v.stockQuantity
      }));

      const { data: insertedVariants, error: variantError } = await supabase
        .from('product_variants')
        .insert(variantsToInsert)
        .select();

      if (variantError) throw new Error(`Variant error: ${variantError.message}`);

      // Create inventory items for variants
      if (insertedVariants && insertedVariants.length > 0) {
        const inventoryToInsert = (insertedVariants as ProductVariantRow[]).map((v) => ({
          product_id: product.id,
          variant_id: v.id,
          sku: v.sku,
          quantity: v.stock_quantity
        }));
        await supabase.from('inventory_items').insert(inventoryToInsert);
      }
    }

    // Task 3: Only create base inventory item if NO variants exist
    if (!data.variants || data.variants.length === 0) {
      await supabase.from('inventory_items').insert({
        product_id: product.id,
        variant_id: null,
        sku: `${product.slug}-BASE`,
        quantity: data.stock
      });
    }

    return this.findById(product.id) as Promise<Product>;
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product> {
    const supabase = this.supabase;
    
    const dbData: ProductDTO = {};
    if (data.categoryId) dbData.category_id = data.categoryId;
    if (data.title) {
      dbData.title = data.title;
      if (!data.slug) dbData.slug = generateSlug(data.title);
    }
    if (data.slug) dbData.slug = data.slug;
    if (data.description) dbData.description = data.description;
    if (data.price !== undefined) dbData.price = Math.floor(data.price);
    if (data.stock !== undefined) dbData.stock = data.stock;
    if (data.imageUrl !== undefined) dbData.image_url = data.imageUrl;
    if (data.isActive !== undefined) dbData.is_active = data.isActive;
    dbData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('products')
      .update(dbData)
      .eq('id', id);

    if (error) throw new Error(`Database error: ${error.message}`);

    // Update variants
    if (data.variants !== undefined) {
      // Fetch current product title if needed for SKUs
      let currentTitle = data.title;
      if (!currentTitle) {
        const { data: p } = await supabase.from('products').select('title').eq('id', id).single();
        currentTitle = p?.title;
      }

      const variantsToProcess = data.variants.map((v) => ({
        id: v.id,
        product_id: id,
        sku: v.sku || generateSKU(currentTitle || '', v.name),
        name: v.name,
        price_adjustment: Math.floor(v.priceAdjustment || 0),
        stock_quantity: v.stockQuantity || 0
      }));

      // Handle deletions: Remove variants that are in the database but not in the incoming list
      const incomingIds = variantsToProcess.filter((v) => v.id).map((v) => v.id);
      const { data: existingVariants } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', id);
      
      const idsToDelete = (existingVariants as { id: string }[] | null)?.filter((v) => !incomingIds.includes(v.id)).map((v) => v.id) || [];

      if (idsToDelete.length > 0) {
        // Delete inventory items first due to foreign key
        await supabase.from('inventory_items').delete().in('variant_id', idsToDelete);
        await supabase.from('product_variants').delete().in('id', idsToDelete);
      }

      // Handle Upserts: Split into new variants (insert) and existing variants (update)
      const newVariants = variantsToProcess
        .filter((v) => !v.id)
        .map((v) => ({
          product_id: v.product_id,
          sku: v.sku,
          name: v.name,
          price_adjustment: v.price_adjustment,
          stock_quantity: v.stock_quantity
        }));
      const existingToUpdate = variantsToProcess.filter((v) => v.id);

      if (newVariants.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from('product_variants')
          .insert(newVariants)
          .select();
        
        if (insertError) throw new Error(`Error inserting new variants: ${insertError.message}`);
        
        // Create inventory items for new variants
        if (inserted) {
          const inventoryToInsert = (inserted as ProductVariantRow[]).map((v) => ({
            product_id: id,
            variant_id: v.id,
            sku: v.sku,
            quantity: v.stock_quantity
          }));
          await supabase.from('inventory_items').insert(inventoryToInsert);
        }
      }

      if (existingToUpdate.length > 0) {
        const { error: updateError } = await supabase.from('product_variants').upsert(existingToUpdate);
        if (updateError) throw new Error(`Error updating existing variants: ${updateError.message}`);
        
        // Sync inventory items
        for (const v of existingToUpdate) {
          await supabase
            .from('inventory_items')
            .update({ 
              quantity: v.stock_quantity,
              sku: v.sku 
            })
            .eq('variant_id', v.id);
        }
      }

      // Task 3: Repository cleanup
      // We only manage base inventory (variant_id=NULL) for products without variants.
      const hasVariantsAfterUpdate = data.variants.length > 0;
      if (hasVariantsAfterUpdate) {
        // Remove base inventory if variants are present/added
        await supabase.from('inventory_items').delete().eq('product_id', id).is('variant_id', null);
      } else if (data.stock !== undefined) {
        // Update or create base inventory item if no variants
        const { data: baseInv } = await supabase
          .from('inventory_items')
          .select('id')
          .eq('product_id', id)
          .is('variant_id', null)
          .single();

        if (baseInv) {
          await supabase.from('inventory_items').update({ quantity: data.stock }).eq('id', baseInv.id);
        } else {
          const { data: p } = await supabase.from('products').select('slug').eq('id', id).single();
          await supabase.from('inventory_items').insert({
            product_id: id,
            variant_id: null,
            sku: `${p?.slug || 'unknown'}-BASE`,
            quantity: data.stock
          });
        }
      }
    } else if (data.stock !== undefined) {
      // Variants not part of this update, check if they exist currently
      const { count } = await supabase
        .from('product_variants')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', id);

      if (count === 0) {
        await supabase
          .from('inventory_items')
          .update({ quantity: data.stock })
          .eq('product_id', id)
          .is('variant_id', null);
      }
    }
    
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
    const supabase = this.supabase;
    
    let sku = variant.sku;
    if (!sku) {
      const { data: product } = await supabase
        .from('products')
        .select('title')
        .eq('id', productId)
        .single();
      
      if (product) {
        sku = generateSKU(product.title, variant.name);
      }
    }

    const { error } = await supabase
      .from('product_variants')
      .insert({
        product_id: productId,
        sku: sku,
        name: variant.name,
        price_adjustment: Math.floor(variant.priceAdjustment),
        stock_quantity: variant.stockQuantity
      });

    if (error) throw new Error(`Database error: ${error.message}`);
  }

  private mapToEntity(row: ProductRow): Product {
    return {
      id: row.id,
      categoryId: row.category_id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      price: typeof row.price === 'string' ? parseInt(row.price) : row.price,
      stock: row.stock,
      imageUrl: row.image_url || undefined,
      isActive: row.is_active,
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
