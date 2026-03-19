import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export type AdminFeedbackType =
  | "compliment"
  | "feature_request"
  | "bug_report"
  | "general"
  | "complaint";

export type AdminFeedbackStatus =
  | "new"
  | "reviewed"
  | "in_progress"
  | "resolved"
  | "archived";

export interface AdminFeedbackUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface AdminFeedbackReviewer {
  id: string;
  firstName?: string;
  lastName?: string;
}

export interface AdminFeedback {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  type: AdminFeedbackType;
  rating?: number | null;
  subject: string;
  message: string;
  status: AdminFeedbackStatus;
  adminNote?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: AdminFeedbackUser;
  reviewer?: AdminFeedbackReviewer;
}

export interface FeedbackStats {
  total: number;
  byStatus: Partial<Record<AdminFeedbackStatus, number>>;
  byType: Partial<Record<AdminFeedbackType, number>>;
  averageRating: string;
}

export interface FetchAdminFeedbackParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminFeedbackStatus;
  type?: AdminFeedbackType;
  rating?: number;
  sort?: "fullName" | "email" | "type" | "rating" | "status" | "createdAt";
  order?: "asc" | "desc";
  from?: string;
  to?: string;
}

export interface FetchAdminFeedbackResult {
  data: AdminFeedback[];
  pagination: ApiPagination;
}

export interface UpdateFeedbackStatusPayload {
  status: AdminFeedbackStatus;
  adminNote?: string;
}

function buildQuery(params: FetchAdminFeedbackParams): string {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.status) query.set("status", params.status);
  if (params.type) query.set("type", params.type);
  if (typeof params.rating === "number") {
    query.set("rating", String(params.rating));
  }
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

export async function fetchAdminFeedback(
  params: FetchAdminFeedbackParams = {},
): Promise<FetchAdminFeedbackResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminFeedback[]>>(
    `/feedback${buildQuery(params)}`,
  );

  return {
    data: response.data.data ?? [],
    pagination:
      response.data.pagination ?? defaultPagination(params.limit ?? 10),
  };
}

export async function fetchAdminFeedbackById(
  id: string,
): Promise<AdminFeedback> {
  const response = await apiClient.get<ApiSuccessResponse<AdminFeedback>>(
    `/feedback/${id}`,
  );

  if (!response.data.data) {
    throw new Error("Missing feedback response data");
  }

  return response.data.data;
}

export async function updateFeedbackStatus(
  id: string,
  payload: UpdateFeedbackStatusPayload,
): Promise<AdminFeedback> {
  const response = await apiClient.patch<ApiSuccessResponse<AdminFeedback>>(
    `/feedback/${id}/status`,
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing updated feedback response data");
  }

  return response.data.data;
}

export async function deleteAdminFeedback(id: string): Promise<void> {
  await apiClient.delete(`/feedback/${id}`);
}

export async function fetchFeedbackStats(): Promise<FeedbackStats> {
  const response =
    await apiClient.get<ApiSuccessResponse<FeedbackStats>>("/feedback/stats");

  return (
    response.data.data ?? {
      total: 0,
      byStatus: {},
      byType: {},
      averageRating: "0.0",
    }
  );
}
