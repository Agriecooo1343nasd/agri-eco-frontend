import { apiClient } from "./client";
import type { ApiPagination, ApiSuccessResponse } from "./types";

/** Public-facing fields only (no email/phone). */
export interface PublicAboutTeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  sortOrder: number;
}

export interface AdminAboutTeamMember extends PublicAboutTeamMember {
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AboutTeamMemberInput = {
  name: string;
  role: string;
  image: string;
  bio: string;
  email?: string | null;
  phone?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function fetchPublicAboutTeamMembers(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: PublicAboutTeamMember[]; pagination: ApiPagination }> {
  const query = buildQuery({
    page: params?.page ?? 1,
    limit: params?.limit ?? 100,
    sort: "sortOrder",
    order: "asc",
  });
  const response = await apiClient.get<
    ApiSuccessResponse<PublicAboutTeamMember[]>
  >(`/about-team-members${query}`);
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination!,
  };
}

export async function fetchAdminAboutTeamMembers(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: AdminAboutTeamMember[]; pagination: ApiPagination }> {
  const query = buildQuery({
    page: params?.page ?? 1,
    limit: params?.limit ?? 200,
    sort: "sortOrder",
    order: "asc",
  });
  const response = await apiClient.get<
    ApiSuccessResponse<AdminAboutTeamMember[]>
  >(`/about-team-members/admin${query}`);
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination!,
  };
}

export async function createAboutTeamMember(
  payload: AboutTeamMemberInput,
): Promise<AdminAboutTeamMember> {
  const response = await apiClient.post<
    ApiSuccessResponse<AdminAboutTeamMember>
  >("/about-team-members", payload);
  if (!response.data.data) throw new Error("Failed to create team member");
  return response.data.data;
}

export async function updateAboutTeamMember(
  id: string,
  payload: Partial<AboutTeamMemberInput>,
): Promise<AdminAboutTeamMember> {
  const response = await apiClient.put<
    ApiSuccessResponse<AdminAboutTeamMember>
  >(`/about-team-members/${id}`, payload);
  if (!response.data.data) throw new Error("Failed to update team member");
  return response.data.data;
}

export async function deleteAboutTeamMember(id: string): Promise<void> {
  await apiClient.delete(`/about-team-members/${id}`);
}
