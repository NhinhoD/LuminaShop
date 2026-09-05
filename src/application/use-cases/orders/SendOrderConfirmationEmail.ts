import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { IProductRepository } from '@/domain/repositories/IProductRepository';
import { IEmailService, LicenseItemDTO } from '@/domain/services/IEmailService';
import { Result, ok, fail } from '@/domain/shared/Result';

export class SendOrderConfirmationEmailUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private productRepo: IProductRepository,
    private emailService: IEmailService
  ) {}

  async execute(orderId: string, locale: 'vi' | 'en' = 'vi'): Promise<Result<void>> {
    try {
      const order = await this.orderRepo.findById(orderId);
      if (!order) {
        return fail(new Error(`Order with ID ${orderId} not found`));
      }

      if (!order.contactEmail) {
        return fail(new Error(`Order ${orderId} does not have a recipient contact email`));
      }

      const items: LicenseItemDTO[] = await Promise.all(
        order.items.map(async (item) => {
          const product = await this.productRepo.findById(item.productId);
          const titleRecord = (item.productTitle || product?.title || {}) as Record<string, string>;
          const productTitle = titleRecord[locale] || titleRecord.vi || titleRecord.en || 'KhoUI Template';

          // Standardized tamper-evident license format: KH-LIC-[ORDER_PREFIX]-[PRODUCT_PREFIX]
          const shortOrder = order.id.split('-')[0].toUpperCase();
          const shortProd = item.productId.slice(0, 6).toUpperCase();
          const licenseKey = `KH-LIC-${shortOrder}-${shortProd}`;

          return {
            productId: item.productId,
            productTitle,
            licenseKey,
            sourceCodeUrl: product?.sourceCodeUrl,
            price: Number(item.priceAtPurchase),
          };
        })
      );

      const customerName = order.shippingAddress?.fullName;

      const emailResult = await this.emailService.sendOrderConfirmation({
        orderId: order.id,
        recipientEmail: order.contactEmail,
        customerName,
        totalAmount: Number(order.totalAmount),
        locale,
        items,
      });

      if (!emailResult.success) {
        return fail(emailResult.error);
      }

      return ok(undefined);
    } catch (err: unknown) {
      return fail(err instanceof Error ? err : new Error('Failed to send order confirmation email'));
    }
  }
}