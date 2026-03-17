export async function fetchAdminProductById(
  productId: string,
): Promise<AdminProduct> {
  const response = await apiClient.get<ApiSuccessResponse<AdminProduct>>(
    `/products/${productId}`,
  );
  if (!response.data.data) {
    throw new Error("Product not found");
  }
  return response.data.data;
}

export async function updateAdminProduct(
  productId: string,
  payload: Partial<CreateAdminProductPayload>,
  files?: { images?: File[]; videos?: File[] },
): Promise<AdminProduct> {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  for (const image of files?.images ?? []) {
    formData.append("images", image);
  }
  for (const video of files?.videos ?? []) {
    formData.append("videos", video);
  }
  const response = await apiClient.put<ApiSuccessResponse<AdminProduct>>(
    `/products/${productId}`,
    formData,
  );
  if (!response.data.data) {
    throw new Error("Product update failed");
  }
  return response.data.data;
}
import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

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

export interface ProductBatch {
  batchId: string;
  quantity: number;
  costPrice?: number;
  expiryDate?: string;
  receivedDate?: string;
  supplier?: string;
  status?: "active" | "expired" | "depleted";
}

export interface ProductShipping {
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shelfLife?: string;
  storageCondition?: string;
  requiresRefrigeration?: boolean;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  sellingPrice: number;
  originalPrice: number;
  stock: number;
  stockLevel?: number;
  lowStockThreshold?: number;
  unit: string;
  tags?: string[];
  features?: string[];
  benefits?: string[];
  batches?: ProductBatch[];
  shipping?: ProductShipping;
  images?: ProductImage[];
  isActive: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  status?: "active" | "draft" | "inactive";
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

export interface CreateCategoryPayload {
  name: string;
}

export interface InventoryBatchPayload {
  batchId: string;
  quantity: number;
  costPrice: number;
  expiryDate?: string;
  receivedDate?: string;
  supplier?: string;
  status?: "active" | "expired" | "depleted";
}

export interface UpdateBatchPayload {
  status?: "active" | "expired" | "depleted";
  expiryDate?: string;
  supplier?: string;
}

export interface CreateAdminProductPayload {
  name: string;
  sku: string;
  description: string;
  shortDescription?: string;
  category: string;
  tags: string[];
  sellingPrice: number;
  originalPrice?: number;
  costPrice?: number;
  unit: "kg" | "g" | "piece" | "bunch" | "pack" | "dozen" | "lb" | "oz";
  measurementUnit?:
    | "kg"
    | "g"
    | "piece"
    | "bunch"
    | "pack"
    | "dozen"
    | "lb"
    | "oz";
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  videos?: Array<{
    url: string;
    title?: string;
    duration?: number;
    isPrimary?: boolean;
  }>;
  features: string[];
  benefits: string[];
  marketingHooks: Array<{ label: string; isActive?: boolean }>;
  healthBenefits: Array<{ title: string; description?: string }>;
  nutrition: Array<{ label: string; value: string }>;
  shipping?: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    shelfLife?: string;
    storageCondition?: string;
    requiresRefrigeration?: boolean;
  };
  certifications: string[];
  isActive: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  batches: InventoryBatchPayload[];
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

export async function createCategoryForAdmin(
  payload: CreateCategoryPayload,
): Promise<ProductCategory> {
  const response = await apiClient.post<ApiSuccessResponse<ProductCategory>>(
    "/categories",
    {
      name: payload.name.trim(),
      isActive: true,
    },
  );

  if (!response.data.data) {
    throw new Error("Missing category response data");
  }

  return response.data.data;
}

export async function deleteAdminProduct(productId: string): Promise<void> {
  await apiClient.delete(`/products/${productId}`);
}

export async function updateAdminProductBatch(
  productId: string,
  batchId: string,
  payload: UpdateBatchPayload,
): Promise<AdminProduct> {
  const response = await apiClient.patch<ApiSuccessResponse<AdminProduct>>(
    `/products/${productId}/batches/${batchId}`,
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing updated product response data");
  }

  return response.data.data;
}

export async function deleteAdminProductBatch(
  productId: string,
  batchId: string,
): Promise<AdminProduct> {
  const response = await apiClient.delete<ApiSuccessResponse<AdminProduct>>(
    `/products/${productId}/batches/${batchId}`,
  );

  if (!response.data.data) {
    throw new Error("Missing updated product response data");
  }

  return response.data.data;
}

export async function deleteAdminProductImage(
  productId: string,
  url: string,
): Promise<AdminProduct> {
  const response = await apiClient.delete<ApiSuccessResponse<AdminProduct>>(
    `/products/${productId}/media`,
    {
      data: { type: "image", url },
    },
  );

  if (!response.data.data) {
    throw new Error("Missing updated product response data");
  }

  return response.data.data;
}

export async function uploadAdminProductMedia(
  productId: string,
  files: { images?: File[]; videos?: File[] },
): Promise<AdminProduct> {
  const formData = new FormData();

  for (const image of files.images ?? []) {
    formData.append("images", image);
  }

  for (const video of files.videos ?? []) {
    formData.append("videos", video);
  }

  const response = await apiClient.post<ApiSuccessResponse<AdminProduct>>(
    `/products/${productId}/media`,
    formData,
  );

  if (!response.data.data) {
    throw new Error("Missing updated product response data");
  }

  return response.data.data;
}

export async function createAdminProduct(
  payload: CreateAdminProductPayload,
  files?: {
    images?: File[];
    videos?: File[];
  },
): Promise<AdminProduct> {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));

  for (const image of files?.images ?? []) {
    formData.append("images", image);
  }

  for (const video of files?.videos ?? []) {
    formData.append("videos", video);
  }

  const response = await apiClient.post<ApiSuccessResponse<AdminProduct>>(
    "/products",
    formData,
  );

  if (!response.data.data) {
    throw new Error("Missing created product response data");
  }

  return response.data.data;
}

export function toAbsoluteMediaUrl(url?: string): string {
  if (!url) {
    return "/assets/products/placeholder.jpg";
  }

  // Keep same-origin paths so Next.js rewrites can proxy media in any env.
  if (url.startsWith("/")) {
    return url;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `/${url}`;
}
