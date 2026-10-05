import { ICategoryRepository } from '@/server/domain/repositories/ICategoryRepository';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@/server/domain/entities/Category';
import { CategoryRow } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseCategoryRepository implements ICategoryRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Retrieves a paginated list of active categories along with active product counts.
   *
   * @param filters - Optional pagination parameters (limit, offset) and search keyword.
   * @returns Object containing categories list and total active categories count.
   */
  async findAll(filters?: { limit?: number; offset?: number; search?: string }): Promise<{ categories: Category[], total: number }> {
    const supabase = this.supabase;
    let query = supabase
      .from('categories')
      .select(`
        *,
        products!products_category_id_fkey(count)
      `, { count: 'exact' })
      .is('deleted_at', null)
      .is('products.deleted_at', null);

    if (filters?.search) {
      query = query.or(`name->>vi.ilike.%${filters.search}%,name->>en.ilike.%${filters.search}%`);
    }

    query = query.order('name');

    if (filters?.limit !== undefined) {
      const offset = filters.offset || 0;
      query = query.range(offset, offset + filters.limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.code === 'PGRST103' || error.message?.includes('satisfiable')) {
        let countQuery = supabase
          .from('categories')
          .select('id', { count: 'exact', head: true })
          .is('deleted_at', null);
        if (filters?.search) {
          countQuery = countQuery.or(`name->>vi.ilike.%${filters.search}%,name->>en.ilike.%${filters.search}%`);
        }
        const { count: actualCount, error: countError } = await countQuery;
        if (countError) {
          throw new Error(`Failed to count categories: ${countError.message}`);
        }
        return { categories: [], total: actualCount || 0 };
      }
      throw new Error(error.message);
    }
    
    const categories = (data as CategoryRow[] || []).map((row) => ({
      ...this.mapToEntity(row),
      productCount: row.products?.[0]?.count || 0
    }));

    return { categories, total: count || 0 };
  }

  /**
   * Retrieves a single active category by its unique identifier.
   *
   * @param id - Category UUID string.
   * @returns Pure Category entity if active and found, null otherwise.
   */
  async findById(id: string): Promise<Category | null> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  /**
   * Retrieves an active category by its unique URL slug.
   *
   * @param slug - Category slug string.
   * @returns Pure Category entity if active and found, null otherwise.
   */
  async findBySlug(slug: string): Promise<Category | null> {
    const supabase = this.supabase;
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapToEntity(data);
  }

  /**
   * Inserts a new category into the database.
   *
   * @param data - Category creation payload.
   * @returns Newly created Category entity.
   */
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

  /**
   * Updates an existing category by its ID.
   *
   * @param id - UUID of category to update.
   * @param data - Partial category update payload.
   * @returns Updated Category entity.
   */
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

  /**
   * Performs soft deletion of a category by setting its deleted_at timestamp.
   *
   * @param id - UUID of category to soft delete.
   * @returns Promise resolving when soft deletion completes.
   */
  async delete(id: string): Promise<void> {
    const supabase = this.supabase;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('categories')
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  /**
   * Maps a Supabase database row to the pure domain Category entity.
   *
   * @param row - Raw CategoryRow from Supabase.
   * @returns Mapped Category domain entity.
   */
  private mapToEntity(row: CategoryRow): Category {
    return {
      id: row.id,
      name: row.name || { vi: '', en: '' },
      slug: row.slug,
      description: row.description || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    };
  }
}
