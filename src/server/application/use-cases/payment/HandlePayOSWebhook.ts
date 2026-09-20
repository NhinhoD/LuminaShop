import { IOrderRepository } from '@/server/domain/repositories/IOrderRepository';
import { IPaymentRepository } from '@/server/domain/repositories/IPaymentRepository';
import { SendOrderConfirmationEmailUseCase } from '@/server/application/use-cases/orders/SendOrderConfirmationEmail';
import { OrderStatus } from '@/server/domain/entities/Order';

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
          console.warn(`[HandlePayOSWebhook] Payment record not found for webhook orderCode ${data.orderCode}. (Likely a sample test webhook from PayOS)`);
          return { success: true, message: 'Webhook verified (sample test or unassociated orderCode)' };
        }

        const order = await this.orderRepo.findById(payment.orderId);
        if (!order) {
          console.error(`[HandlePayOSWebhook] Associated order ${payment.orderId} not found for payment ${payment.id}`);
          return { success: false, message: `Associated order ${payment.orderId} not found` };
        }

        const isPaymentPaid = payment.status === 'paid';
        const isOrderPaid = order.paymentStatus === 'paid' && order.status === OrderStatus.COMPLETED;

        // Idempotency guard: Both payment and order are already confirmed paid and completed
        if (isPaymentPaid && isOrderPaid) {
          return { success: true, message: 'Payment was already processed and marked paid' };
        }

        // Reconcile payment status if not yet marked paid
        if (!isPaymentPaid) {
          await this.paymentRepo.updatePaymentStatus(payment.id, 'paid');
        }

        // Reconcile order status if not yet marked paid and completed
        if (!isOrderPaid) {
          await this.orderRepo.updatePaymentStatus(payment.orderId, 'paid');
        }
        
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

      // Handle cancellation webhook notifications using structured fields
      const rawData = data as unknown as Record<string, unknown>;
      const isCancelled =
        rawData.status === 'CANCELLED' ||
        rawData.cancel === true ||
        Boolean(rawData.cancellationReason);

      if (isCancelled) {
        const payment = await this.paymentRepo.findByTransactionId(String(data.orderCode));
        if (payment && payment.status !== 'paid') {
          const cancelled = await this.orderRepo.cancelPendingOrder(payment.orderId);
          if (cancelled) {
            await this.paymentRepo.updatePaymentStatus(payment.id, 'failed');
            return { success: true, message: 'Payment cancelled successfully via webhook' };
          }
        }
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
