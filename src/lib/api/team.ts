import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export type TeamMemberRole = "manager" | "member";
export type TeamMemberStatus = "invited" | "active" | "inactive";

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: TeamMemberRole;
  position?: string;
  department?: string;
  status: TeamMemberStatus;
  invitedBy?: string;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchTeamMembersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TeamMemberStatus;
  sort?: "firstName" | "lastName" | "email" | "status" | "createdAt";
  order?: "asc" | "desc";
}

export interface FetchTeamMembersResult {
  data: TeamMember[];
  pagination: ApiPagination;
}

export interface InviteTeamMemberPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: TeamMemberRole;
  position?: string;
  department?: string;
}

export interface TeamStats {
  total: number;
  active: number;
  invited: number;
  inactive: number;
}

function buildTeamMembersQuery(params: FetchTeamMembersParams): string {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.status) query.set("status", params.status);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function defaultPagination(limit = 10): ApiPagination {
  return {
    total: 0,
    page: 1,
    limit,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  };
}

export async function fetchTeamMembers(
  params: FetchTeamMembersParams,
): Promise<FetchTeamMembersResult> {
  const response = await apiClient.get<ApiSuccessResponse<TeamMember[]>>(
    `/team${buildTeamMembersQuery(params)}`,
  );

  return {
    data: response.data.data ?? [],
    pagination:
      response.data.pagination ?? defaultPagination(params.limit ?? 10),
  };
}

export async function inviteTeamMember(
  payload: InviteTeamMemberPayload,
): Promise<TeamMember> {
  const response = await apiClient.post<ApiSuccessResponse<TeamMember>>(
    "/team/invite",
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing invited team member response data");
  }

  return response.data.data;
}

export async function removeTeamMember(memberId: string): Promise<void> {
  await apiClient.delete(`/team/${memberId}`);
}

export async function resendTeamInvite(memberId: string): Promise<TeamMember> {
  const response = await apiClient.post<ApiSuccessResponse<TeamMember>>(
    `/team/${memberId}/resend-invite`,
  );

  if (!response.data.data) {
    throw new Error("Missing resend invite response data");
  }

  return response.data.data;
}

export async function fetchTeamStats(): Promise<TeamStats> {
  const response =
    await apiClient.get<ApiSuccessResponse<TeamStats>>("/team/stats");

  return (
    response.data.data ?? {
      total: 0,
      active: 0,
      invited: 0,
      inactive: 0,
    }
  );
}

export interface AcceptTeamInvitePayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AcceptTeamInviteResult {
  memberId: string;
}

export async function acceptTeamInvite(
  payload: AcceptTeamInvitePayload,
): Promise<AcceptTeamInviteResult> {
  const response = await apiClient.post<
    ApiSuccessResponse<AcceptTeamInviteResult>
  >("/team/accept-invite", payload);

  return response.data.data ?? { memberId: "" };
}
