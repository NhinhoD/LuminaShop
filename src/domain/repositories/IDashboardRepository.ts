export interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number; // percentage
  totalOrders: number;
  ordersGrowth: number; // percentage
  newCustomers: number;
}

export interface CustomerWithStats {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export interface IDashboardRepository {
  getMetrics(): Promise<DashboardMetrics>;
  getCustomers(search?: string): Promise<CustomerWithStats[]>;
}

