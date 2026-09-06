import { IPaymentGateway, PaymentResult } from '@/domain/repositories/IPaymentGateway';
import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { OrderStatus } from '@/domain/entities/Order';
import { SendOrderConfirmationEmailUseCase } from '@/application/use-cases/orders/SendOrderConfirmationEmail';

/**
 * Data transfer object for processing payment.
 */
export interface ProcessPaymentDTO {
  orderId: string;
  amount: number;
  method: string;
  userId: string;
}

/**
 * Use case to process order payment through payment gateways or free fulfillment.
 * Enforces order ownership, state-machine integrity, and atomic digital order fulfillment.
 */
export class ProcessPaymentUseCase {
  constructor(
    private paymentGateway: IPaymentGateway,
    private orderRepo: IOrderRepository,
    private emailUseCase?: SendOrderConfirmationEmailUseCase
  ) {}

  /**
   * Executes payment processing for an order.
   *
   * @param data - The payment processing request payload containing orderId, amount, method, and authenticated userId.
   * @returns PaymentResult indicating success or failure of the payment operation.
   */
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

      // Security: Enforce order ownership (IDOR defense - CWE-639)
      if (order.userId !== data.userId) {
        return {
          success: false,
          paymentId: '',
          message: 'Bạn không có quyền thực hiện thanh toán cho đơn hàng này.',
        };
      }

      // State integrity: Do not process payment on cancelled orders
      if (order.status === OrderStatus.CANCELLED) {
        return {
          success: false,
          paymentId: '',
          message: 'Đơn hàng này đã bị hủy, không thể thực hiện thanh toán.',
        };
      }

      // Free products / 0đ orders: verify against stored order total to prevent client amount tampering
      if (order.totalAmount <= 0) {
        // updatePaymentStatus('paid') atomically sets status: 'completed'
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
        // updatePaymentStatus('paid') atomically sets status: 'completed' in one operation
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
