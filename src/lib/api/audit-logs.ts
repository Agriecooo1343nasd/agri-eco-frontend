import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export interface AdminAuditLog {
  id: string;
  actorUserId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchAdminAuditLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  entityType?: string;
  sort?: "createdAt" | "action" | "entityType";
  order?: "asc" | "desc";
}

export interface FetchAdminAuditLogsResult {
  data: AdminAuditLog[];
  pagination: ApiPagination;
}

export interface CreateAuditLogPayload {
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

function buildQuery(params: FetchAdminAuditLogsParams): string {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.action?.trim()) query.set("action", params.action.trim());
  if (params.entityType?.trim()) {
    query.set("entityType", params.entityType.trim());
  }
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

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

export async function fetchAdminAuditLogs(
  params: FetchAdminAuditLogsParams = {},
): Promise<FetchAdminAuditLogsResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminAuditLog[]>>(
    `/audit-logs${buildQuery(params)}`,
  );

  return {
    data: response.data.data ?? [],
    pagination:
      response.data.pagination ?? defaultPagination(params.limit ?? 10),
  };
}

export async function createAuditLog(
  payload: CreateAuditLogPayload,
): Promise<AdminAuditLog> {
  const response = await apiClient.post<ApiSuccessResponse<AdminAuditLog>>(
    "/audit-logs",
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing created audit log response data");
  }

  return response.data.data;
}

export async function updateAuditLog(
  id: string,
  payload: CreateAuditLogPayload,
): Promise<AdminAuditLog> {
  const response = await apiClient.put<ApiSuccessResponse<AdminAuditLog>>(
    `/audit-logs/${id}`,
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing updated audit log response data");
  }

  return response.data.data;
}

export async function deleteAuditLog(id: string): Promise<void> {
  await apiClient.delete(`/audit-logs/${id}`);
}
