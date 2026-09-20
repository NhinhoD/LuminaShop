import { IPaymentGateway, PaymentResult } from '@/server/domain/repositories/IPaymentGateway';
import { SupabaseClient } from '@supabase/supabase-js';
import { PayOS } from '@payos/node';
import type { Webhook } from '@payos/node';
import { resolveBaseUrl } from '@/shared/utils/url';

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
      
      let rawHost: string | null = null;
      try {
        const { headers } = await import('next/headers');
        const headersList = await headers();
        rawHost = headersList.get('x-forwarded-host') || headersList.get('host');
      } catch {
        // Fallback if not in Next.js request context
      }

      const baseUrl = resolveBaseUrl(rawHost);

      
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
          amount: amount,
          transaction_id: String(orderCode)
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

  /**
   * Verifies the status of a payment transaction with the PayOS API.
   *
   * @param transactionId - The PayOS order code numeric string.
   * @returns Verification result including boolean success, explicit status code, and message.
   */
  async verifyPayment(transactionId: string): Promise<{ success: boolean; status?: string; message: string }> {
    try {
      const paymentInfo = await this.payos.paymentRequests.get(Number(transactionId));
      if (paymentInfo) {
        if (paymentInfo.status === 'PAID') {
          return { success: true, status: 'PAID', message: 'Payment verified successfully' };
        }
        if (paymentInfo.status === 'CANCELLED') {
          return { success: false, status: 'CANCELLED', message: 'Payment was cancelled by user' };
        }
        if (paymentInfo.status === 'EXPIRED') {
          return { success: false, status: 'EXPIRED', message: 'Payment link has expired' };
        }
        return { success: false, status: paymentInfo.status, message: `Payment status: ${paymentInfo.status}` };
      }
      return { success: false, message: 'Could not retrieve payment info from PayOS' };
    } catch (payosError: unknown) {
      console.error('PayOS verify error:', payosError instanceof Error ? payosError.message : String(payosError));
      return { success: false, message: 'Could not verify with PayOS' };
    }
  }

  async verifyPaymentWebhookData(body: unknown) {
    if (!body || typeof body !== 'object' || !('data' in body) || !('signature' in body)) {
      throw new Error('Invalid webhook payload format');
    }
    return this.payos.webhooks.verify(body as Webhook);
  }
}
