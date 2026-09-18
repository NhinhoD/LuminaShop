import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../entities/Category';

export interface ICategoryRepository {
  findAll(filters?: { limit?: number; offset?: number; search?: string }): Promise<{ categories: Category[], total: number }>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  create(data: CreateCategoryDTO): Promise<Category>;
  update(id: string, data: UpdateCategoryDTO): Promise<Category>;
  delete(id: string): Promise<void>;
}
