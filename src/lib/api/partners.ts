import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export type AdminPartnerStatus = "pending" | "active" | "inactive";
export type AdminPartnerType = "tourism_operator" | "school" | "hospitality" | "business" | "ngo";

export interface PartnerSocialLinks {
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface AdminPartner {
  id: string;
  name: string;
  type: AdminPartnerType;
  contactName: string;
  email: string;
  phone?: string;
  status: AdminPartnerStatus;
  revenueShareRate?: number;
  notes?: string;
  isFeatured?: boolean;
  tagline?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  gallery?: string[];
  city?: string;
  country?: string;
  address?: string;
  location?: string;
  services?: string[];
  certifications?: string[];
  referenceUrls?: string[];
  socialLinks?: PartnerSocialLinks;
  foundedYear?: number;
  teamSize?: string;
  registrationNumber?: string;
  website?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type AdminPartnerApplicationStatus = "pending" | "approved" | "rejected";

export interface AdminPartnerApplication {
  id: string;
  businessName: string;
  businessType: AdminPartnerType;
  contactName: string;
  email: string;
  phone?: string;
  description?: string;
  publicDescription?: string;
  internalMessage?: string;
  location?: string;
  tagline?: string;
  aboutCompany?: string;
  logo?: string;
  coverImage?: string;
  gallery?: string[];
  foundedYear?: number;
  city?: string;
  country?: string;
  address?: string;
  services?: string[];
  certifications?: string[];
  socialLinks?: PartnerSocialLinks;
  registrationNumber?: string;
  website?: string;
  teamSize?: string;
  agreedToTerms?: boolean;
  referenceUrls?: string[];
  status: AdminPartnerApplicationStatus;
  reviewNote?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPartnerStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  totalRevenue: number;
  pendingPayouts: number;
  totalBookings: number;
  agreements?: {
    active: number;
    expired: number;
    terminated: number;
  };
}

export interface UpsertAdminPartnerPayload {
  name: string;
  type: AdminPartnerType;
  contactName: string;
  email: string;
  phone?: string;
  status?: AdminPartnerStatus;
  revenueShareRate?: number;
  notes?: string;
  tagline?: string;
  logo?: string;
  city?: string;
  country?: string;
  address?: string;
  location?: string;
  socialLinks?: PartnerSocialLinks;
  foundedYear?: number;
  teamSize?: string;
  registrationNumber?: string;
  isPublic?: boolean;
}

export interface FetchAdminPartnersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminPartnerStatus;
  type?: AdminPartnerType;
  sort?: "name" | "type" | "status" | "createdAt";
  order?: "asc" | "desc";
}

export interface FetchAdminPartnersResult {
  data: AdminPartner[];
  pagination: ApiPagination;
}

export interface FetchAdminPartnerApplicationsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminPartnerApplicationStatus;
  sort?: "businessName" | "createdAt";
  order?: "asc" | "desc";
}

export interface FetchAdminPartnerApplicationsResult {
  data: AdminPartnerApplication[];
  pagination: ApiPagination;
}

export interface ReviewAdminPartnerApplicationPayload {
  status: "approved" | "rejected";
  reviewNote?: string;
}

export type AdminPartnerAgreementStatus = "active" | "expired" | "terminated";
export type AdminPartnerAgreementPayoutCycle = "monthly" | "quarterly" | "biannual" | "annual";

export interface AdminPartnerAgreement {
  id: string;
  partnerId: string;
  title: string;
  description?: string;
  version: string;
  effectiveDate: string;
  endDate: string;
  termsSummary?: string;
  status: AdminPartnerAgreementStatus;
  payoutCycle: AdminPartnerAgreementPayoutCycle;
  commissionRate: number;
  platformShareRate: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertAdminPartnerAgreementPayload {
  title: string;
  description?: string;
  version: string;
  effectiveDate: string;
  endDate: string;
  termsSummary?: string;
  status?: AdminPartnerAgreementStatus;
  payoutCycle: AdminPartnerAgreementPayoutCycle;
  commissionRate: number;
  platformShareRate: number;
}

export interface FetchAdminPartnerCommissionsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "paid" | "cancelled";
  sort?: "createdAt" | "commissionAmount" | "status" | "dueDate";
  order?: "asc" | "desc";
}

