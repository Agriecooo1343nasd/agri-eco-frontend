import { apiClient } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/lib/api/types";

export type DashboardPeriod = "monthly" | "weekly" | "daily";

export interface DashboardOverview {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalCategories: number;
  unreadMessages: number;
}

export interface RevenueChartItem {
  period: string;
  revenue: number;
  orders: number;
}

export interface RevenueChart {
  period: string;
  data: RevenueChartItem[];
}

export interface TopProduct {
  id: string;
  name: string;
  soldCount: number;
  sellingPrice: number;
  stock: number;
  images?: string[];
  category?: { name: string };
  averageRating?: number;
}

export interface OrderByStatus {
  status: string;
  count: number;
}

export interface RecentOrderUser {
  username: string;
  email: string;
}

export interface RecentOrder {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  user?: RecentOrderUser;
  items?: { id: string; quantity: number; price: number }[];
}

export interface CustomerGrowthItem {
  period: string;
  newCustomers: number;
}

export interface CustomerGrowth {
  period: string;
  data: CustomerGrowthItem[];
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  sku?: string;
  images?: string[];
  category?: { name: string };
}

export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const res = await apiClient.get<ApiSuccessResponse<DashboardOverview>>(
    "/dashboard/overview",
  );
  return res.data.data!;
}

export async function fetchRevenueChart(
  period: DashboardPeriod = "monthly",
): Promise<RevenueChart> {
  const res = await apiClient.get<ApiSuccessResponse<RevenueChart>>(
    `/dashboard/revenue-chart?period=${period}`,
  );
  return res.data.data!;
}

export async function fetchTopProducts(limit = 5): Promise<TopProduct[]> {
  const res = await apiClient.get<ApiSuccessResponse<TopProduct[]>>(
    `/dashboard/top-products?limit=${limit}`,
  );
  return res.data.data!;
}

export async function fetchOrdersByStatus(): Promise<OrderByStatus[]> {
  const res = await apiClient.get<ApiSuccessResponse<OrderByStatus[]>>(
    "/dashboard/orders-by-status",
  );
  return res.data.data!;
}

export async function fetchRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const res = await apiClient.get<ApiSuccessResponse<RecentOrder[]>>(
    `/dashboard/recent-orders?limit=${limit}`,
  );
  return res.data.data!;
}

export async function fetchCustomerGrowth(
  period: DashboardPeriod = "monthly",
): Promise<CustomerGrowth> {
  const res = await apiClient.get<ApiSuccessResponse<CustomerGrowth>>(
    `/dashboard/customer-growth?period=${period}`,
  );
  return res.data.data!;
}

export async function fetchLowStockProducts(
  threshold = 10,
): Promise<LowStockProduct[]> {
  const res = await apiClient.get<ApiSuccessResponse<LowStockProduct[]>>(
    `/dashboard/low-stock?threshold=${threshold}`,
  );
  return res.data.data!;
}
