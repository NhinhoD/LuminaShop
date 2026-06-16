import { SupabaseClient } from '@supabase/supabase-js';
import { IPaymentRepository, Payment } from '@/domain/repositories/IPaymentRepository';
import { PaymentRow } from '../types';

export class SupabasePaymentRepository implements IPaymentRepository {
  constructor(private supabase: SupabaseClient) {}

  private mapToDomain(row: PaymentRow): Payment {
    return {
      id: row.id,
      orderId: row.order_id,
      method: row.method,
      status: row.status,
      amount: row.amount,
      transactionId: row.transaction_id || undefined,
      webhookPayload: row.webhook_payload,
      createdAt: new Date(row.created_at)
    };
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (error || !data) return null;
    return this.mapToDomain(data as PaymentRow);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !data) return null;
    return this.mapToDomain(data as PaymentRow);
  }

  async updatePaymentStatus(id: string, status: string): Promise<void> {
    const { error } = await this.supabase
      .from('payments')
      .update({ status })
      .eq('id', id);

    if (error) throw new Error(`Failed to update payment status: ${error.message}`);
  }
}