export interface FetchAdminPartnerCommissionsResult {
  data: Array<{
    id: string;
    partnerId: string;
    grossAmount: number;
    commissionAmount: number;
    status: "pending" | "approved" | "paid" | "cancelled";
    dueDate?: string;
    paidAt?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
  }>;
  pagination: ApiPagination;
  summary: { total: number; pending: number; paid: number };
}

export type AdminAgreementPayoutStatus = "pending" | "paid";

export interface AdminAgreementPayout {
  id: string;
  agreementId: string;
  partnerId: string;
  amount: number;
  period: string;
  date: string;
  status: AdminAgreementPayoutStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchAdminAgreementPaymentsParams {
  page?: number;
  limit?: number;
  status?: AdminAgreementPayoutStatus;
  sort?: "date" | "createdAt" | "amount";
  order?: "asc" | "desc";
}

export interface FetchAdminAgreementPaymentsResult {
  data: AdminAgreementPayout[];
  pagination: ApiPagination;
  summary: { totalPaid: number; records: number; payoutCycle?: AdminPartnerAgreementPayoutCycle };
}

export interface CreateAdminAgreementPayoutPayload {
  amount: number;
  period: string;
  date: string;
  status?: AdminAgreementPayoutStatus;
  notes?: string;
}

export type AdminAgreementInputType = "financial" | "in_kind";
export type AdminAgreementInputCategory = "capital" | "operations" | "marketing" | "logistics";

export interface AdminAgreementInput {
  id: string;
  agreementId: string;
  partnerId: string;
  description: string;
  date: string;
  type: AdminAgreementInputType;
  category: AdminAgreementInputCategory;
  amount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FetchAdminAgreementInputsParams {
  page?: number;
  limit?: number;
  sort?: "date" | "createdAt";
  order?: "asc" | "desc";
}

export interface FetchAdminAgreementInputsResult {
  data: AdminAgreementInput[];
  pagination: ApiPagination;
  summary: { financialSupport: number; totalInputs: number; inputMix: Record<string, number> };
}

export interface CreateAdminAgreementInputPayload {
  description: string;
  date: string;
  type: AdminAgreementInputType;
  category: AdminAgreementInputCategory;
  amount: number;
  notes?: string;
}

function buildQuery(params: any): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function defaultPagination(limit = 10): ApiPagination {
  return { total: 0, page: 1, limit, pages: 1, hasNext: false, hasPrev: false };
}

// Public API
export interface FetchPublicPartnersParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  featured?: "true" | "false";
  sort?: string;
  order?: "asc" | "desc";
}

export async function fetchPublicPartners(params: FetchPublicPartnersParams = {}): Promise<FetchAdminPartnersResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminPartner[]>>(`/partners/public${buildQuery(params)}`);
  return { data: response.data.data ?? [], pagination: response.data.pagination ?? defaultPagination(params.limit ?? 10) };
}

export async function fetchPublicPartnerById(id: string): Promise<AdminPartner> {
  const response = await apiClient.get<ApiSuccessResponse<AdminPartner>>(`/partners/public/${id}`);
  if (!response.data.data) throw new Error("Partner not found");
  return response.data.data;
}

export async function submitPartnerApplication(payload: any): Promise<any> {
  const response = await apiClient.post<ApiSuccessResponse<any>>("/partners/apply", payload);
  return response.data;
}

// Admin API
export async function fetchAdminPartners(params: FetchAdminPartnersParams): Promise<FetchAdminPartnersResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminPartner[]>>(`/partners${buildQuery(params)}`);
  return { data: response.data.data ?? [], pagination: response.data.pagination ?? defaultPagination(params.limit ?? 10) };
}

export async function fetchAdminPartnerById(partnerId: string): Promise<AdminPartner> {
  const response = await apiClient.get<ApiSuccessResponse<AdminPartner>>(`/partners/${partnerId}`);
  if (!response.data.data) throw new Error("Partner not found");
  return response.data.data;
}

export async function createAdminPartner(payload: UpsertAdminPartnerPayload): Promise<AdminPartner> {
  const response = await apiClient.post<ApiSuccessResponse<AdminPartner>>("/partners", payload);
  if (!response.data.data) throw new Error("Missing created partner response data");
  return response.data.data;
}

export async function updateAdminPartner(partnerId: string, payload: Partial<UpsertAdminPartnerPayload>): Promise<AdminPartner> {
  const response = await apiClient.put<ApiSuccessResponse<AdminPartner>>(`/partners/${partnerId}`, payload);
  if (!response.data.data) throw new Error("Missing updated partner response data");
  return response.data.data;
}

