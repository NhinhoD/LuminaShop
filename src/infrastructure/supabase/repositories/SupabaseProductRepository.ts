import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { Product, CreateProductDTO, UpdateProductDTO, ProductVariant } from '@/domain/entities/Product';
import { createClient } from '@/infrastructure/supabase/server';
import { generateSlug, generateSKU } from '@/lib/utils';

export class SupabaseProductRepository implements IProductRepository {
  constructor(private supabase: any) {}

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
      products: (data || []).map((row: any) => this.mapToEntity(row)),
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
      const variantsToInsert = data.variants.map((v: any) => ({
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
        const inventoryToInsert = insertedVariants.map((v: any) => ({
          product_id: product.id,
          variant_id: v.id,
          sku: v.sku,
          quantity: v.stock_quantity
        }));
        await supabase.from('inventory_items').insert(inventoryToInsert);
      }
    }

    // Also create base inventory item for the product itself if no variants
    const { data: existingBaseInventory } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('product_id', product.id)
      .is('variant_id', null)
      .single();

    if (!existingBaseInventory) {
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
    
    const dbData: any = {};
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

      const variantsToProcess = data.variants.map((v: any) => ({
        id: v.id,
        product_id: id,
        sku: v.sku || generateSKU(currentTitle || '', v.name),
        name: v.name,
        price_adjustment: Math.floor(v.priceAdjustment || 0),
        stock_quantity: v.stockQuantity || 0
      }));

      // Handle deletions: Remove variants that are in the database but not in the incoming list
      const incomingIds = variantsToProcess.filter((v: any) => v.id).map((v: any) => v.id);
      const { data: existingVariants } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', id);
      
      const idsToDelete = existingVariants?.filter((v: any) => !incomingIds.includes(v.id)).map((v: any) => v.id) || [];

      if (idsToDelete.length > 0) {
        // Delete inventory items first due to foreign key
        await supabase.from('inventory_items').delete().in('variant_id', idsToDelete);
        await supabase.from('product_variants').delete().in('id', idsToDelete);
      }

      // Handle Upserts: Split into new variants (insert) and existing variants (update)
      const newVariants = variantsToProcess.filter((v: any) => !v.id).map(({ id, ...rest }: any) => rest);
      const existingToUpdate = variantsToProcess.filter((v: any) => v.id);

      if (newVariants.length > 0) {
        const { data: inserted, error: insertError } = await supabase
          .from('product_variants')
          .insert(newVariants)
          .select();
        
        if (insertError) throw new Error(`Error inserting new variants: ${insertError.message}`);
        
        // Create inventory items for new variants
        if (inserted) {
          const inventoryToInsert = inserted.map((v: any) => ({
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

      // Sync base product inventory if needed
      if (data.stock !== undefined) {
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

  async addVariant(productId: string, variant: any): Promise<void> {
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

  private mapToEntity(row: any): Product {
    return {
      id: row.id,
      categoryId: row.category_id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      price: parseInt(row.price),
      stock: row.stock,
      imageUrl: row.image_url,
      isActive: row.is_active,
      variants: row.variants?.map((v: any) => ({
        id: v.id,
        productId: v.product_id,
        sku: v.sku,
        name: v.name,
        priceAdjustment: parseInt(v.price_adjustment),
        stockQuantity: v.stock_quantity,
        createdAt: new Date(v.created_at),
        updatedAt: new Date(v.updated_at),
      })),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
