export interface PaymentResult {
  success: boolean;
  paymentId: string;
  message: string;
}

export interface IPaymentGateway {
  processPayment(orderId: string, amount: number, method: string): Promise<PaymentResult>;
}
