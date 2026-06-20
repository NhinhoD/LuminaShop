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
      
      let envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL;
      if (envUrl && envUrl.endsWith('/')) {
        envUrl = envUrl.slice(0, -1);
      }

      let baseUrl = '';

      // Priority 1: env var cứng, đáng tin nhất
      if (envUrl) {
        baseUrl = envUrl;
        
        // Host spoofing detection for logging
        try {
          const { headers } = await import('next/headers');
          const headersList = await headers();
          const rawHost = headersList.get('host');
          if (rawHost) {
            try {
              const expectedHost = new URL(envUrl).host;
              if (rawHost !== expectedHost) {
                console.warn(`[PayOSGateway] Security Warning: Host header mismatch. Expected ${expectedHost}, got ${rawHost}. Falling back to env var.`);
              }
            } catch(e) {}
          }
        } catch(e) {}
      } else {
        // Priority 2: Dynamic header (chỉ nếu host khớp whitelist)
        try {
          const { headers } = await import('next/headers');
          const headersList = await headers();
          const rawHost = headersList.get('host');
          
          if (rawHost) {
            // Whitelist validation & Không bao giờ dùng raw header value trực tiếp
            const isLocal = rawHost.startsWith('localhost') || rawHost.startsWith('127.0.0.1');
            
            if (process.env.VERCEL_PROJECT_PRODUCTION_URL && rawHost === process.env.VERCEL_PROJECT_PRODUCTION_URL) {
              baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
            } else if (process.env.VERCEL_URL && rawHost === process.env.VERCEL_URL) {
              baseUrl = `https://${process.env.VERCEL_URL}`;
            } else if (isLocal && process.env.NODE_ENV !== 'production') {
              baseUrl = `http://localhost:3000`;
            } else {
              console.warn(`[PayOSGateway] Security Warning: Rejecting untrusted host header: ${rawHost}. No env var fallback available.`);
            }
          }
        } catch (error) {
          // Fallback if not in a Next.js request context
        }
      }

      // Priority 3: Guard clause & Fallback localhost
      if (!baseUrl) {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('[PayOSGateway] Security Guard: No valid baseUrl found for production environment. Please set NEXT_PUBLIC_SITE_URL.');
        }
        console.warn('[PayOSGateway] Warning: Using fallback http://localhost:3000 for baseUrl');
        baseUrl = 'http://localhost:3000';
      }
      
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

  async verifyPayment(transactionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const paymentInfo = await this.payos.paymentRequests.get(Number(transactionId));
      if (paymentInfo && paymentInfo.status === 'PAID') {
        return { success: true, message: 'Payment verified successfully' };
      }
      return { success: false, message: 'Payment is not PAID yet' };
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
