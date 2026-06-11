import { IPaymentGateway, PaymentResult } from '@/domain/repositories/IPaymentGateway';

export class CompositePaymentGateway implements IPaymentGateway {
  constructor(private gateways: Record<string, IPaymentGateway>) {}

  async processPayment(orderId: string, amount: number, method: string): Promise<PaymentResult> {
    const gateway = this.gateways[method];
    if (!gateway) {
      return {
        success: false,
        paymentId: '',
        message: `Unsupported payment method: ${method}`
      };
    }
    return gateway.processPayment(orderId, amount, method);
  }
}
