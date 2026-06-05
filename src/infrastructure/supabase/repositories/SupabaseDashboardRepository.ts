import { IDashboardRepository, DashboardMetrics } from '@/domain/repositories/IDashboardRepository';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseDashboardRepository implements IDashboardRepository {
  constructor(private supabase: SupabaseClient) {}

  async getMetrics(): Promise<DashboardMetrics> {
    const supabase = this.supabase;
    
    // We could write a complex RPC for this, but for now we'll do lightweight queries
    
    // 1. Total Revenue (sum of delivered/completed orders)
    const { data: revenueData, error: revenueError } = await supabase
      .from('orders')
      .select('total_amount')
      .in('status', ['delivered', 'completed', 'paid']);
      
    let totalRevenue = 0;
    if (!revenueError && revenueData) {
      totalRevenue = revenueData.reduce((sum, order) => sum + Number(order.total_amount), 0);
    }

    // 2. Total Orders
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // 3. New Customers (profiles created recently, or just total profiles for now)
    const { count: newCustomers, error: customersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    return {
      totalRevenue,
      revenueGrowth: 14.5, // Mocked growth for UI purposes since we don't track historical snapshots yet
      totalOrders: totalOrders || 0,
      ordersGrowth: 5.2, // Mocked growth
      newCustomers: newCustomers || 0,
    };
  }
}