export async function deleteAdminPartner(id: string): Promise<void> {
  await apiClient.delete(`/partners/${id}`);
}

export async function terminateAdminPartner(partnerId: string, notes?: string): Promise<AdminPartner> {
  const response = await apiClient.patch<ApiSuccessResponse<AdminPartner>>(`/partners/${partnerId}/terminate`, notes?.trim() ? { notes: notes.trim() } : {});
  if (!response.data.data) throw new Error("Missing terminated partner response data");
  return response.data.data;
}

export async function fetchAdminPartnerStats(): Promise<AdminPartnerStats> {
  const response = await apiClient.get<ApiSuccessResponse<AdminPartnerStats>>("/partners/stats");
  return response.data.data ?? { total: 0, active: 0, pending: 0, inactive: 0, totalRevenue: 0, pendingPayouts: 0, totalBookings: 0, agreements: { active: 0, expired: 0, terminated: 0 } };
}

export async function fetchAdminPartnerApplications(params: FetchAdminPartnerApplicationsParams): Promise<FetchAdminPartnerApplicationsResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminPartnerApplication[]>>(`/partners/applications${buildQuery(params)}`);
  return { data: response.data.data ?? [], pagination: response.data.pagination ?? defaultPagination(params.limit ?? 10) };
}

export async function fetchAdminPartnerApplicationById(applicationId: string): Promise<AdminPartnerApplication> {
  const response = await apiClient.get<ApiSuccessResponse<AdminPartnerApplication>>(`/partners/applications/${applicationId}`);
  if (!response.data.data) throw new Error("Application not found");
  return response.data.data;
}

export async function reviewAdminPartnerApplication(applicationId: string, payload: ReviewAdminPartnerApplicationPayload): Promise<AdminPartnerApplication> {
  const response = await apiClient.patch<ApiSuccessResponse<AdminPartnerApplication>>(`/partners/applications/${applicationId}/review`, payload);
  if (!response.data.data) throw new Error("Missing reviewed partner application response data");
  return response.data.data;
}

export async function fetchAdminPartnerCommissions(partnerId: string, params: FetchAdminPartnerCommissionsParams): Promise<FetchAdminPartnerCommissionsResult> {
  const response = await apiClient.get<ApiSuccessResponse<any>>(`/partners/${partnerId}/commissions${buildQuery(params)}`);
  const summary = (response.data.meta?.summary ?? {}) as any;
  return { data: response.data.data ?? [], pagination: response.data.pagination ?? defaultPagination(params.limit ?? 10), summary: { total: summary.total ?? 0, pending: summary.pending ?? 0, paid: summary.paid ?? 0 } };
}

export async function fetchAdminPartnerAgreements(partnerId: string): Promise<AdminPartnerAgreement[]> {
  const response = await apiClient.get<ApiSuccessResponse<AdminPartnerAgreement[]>>(`/partners/${partnerId}/agreements`);
  return response.data.data ?? [];
}

export async function createAdminPartnerAgreement(partnerId: string, payload: UpsertAdminPartnerAgreementPayload): Promise<AdminPartnerAgreement> {
  const response = await apiClient.post<ApiSuccessResponse<AdminPartnerAgreement>>(`/partners/${partnerId}/agreements`, payload);
  if (!response.data.data) throw new Error("Missing created partner agreement response data");
  return response.data.data;
}

export async function updateAdminPartnerAgreement(partnerId: string, agreementId: string, payload: Partial<UpsertAdminPartnerAgreementPayload>): Promise<AdminPartnerAgreement> {
  const response = await apiClient.put<ApiSuccessResponse<AdminPartnerAgreement>>(`/partners/${partnerId}/agreements/${agreementId}`, payload);
  if (!response.data.data) throw new Error("Missing updated partner agreement response data");
  return response.data.data;
}

export async function deleteAdminPartnerAgreement(partnerId: string, agreementId: string): Promise<void> {
  await apiClient.delete(`/partners/${partnerId}/agreements/${agreementId}`);
}

