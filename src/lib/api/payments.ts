import { apiClient } from "./client";
import type { ApiPagination, ApiSuccessResponse } from "./types";

export type PaymentProvider = "mtn" | "airtel";

export type PaymentTransactionStatus =
  | "initiated"
  | "pending"
  | "success"
  | "failed"
  | "refunded";

export interface InitiatePaymentPayload {
  provider: PaymentProvider;
  method: "mobile_money";
  phone: string;
  currency?: string;
  amount?: number;
  orderId?: string;
  bookingId?: string;
  trainingEnrollmentId?: string;
  schoolVisitId?: string;
  payload?: Record<string, unknown>;
}

export interface InitiatePaymentResult {
  id: string;
  reference: string;
  status: PaymentTransactionStatus;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  method: string;
  orderId?: string;
  bookingId?: string;
  trainingEnrollmentId?: string;
  schoolVisitId?: string;
  externalTransId?: string;
  orderCompleted?: boolean;
  bookingCompleted?: boolean;
  trainingEnrollmentCompleted?: boolean;
  schoolVisitCompleted?: boolean;
  paidAt?: string;
}

export interface PaymentTransaction {
  id: string;
  userId?: string;
  reference: string;
  provider: PaymentProvider | "manual";
  method: string;
  status: PaymentTransactionStatus;
  currency: string;
  amount: number;
  orderId?: string;
  bookingId?: string;
  trainingEnrollmentId?: string;
  schoolVisitId?: string;
  payload?: Record<string, unknown>;
  response?: Record<string, unknown>;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAdminStats {
  total: number;
  success: number;
  failed: number;
  pending: number;
  totalRevenue: number;
  byProvider: Array<{ provider: string; count: string; total: string }>;
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function initiatePayment(
  payload: InitiatePaymentPayload,
): Promise<InitiatePaymentResult> {
  const response = await apiClient.post<ApiSuccessResponse<InitiatePaymentResult>>(
    "/payments/initiate",
    payload,
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to initiate payment");
  }
  return response.data.data;
}

export async function fetchMyPayments(params: {
  page?: number;
  limit?: number;
  status?: PaymentTransactionStatus;
} = {}): Promise<{ data: PaymentTransaction[]; pagination: ApiPagination }> {
  const response = await apiClient.get<ApiSuccessResponse<PaymentTransaction[]>>(
    `/payments/my${buildQuery(params)}`,
  );
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination!,
  };
}

export async function fetchAdminPayments(params: {
  page?: number;
  limit?: number;
  status?: PaymentTransactionStatus | "all";
  provider?: PaymentProvider | "all";
  search?: string;
  from?: string;
  to?: string;
  sort?: string;
  order?: "asc" | "desc";
} = {}): Promise<{ data: PaymentTransaction[]; pagination: ApiPagination }> {
  const query = buildQuery({
    page: params.page,
    limit: params.limit,
    status: params.status && params.status !== "all" ? params.status : undefined,
    provider: params.provider && params.provider !== "all" ? params.provider : undefined,
    search: params.search,
    from: params.from,
    to: params.to,
    sort: params.sort,
    order: params.order,
  });
  const response = await apiClient.get<ApiSuccessResponse<PaymentTransaction[]>>(
    `/payments/admin${query}`,
  );
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination!,
  };
}

export async function fetchAdminPaymentById(id: string): Promise<PaymentTransaction> {
  const response = await apiClient.get<ApiSuccessResponse<PaymentTransaction>>(
    `/payments/admin/${id}`,
  );
  if (!response.data.data) throw new Error("Payment not found");
  return response.data.data;
}

export async function fetchAdminPaymentStats(): Promise<PaymentAdminStats> {
  const response = await apiClient.get<ApiSuccessResponse<PaymentAdminStats>>(
    "/payments/admin/stats",
  );
  return response.data.data!;
}

/** Normalize Rwanda phone for API (backend validates with isValidRwandaMobile). */
export function normalizeRwandaPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("250") && digits.length >= 12) return digits;
  if (digits.startsWith("07") && digits.length === 10) return `25${digits}`;
  if (digits.startsWith("7") && digits.length === 9) return `250${digits}`;
  return digits;
}

export function isPaymentSuccessful(result: InitiatePaymentResult): boolean {
  return result.status === "success";
}
