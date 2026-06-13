import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { SupabaseClient } from '@supabase/supabase-js';

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
    private supabase: SupabaseClient
  ) {}

  async execute(data: WebhookData): Promise<{ success: boolean; message: string }> {
    try {
      if (data.code === '00') {
        const { data: payment, error } = await this.supabase
          .from('payments')
          .select('order_id')
          .eq('transaction_id', String(data.orderCode))
          .single();

        if (error || !payment) {
          throw new Error(`Payment record not found for webhook orderCode ${data.orderCode}`);
        }

        await this.supabase
          .from('payments')
          .update({ status: 'paid' })
          .eq('transaction_id', String(data.orderCode));

        await this.orderRepo.updatePaymentStatus(payment.order_id, 'paid');
        
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
