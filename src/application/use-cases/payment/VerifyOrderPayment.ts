import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export class VerifyOrderPaymentUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private supabase: SupabaseClient
  ) {}

  async execute(orderId: string): Promise<{ success: boolean; message: string }> {
    try {
      const order = await this.orderRepo.findById(orderId);
      if (!order) return { success: false, message: 'Order not found' };
      if (order.paymentStatus === 'paid') return { success: true, message: 'Already paid' };

      const { data: payment, error } = await this.supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error || !payment) return { success: false, message: 'Payment record not found' };

      // Only PayOS needs this online sync
      if (payment.method === 'payos' && payment.transaction_id) {
        const { PayOS } = await import('@payos/node');
        const payos = new PayOS({
          clientId: process.env.PAYOS_CLIENT_ID || '',
          apiKey: process.env.PAYOS_API_KEY || '',
          checksumKey: process.env.PAYOS_CHECKSUM_KEY || ''
        });

        try {
          const paymentInfo = await payos.paymentRequests.get(Number(payment.transaction_id));
          
          if (paymentInfo && paymentInfo.status === 'PAID') {
            await this.supabase
              .from('payments')
              .update({ status: 'paid' })
              .eq('id', payment.id);

            await this.orderRepo.updatePaymentStatus(orderId, 'paid');
            return { success: true, message: 'Payment verified successfully' };
          }
        } catch (payosError: any) {
          console.error('PayOS verify error:', payosError.message);
          return { success: false, message: 'Could not verify with PayOS' };
        }
      }

      return { success: false, message: 'Payment is not PAID yet or unsupported method' };
    } catch (error: any) {
      console.error('VerifyOrderPaymentUseCase error:', error);
      return { success: false, message: error.message };
    }
  }
}
