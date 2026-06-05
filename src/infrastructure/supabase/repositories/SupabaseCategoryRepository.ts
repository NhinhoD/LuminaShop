import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@/domain/entities/Category';
import { CategoryRow } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseCategoryRepository implements ICategoryRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(filters?: { limit?: number; offset?: number; search?: string }): Promise<{ categories: Category[], total: number }> {
    const supabase = this.supabase;
    let query = supabase
      .from('categories')
      .select(`
        *,
        products!products_category_id_fkey(count)
      `, { count: 'exact' });

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    query = query.order('name');

    if (filters?.limit !== undefined) {
      const offset = filters.offset || 0;
      query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);
    
    const categories = (data as CategoryRow[] || []).map((row) => ({
      ...this.mapToEntity(row),
      productCount: row.products?.[0]?.count || 0
    }));

    return { categories, total: count || 0 };
  }

  async findById(id: string): Promise<Category | null> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  async create(data: CreateCategoryDTO): Promise<Category> {
    const supabase = this.supabase;
    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToEntity(category);
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    const supabase = this.supabase;
    const { data: category, error } = await supabase
      .from('categories')
      .update({
        name: data.name,
        slug: data.slug,
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToEntity(category);
  }

  async delete(id: string): Promise<void> {
    const supabase = this.supabase;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  private mapToEntity(row: CategoryRow): Category {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
