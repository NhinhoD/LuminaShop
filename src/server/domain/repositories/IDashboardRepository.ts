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

export interface CustomerFilters {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface PaginatedCustomersResult {
  customers: CustomerWithStats[];
  total: number;
  vipCount: number;
  totalSpent: number;
}

export interface IDashboardRepository {
  getMetrics(): Promise<DashboardMetrics>;
  getCustomers(search?: string): Promise<CustomerWithStats[]>;
  getPaginatedCustomers(filters?: CustomerFilters): Promise<PaginatedCustomersResult>;
}

