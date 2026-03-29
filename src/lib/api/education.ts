import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export const toAbsoluteEducationImage = (path?: string) => {
  if (!path) return "/assets/education/placeholder.jpg";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${path.startsWith("/") ? "" : "/"}${path}`;
};

export interface MultiLangText {
  en: string;
  rw?: string;
  fr?: string;
  sw?: string;
}

export interface TrainingTopic {
  name: MultiLangText;
  description?: MultiLangText;
  sortOrder?: number;
}

export interface TrainingProgram {
  id: string;
  title: MultiLangText;
  slug: string;
  shortDescription?: MultiLangText;
  fullDescription: MultiLangText;
  heroImage?: string;
  coverImage?: string;
  type: "course" | "certification" | "workshop";
  level: "beginner" | "intermediate" | "advanced";
  status: "draft" | "upcoming" | "in_progress" | "completed" | "cancelled";
  priceRwf: number;
  durationWeeks: number;
  capacity: number;
  language: string;
  isPublished: boolean;
  isFeatured: boolean;
  curriculum: any[];
  topics: TrainingTopic[];
  instructorName?: string;
  instructorBio?: MultiLangText;
  requirements?: MultiLangText[];
  whatStudentsGet?: MultiLangText[];
  certificateTemplate?: {
    title?: MultiLangText;
    programName?: MultiLangText;
    description?: MultiLangText;
    signatoryName?: MultiLangText;
    signatoryTitle?: MultiLangText;
  };
  location?: string;
  averageRating: number;
  reviewCount: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTrainingProgram extends TrainingProgram {}

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
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface AdminTrainingEnrollment {
  id: string;
  userId: string;
  trainingProgramId: string;
  status: string;
  createdAt: string;
}

export interface AdminSchoolVisitSettings {
  id?: string;
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

export interface CreateAdminTrainingProgramPayload {
  title: MultiLangText;
  shortDescription?: MultiLangText;
  fullDescription: MultiLangText;
  heroImage?: string;
  coverImage?: string;
  type: "course" | "certification" | "workshop";
  level: "beginner" | "intermediate" | "advanced";
  status?: "draft" | "upcoming" | "in_progress" | "completed" | "cancelled";
  priceRwf: number;
  durationWeeks: number;
  capacity: number;
  language: string;
  isPublished: boolean;
  isFeatured: boolean;
  curriculum: any[];
  topics: { name: MultiLangText; sortOrder: number }[];
  instructorName?: string;
  instructorBio?: MultiLangText;
  requirements?: MultiLangText[];
  whatStudentsGet?: MultiLangText[];
  certificateTemplate?: {
    title?: MultiLangText;
    programName?: MultiLangText;
    description?: MultiLangText;
    signatoryName?: MultiLangText;
    signatoryTitle?: MultiLangText;
  };
  location?: string;
  startDate?: string;
}

export interface CreateTrainingEnrollmentPayload {
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface UpsertAdminSchoolVisitSettingsPayload extends Omit<
  AdminSchoolVisitSettings,
  "id"
> {}

export interface FetchTrainingProgramsParams {
  page?: number;
  limit?: number;
  search?: string;
  level?: "beginner" | "intermediate" | "advanced";
  type?: "course" | "certification" | "workshop";
  isFeatured?: "true" | "false";
  sort?: string;
  order?: "asc" | "desc";
}

export interface FetchTrainingProgramsResult {
  data: TrainingProgram[];
  pagination: ApiPagination;
}

function buildQuery(params: FetchTrainingProgramsParams): string {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.level) query.set("level", params.level);
  if (params.type) query.set("type", params.type);
  if (params.isFeatured) query.set("isFeatured", params.isFeatured);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export async function fetchTrainingPrograms(
  params: FetchTrainingProgramsParams,
): Promise<FetchTrainingProgramsResult> {
  const response = await apiClient.get<ApiSuccessResponse<TrainingProgram[]>>(
    `/training-programs${buildQuery(params)}`,
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


export async function fetchTrainingProgramBySlug(
  slug: string,
): Promise<TrainingProgram> {
  const response = await apiClient.get<ApiSuccessResponse<TrainingProgram>>(
    `/training-programs/slug/${slug}`,
  );

  if (!response.data.data) {
    throw new Error("Program not found");
  }

  return response.data.data;
}

export async function enrollInProgram(
  id: string,
  payload: CreateTrainingEnrollmentPayload,
): Promise<any> {
  const response = await apiClient.post<ApiSuccessResponse<any>>(
    `/training-programs/${id}/enroll`,
    payload,
  );
  if (!response.data.data && !response.data.success) {
    throw new Error(response.data.message || "Failed to enroll");
  }
  return response.data.data;
}

export interface TrainingEnrollment {
  id: string;
  userId: string;
  trainingProgramId: string;
  status: "pending" | "approved" | "rejected" | "completed";
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  trainingProgram: TrainingProgram;
}

export interface FetchMyEnrollmentsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected" | "completed";
  trainingProgramId?: string;
  search?: string;
  from?: string;
  to?: string;
  sort?: "createdAt" | "status" | "fullName";
  order?: "asc" | "desc";
}

export interface FetchMyEnrollmentsResult {
  data: TrainingEnrollment[];
  pagination: ApiPagination;
}

export async function fetchMyEnrollments(
  params?: FetchMyEnrollmentsParams,
): Promise<FetchMyEnrollmentsResult> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status) query.set("status", params.status);
  if (params?.trainingProgramId)
    query.set("trainingProgramId", params.trainingProgramId);
  if (params?.search) query.set("search", params.search);
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.sort) query.set("sort", params.sort);
  if (params?.order) query.set("order", params.order);

  const queryString = query.toString();
  const response = await apiClient.get<ApiSuccessResponse<TrainingEnrollment[]>>(
    `/training-programs/me/enrollments${queryString ? `?${queryString}` : ""}`,
  );
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination ?? {
      total: 0,
      page: 1,
      limit: params?.limit ?? 10,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}

export async function fetchCertificate(enrollmentId: string): Promise<any> {
  const response = await apiClient.get<ApiSuccessResponse<any>>(
    `/training-programs/me/enrollments/${enrollmentId}/certificate`,
  );
  if (!response.data.data) throw new Error("Certificate not found");
  return response.data.data;
}

/* ---------- Admin Functions ---------- */

export async function fetchAdminTrainingPrograms(
  params: FetchTrainingProgramsParams,
): Promise<FetchTrainingProgramsResult> {
  const response = await apiClient.get<ApiSuccessResponse<TrainingProgram[]>>(
    `/training-programs/admin/programs${buildQuery(params)}`,
  );
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination!,
  };
}

export async function fetchAdminTrainingProgramById(
  id: string,
): Promise<AdminTrainingProgram> {
  const response = await apiClient.get<
    ApiSuccessResponse<AdminTrainingProgram>
  >(`/training-programs/admin/programs/${id}`);
  if (!response.data.data) throw new Error("Program not found");
  return response.data.data;
}

export async function createAdminTrainingProgram(
  payload: CreateAdminTrainingProgramPayload,
): Promise<AdminTrainingProgram> {
  const response = await apiClient.post<
    ApiSuccessResponse<AdminTrainingProgram>
  >("/training-programs", payload);
  if (!response.data.data) throw new Error("Failed to create program");
  return response.data.data;
}

export async function updateAdminTrainingProgram(
  id: string,
  payload: Partial<CreateAdminTrainingProgramPayload>,
): Promise<AdminTrainingProgram> {
  const response = await apiClient.put<
    ApiSuccessResponse<AdminTrainingProgram>
  >(`/training-programs/${id}`, payload);
  if (!response.data.data) throw new Error("Failed to update program");
  return response.data.data;
}

export async function fetchAdminTrainingEnrollments(params: any): Promise<any> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.trainingProgramId) query.set("trainingProgramId", params.trainingProgramId);
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);

  const queryString = query.toString();
  const response = await apiClient.get<ApiSuccessResponse<any>>(
    `/training-programs/admin/enrollments${queryString ? `?${queryString}` : ""}`,
  );
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination!,
  };
}

export async function fetchAdminSchoolVisits(params: any): Promise<any> {
  const response = await apiClient.get<ApiSuccessResponse<AdminSchoolVisit[]>>(
    "/school-visits/admin",
  );
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination!,
  };
}

export async function fetchAdminSchoolVisitById(id: string): Promise<any> {
  const response = await apiClient.get<ApiSuccessResponse<any>>(`/school-visits/admin/${id}`);
  if (!response.data.data) throw new Error("School visit not found");
  return response.data.data;
}

export async function updateAdminSchoolVisitStatus(id: string, payload: { status: string; approvalNote?: string }): Promise<any> {
  const response = await apiClient.patch<ApiSuccessResponse<any>>(`/school-visits/admin/${id}/status`, payload);
  if (!response.data.data) throw new Error("Failed to update status");
  return response.data.data;
}

export async function fetchAdminSchoolVisitSettings(): Promise<AdminSchoolVisitSettings | null> {
  const response = await apiClient.get<
    ApiSuccessResponse<AdminSchoolVisitSettings>
  >("/school-visits/admin/settings");
  return response.data.data ?? null;
}

export async function updateAdminSchoolVisitSettings(
  payload: UpsertAdminSchoolVisitSettingsPayload,
): Promise<AdminSchoolVisitSettings> {
  const response = await apiClient.put<
    ApiSuccessResponse<AdminSchoolVisitSettings>
  >("/school-visits/admin/settings", payload);
  if (!response.data.data) throw new Error("Failed to update settings");
  return response.data.data;
}

export async function fetchAdminProgramStats(id: string): Promise<any> {
  const response = await apiClient.get<ApiSuccessResponse<any>>(
    `/training-programs/admin/programs/${id}/stats`,
  );
  if (!response.data.data) throw new Error("Stats not found");
  return response.data.data;
}

export async function toggleAdminTrainingProgramArchive(
  id: string,
): Promise<AdminTrainingProgram> {
  const response = await apiClient.patch<
    ApiSuccessResponse<AdminTrainingProgram>
  >(`/training-programs/admin/programs/${id}/archive`);
  if (!response.data.data) throw new Error("Failed to toggle archive");
  return response.data.data;
}

export async function deleteAdminTrainingProgram(id: string): Promise<void> {
  await apiClient.delete(`/training-programs/${id}`);
}

export interface CreateSchoolVisitPayload {
  institutionName: string;
  contactName: string;
  email: string;
  phone: string;
  studentCount: number;
  teacherCount?: number;
  preferredDate: string;
  curriculumGoals?: string;
  specialRequirements?: string;
}

export async function submitSchoolVisit(
  payload: CreateSchoolVisitPayload,
): Promise<any> {
  const response = await apiClient.post<ApiSuccessResponse<any>>(
    "/school-visits",
    payload,
  );
  if (!response.data.data)
    throw new Error(response.data.message || "Failed to submit visit");
  return response.data;
}
