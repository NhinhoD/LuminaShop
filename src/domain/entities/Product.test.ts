import { describe, it } from 'node:test';
import assert from 'node:assert';
import { Product, sanitizeProductForPublic } from './Product';

describe('sanitizeProductForPublic', () => {
  const baseProduct: Product = {
    id: 'prod-1',
    categoryId: 'cat-1',
    title: { vi: 'Template Test', en: 'Test Template' },
    slug: 'template-test',
    description: { vi: 'Mô tả', en: 'Description' },
    price: 0,
    stock: 10,
    isActive: true,
    demoUrl: 'https://demo.example.com',
    sourceCodeUrl: 'https://storage.example.com/source.zip',
    techStack: ['Next.js', 'Tailwind CSS'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('preserves sourceCodeUrl for genuinely free products (price: 0, no variants)', () => {
    const product: Product = { ...baseProduct, variants: [] };
    const sanitized = sanitizeProductForPublic(product, false);
    assert.strictEqual(sanitized.sourceCodeUrl, baseProduct.sourceCodeUrl);
  });

  it('preserves sourceCodeUrl for genuinely free products with zero-adjustment variants', () => {
    const product: Product = {
      ...baseProduct,
      variants: [
        {
          id: 'var-1',
          productId: 'prod-1',
          sku: 'SKU-FREE',
          name: 'Free Edition',
          priceAdjustment: 0,
          stockQuantity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    const sanitized = sanitizeProductForPublic(product, false);
    assert.strictEqual(sanitized.sourceCodeUrl, baseProduct.sourceCodeUrl);
  });

  it('masks sourceCodeUrl for price: 0 product when selectable variant has positive price adjustment', () => {
    const product: Product = {
      ...baseProduct,
      price: 0,
      variants: [
        {
          id: 'var-paid',
          productId: 'prod-1',
          sku: 'SKU-PAID',
          name: 'Commercial License',
          priceAdjustment: 199000,
          stockQuantity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    const sanitized = sanitizeProductForPublic(product, false);
    assert.strictEqual(sanitized.sourceCodeUrl, '');
  });

  it('preserves sourceCodeUrl for price: 0 product with paid variant when isPurchased is true', () => {
    const product: Product = {
      ...baseProduct,
      price: 0,
      variants: [
        {
          id: 'var-paid',
          productId: 'prod-1',
          sku: 'SKU-PAID',
          name: 'Commercial License',
          priceAdjustment: 199000,
          stockQuantity: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };
    const sanitized = sanitizeProductForPublic(product, true);
    assert.strictEqual(sanitized.sourceCodeUrl, baseProduct.sourceCodeUrl);
  });

  it('masks sourceCodeUrl for paid base product (price > 0) when isPurchased is false', () => {
    const product: Product = { ...baseProduct, price: 50000 };
    const sanitized = sanitizeProductForPublic(product, false);
    assert.strictEqual(sanitized.sourceCodeUrl, '');
  });

  it('preserves sourceCodeUrl for paid base product (price > 0) when isPurchased is true', () => {
    const product: Product = { ...baseProduct, price: 50000 };
    const sanitized = sanitizeProductForPublic(product, true);
    assert.strictEqual(sanitized.sourceCodeUrl, baseProduct.sourceCodeUrl);
  });
});
