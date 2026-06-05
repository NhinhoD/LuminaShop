export interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number; // percentage
  totalOrders: number;
  ordersGrowth: number; // percentage
  newCustomers: number;
}

export interface IDashboardRepository {
  getMetrics(): Promise<DashboardMetrics>;
}
