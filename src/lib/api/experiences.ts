import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export interface MultiLangText {
  en: string;
  rw?: string;
  fr?: string;
  sw?: string;
}

export interface ExperienceSlot {
  id: string;
  date: string;
  timeSlot: string;
  capacity: number;
  bookedParticipants: number;
  waitlistedParticipants: number;
  isClosed: boolean;
}

export type ExperienceType =
  | "beekeeping"
  | "harvesting"
  | "farm_tour"
  | "cultural"
  | "educational"
  | "workshop"
  | "farm_stay";

export interface Experience {
  id: string;
  slug: string;
  title: MultiLangText;
  type: ExperienceType;
  shortDescription: MultiLangText;
  fullOverview: MultiLangText;
  cancellationPolicy?: MultiLangText;
  heroImage?: string;
  gallery: string[];
  highlights: Array<MultiLangText | string>;
  requirements: Array<MultiLangText | string>;
  inclusions: Array<MultiLangText | string>;
  priceRwf: number;
  pricePerGroupRwf: number;
  capacity: number;
  minParticipants: number;
  expectedDuration?: string;
  durationMinutes: number;
  marketSector?: string;
  destination?: string;
  linkedAccommodationIds: string[];
  averageRating: number;
  reviewCount: number;
  availabilityStatus: "available" | "limited" | "sold_out" | "upcoming";
  isActive: boolean;
  isFeatured: boolean;
  seasonStart?: string;
  seasonEnd?: string;
  languageSupport: string[];
  createdAt: string;
  updatedAt?: string;
  slots?: ExperienceSlot[];
}

export interface AdminExperience extends Experience {}

export interface FetchExperiencesParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ExperienceType;
  isFeatured?: "true" | "false";
  sort?: string;
  order?: "asc" | "desc";
}

export interface FetchExperiencesResult {
  data: Experience[];
  pagination: ApiPagination;
}

export interface CreateAdminExperiencePayload {
  title: MultiLangText;
  type: ExperienceType;
  shortDescription: MultiLangText;
  fullOverview: MultiLangText;
  cancellationPolicy?: MultiLangText;
  heroImage?: string;
  gallery?: string[];
  highlights?: Array<MultiLangText | string>;
  requirements?: Array<MultiLangText | string>;
  inclusions?: Array<MultiLangText | string>;
  priceRwf?: number;
  pricePerGroupRwf?: number;
  capacity?: number;
  minParticipants?: number;
  expectedDuration?: string;
  durationMinutes?: number;
  marketSector?: string;
  destination?: string;
  linkedAccommodationIds?: string[];
  availabilityStatus?: "available" | "limited" | "sold_out" | "upcoming";
  isActive?: boolean;
  isFeatured?: boolean;
  seasonStart?: string;
  seasonEnd?: string;
  languageSupport?: string[];
}

function buildQuery(params: FetchExperiencesParams): string {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.type) query.set("type", params.type);
  if (params.isFeatured) query.set("isFeatured", params.isFeatured);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

/* ---------- Public Functions ---------- */

export async function fetchExperiences(
  params: FetchExperiencesParams,
): Promise<FetchExperiencesResult> {
  const response = await apiClient.get<ApiSuccessResponse<Experience[]>>(
    `/experiences${buildQuery(params)}`,
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

export async function fetchExperienceBySlug(slug: string): Promise<Experience> {
  const response = await apiClient.get<ApiSuccessResponse<Experience>>(
    `/experiences/slug/${slug}`,
  );

  if (!response.data.data) {
    throw new Error("Experience not found");
  }

  return response.data.data;
}

/* ---------- Admin Functions ---------- */

export async function fetchAdminExperiences(
  params: FetchExperiencesParams,
): Promise<FetchExperiencesResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminExperience[]>>(
    `/experiences/admin${buildQuery(params)}`,
  );

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination!,
  };
}

export async function fetchAdminExperienceById(
  id: string,
): Promise<AdminExperience> {
  const response = await apiClient.get<ApiSuccessResponse<AdminExperience>>(
    `/experiences/admin/${id}`,
  );

  if (!response.data.data) {
    throw new Error("Experience not found");
  }

  return response.data.data;
}

export async function createAdminExperience(
  payload: CreateAdminExperiencePayload,
): Promise<AdminExperience> {
  const response = await apiClient.post<ApiSuccessResponse<AdminExperience>>(
    "/experiences",
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing created experience response data");
  }

  return response.data.data;
}

export async function updateAdminExperience(
  id: string,
  payload: Partial<CreateAdminExperiencePayload>,
): Promise<AdminExperience> {
  const response = await apiClient.put<ApiSuccessResponse<AdminExperience>>(
    `/experiences/${id}`,
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing updated experience response data");
  }

  return response.data.data;
}

export async function deleteAdminExperience(id: string): Promise<void> {
  await apiClient.delete(`/experiences/${id}`);
}

export async function cancelAdminExperience(
  id: string,
  reason?: string,
): Promise<AdminExperience> {
  const response = await apiClient.patch<ApiSuccessResponse<AdminExperience>>(
    `/experiences/admin/${id}/cancel`,
    { reason },
  );
  if (!response.data.data) {
    throw new Error("Failed to cancel experience");
  }
  return response.data.data;
}

/* ---------- Admin: Slot Management ---------- */

export async function createExperienceSlot(
  experienceId: string,
  payload: { date: string; timeSlot: string; capacity: number },
): Promise<ExperienceSlot> {
  const response = await apiClient.post<ApiSuccessResponse<ExperienceSlot>>(
    `/experiences/admin/${experienceId}/slots`,
    payload,
  );
  if (!response.data.data) {
    throw new Error("Failed to create slot");
  }
  return response.data.data;
}

export async function updateExperienceSlot(
  experienceId: string,
  slotId: string,
  payload: Partial<{ date: string; timeSlot: string; capacity: number; isClosed: boolean }>,
): Promise<ExperienceSlot> {
  const response = await apiClient.patch<ApiSuccessResponse<ExperienceSlot>>(
    `/experiences/admin/${experienceId}/slots/${slotId}`,
    payload,
  );
  if (!response.data.data) {
    throw new Error("Failed to update slot");
  }
  return response.data.data;
}

export async function deleteExperienceSlot(
  experienceId: string,
  slotId: string,
): Promise<void> {
  await apiClient.delete(`/experiences/admin/${experienceId}/slots/${slotId}`);
}

/* ---------- Asset Helpers ---------- */

export function toAbsoluteExperienceImage(url?: string): string {
  if (!url) {
    return "/assets/tours/farm-tour.jpg";
  }

  if (url.startsWith("/")) {
    return url;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `/${url}`;
}
