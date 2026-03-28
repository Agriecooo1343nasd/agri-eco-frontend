import { apiClient } from "./client";
import type { ApiSuccessResponse, ApiPagination } from "./types";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment: string;
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

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
}

export interface ReviewList {
  data: Review[];
  pagination: ApiPagination;
  meta?: {
    ratingDistribution: Array<{ rating: number; count: string }>;
  };
}

/**
 * Create a new review (Customer)
 * Note: Backend currently only supports shop products for reviews.
 */
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
