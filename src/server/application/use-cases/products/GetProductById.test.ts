import { describe, it } from 'node:test';
import assert from 'node:assert';
import { GetProductByIdUseCase } from './GetProductById';
import { IProductRepository } from '@/server/domain/repositories/IProductRepository';
import { Product } from '@/server/domain/entities/Product';

describe('GetProductByIdUseCase', () => {
  const mockProduct: Product = {
    id: 'prod-123',
    categoryId: 'cat-1',
    title: { vi: 'Sản phẩm mẫu', en: 'Sample Product' },
    slug: 'san-pham-mau',
    description: { vi: 'Mô tả', en: 'Description' },
    price: 100000,
    stock: 5,
    isActive: true,
    demoUrl: 'https://demo.example.com',
    sourceCodeUrl: 'https://source.example.com/file.zip',
    techStack: ['Next.js'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createMockRepo = (overrides?: Partial<IProductRepository>): IProductRepository => ({
    findById: async () => mockProduct,
    findBySlug: async () => null,
    findAll: async () => ({ products: [], total: 0 }),
    create: async () => mockProduct,
    update: async () => mockProduct,
    delete: async () => {},
    addVariant: async () => {},
    ...overrides,
  });

  it('returns ok with product when product exists', async () => {
    const mockRepo = createMockRepo();
    const useCase = new GetProductByIdUseCase(mockRepo);
    const result = await useCase.execute('prod-123');

    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.deepStrictEqual(result.data, mockProduct);
    }
  });

  it('returns ok with null when product does not exist', async () => {
    const mockRepo = createMockRepo({
      findById: async () => null,
    });

    const useCase = new GetProductByIdUseCase(mockRepo);
    const result = await useCase.execute('non-existent-id');

    assert.strictEqual(result.success, true);
    if (result.success) {
      assert.strictEqual(result.data, null);
    }
  });

  it('sanitizes backend error message and returns generic error on repository failure (CWE-209 defense)', async () => {
    const mockRepo = createMockRepo({
      findById: async () => {
        throw new Error('PostgreSQL connection terminated unexpectedly: column products.sensitive_column does not exist');
      },
    });

    const useCase = new GetProductByIdUseCase(mockRepo);
    const result = await useCase.execute('prod-error');

    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.strictEqual(result.error.message, 'Đã có lỗi xảy ra khi lấy thông tin sản phẩm.');
      assert.doesNotMatch(result.error.message, /sensitive_column/);
      assert.doesNotMatch(result.error.message, /PostgreSQL/);
    }
  });
});