export async function fetchAdminAgreementPayments(partnerId: string, agreementId: string, params: FetchAdminAgreementPaymentsParams): Promise<FetchAdminAgreementPaymentsResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminAgreementPayout[]>>(`/partners/${partnerId}/agreements/${agreementId}/payments${buildQuery(params)}`);
  const summary = (response.data.meta?.summary ?? {}) as any;
  return { data: response.data.data ?? [], pagination: response.data.pagination ?? defaultPagination(params.limit ?? 10), summary: { totalPaid: summary.totalPaid ?? 0, records: summary.records ?? 0, payoutCycle: summary.payoutCycle } };
}

export async function createAdminAgreementPayout(partnerId: string, agreementId: string, payload: CreateAdminAgreementPayoutPayload): Promise<AdminAgreementPayout> {
  const response = await apiClient.post<ApiSuccessResponse<AdminAgreementPayout>>(`/partners/${partnerId}/agreements/${agreementId}/payments`, payload);
  if (!response.data.data) throw new Error("Missing created payout response data");
  return response.data.data;
}

export async function fetchAdminAgreementInputs(partnerId: string, agreementId: string, params: FetchAdminAgreementInputsParams): Promise<FetchAdminAgreementInputsResult> {
  const response = await apiClient.get<ApiSuccessResponse<AdminAgreementInput[]>>(`/partners/${partnerId}/agreements/${agreementId}/inputs${buildQuery(params)}`);
  const summary = (response.data.meta?.summary ?? {}) as any;
  return { data: response.data.data ?? [], pagination: response.data.pagination ?? defaultPagination(params.limit ?? 10), summary: { financialSupport: summary.financialSupport ?? 0, totalInputs: summary.totalInputs ?? 0, inputMix: summary.inputMix ?? {} } };
}

export async function createAdminAgreementInput(partnerId: string, agreementId: string, payload: CreateAdminAgreementInputPayload): Promise<AdminAgreementInput> {
  const response = await apiClient.post<ApiSuccessResponse<AdminAgreementInput>>(`/partners/${partnerId}/agreements/${agreementId}/inputs`, payload);
  if (!response.data.data) throw new Error("Missing created input response data");
  return response.data.data;
}

// Partner Self-Service API
export async function fetchPartnerMe(): Promise<any | null> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<any>>("/partners/me", { skipErrorToast: true } as any);
    if (!response.data.data) return null;
    const p = response.data.data;
    if (p.partner && p.summary) {
      return { ...p.partner, revenueSummary: { gross: p.summary.grossRevenue ?? 0, earnings: p.summary.totalEarnings ?? 0, pending: p.summary.pendingEarnings ?? 0, bookings: p.summary.bookings ?? 0 }, payoutCycle: p.summary.payoutCycle };
    }
    return p;
  } catch (e: any) {
    if (e.response?.status === 403 || e.response?.status === 404) return null;
    throw e;
  }
}

export async function fetchPartnerMyApplication(): Promise<any | null> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<any>>("/partners/me/application", { skipErrorToast: true } as any);
    return response.data.data ?? null;
  } catch { return null; }
}

export async function fetchPartnerAgreements(): Promise<any[]> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<any[]>>("/partners/me/agreements", { skipErrorToast: true } as any);
    return response.data.data ?? [];
  } catch { return []; }
}

export async function fetchPartnerAgreementById(agreementId: string): Promise<any> {
  const response = await apiClient.get<ApiSuccessResponse<any>>(`/partners/me/agreements/${agreementId}`);
  if (!response.data.data) throw new Error("Agreement not found");
  return response.data.data;
}

export async function fetchPartnerAgreementPayments(agreementId: string, params: FetchPartnerAgreementQueryParams): Promise<any> {
  const response = await apiClient.get<ApiSuccessResponse<any>>(`/partners/me/agreements/${agreementId}/payments${buildQuery(params)}`);
  return { data: response.data.data ?? [], pagination: response.data.pagination ?? defaultPagination(params.limit ?? 10), summary: response.data.meta?.summary ?? {} };
}

export async function fetchPartnerAgreementInputs(agreementId: string, params: FetchPartnerAgreementQueryParams): Promise<any> {
  const response = await apiClient.get<ApiSuccessResponse<any>>(`/partners/me/agreements/${agreementId}/inputs${buildQuery(params)}`);
  return { data: response.data.data ?? [], pagination: response.data.pagination ?? defaultPagination(params.limit ?? 10), summary: response.data.meta?.summary ?? {} };
}

export interface FetchPartnerAgreementQueryParams { page?: number; limit?: number; }
