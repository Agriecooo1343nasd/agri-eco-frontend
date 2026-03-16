import { apiClient } from "./client";
import type { ApiPagination, ApiSuccessResponse } from "./types";

export interface MultiLangValue {
  en: string;
  rw?: string;
  fr?: string;
  sw?: string;
}

export interface AdminAccommodation {
  id: string;
  name: MultiLangValue;
  description: MultiLangValue;
  category: "standard" | "premium" | "family" | "luxury" | "eco";
  status: "available" | "occupied" | "maintenance";
  ratePerNightRwf: number;
  maxGuests: number;
  amenities: string[];
  mainImage?: string;
  gallery: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccommodationsPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sort?: "ratePerNightRwf" | "maxGuests" | "createdAt";
  order?: "asc" | "desc";
}

export interface AccommodationList {
  data: AdminAccommodation[];
  pagination: ApiPagination;
}

/**
 * Fetch accommodations with pagination, search, and filtering
 * Uses public endpoint by default (only active accommodations)
 */
export async function fetchAccommodations(
  params: AccommodationsPaginationParams = {},
): Promise<AccommodationList> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.category) searchParams.append("category", params.category);
  if (params.status) searchParams.append("status", params.status);
  if (params.sort) searchParams.append("sort", params.sort);
  if (params.order) searchParams.append("order", params.order);

  const response = await apiClient.get<
    ApiSuccessResponse<AdminAccommodation[]>
  >(`/accommodations?${searchParams.toString()}`);

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

/**
 * Fetch accommodations from admin endpoint (includes inactive ones)
 */
export async function fetchAdminAccommodations(
  params: AccommodationsPaginationParams = {},
): Promise<AccommodationList> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.category) searchParams.append("category", params.category);
  if (params.status) searchParams.append("status", params.status);
  if (params.sort) searchParams.append("sort", params.sort);
  if (params.order) searchParams.append("order", params.order);

  const response = await apiClient.get<
    ApiSuccessResponse<AdminAccommodation[]>
  >(`/accommodations/admin?${searchParams.toString()}`);

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

/**
 * Get accommodation by ID
 */
export async function fetchAccommodationById(
  id: string,
): Promise<AdminAccommodation> {
  const response = await apiClient.get<ApiSuccessResponse<AdminAccommodation>>(
    `/accommodations/${id}`,
  );

  if (!response.data.data) {
    throw new Error("Missing accommodation response data");
  }

  return response.data.data;
}

/**
 * Normalize accommodation image URL to absolute path
 */
export function toAbsoluteAccommodationImage(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return url.startsWith("/") ? url : `/${url}`;
}
