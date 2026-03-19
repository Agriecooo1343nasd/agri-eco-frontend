import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export interface AdminContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  replyMessage?: string | null;
  repliedAt?: string | null;
  repliedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactStats {
  total: number;
  unread: number;
  read: number;
  replied: number;
}

export interface FetchAdminContactsParams {
  page?: number;
  limit?: number;
  search?: string;
  isRead?: "true" | "false";
  from?: string;
  to?: string;
  sort?: "firstName" | "lastName" | "email" | "subject" | "createdAt";
  order?: "asc" | "desc";
}

export interface FetchAdminContactsResult {
  data: AdminContact[];
  pagination: ApiPagination;
}

function buildQuery(params: FetchAdminContactsParams): string {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.isRead) query.set("isRead", params.isRead);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
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

export async function fetchAdminContacts(
  params: FetchAdminContactsParams = {},
): Promise<FetchAdminContactsResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminContact[]>>(
    `/contact${buildQuery(params)}`,
  );

  return {
    data: response.data.data ?? [],
    pagination:
      response.data.pagination ?? defaultPagination(params.limit ?? 10),
  };
}

export async function fetchAdminContactById(id: string): Promise<AdminContact> {
  const response = await apiClient.get<ApiSuccessResponse<AdminContact>>(
    `/contact/${id}`,
  );

  if (!response.data.data) {
    throw new Error("Missing contact response data");
  }

  return response.data.data;
}

export async function toggleContactRead(id: string): Promise<AdminContact> {
  const response = await apiClient.patch<ApiSuccessResponse<AdminContact>>(
    `/contact/${id}/read`,
  );

  if (!response.data.data) {
    throw new Error("Missing updated contact response data");
  }

  return response.data.data;
}

export async function replyToContact(
  id: string,
  message: string,
): Promise<AdminContact> {
  const response = await apiClient.post<ApiSuccessResponse<AdminContact>>(
    `/contact/${id}/reply`,
    { message },
  );

  if (!response.data.data) {
    throw new Error("Missing replied contact response data");
  }

  return response.data.data;
}

export async function deleteContact(id: string): Promise<void> {
  await apiClient.delete(`/contact/${id}`);
}

export async function fetchContactStats(): Promise<ContactStats> {
  const response =
    await apiClient.get<ApiSuccessResponse<ContactStats>>("/contact/stats");

  return (
    response.data.data ?? {
      total: 0,
      unread: 0,
      read: 0,
      replied: 0,
    }
  );
}
