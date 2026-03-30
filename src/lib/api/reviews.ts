import { apiClient } from "./client";
import type { ApiSuccessResponse, ApiPagination } from "./types";

export interface Review {
  id: string;
  productId?: string;
  experienceId?: string;
  trainingProgramId?: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
  product?: {
    id: string;
    name: any;
    slug: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type ReviewEntityType = "product" | "tour" | "education";

export interface CreateReviewPayload {
  productId?: string;
  experienceId?: string;
  trainingProgramId?: string;
  rating: number;
  title?: string;
  comment?: string;
}

export interface ReviewList {
  data: Review[];
  pagination: ApiPagination;
  meta?: {
    ratingDistribution: Array<{ rating: number; count: string }>;
  };
}

export interface FetchAdminReviewsParams {
  page?: number;
  limit?: number;
  isApproved?: "true" | "false";
  rating?: number;
  productId?: string;
  search?: string;
  from?: string;
  to?: string;
  sort?: "rating" | "helpfulCount" | "createdAt";
  order?: "asc" | "desc";
}

export interface AdminReview extends Review {
  user?: {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
  };
  product?: {
    id: string;
    name: any;
    slug: string;
  };
}

export interface AdminReviewList {
  data: AdminReview[];
  pagination: ApiPagination;
}

export interface AdminReviewStats {
  total: number;
  approved: number;
  pending: number;
  averageRating: string;
}

export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  const response = await apiClient.post<ApiSuccessResponse<Review>>(
    "/reviews",
    payload,
  );
  if (!response.data.data) {
    throw new Error("Missing created review response data");
  }
  return response.data.data;
}

export async function createExperienceReview(
  experienceId: string,
  payload: Omit<CreateReviewPayload, "productId" | "experienceId" | "trainingProgramId">,
): Promise<Review> {
  return createReview({ ...payload, experienceId });
}

export async function createProgramReview(
  trainingProgramId: string,
  payload: Omit<CreateReviewPayload, "productId" | "experienceId" | "trainingProgramId">,
): Promise<Review> {
  return createReview({ ...payload, trainingProgramId });
}

/**
 * Get reviews for a specific product
 */
export async function fetchProductReviews(
  productId: string,
  params: Record<string, any> = {},
): Promise<ReviewList> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.append(key, String(value));
  });

  const response = await apiClient.get<ApiSuccessResponse<Review[]>>(
    `/reviews/product/${productId}?${searchParams.toString()}`,
  );

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination!,
    meta: response.data.meta as any,
  };
}

export async function fetchExperienceReviews(
  experienceId: string,
  params: Record<string, any> = {},
): Promise<ReviewList> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.append(key, String(value));
  });

  const response = await apiClient.get<ApiSuccessResponse<Review[]>>(
    `/reviews/experience/${experienceId}?${searchParams.toString()}`,
  );

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination!,
  };
}

export async function fetchProgramReviews(
  programId: string,
  params: Record<string, any> = {},
): Promise<ReviewList> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.append(key, String(value));
  });

  const response = await apiClient.get<ApiSuccessResponse<Review[]>>(
    `/reviews/program/${programId}?${searchParams.toString()}`,
  );

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination!,
  };
}

export async function fetchAdminReviews(
  params: FetchAdminReviewsParams,
): Promise<AdminReviewList> {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.isApproved !== undefined) sp.set("isApproved", params.isApproved);
  if (params.rating) sp.set("rating", String(params.rating));
  if (params.productId) sp.set("productId", params.productId);
  if (params.search?.trim()) sp.set("search", params.search.trim());
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.sort) sp.set("sort", params.sort);
  if (params.order) sp.set("order", params.order);

  const qs = sp.toString();
  const response = await apiClient.get<ApiSuccessResponse<AdminReview[]>>(
    `/reviews/admin${qs ? `?${qs}` : ""}`,
  );

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination ?? {
      total: 0,
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}

export async function toggleAdminReviewApproval(
  reviewId: string,
): Promise<AdminReview> {
  const response = await apiClient.patch<ApiSuccessResponse<AdminReview>>(
    `/reviews/admin/${reviewId}/approval`,
  );
  if (!response.data.data) {
    throw new Error("Missing review response data");
  }
  return response.data.data;
}

export async function deleteAdminReview(reviewId: string): Promise<void> {
  await apiClient.delete(`/reviews/admin/${reviewId}`);
}

export async function fetchAdminReviewStats(): Promise<AdminReviewStats> {
  const response = await apiClient.get<ApiSuccessResponse<AdminReviewStats>>(
    "/reviews/admin/stats",
  );
  return (
    response.data.data ?? {
      total: 0,
      approved: 0,
      pending: 0,
      averageRating: "0.0",
    }
  );
}
