import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { IPaymentRepository } from '@/domain/repositories/IPaymentRepository';
import { SendOrderConfirmationEmailUseCase } from '@/application/use-cases/orders/SendOrderConfirmationEmail';

/**
 * Payload data received from PayOS webhook notifications.
 */
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

/**
 * Use case to handle asynchronous webhook events from PayOS payment gateway.
 * Updates payment and order status idempotently and triggers automated fulfillment emails.
 */
export class HandlePayOSWebhookUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private paymentRepo: IPaymentRepository,
    private sendOrderEmailUseCase?: SendOrderConfirmationEmailUseCase
  ) {}

  /**
   * Processes a verified PayOS webhook notification.
   *
   * @param data - The webhook notification data payload.
   * @returns An object with success status and processing message.
   */
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
        // updatePaymentStatus('paid') atomically sets status: 'completed' in one operation
        await this.orderRepo.updatePaymentStatus(payment.orderId, 'paid');
        
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
