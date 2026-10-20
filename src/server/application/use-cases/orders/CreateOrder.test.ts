import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CreateOrderUseCase, CreateOrderDTO, CartItemDTO } from './CreateOrder';
import { Product } from '@/server/domain/entities/Product';
import { Order, OrderItem, PaymentMethod } from '@/server/domain/entities/Order';
import { IOrderRepository } from '@/server/domain/repositories/IOrderRepository';
import { IProductRepository } from '@/server/domain/repositories/IProductRepository';

function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    categoryId: 'cat-1',
    title: { vi: 'Template A', en: 'Template A' },
    slug: 'template-a',
    description: { vi: '', en: '' },
    price: 2000,
    stock: 10,
    imageUrl: 'https://cdn.example.com/a.png',
    isActive: true,
    demoUrl: '',
    sourceCodeUrl: '',
    techStack: [],
    variants: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createCartItem(overrides: Partial<CartItemDTO> = {}): CartItemDTO {
  return {
    productId: 'prod-1',
    quantity: 1,
    price: 1,
    title: 'Template A',
    ...overrides,
  };
}

function createOrderPayload(cartItems: CartItemDTO[]): Omit<CreateOrderDTO, 'userId'> {
  return {
    cartItems,
    shippingAddress: {
      fullName: 'John Doe',
      phone: '0901234567',
      street: 'john@example.com',
      district: 'Digital Deliveries',
      city: 'Digital',
      ward: 'KhoUI',
    },
    paymentMethod: PaymentMethod.COD,
    notes: '',
    contactEmail: 'john@example.com',
    contactPhone: '0901234567',
  };
}

function buildOrderRepo(
  onCapture: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'items'>, items: Omit<OrderItem, 'id' | 'orderId'>[]) => void
): IOrderRepository {
  return {
    create: async (order, items) => {
      onCapture(order, items);
      return {
        id: 'order-1',
        userId: order.userId,
        status: order.status,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        contactEmail: order.contactEmail,
        contactPhone: order.contactPhone,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        notes: order.notes,
        items: items.map((item, index) => ({ ...item, id: `item-${index}`, orderId: 'order-1' })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    findById: async () => null,
    findByUserId: async () => ({ orders: [], total: 0 }),
    findAll: async () => ({ orders: [], total: 0 }),
    updateStatus: async () => {},
    updatePaymentStatus: async () => {},
    hasPurchasedProduct: async () => false,
    cancelPendingOrder: async () => false,
    findUserPurchasedTemplates: async () => ({ items: [], total: 0 }),
  };
}

function buildProductRepo(products: Record<string, Product | null>): IProductRepository {
  return {
    findById: async (id) => (id in products ? products[id] : null),
    findBySlug: async () => null,
    findAll: async () => ({ products: [], total: 0 }),
    create: async () => {
      throw new Error('not implemented');
    },
    update: async () => {
      throw new Error('not implemented');
    },
    delete: async () => {},
    addVariant: async () => {},
  };
}

describe('CreateOrderUseCase - server-side price authority', () => {
  it('ignores the client-supplied price and uses the database price', async () => {
    let capturedTotal = -1;
    let capturedPrice = -1;

    const useCase = new CreateOrderUseCase(
      buildOrderRepo((order, items) => {
        capturedTotal = order.totalAmount;
        capturedPrice = items[0].priceAtPurchase;
      }),
      buildProductRepo({ 'prod-1': createMockProduct({ price: 2000 }) })
    );

    const result = await useCase.execute({
      ...createOrderPayload([createCartItem({ price: 1 })]),
      userId: 'user-1',
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(capturedTotal, 2000, 'Total must be recomputed from the DB price');
    assert.strictEqual(capturedPrice, 2000, 'Item price must come from the DB, not the client');
  });

  it('multiplies the database price by the requested quantity', async () => {
    let capturedTotal = -1;

    const useCase = new CreateOrderUseCase(
      buildOrderRepo((order) => {
        capturedTotal = order.totalAmount;
      }),
      buildProductRepo({ 'prod-1': createMockProduct({ price: 2000 }) })
    );

    const result = await useCase.execute({
      ...createOrderPayload([createCartItem({ price: 0, quantity: 3 })]),
      userId: 'user-1',
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(capturedTotal, 6000);
  });

  it('rejects inactive or missing products without creating an order', async () => {
    let createCalled = false;

    const useCase = new CreateOrderUseCase(
      buildOrderRepo(() => {
        createCalled = true;
      }),
      buildProductRepo({ 'prod-1': createMockProduct({ isActive: false }) })
    );

    const result = await useCase.execute({
      ...createOrderPayload([createCartItem()]),
      userId: 'user-1',
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(createCalled, false);
  });

  it('applies the database variant price adjustment', async () => {
    let capturedTotal = -1;

    const product = createMockProduct({
      price: 2000,
      variants: [
        {
          id: 'variant-1',
          productId: 'prod-1',
          sku: 'SKU-1',
          name: 'Extended license',
          priceAdjustment: 500,
          stockQuantity: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    const useCase = new CreateOrderUseCase(
      buildOrderRepo((order) => {
        capturedTotal = order.totalAmount;
      }),
      buildProductRepo({ 'prod-1': product })
    );

    const result = await useCase.execute({
      ...createOrderPayload([createCartItem({ variantId: 'variant-1', price: 1 })]),
      userId: 'user-1',
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(capturedTotal, 2500);
  });

  it('rejects a variant that does not belong to the product', async () => {
    const useCase = new CreateOrderUseCase(
      buildOrderRepo(() => {}),
      buildProductRepo({ 'prod-1': createMockProduct({ variants: [] }) })
    );

    const result = await useCase.execute({
      ...createOrderPayload([createCartItem({ variantId: 'missing-variant' })]),
      userId: 'user-1',
    });

    assert.strictEqual(result.success, false);
  });

  it('sanitizes unexpected repository errors (CWE-209)', async () => {
    const distinctiveSecret = 'DISTINCTIVE_DATABASE_CRASH_SECRET_123';
    const failingRepo: IOrderRepository = {
      ...buildOrderRepo(() => {}),
      create: async () => {
        throw new Error(distinctiveSecret);
      },
    };

    const useCase = new CreateOrderUseCase(
      failingRepo,
      buildProductRepo({ 'prod-1': createMockProduct() })
    );

    const result = await useCase.execute({
      ...createOrderPayload([createCartItem()]),
      userId: 'user-1',
    });

    assert.strictEqual(result.success, false);
    if (!result.success) {
      assert.strictEqual(result.error.message.includes(distinctiveSecret), false);
    }
  });
});
