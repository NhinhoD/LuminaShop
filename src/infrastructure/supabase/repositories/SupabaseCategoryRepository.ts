import { ICategoryRepository } from '@/domain/repositories/ICategoryRepository';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@/domain/entities/Category';
import { createClient } from '@/infrastructure/supabase/server';

export class SupabaseCategoryRepository implements ICategoryRepository {
  constructor(private supabase: any) {}

  async findAll(): Promise<Category[]> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        products!products_category_id_fkey(count)
      `)
      .order('name');

    if (error) throw new Error(error.message);
    return (data || []).map((row: any) => ({
      ...this.mapToEntity(row),
      productCount: row.products?.[0]?.count || 0
    }));
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

  private mapToEntity(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
