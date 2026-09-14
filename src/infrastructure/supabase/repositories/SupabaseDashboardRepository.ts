import { 
  IDashboardRepository, 
  DashboardMetrics, 
  CustomerWithStats, 
  CustomerFilters, 
  PaginatedCustomersResult 
} from '@/domain/repositories/IDashboardRepository';
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
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // 3. New Customers (profiles created recently, or just total profiles for now)
    const { count: newCustomers } = await supabase
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

  async getCustomers(search?: string): Promise<CustomerWithStats[]> {
    const supabase = this.supabase;

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, role, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      throw new Error(`Failed to fetch customer profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return [];
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, contact_email, total_amount, status, payment_status, created_at');

    if (ordersError) {
      throw new Error(`Failed to fetch customer orders for stats: ${ordersError.message}`);
    }

    const ordersByUser: Record<string, { totalOrders: number; totalSpent: number; lastOrderDate: string; email: string }> = {};

    (orders || []).forEach((ord) => {
      const uid = ord.user_id;
      if (!uid) return;

      if (!ordersByUser[uid]) {
        ordersByUser[uid] = {
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: ord.created_at,
          email: ord.contact_email || '',
        };
      }

      ordersByUser[uid].totalOrders += 1;
      if (ord.status === 'completed' || ord.payment_status === 'paid' || ord.status === 'delivered') {
        ordersByUser[uid].totalSpent += Number(ord.total_amount || 0);
      }
      if (new Date(ord.created_at) > new Date(ordersByUser[uid].lastOrderDate)) {
        ordersByUser[uid].lastOrderDate = ord.created_at;
      }
      if (!ordersByUser[uid].email && ord.contact_email) {
        ordersByUser[uid].email = ord.contact_email;
      }
    });

    const customers: CustomerWithStats[] = profiles.map((p) => {
      const stats = ordersByUser[p.id] || { totalOrders: 0, totalSpent: 0, lastOrderDate: '', email: '' };
      return {
        id: p.id,
        fullName: p.full_name || 'Khách hàng',
        email: stats.email || (p.role === 'admin' ? 'admin@khoui.vn' : `${p.id.slice(0, 8)}@user.khoui.vn`),
        role: p.role || 'user',
        createdAt: p.created_at,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
      };
    });

    if (!search) {
      return customers;
    }

    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }

  async getPaginatedCustomers(filters?: CustomerFilters): Promise<PaginatedCustomersResult> {
    const supabase = this.supabase;

    // 1. Compute global aggregated KPIs for metrics cards via database RPC
    let totalSpent = 0;
    let vipCount = 0;

    const { data: rpcKpiData, error: rpcError } = await supabase.rpc('get_customer_kpis');
    if (!rpcError && rpcKpiData && rpcKpiData.length > 0) {
      totalSpent = Number(rpcKpiData[0].total_spent || 0);
      vipCount = Number(rpcKpiData[0].vip_count || 0);
    } else {
      // Fallback query if RPC fails or is unavailable
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('user_id, total_amount, status, payment_status')
        .not('user_id', 'is', null)
        .or('status.in.(delivered,completed,paid),payment_status.eq.paid');

      if (revenueError) {
        throw new Error(`Failed to fetch orders for customer KPIs: ${revenueError.message}`);
      }

      const userSpentMap: Record<string, number> = {};
      (revenueData || []).forEach((r) => {
        if (r.user_id) {
          const amt = Number(r.total_amount || 0);
          totalSpent += amt;
          userSpentMap[r.user_id] = (userSpentMap[r.user_id] || 0) + amt;
        }
      });
      vipCount = Object.values(userSpentMap).filter((spent) => spent >= 2000000).length;
    }

    // 2. Build filtered paginated profiles query
    let query = supabase
      .from('profiles')
      .select('id, full_name, role, created_at', { count: 'exact' });

    if (filters?.search && filters.search.trim()) {
      const term = filters.search.trim();

      // Check if term matches email in orders to find matching user IDs
      const { data: emailMatches, error: emailError } = await supabase
        .from('orders')
        .select('user_id')
        .ilike('contact_email', `%${term}%`);

      if (emailError) {
        throw new Error(`Failed to search orders by contact email: ${emailError.message}`);
      }

      const userIdsFromEmail = Array.from(
        new Set((emailMatches || []).map((o: { user_id?: string }) => o.user_id).filter(Boolean))
      );

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(term);
      const escapedTerm = term.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const orConditions: string[] = [`full_name.ilike."%${escapedTerm}%"`];

      if (isUuid) {
        orConditions.push(`id.eq.${term}`);
      }
      if (userIdsFromEmail.length > 0) {
        orConditions.push(`id.in.(${userIdsFromEmail.join(',')})`);
      }
      query = query.or(orConditions.join(','));
    }

    const limit = filters?.limit ?? 10;
    const offset = filters?.offset ?? 0;
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: profiles, count, error: profilesError } = await query;
    if (profilesError) {
      throw new Error(`Failed to fetch paginated profiles: ${profilesError.message}`);
    }

    const total = count ?? (profiles?.length || 0);

    if (!profiles || profiles.length === 0) {
      return {
        customers: [],
        total,
        vipCount,
        totalSpent,
      };
    }

    // 3. Fetch order statistics ONLY for the profiles on the current page
    const pageUserIds = profiles.map((p) => p.id);
    const { data: pageOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, user_id, contact_email, total_amount, status, payment_status, created_at')
      .in('user_id', pageUserIds);

    if (ordersError) {
      throw new Error(`Failed to fetch orders for page profiles: ${ordersError.message}`);
    }

    const ordersByUser: Record<
      string,
      { totalOrders: number; totalSpent: number; lastOrderDate: string; email: string }
    > = {};

    (pageOrders || []).forEach((ord) => {
      const uid = ord.user_id;
      if (!uid) return;

      if (!ordersByUser[uid]) {
        ordersByUser[uid] = {
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: ord.created_at,
          email: ord.contact_email || '',
        };
      }

      ordersByUser[uid].totalOrders += 1;
      if (ord.status === 'completed' || ord.payment_status === 'paid' || ord.status === 'delivered') {
        ordersByUser[uid].totalSpent += Number(ord.total_amount || 0);
      }
      if (new Date(ord.created_at) > new Date(ordersByUser[uid].lastOrderDate)) {
        ordersByUser[uid].lastOrderDate = ord.created_at;
      }
      if (!ordersByUser[uid].email && ord.contact_email) {
        ordersByUser[uid].email = ord.contact_email;
      }
    });

    const customers: CustomerWithStats[] = profiles.map((p) => {
      const stats = ordersByUser[p.id] || { totalOrders: 0, totalSpent: 0, lastOrderDate: '', email: '' };
      return {
        id: p.id,
        fullName: p.full_name || 'Khách hàng',
        email: stats.email || (p.role === 'admin' ? 'admin@khoui.vn' : `${p.id.slice(0, 8)}@user.khoui.vn`),
        role: p.role || 'user',
        createdAt: p.created_at,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
      };
    });

    return {
      customers,
      total,
      vipCount,
      totalSpent,
    };
  }
}

