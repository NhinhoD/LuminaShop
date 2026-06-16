import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { IPaymentRepository } from '@/domain/repositories/IPaymentRepository';

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
    private paymentRepo: IPaymentRepository
  ) {}

  async execute(data: WebhookData): Promise<{ success: boolean; message: string }> {
    try {
      if (data.code === '00') {
        const payment = await this.paymentRepo.findByTransactionId(String(data.orderCode));

        if (!payment) {
          throw new Error(`Payment record not found for webhook orderCode ${data.orderCode}`);
        }

        await this.paymentRepo.updatePaymentStatus(payment.id, 'paid');
        await this.orderRepo.updatePaymentStatus(payment.orderId, 'paid');
        
        return { success: true, message: 'Webhook processed successfully' };
      }

      return { success: true, message: 'Webhook received but not a success code' };
    } catch (error: unknown) {
      console.error('HandlePayOSWebhookUseCase error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown webhook processing error'
      };
    }
  }
}
