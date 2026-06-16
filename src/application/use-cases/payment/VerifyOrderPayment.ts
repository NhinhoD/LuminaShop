import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { IPaymentRepository } from '@/domain/repositories/IPaymentRepository';
import { IPaymentGateway } from '@/domain/repositories/IPaymentGateway';

export class VerifyOrderPaymentUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private paymentRepo: IPaymentRepository,
    private payosGateway: IPaymentGateway
  ) {}

  async execute(orderId: string): Promise<{ success: boolean; message: string }> {
    try {
      const order = await this.orderRepo.findById(orderId);
      if (!order) return { success: false, message: 'Order not found' };
      if (order.paymentStatus === 'paid') return { success: true, message: 'Already paid' };

      const payment = await this.paymentRepo.findByOrderId(orderId);
      if (!payment) return { success: false, message: 'Payment record not found' };

      // Only PayOS needs this online sync
      if (payment.method === 'payos' && payment.transactionId) {
        if (this.payosGateway.verifyPayment) {
          const verifyResult = await this.payosGateway.verifyPayment(payment.transactionId);
          if (verifyResult.success) {
            await this.paymentRepo.updatePaymentStatus(payment.id, 'paid');
            await this.orderRepo.updatePaymentStatus(orderId, 'paid');
            return { success: true, message: 'Payment verified successfully' };
          }
          return verifyResult;
        }
      }

      return { success: false, message: 'Payment is not PAID yet or unsupported method' };
    } catch (error: unknown) {
      console.error('VerifyOrderPaymentUseCase error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
