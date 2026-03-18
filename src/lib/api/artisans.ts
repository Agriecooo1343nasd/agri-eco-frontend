import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export interface AdminArtisanProduct {
  id: string;
  name: ArtisanMultiLangText;
  description?: ArtisanMultiLangText;
  price?: number;
  stock?: number;
  categoryId?: string;
  image?: string;
}

export interface ArtisanMultiLangText {
  en: string;
  rw?: string;
  fr?: string;
  sw?: string;
}

export interface AdminArtisan {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialty: string;
  location?: string;
  shortDescription?: ArtisanMultiLangText;
  fullStory?: ArtisanMultiLangText;
  image?: string;
  isFeatured: boolean;
  isActive: boolean;
  createdBy?: string;
  products?: AdminArtisanProduct[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertAdminArtisanPayload {
  name: string;
  email?: string;
  phone?: string;
  specialty: string;
  location?: string;
  shortDescription?: ArtisanMultiLangText;
  fullStory?: ArtisanMultiLangText;
  image?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface AdminArtisanStats {
  activeArtisans: number;
  pendingApplications: number;
  totalProducts: number;
  featuredCount: number;
}

export interface FetchAdminArtisansParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "name" | "specialty" | "createdAt";
  order?: "asc" | "desc";
  specialty?: string;
  isFeatured?: "true" | "false";
}

export interface FetchAdminArtisansResult {
  data: AdminArtisan[];
  pagination: ApiPagination;
}

function buildQuery(params: FetchAdminArtisansParams): string {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  if (params.specialty) query.set("specialty", params.specialty);
  if (params.isFeatured) query.set("isFeatured", params.isFeatured);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export async function fetchAdminArtisans(
  params: FetchAdminArtisansParams,
): Promise<FetchAdminArtisansResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminArtisan[]>>(
    `/artisans/admin${buildQuery(params)}`,
  );

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination ?? {
      total: 0,
      page: 1,
      limit: params.limit ?? 10,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}

export async function fetchAdminArtisanStats(): Promise<AdminArtisanStats> {
  const response = await apiClient.get<ApiSuccessResponse<AdminArtisanStats>>(
    "/artisans/admin/stats",
  );

  return (
    response.data.data ?? {
      activeArtisans: 0,
      pendingApplications: 0,
      totalProducts: 0,
      featuredCount: 0,
    }
  );
}

export async function fetchAdminArtisanById(id: string): Promise<AdminArtisan> {
  const response = await apiClient.get<ApiSuccessResponse<AdminArtisan>>(
    `/artisans/admin/${id}`,
  );

  if (!response.data.data) {
    throw new Error("Artisan not found");
  }

  return response.data.data;
}

export async function createAdminArtisan(
  payload: UpsertAdminArtisanPayload,
): Promise<AdminArtisan> {
  const response = await apiClient.post<ApiSuccessResponse<AdminArtisan>>(
    "/artisans",
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing created artisan response data");
  }

  return response.data.data;
}

export async function updateAdminArtisan(
  id: string,
  payload: Partial<UpsertAdminArtisanPayload>,
): Promise<AdminArtisan> {
  const response = await apiClient.put<ApiSuccessResponse<AdminArtisan>>(
    `/artisans/${id}`,
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing updated artisan response data");
  }

  return response.data.data;
}

export function toAbsoluteArtisanImage(url?: string): string {
  if (!url) {
    return "/assets/products/placeholder.jpg";
  }

  if (url.startsWith("/")) {
    return url;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `/${url}`;
}
