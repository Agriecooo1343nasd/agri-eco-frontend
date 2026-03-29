import { apiClient } from "./client";
import type { ApiPagination, ApiSuccessResponse } from "./types";
import { toSiteRelativeMediaSrc } from "@/lib/media-url";

export interface GalleryCaption {
  en?: string;
  fr?: string;
  rw?: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  caption?: GalleryCaption;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryListResult {
  images: GalleryImage[];
  pagination: ApiPagination;
}

export async function fetchPublicGallery(params?: {
  page?: number;
  limit?: number;
}): Promise<GalleryListResult> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  const qs = q.toString();
  const response = await apiClient.get<ApiSuccessResponse<GalleryListResult>>(
    `/gallery${qs ? `?${qs}` : ""}`,
  );
  const data = response.data.data as GalleryListResult | undefined;
  return (
    data ?? {
      images: [],
      pagination: response.data.pagination ?? {
        total: 0,
        page: 1,
        limit: 24,
        pages: 1,
        hasNext: false,
        hasPrev: false,
      },
    }
  );
}

export async function fetchAdminGalleryAll(params?: {
  page?: number;
  limit?: number;
}): Promise<GalleryListResult> {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit ?? 200));
  const qs = q.toString();
  const response = await apiClient.get<ApiSuccessResponse<GalleryListResult>>(
    `/gallery/admin/all${qs ? `?${qs}` : ""}`,
  );
  const data = response.data.data as GalleryListResult | undefined;
  return (
    data ?? {
      images: [],
      pagination: response.data.pagination ?? {
        total: 0,
        page: 1,
        limit: 200,
        pages: 1,
        hasNext: false,
        hasPrev: false,
      },
    }
  );
}

export async function createGalleryImage(body: {
  imageUrl: string;
  thumbnailUrl?: string;
  caption?: GalleryCaption;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<GalleryImage> {
  const response = await apiClient.post<ApiSuccessResponse<GalleryImage>>(
    "/gallery",
    body,
  );
  if (!response.data.data) throw new Error("Gallery create failed");
  return response.data.data;
}

export async function updateGalleryImage(
  id: string,
  body: {
    imageUrl?: string;
    thumbnailUrl?: string;
    caption?: GalleryCaption;
    sortOrder?: number;
    isActive?: boolean;
  },
): Promise<GalleryImage> {
  const response = await apiClient.put<ApiSuccessResponse<GalleryImage>>(
    `/gallery/${id}`,
    body,
  );
  if (!response.data.data) throw new Error("Gallery update failed");
  return response.data.data;
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await apiClient.delete(`/gallery/${id}`);
}

/** Same-origin `/uploads/...` for Next/Image + rewrites (avoids remotePatterns for API host). */
export function galleryImageDisplayUrl(
  image: Pick<GalleryImage, "imageUrl" | "thumbnailUrl">,
): string {
  const raw = image.thumbnailUrl?.trim() || image.imageUrl;
  return toSiteRelativeMediaSrc(raw);
}
