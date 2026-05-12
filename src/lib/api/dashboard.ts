import { apiClient } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/lib/api/types";

export type DashboardPeriod = "monthly" | "weekly" | "daily";

export interface KPIComparison {
  current: number;
  previous: number;
  change: number | null;
}

export interface DashboardOverview {
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalCategories: number;
  unreadMessages: number;
  conversionRate: number;
  estimatedVisitors: number;
  comparisons: {
    revenue: KPIComparison;
    orders: KPIComparison;
    customers: KPIComparison;
  };
}

export interface RevenueChartItem {
  period: string;
  revenue?: number;
  orders?: number;
  productRevenue?: number;
  productOrders?: number;
  tourRevenue?: number;
  tourBookings?: number;
  trainingRevenue?: number;
  trainingEnrollments?: number;
  totalRevenue?: number;
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

// ─── New Endpoints ───────────────────────────────────────

export interface ModulesSummary {
  tours: number;
  education: number;
  artisans: number;
  partners: number;
  totalBookings: number;
  totalEnrollments: number;
}

export interface RevenueStream {
  name: string;
  value: number;
  percentage: number;
}

export interface RevenueByStream {
  total: number;
  streams: RevenueStream[];
}

export interface SalesCategory {
  id: string;
  name: string;
  revenue: number;
  unitsSold: number;
  percentage: number;
}

export interface SalesByCategory {
  total: number;
  categories: SalesCategory[];
}

export interface RecentBooking {
  id: string;
  referenceNumber: string;
  fullName: string;
  email: string;
  participants: number;
  date: string;
  timeSlot: string;
  status: string;
  paymentStatus: string;
  amountRwf: number;
  createdAt: string;
  experience?: {
    id: string;
    title: string;
    type: string;
  };
}

export interface TrainingEnrollmentStats {
  status: string;
  count: number;
}

export interface TrainingEnrollment {
  id: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
  trainingProgramId: string;
  program?: {
    id: string;
    title: string;
  };
}

export interface TrainingStats {
  totalPrograms: number;
  totalEnrollments: number;
  byStatus: {
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
  };
  totalRevenue: number;
  recentEnrollments: TrainingEnrollment[];
}

export interface ViewByCategory {
  category: string;
  views: number;
}

export interface TopViewedProduct {
  id: string;
  name: string;
  slug: string;
  viewCount: number;
  images?: string[];
}

export interface VisitorStats {
  totalPageViews: number;
  topViewedProducts: TopViewedProduct[];
  viewsByCategory: ViewByCategory[];
  note: string;
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

// ─── New Endpoints ───────────────────────────────────────

export async function fetchModulesSummary(): Promise<ModulesSummary> {
  const res = await apiClient.get<ApiSuccessResponse<ModulesSummary>>(
    "/dashboard/modules-summary",
  );
  return res.data.data!;
}

export async function fetchRevenueByStream(): Promise<RevenueByStream> {
  const res = await apiClient.get<ApiSuccessResponse<RevenueByStream>>(
    "/dashboard/revenue-by-stream",
  );
  return res.data.data!;
}

export async function fetchSalesByCategory(): Promise<SalesByCategory> {
  const res = await apiClient.get<ApiSuccessResponse<SalesByCategory>>(
    "/dashboard/sales-by-category",
  );
  return res.data.data!;
}

export async function fetchRecentBookings(
  limit = 10,
): Promise<RecentBooking[]> {
  const res = await apiClient.get<ApiSuccessResponse<RecentBooking[]>>(
    `/dashboard/recent-bookings?limit=${limit}`,
  );
  return res.data.data!;
}

export async function fetchTrainingStats(): Promise<TrainingStats> {
  const res = await apiClient.get<ApiSuccessResponse<TrainingStats>>(
    "/dashboard/training-stats",
  );
  return res.data.data!;
}

export async function fetchVisitorStats(): Promise<VisitorStats> {
  const res = await apiClient.get<ApiSuccessResponse<VisitorStats>>(
    "/dashboard/visitor-stats",
  );
  return res.data.data!;
}
export interface PendingCounts {
  orders: number;
  bookings: number;
  enrollments: number;
  artisanApplications: number;
  partnerApplications: number;
  reviews: number;
  returns: number;
  appeals: number;
  contacts: number;
  feedback: number;
  activePartners: number;
}

export async function fetchPendingCounts(): Promise<PendingCounts> {
  const res = await apiClient.get<ApiSuccessResponse<PendingCounts>>(
    "/dashboard/pending-counts",
  );
  return res.data.data!;
}
