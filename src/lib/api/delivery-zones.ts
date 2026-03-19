import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export interface DeliveryZone {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  minDeliveryHours: number;
  maxDeliveryHours: number;
  feeRwf: number;
  freeFromRwf: number;
  coverage: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchAdminDeliveryZonesParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "name" | "feeRwf" | "createdAt";
  order?: "asc" | "desc";
}

export interface FetchAdminDeliveryZonesResult {
  data: DeliveryZone[];
  pagination: ApiPagination;
}

export interface CreateDeliveryZonePayload {
  name: string;
  code: string;
  isActive?: boolean;
  minDeliveryHours?: number;
  maxDeliveryHours?: number;
  feeRwf?: number;
  freeFromRwf?: number;
  coverage?: Record<string, unknown>;
}

export type UpdateDeliveryZonePayload = Partial<CreateDeliveryZonePayload>;

function buildQuery(params: FetchAdminDeliveryZonesParams): string {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
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

export async function fetchAdminDeliveryZones(
  params: FetchAdminDeliveryZonesParams = {},
): Promise<FetchAdminDeliveryZonesResult> {
  const response = await apiClient.get<ApiSuccessResponse<DeliveryZone[]>>(
    `/delivery-zones/admin${buildQuery(params)}`,
  );
  return {
    data: response.data.data ?? [],
    pagination:
      response.data.pagination ?? defaultPagination(params.limit ?? 10),
  };
}

export async function fetchAdminDeliveryZoneById(
  id: string,
): Promise<DeliveryZone> {
  const response = await apiClient.get<ApiSuccessResponse<DeliveryZone>>(
    `/delivery-zones/admin/${id}`,
  );
  if (!response.data.data) {
    throw new Error("Missing delivery zone response data");
  }
  return response.data.data;
}

export async function createDeliveryZone(
  payload: CreateDeliveryZonePayload,
): Promise<DeliveryZone> {
  const response = await apiClient.post<ApiSuccessResponse<DeliveryZone>>(
    "/delivery-zones",
    payload,
  );
  if (!response.data.data) {
    throw new Error("Missing created delivery zone response data");
  }
  return response.data.data;
}

export async function updateDeliveryZone(
  id: string,
  payload: UpdateDeliveryZonePayload,
): Promise<DeliveryZone> {
  const response = await apiClient.put<ApiSuccessResponse<DeliveryZone>>(
    `/delivery-zones/${id}`,
    payload,
  );
  if (!response.data.data) {
    throw new Error("Missing updated delivery zone response data");
  }
  return response.data.data;
}

export async function deleteDeliveryZone(id: string): Promise<void> {
  await apiClient.delete(`/delivery-zones/${id}`);
}
