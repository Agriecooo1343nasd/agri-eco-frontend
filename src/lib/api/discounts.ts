import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export type DiscountType = "percentage" | "fixed" | "bogo" | "flash_sale";
export type DiscountStatus = "active" | "inactive" | "expired" | "scheduled";

export interface DiscountCreator {
  id: string;
  username: string;
}

export interface AdminDiscount {
  id: string;
  name: string;
  code: string;
  description?: string;
  image?: string;
  type: DiscountType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  applicableProducts: string[];
  applicableCategories: string[];
  usageLimit: number;
  usageCount: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  status: DiscountStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  creator?: DiscountCreator;
}

export interface FetchAdminDiscountsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: DiscountStatus;
  type?: DiscountType;
  sort?:
    | "name"
    | "code"
    | "value"
    | "startDate"
    | "endDate"
    | "usageCount"
    | "createdAt"
    | "updatedAt";
  order?: "asc" | "desc";
  from?: string;
  to?: string;
}

export interface FetchAdminDiscountsResult {
  data: AdminDiscount[];
  pagination: ApiPagination;
}

export interface DiscountStats {
  active: number;
  scheduled: number;
  expired: number;
  totalUsage: number;
}

export interface CreateDiscountPayload {
  code: string;
  name: string;
  description?: string;
  image?: string;
  type: DiscountType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startDate: string;
  endDate: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  status?: DiscountStatus;
}

export interface UpdateDiscountPayload {
  code?: string;
  name?: string;
  description?: string;
  image?: string | null;
  type?: DiscountType;
  value?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  startDate?: string;
  endDate?: string;
  applicableProducts?: string[];
  applicableCategories?: string[];
  status?: DiscountStatus;
}

function buildQuery(params: FetchAdminDiscountsParams): string {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.status) query.set("status", params.status);
  if (params.type) query.set("type", params.type);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function defaultPagination(limit = 10): ApiPagination {
  return {
    total: 0,
    page: 1,
    limit,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  };
}

export async function fetchAdminDiscounts(
  params: FetchAdminDiscountsParams,
): Promise<FetchAdminDiscountsResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminDiscount[]>>(
    `/discounts${buildQuery(params)}`,
  );

  return {
    data: response.data.data ?? [],
    pagination:
      response.data.pagination ?? defaultPagination(params.limit ?? 10),
  };
}

export async function fetchAdminDiscountById(
  id: string,
): Promise<AdminDiscount> {
  const response = await apiClient.get<ApiSuccessResponse<AdminDiscount>>(
    `/discounts/${id}`,
  );

  if (!response.data.data) {
    throw new Error("Missing discount response data");
  }

  return response.data.data;
}

export async function createDiscount(
  payload: CreateDiscountPayload,
): Promise<AdminDiscount> {
  const response = await apiClient.post<ApiSuccessResponse<AdminDiscount>>(
    "/discounts",
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing created discount response data");
  }

  return response.data.data;
}

export async function updateDiscount(
  id: string,
  payload: UpdateDiscountPayload,
): Promise<AdminDiscount> {
  const response = await apiClient.put<ApiSuccessResponse<AdminDiscount>>(
    `/discounts/${id}`,
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing updated discount response data");
  }

  return response.data.data;
}

export async function deleteDiscount(id: string): Promise<void> {
  await apiClient.delete(`/discounts/${id}`);
}

export async function toggleDiscountStatus(id: string): Promise<AdminDiscount> {
  const response = await apiClient.patch<ApiSuccessResponse<AdminDiscount>>(
    `/discounts/${id}/toggle`,
  );

  if (!response.data.data) {
    throw new Error("Missing toggled discount response data");
  }

  return response.data.data;
}

export async function fetchDiscountStats(): Promise<DiscountStats> {
  const response =
    await apiClient.get<ApiSuccessResponse<DiscountStats>>("/discounts/stats");

  return (
    response.data.data ?? {
      active: 0,
      scheduled: 0,
      expired: 0,
      totalUsage: 0,
    }
  );
}
export async function validateDiscountCode(
  code: string,
): Promise<{ valid: boolean; discount?: AdminDiscount; amount?: number }> {
  const response = await apiClient.post<
    ApiSuccessResponse<{ valid: boolean; discount?: AdminDiscount; amount?: number }>
  >("/discounts/validate", { code });
  return response.data.data!;
}
