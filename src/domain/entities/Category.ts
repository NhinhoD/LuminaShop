export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;
}

export type CreateCategoryDTO = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;
