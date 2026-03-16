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

export interface AdminExperience {
  id: string;
  slug: string;
  title: MultiLangText;
  type: ExperienceType;
  shortDescription: MultiLangText;
  fullOverview: MultiLangText;
  heroImage?: string;
  gallery: string[];
  highlights: string[];
  requirements: string[];
  inclusions: string[];
  priceRwf: number;
  pricePerGroupRwf: number;
  capacity: number;
  minParticipants: number;
  expectedDuration?: string;
  durationMinutes: number;
  destination?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  slots?: ExperienceSlot[];
}

export interface FetchAdminExperiencesParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ExperienceType;
  isFeatured?: "true" | "false";
  sort?: "priceRwf" | "capacity" | "createdAt";
  order?: "asc" | "desc";
}

export interface FetchAdminExperiencesResult {
  data: AdminExperience[];
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
  highlights?: string[];
  requirements?: string[];
  inclusions?: string[];
  priceRwf?: number;
  pricePerGroupRwf?: number;
  capacity?: number;
  minParticipants?: number;
  expectedDuration?: string;
  durationMinutes?: number;
  marketSector?: string;
  destination?: string;
  linkedAccommodationIds?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  seasonStart?: string;
  seasonEnd?: string;
  languageSupport?: string[];
}

function buildQuery(params: FetchAdminExperiencesParams): string {
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

export async function fetchAdminExperiences(
  params: FetchAdminExperiencesParams,
): Promise<FetchAdminExperiencesResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminExperience[]>>(
    `/experiences/admin${buildQuery(params)}`,
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

export async function deleteAdminExperience(id: string): Promise<void> {
  await apiClient.delete(`/experiences/${id}`);
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
