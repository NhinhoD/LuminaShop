import { IPaymentGateway, PaymentResult } from '@/domain/repositories/IPaymentGateway';
import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { SendOrderConfirmationEmailUseCase } from '@/application/use-cases/orders/SendOrderConfirmationEmail';

export interface ProcessPaymentDTO {
  orderId: string;
  amount: number;
  method: string;
}

export class ProcessPaymentUseCase {
  constructor(
    private paymentGateway: IPaymentGateway,
    private orderRepo: IOrderRepository,
    private emailUseCase?: SendOrderConfirmationEmailUseCase
  ) {}

  async execute(data: ProcessPaymentDTO): Promise<PaymentResult> {
    try {
      const order = await this.orderRepo.findById(data.orderId);
      if (!order) {
        return {
          success: false,
          paymentId: '',
          message: 'Không tìm thấy thông tin đơn hàng.',
        };
      }

      // Free products / 0đ orders: verify against stored order total to prevent client amount tampering
      if (order.totalAmount <= 0) {
        await this.orderRepo.updatePaymentStatus(data.orderId, 'paid');
        
        if (this.emailUseCase) {
          try {
            const emailResult = await this.emailUseCase.execute(data.orderId);
            if (!emailResult.success) {
              console.error('[ProcessPaymentUseCase] Free order email delivery failed:', emailResult.error.message);
            }
          } catch (emailErr) {
            console.error('[ProcessPaymentUseCase] Free order email delivery error:', emailErr);
          }
        }

        return {
          success: true,
          paymentId: `free-${Date.now()}`,
          message: 'Đơn hàng miễn phí (0đ) đã được kích hoạt thành công!',
        };
      }

      const result = await this.paymentGateway.processPayment(data.orderId, order.totalAmount, data.method);
      
      if (result.success) {
        const paymentStatus = (data.method === 'cod' || data.method === 'payos') ? 'unpaid' : 'paid';
        await this.orderRepo.updatePaymentStatus(data.orderId, paymentStatus);
      } else {
        await this.orderRepo.updatePaymentStatus(data.orderId, 'failed');
      }

      return result;
    } catch (error: unknown) {
      console.error('ProcessPaymentUseCase Error:', error);
      return {
        success: false,
        paymentId: '',
        message: error instanceof Error ? error.message : 'Payment processing failed.'
      };
    }
  }
}
