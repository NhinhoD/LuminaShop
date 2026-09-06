import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { IPaymentRepository } from '@/domain/repositories/IPaymentRepository';
import { OrderStatus } from '@/domain/entities/Order';
import { SendOrderConfirmationEmailUseCase } from '@/application/use-cases/orders/SendOrderConfirmationEmail';

export interface WebhookData {
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  currency: string;
  paymentLinkId: string;
  code: string;
  desc: string;
}

export class HandlePayOSWebhookUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private paymentRepo: IPaymentRepository,
    private sendOrderEmailUseCase?: SendOrderConfirmationEmailUseCase
  ) {}

  async execute(data: WebhookData): Promise<{ success: boolean; message: string }> {
    try {
      if (data.code === '00') {
        const payment = await this.paymentRepo.findByTransactionId(String(data.orderCode));

        if (!payment) {
          throw new Error(`Payment record not found for webhook orderCode ${data.orderCode}`);
        }

        // Idempotency guard: If payment is already marked paid, return early to prevent duplicate fulfillment
        if (payment.status === 'paid') {
          return { success: true, message: 'Payment was already processed and marked paid' };
        }

        await this.paymentRepo.updatePaymentStatus(payment.id, 'paid');
        await this.orderRepo.updatePaymentStatus(payment.orderId, 'paid');
        await this.orderRepo.updateStatus(payment.orderId, OrderStatus.COMPLETED);
        
        // Trigger automated license key & digital fulfillment delivery email
        if (this.sendOrderEmailUseCase) {
          try {
            const emailResult = await this.sendOrderEmailUseCase.execute(payment.orderId);
            if (!emailResult.success) {
              console.error(`[HandlePayOSWebhook] Gửi email fulfillment thất bại cho đơn ${payment.orderId}:`, emailResult.error.message);
            }
          } catch (emailErr) {
            console.error(`[HandlePayOSWebhook] Ngoại lệ khi gửi email fulfillment cho đơn ${payment.orderId}:`, emailErr);
          }
        }

        return { success: true, message: 'Webhook processed successfully' };
      }

      return { success: true, message: 'Webhook received but not a success code' };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown webhook processing error'
      };
    }
  }
}
