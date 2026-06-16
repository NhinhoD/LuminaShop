export interface Payment {
  id: string;
  orderId: string;
  method: string;
  status: string;
  amount: number | string;
  transactionId?: string;
  webhookPayload?: unknown;
  createdAt: Date;
}

export interface IPaymentRepository {
  findByTransactionId(transactionId: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment | null>;
  updatePaymentStatus(id: string, status: string): Promise<void>;
}
