import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

/* ─── Enums matching the backend model ─────────────────────── */
export type CmsPageType = "page" | "blog" | "resource";
export type CmsStatus = "draft" | "published" | "archived";

/* ─── Multi-language text shape ────────────────────────────── */
export interface MultiLangText {
  en: string;
  rw?: string;
  fr?: string;
  sw?: string;
}

/* ─── Nested objects returned by the API ───────────────────── */
export interface CmsAuthor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface CmsCategory {
  id: string;
  name: string;
  slug: string;
}

/* ─── Core CMS page record ──────────────────────────────────── */
export interface CmsPage {
  id: string;
  title: MultiLangText;
  slug: string;
  pageType: CmsPageType;
  excerpt?: MultiLangText;
  content: MultiLangText;
  status: CmsStatus;
  tags: string[];
  coverImage?: string;
  featured: boolean;
  readTime?: number;
  categoryId?: string;
  authorId?: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: CmsAuthor;
  category?: CmsCategory;
}

/* ─── Stats ─────────────────────────────────────────────────── */
export interface CmsStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  blogCount: number;
  featured: number;
}

/* ─── List params & result ──────────────────────────────────── */
export interface FetchAdminCmsPagesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CmsStatus;
  pageType?: CmsPageType;
  featured?: "true" | "false";
  categoryId?: string;
  sort?: "status" | "pageType" | "createdAt" | "featured";
  order?: "asc" | "desc";
}

export interface FetchAdminCmsPagesResult {
  data: CmsPage[];
  pagination: ApiPagination;
}

/* ─── Payload for create/update ────────────────────────────── */
export interface UpsertCmsPagePayload {
  title: MultiLangText;
  content: MultiLangText;
  excerpt?: MultiLangText;
  pageType?: CmsPageType;
  status?: CmsStatus;
  tags?: string[];
  coverImage?: string;
  featured?: boolean;
  categoryId?: string;
  authorId?: string;
  publishedAt?: string;
  scheduledAt?: string;
}

/* ─── Query builder ─────────────────────────────────────────── */
function buildQuery(params: FetchAdminCmsPagesParams): string {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.status) q.set("status", params.status);
  if (params.pageType) q.set("pageType", params.pageType);
  if (params.featured) q.set("featured", params.featured);
  if (params.categoryId) q.set("categoryId", params.categoryId);
  if (params.sort) q.set("sort", params.sort);
  if (params.order) q.set("order", params.order);
  const str = q.toString();
  return str ? `?${str}` : "";
}

function defaultPagination(limit = 10): ApiPagination {
  return { total: 0, page: 1, limit, pages: 1, hasNext: false, hasPrev: false };
}

/* ─── API functions ─────────────────────────────────────────── */

export async function fetchAdminCmsPages(
  params: FetchAdminCmsPagesParams = {},
): Promise<FetchAdminCmsPagesResult> {
  const response = await apiClient.get<ApiSuccessResponse<CmsPage[]>>(
    `/cms/admin${buildQuery(params)}`,
  );
  return {
    data: response.data.data ?? [],
    pagination:
      response.data.pagination ?? defaultPagination(params.limit ?? 10),
  };
}

export async function fetchAdminCmsPageById(id: string): Promise<CmsPage> {
  const response = await apiClient.get<ApiSuccessResponse<CmsPage>>(
    `/cms/admin/${id}`,
  );
  if (!response.data.data) throw new Error("CMS page not found");
  return response.data.data;
}

export async function createCmsPage(
  payload: UpsertCmsPagePayload,
): Promise<CmsPage> {
  const response = await apiClient.post<ApiSuccessResponse<CmsPage>>(
    "/cms",
    payload,
  );
  if (!response.data.data) throw new Error("Missing create response data");
  return response.data.data;
}

export async function updateCmsPage(
  id: string,
  payload: Partial<UpsertCmsPagePayload>,
): Promise<CmsPage> {
  const response = await apiClient.put<ApiSuccessResponse<CmsPage>>(
    `/cms/${id}`,
    payload,
  );
  if (!response.data.data) throw new Error("Missing update response data");
  return response.data.data;
}

export async function deleteCmsPage(id: string): Promise<void> {
  await apiClient.delete(`/cms/${id}`);
}

export async function fetchCmsStats(): Promise<CmsStats> {
  const response =
    await apiClient.get<ApiSuccessResponse<CmsStats>>("/cms/admin/stats");
  return (
    response.data.data ?? {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      blogCount: 0,
      featured: 0,
    }
  );
}
