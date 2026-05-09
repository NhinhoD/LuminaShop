import { IPaymentGateway, PaymentResult } from '@/domain/repositories/IPaymentGateway';
import { SupabaseClient } from '@supabase/supabase-js';

export class CODPaymentGateway implements IPaymentGateway {
  constructor(private supabase: SupabaseClient) {}

  async processPayment(orderId: string, amount: number, method: string): Promise<PaymentResult> {
    if (method !== 'cod') {
      return {
        success: false,
        paymentId: '',
        message: 'Invalid payment method for COD gateway'
      };
    }

    try {
      const { data, error } = await this.supabase
        .from('payments')
        .insert({
          order_id: orderId,
          method: 'cod',
          status: 'paid',
          amount: amount
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        paymentId: data.id,
        message: 'Thanh toán COD thành công'
      };
    } catch (error: unknown) {
      console.error('CODPaymentGateway error:', error);
      return {
        success: false,
        paymentId: '',
        message: 'Lỗi khi tạo giao dịch thanh toán COD'
      };
    }
  }
}
