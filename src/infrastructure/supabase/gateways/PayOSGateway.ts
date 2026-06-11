import { IPaymentGateway, PaymentResult } from '@/domain/repositories/IPaymentGateway';
import { SupabaseClient } from '@supabase/supabase-js';
import { PayOS } from '@payos/node';
import type { Webhook } from '@payos/node';

export class PayOSGateway implements IPaymentGateway {
  private payos: PayOS;

  constructor(private supabase: SupabaseClient) {
    this.payos = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID || '',
      apiKey: process.env.PAYOS_API_KEY || '',
      checksumKey: process.env.PAYOS_CHECKSUM_KEY || ''
    });
  }

  async processPayment(orderId: string, amount: number, method: string): Promise<PaymentResult> {
    if (method !== 'payos') {
      return {
        success: false,
        paymentId: '',
        message: 'Invalid payment method for PayOS gateway'
      };
    }

    try {
      // PayOS requires a numeric orderCode, while our orderId is UUID
      // Generate a unique numeric ID for PayOS orderCode
      const orderCode = Number(String(Date.now()).slice(-9)) * 100 + Math.floor(Math.random() * 100);
      
      const baseUrl = process.env.APP_URL || 'http://localhost:3000';
      
      const body = {
        orderCode: orderCode,
        amount: amount,
        description: `Thanh toan don hang`,
        returnUrl: `${baseUrl}/orders/${orderId}/success`,
        cancelUrl: `${baseUrl}/orders/${orderId}/failed`
      };

      const paymentLinkRes = await this.payos.paymentRequests.create(body);

      const { data, error } = await this.supabase
        .from('payments')
        .insert({
          order_id: orderId,
          method: 'payos',
          status: 'unpaid',
          amount: amount
          // Note: ideally we'd store orderCode in the DB to map webhook callbacks to this payment
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        paymentId: data.id,
        message: 'Tạo link thanh toán PayOS thành công',
        checkoutUrl: paymentLinkRes.checkoutUrl
      };
    } catch (error: unknown) {
      console.error('PayOSGateway error:', error);
      return {
        success: false,
        paymentId: '',
        message: 'Lỗi khi tạo giao dịch thanh toán PayOS'
      };
    }
  }

  async verifyPaymentWebhookData(body: unknown) {
    // We cast to Webhook internally because the PayOS SDK expects a specific type
    return await this.payos.webhooks.verify(body as Webhook);
  }
}
