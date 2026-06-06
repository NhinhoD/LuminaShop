export interface Category {
  id: string;
  name: Record<string, string>;
  slug: string;
  description?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;
}

export type CreateCategoryDTO = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;
