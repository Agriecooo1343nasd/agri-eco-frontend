import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export interface MultiLangText {
  en: string;
  rw?: string;
  fr?: string;
  sw?: string;
}

export interface AdminTrainingTopic {
  name: MultiLangText;
  description?: MultiLangText;
  sortOrder?: number;
}

export interface CreateAdminTrainingProgramPayload {
  title: MultiLangText;
  shortDescription?: MultiLangText;
  fullDescription: MultiLangText;
  heroImage?: string;
  coverImage?: string;
  type: "course" | "certification" | "workshop";
  level: "beginner" | "intermediate" | "advanced";
  priceRwf: number;
  durationWeeks: number;
  capacity: number;
  language: string;
  isPublished: boolean;
  isFeatured: boolean;
  curriculum: Record<string, unknown>[];
  topics: AdminTrainingTopic[];
  startDate?: string;
  endDate?: string;
}

export interface AdminTrainingProgram {
  id: string;
  title: MultiLangText;
  shortDescription?: MultiLangText;
  type: "course" | "certification" | "workshop";
  level: "beginner" | "intermediate" | "advanced";
  priceRwf: number;
  durationWeeks: number;
  capacity: number;
  isPublished: boolean;
  isFeatured: boolean;
  startDate?: string;
  createdAt: string;
}

export interface AdminTrainingProgramDetail extends AdminTrainingProgram {
  fullDescription: MultiLangText;
  heroImage?: string | null;
  coverImage?: string | null;
  language: string;
  isFeatured: boolean;
  curriculum: Record<string, unknown>[];
  topics: AdminTrainingTopic[];
  endDate?: string;
}

export interface AdminTrainingEnrollment {
  id: string;
  trainingProgramId: string;
  status: "pending" | "approved" | "rejected" | "completed";
}

export interface AdminSchoolVisit {
  id: string;
  institutionName: string;
  contactName: string;
  email: string;
  phone: string;
  studentCount: number;
  teacherCount: number;
  preferredDate: string;
  curriculumGoals?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
}

export interface AdminSchoolVisitSettings {
  id: string;
  sectionHeading: MultiLangText;
  sectionSubheading: MultiLangText;
  inclusions: { text: MultiLangText; sortOrder: number }[];
  subjects: {
    name: MultiLangText;
    description?: MultiLangText;
    sortOrder: number;
  }[];
  gradeLevels: { label: MultiLangText; sortOrder: number }[];
  duration: string;
  pricePerStudent: number;
  minStudents: number;
  maxStudents: number;
  isActive: boolean;
  updatedAt: string;
}

export interface UpsertAdminSchoolVisitSettingsPayload {
  sectionHeading: MultiLangText;
  sectionSubheading: MultiLangText;
  inclusions: { text: MultiLangText; sortOrder: number }[];
  subjects: {
    name: MultiLangText;
    description?: MultiLangText;
    sortOrder: number;
  }[];
  gradeLevels: { label: MultiLangText; sortOrder: number }[];
  duration: string;
  pricePerStudent: number;
  minStudents: number;
  maxStudents: number;
  isActive: boolean;
}

interface ListResult<T> {
  data: T[];
  pagination: ApiPagination;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  }

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

const emptyPagination = (limit = 10): ApiPagination => ({
  total: 0,
  page: 1,
  limit,
  pages: 1,
  hasNext: false,
  hasPrev: false,
});

export async function fetchAdminTrainingPrograms(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "title" | "priceRwf" | "level" | "createdAt";
  order?: "asc" | "desc";
}): Promise<ListResult<AdminTrainingProgram>> {
  const response = await apiClient.get<
    ApiSuccessResponse<AdminTrainingProgram[]>
  >(
    `/training-programs/admin/programs${buildQuery({
      page: params?.page,
      limit: params?.limit,
      search: params?.search?.trim() || undefined,
      sort: params?.sort,
      order: params?.order,
    })}`,
  );

  return {
    data: response.data.data ?? [],
    pagination:
      response.data.pagination ?? emptyPagination(params?.limit ?? 100),
  };
}

export async function fetchAdminTrainingEnrollments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "pending" | "approved" | "rejected" | "completed";
  trainingProgramId?: string;
  sort?: "createdAt" | "status" | "fullName";
  order?: "asc" | "desc";
}): Promise<ListResult<AdminTrainingEnrollment>> {
  const response = await apiClient.get<
    ApiSuccessResponse<AdminTrainingEnrollment[]>
  >(
    `/training-programs/admin/enrollments${buildQuery({
      page: params?.page,
      limit: params?.limit,
      search: params?.search?.trim() || undefined,
      status: params?.status,
      trainingProgramId: params?.trainingProgramId,
      sort: params?.sort,
      order: params?.order,
    })}`,
  );

  return {
    data: response.data.data ?? [],
    pagination:
      response.data.pagination ?? emptyPagination(params?.limit ?? 100),
  };
}

export async function fetchAdminSchoolVisits(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "pending" | "approved" | "rejected" | "completed";
  sort?: "preferredDate" | "createdAt" | "institutionName";
  order?: "asc" | "desc";
}): Promise<ListResult<AdminSchoolVisit>> {
  const response = await apiClient.get<ApiSuccessResponse<AdminSchoolVisit[]>>(
    `/school-visits/admin${buildQuery({
      page: params?.page,
      limit: params?.limit,
      search: params?.search?.trim() || undefined,
      status: params?.status,
      sort: params?.sort,
      order: params?.order,
    })}`,
  );

  return {
    data: response.data.data ?? [],
    pagination:
      response.data.pagination ?? emptyPagination(params?.limit ?? 100),
  };
}

export async function createAdminTrainingProgram(
  payload: CreateAdminTrainingProgramPayload,
): Promise<AdminTrainingProgram> {
  const response = await apiClient.post<
    ApiSuccessResponse<AdminTrainingProgram>
  >("/training-programs", payload);

  if (!response.data.data) {
    throw new Error("Missing created training program response data");
  }

  return response.data.data;
}

export async function fetchAdminTrainingProgramById(
  id: string,
): Promise<AdminTrainingProgramDetail> {
  const response = await apiClient.get<
    ApiSuccessResponse<AdminTrainingProgramDetail>
  >(`/training-programs/admin/programs/${id}`);

  if (!response.data.data) {
    throw new Error("Training program not found");
  }

  return response.data.data;
}

export async function updateAdminTrainingProgram(
  id: string,
  payload: Partial<CreateAdminTrainingProgramPayload>,
): Promise<AdminTrainingProgramDetail> {
  const response = await apiClient.put<
    ApiSuccessResponse<AdminTrainingProgramDetail>
  >(`/training-programs/${id}`, payload);

  if (!response.data.data) {
    throw new Error("Missing updated training program response data");
  }

  return response.data.data;
}

export async function fetchAdminSchoolVisitSettings(): Promise<AdminSchoolVisitSettings | null> {
  const response = await apiClient.get<
    ApiSuccessResponse<AdminSchoolVisitSettings | null>
  >("/school-visits/admin/settings");

  return response.data.data ?? null;
}

export async function updateAdminSchoolVisitSettings(
  payload: UpsertAdminSchoolVisitSettingsPayload,
): Promise<AdminSchoolVisitSettings> {
  const response = await apiClient.put<
    ApiSuccessResponse<AdminSchoolVisitSettings>
  >("/school-visits/admin/settings", payload);

  if (!response.data.data) {
    throw new Error("Missing updated school visit settings response data");
  }

  return response.data.data;
}
