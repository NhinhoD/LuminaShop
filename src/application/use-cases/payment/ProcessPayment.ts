import { IPaymentGateway, PaymentResult } from '@/domain/repositories/IPaymentGateway';
import { IOrderRepository } from '@/domain/repositories/IOrderRepository';
import { OrderStatus } from '@/domain/entities/Order';

export interface ProcessPaymentDTO {
  orderId: string;
  amount: number;
  method: string;
}

export class ProcessPaymentUseCase {
  constructor(
    private paymentGateway: IPaymentGateway,
    private orderRepo: IOrderRepository
  ) {}

  async execute(data: ProcessPaymentDTO): Promise<PaymentResult> {
    try {
      const result = await this.paymentGateway.processPayment(data.orderId, data.amount, data.method);
      
      if (result.success) {
        const paymentStatus = data.method === 'cod' ? 'unpaid' : 'paid';
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
