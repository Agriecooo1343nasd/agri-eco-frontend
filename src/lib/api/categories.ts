import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchAdminCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: "true" | "false";
  isFeatured?: "true" | "false";
  parentId?: string;
  topLevel?: "true";
  sort?: "name" | "sortOrder" | "productCount";
  order?: "asc" | "desc";
}

export interface FetchAdminCategoriesResult {
  data: AdminCategory[];
  pagination: ApiPagination;
}

export interface UpsertCategoryPayload {
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
}

function buildQuery(params: FetchAdminCategoriesParams): string {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.isActive) query.set("isActive", params.isActive);
  if (params.isFeatured) query.set("isFeatured", params.isFeatured);
  if (params.parentId) query.set("parentId", params.parentId);
  if (params.topLevel) query.set("topLevel", params.topLevel);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export async function fetchAdminCategories(
  params: FetchAdminCategoriesParams,
): Promise<FetchAdminCategoriesResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminCategory[]>>(
    `/categories${buildQuery(params)}`,
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

export async function createAdminCategory(
  payload: UpsertCategoryPayload,
  imageFile?: File,
): Promise<AdminCategory> {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await apiClient.post<ApiSuccessResponse<AdminCategory>>(
    "/categories",
    formData,
  );

  if (!response.data.data) {
    throw new Error("Missing category response data");
  }

  return response.data.data;
}

export async function updateAdminCategory(
  id: string,
  payload: Partial<UpsertCategoryPayload>,
  imageFile?: File,
): Promise<AdminCategory> {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));

  if (imageFile) {
    formData.append("image", imageFile);
  }

  const response = await apiClient.put<ApiSuccessResponse<AdminCategory>>(
    `/categories/${id}`,
    formData,
  );

  if (!response.data.data) {
    throw new Error("Missing updated category response data");
  }

  return response.data.data;
}

export async function deleteAdminCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

export function toAbsoluteCategoryImage(url?: string): string {
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
