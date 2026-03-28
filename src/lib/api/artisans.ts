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
  artisan?: {
    id: string;
    name: string;
    specialty?: string;
  };
  category?: {
    id: string;
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertAdminArtisanProductPayload {
  name: ArtisanMultiLangText;
  description?: ArtisanMultiLangText;
  price: number;
  stock?: number;
  categoryId?: string;
  image?: string;
}

export interface FetchAdminArtisanProductsParams {
  page?: number;
  limit?: number;
  artisanId?: string;
  categoryId?: string;
  search?: string;
  sort?: "price" | "stock" | "createdAt";
  order?: "asc" | "desc";
}

export interface FetchAdminArtisanProductsResult {
  data: AdminArtisanProduct[];
  pagination: ApiPagination;
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

export type AdminArtisanApplicationStatus = "pending" | "approved" | "rejected";

export interface AdminArtisanApplication {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  specialty: string;
  location: string;
  shortDescription?: ArtisanMultiLangText;
  fullStory?: ArtisanMultiLangText;
  profileImage?: string;
  status: AdminArtisanApplicationStatus;
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchAdminArtisanApplicationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminArtisanApplicationStatus;
  sort?: "fullName" | "createdAt";
  order?: "asc" | "desc";
}

export interface FetchAdminArtisanApplicationsResult {
  data: AdminArtisanApplication[];
  pagination: ApiPagination;
}

export interface ReviewAdminArtisanApplicationPayload {
  status: "approved" | "rejected";
  reviewNote?: string;
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

function buildArtisansQuery(params: FetchAdminArtisansParams): string {
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

export async function fetchArtisans(
  params: FetchAdminArtisansParams,
): Promise<FetchAdminArtisansResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminArtisan[]>>(
    `/artisans${buildArtisansQuery(params)}`,
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

export async function fetchArtisanById(id: string): Promise<AdminArtisan> {
  // NOTE: Currently using admin endpoint as there's no public detail endpoint in swagger
  const response = await apiClient.get<ApiSuccessResponse<AdminArtisan>>(
    `/artisans/admin/${id}`,
  );

  if (!response.data.data) {
    throw new Error("Artisan not found");
  }

  return response.data.data;
}

export async function submitArtisanApplication(payload: any): Promise<any> {
  // Ensure shortDescription and fullStory are objects if they are strings
  const formattedPayload = { ...payload };
  if (typeof formattedPayload.shortDescription === "string") {
    formattedPayload.shortDescription = { en: formattedPayload.shortDescription };
  }
  if (typeof formattedPayload.fullStory === "string") {
    formattedPayload.fullStory = { en: formattedPayload.fullStory };
  }

  const response = await apiClient.post<ApiSuccessResponse<any>>(
    "/artisans/applications",
    formattedPayload,
  );
  return response.data;
}

function buildArtisanProductsQuery(
  params: FetchAdminArtisanProductsParams,
): string {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.artisanId) query.set("artisanId", params.artisanId);
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export async function fetchAdminArtisans(
  params: FetchAdminArtisansParams,
): Promise<FetchAdminArtisansResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminArtisan[]>>(
    `/artisans/admin${buildArtisansQuery(params)}`,
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

export async function fetchAdminArtisanApplications(
  params: FetchAdminArtisanApplicationsParams,
): Promise<FetchAdminArtisanApplicationsResult> {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.status) query.set("status", params.status);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

  const queryString = query.toString();

  const response = await apiClient.get<
    ApiSuccessResponse<AdminArtisanApplication[]>
  >(`/artisans/admin/applications${queryString ? `?${queryString}` : ""}`);

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

export async function reviewAdminArtisanApplication(
  id: string,
  payload: ReviewAdminArtisanApplicationPayload,
): Promise<AdminArtisanApplication> {
  const response = await apiClient.patch<
    ApiSuccessResponse<AdminArtisanApplication>
  >(`/artisans/admin/applications/${id}/review`, payload);

  if (!response.data.data) {
    throw new Error("Missing reviewed application response data");
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

export async function fetchAdminArtisanProducts(
  params: FetchAdminArtisanProductsParams,
): Promise<FetchAdminArtisanProductsResult> {
  const response = await apiClient.get<
    ApiSuccessResponse<AdminArtisanProduct[]>
  >(`/artisans/admin/products${buildArtisanProductsQuery(params)}`);

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

export async function fetchAdminArtisanProductById(
  artisanId: string,
  productId: string,
): Promise<AdminArtisanProduct> {
  let page = 1;
  const limit = 100;

  // Backend currently exposes list-only product endpoint for artisan products,
  // so we resolve a single product by paging until a match is found.
  while (page <= 20) {
    const result = await fetchAdminArtisanProducts({
      artisanId,
      page,
      limit,
      sort: "createdAt",
      order: "desc",
    });

    const match = result.data.find((entry) => entry.id === productId);
    if (match) {
      return match;
    }

    if (!result.pagination.hasNext) {
      break;
    }

    page += 1;
  }

  throw new Error("Artisan product not found");
}

export async function createAdminArtisanProduct(
  artisanId: string,
  payload: UpsertAdminArtisanProductPayload,
): Promise<AdminArtisanProduct> {
  const response = await apiClient.post<
    ApiSuccessResponse<AdminArtisanProduct>
  >(`/artisans/admin/${artisanId}/products`, payload);

  if (!response.data.data) {
    throw new Error("Missing created artisan product response data");
  }

  return response.data.data;
}

export async function updateAdminArtisanProduct(
  artisanId: string,
  productId: string,
  payload: Partial<UpsertAdminArtisanProductPayload>,
): Promise<AdminArtisanProduct> {
  const response = await apiClient.put<ApiSuccessResponse<AdminArtisanProduct>>(
    `/artisans/admin/${artisanId}/products/${productId}`,
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing updated artisan product response data");
  }

  return response.data.data;
}

export async function deleteAdminArtisanProduct(
  artisanId: string,
  productId: string,
): Promise<void> {
  await apiClient.delete(`/artisans/admin/${artisanId}/products/${productId}`);
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
