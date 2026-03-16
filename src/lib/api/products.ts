import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";
import { apiBaseUrl } from "@/lib/config/api";

export interface ProductCategory {
  id: string;
  name: string;
  slug?: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  sellingPrice: number;
  originalPrice: number;
  stock: number;
  lowStockThreshold?: number;
  unit: string;
  images?: ProductImage[];
  isActive: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  averageRating?: number;
  soldCount: number;
  createdAt: string;
  category?: ProductCategory;
}

export type AdminProductSort =
  | "name"
  | "sellingPrice"
  | "stock"
  | "soldCount"
  | "averageRating"
  | "sku"
  | "createdAt";

export interface FetchAdminProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: "true" | "false";
  sort?: AdminProductSort;
  order?: "asc" | "desc";
}

export interface FetchAdminProductsResult {
  data: AdminProduct[];
  pagination: ApiPagination;
}

interface CategoryListResult {
  data: ProductCategory[];
  pagination?: ApiPagination;
}

function buildQuery(params: FetchAdminProductsParams): string {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.category) query.set("category", params.category);
  if (params.isActive) query.set("isActive", params.isActive);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export async function fetchAdminProducts(
  params: FetchAdminProductsParams,
): Promise<FetchAdminProductsResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminProduct[]>>(
    `/products${buildQuery(params)}`,
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

export async function fetchCategoriesForAdmin(): Promise<CategoryListResult> {
  const response = await apiClient.get<ApiSuccessResponse<ProductCategory[]>>(
    "/categories?limit=100&isActive=true&sort=name&order=asc",
  );

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination,
  };
}

export function toAbsoluteMediaUrl(url?: string): string {
  if (!url) {
    return "/assets/products/placeholder.jpg";
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const origin = apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}
