import { apiClient } from "./client";
import type { ApiPagination, ApiSuccessResponse } from "./types";

/* ─── Enums ─────────────────────────────────────────────── */

export enum ReturnStatus {
  PENDING_REVIEW = "pending_review",
  APPROVED = "approved",
  REJECTED = "rejected",
  PENDING_PICKUP = "pending_pickup",
  PICKED_UP = "picked_up",
  RETURNED_TO_WAREHOUSE = "returned_to_warehouse",
  REFUNDED = "refunded",
  CLOSED = "closed",
}

export enum ReturnReason {
  DAMAGED = "damaged",
  WRONG_ITEM = "wrong_item",
  NOT_AS_DESCRIBED = "not_as_described",
  EXPIRED = "expired",
  CHANGED_MIND = "changed_mind",
  OTHER = "other",
}

export enum AppealStatus {
  NONE = "none",
  PENDING = "pending",
  ACCEPTED = "accepted",
  DENIED = "denied",
}

/* ─── Types ─────────────────────────────────────────────── */

export interface ReturnItem {
  orderItemId: string;
  productId?: string | null;
  artisanProductId?: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface ReturnRecord {
  id: string;
  returnNumber: string;
  orderId: string;
  userId: string;
  reason: ReturnReason;
  description: string;
  evidenceImages: string[];
  items: ReturnItem[];
  status: ReturnStatus;

  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  rejectionReason?: string | null;

  appealStatus: AppealStatus;
  appealReason?: string | null;
  appealEvidenceImages: string[];
  appealResolvedBy?: string | null;
  appealResolvedAt?: string | null;
  appealResolutionNote?: string | null;

  deliveryAgentId?: string | null;
  pickupScheduledAt?: string | null;
  pickedUpAt?: string | null;
  warehouseReceivedAt?: string | null;

  refundAmount?: number | null;
  refundedAt?: string | null;

  createdAt: string;
  updatedAt: string;

  // Hydrated relations
  user?: { id: string; username?: string; firstName?: string; lastName?: string; email?: string };
  order?: { id: string; orderNumber: string };
  deliveryAgent?: { id: string; firstName?: string; lastName?: string; username?: string; email?: string };
  reviewer?: { id: string; username?: string; firstName?: string; lastName?: string };
}

export interface DeliveryAgent {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  phone?: string;
}

/* ─── Customer APIs ─────────────────────────────────────── */

export interface CreateReturnPayload {
  orderId: string;
  reason: ReturnReason;
  description: string;
  evidenceImages?: string[];
  items: Array<{
    orderItemId: string;
    productId?: string;
    artisanProductId?: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export async function createReturn(payload: CreateReturnPayload): Promise<ReturnRecord> {
  const res = await apiClient.post<ApiSuccessResponse<ReturnRecord>>("/returns", payload);
  return res.data.data!;
}

export async function fetchMyReturns(params: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<{ data: ReturnRecord[]; pagination: ApiPagination }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  const res = await apiClient.get<ApiSuccessResponse<ReturnRecord[]>>(`/returns/me?${query}`);
  return { data: res.data.data ?? [], pagination: res.data.pagination! };
}

export async function fetchMyReturnById(id: string): Promise<ReturnRecord> {
  const res = await apiClient.get<ApiSuccessResponse<ReturnRecord>>(`/returns/me/${id}`);
  return res.data.data!;
}

export async function appealReturn(id: string, payload: {
  reason: string;
  evidenceImages?: string[];
}): Promise<ReturnRecord> {
  const res = await apiClient.post<ApiSuccessResponse<ReturnRecord>>(`/returns/me/${id}/appeal`, payload);
  return res.data.data!;
}

/* ─── Admin APIs ────────────────────────────────────────── */

export interface FetchAdminReturnsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  from?: string;
  to?: string;
}

export async function fetchAdminReturns(params: FetchAdminReturnsParams = {}): Promise<{
  data: ReturnRecord[];
  pagination: ApiPagination;
}> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  const res = await apiClient.get<ApiSuccessResponse<ReturnRecord[]>>(`/returns/admin?${query}`);
  return { data: res.data.data ?? [], pagination: res.data.pagination! };
}

export async function fetchAdminReturnById(id: string): Promise<ReturnRecord> {
  const res = await apiClient.get<ApiSuccessResponse<ReturnRecord>>(`/returns/admin/${id}`);
  return res.data.data!;
}

export async function reviewAdminReturn(id: string, payload: {
  decision: "approved" | "rejected";
  reviewNote?: string;
  rejectionReason?: string;
  refundAmount?: number;
}): Promise<ReturnRecord> {
  const res = await apiClient.patch<ApiSuccessResponse<ReturnRecord>>(`/returns/admin/${id}/review`, payload);
  return res.data.data!;
}

export async function resolveAdminAppeal(id: string, payload: {
  decision: "accepted" | "denied";
  note?: string;
  refundAmount?: number;
}): Promise<ReturnRecord> {
  const res = await apiClient.patch<ApiSuccessResponse<ReturnRecord>>(`/returns/admin/${id}/appeal/resolve`, payload);
  return res.data.data!;
}

export async function assignReturnAgent(id: string, payload: {
  deliveryAgentId: string;
  pickupScheduledAt?: string;
  notes?: string;
}): Promise<ReturnRecord> {
  const res = await apiClient.patch<ApiSuccessResponse<ReturnRecord>>(`/returns/admin/${id}/assign-agent`, payload);
  return res.data.data!;
}

export async function markReturnRefunded(id: string): Promise<ReturnRecord> {
  const res = await apiClient.patch<ApiSuccessResponse<ReturnRecord>>(`/returns/admin/${id}/refunded`);
  return res.data.data!;
}

/* ─── Delivery Assignment APIs ──────────────────────────── */

export enum DeliveryAssignmentStatus {
  ASSIGNED = "assigned",
  PICKED_UP = "picked_up",
  IN_TRANSIT = "in_transit",
  DELIVERED = "delivered",
  RETURNED_TO_WAREHOUSE = "returned_to_warehouse",
  CANCELLED = "cancelled",
}

export enum DeliveryAssignmentTargetType {
  ORDER = "order",
  RETURN = "return",
}

export interface DeliveryAssignmentRecord {
  id: string;
  targetType: DeliveryAssignmentTargetType;
  targetId: string;
  targetReference: string;
  deliveryAgentId: string;
  assignedBy: string;
  status: DeliveryAssignmentStatus;
  notes?: string;
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  
  agent?: DeliveryAgent;
  target?: any; // Hydrated order or return
}

export async function fetchDeliveryAssignments(params: {
  page?: number;
  limit?: number;
  status?: string;
  targetType?: string;
  search?: string;
  deliveryAgentId?: string;
  from?: string;
  to?: string;
  sort?: string;
  order?: "asc" | "desc";
} = {}): Promise<{ data: DeliveryAssignmentRecord[]; pagination: ApiPagination }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.targetType && params.targetType !== "all") query.set("targetType", params.targetType);
  if (params.search) query.set("search", params.search);
  if (params.deliveryAgentId) query.set("deliveryAgentId", params.deliveryAgentId);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);

  const res = await apiClient.get<ApiSuccessResponse<DeliveryAssignmentRecord[]>>(`/delivery-assignments?${query}`);
  return { data: res.data.data ?? [], pagination: res.data.pagination! };
}

export async function cancelDeliveryAssignment(id: string, reason?: string): Promise<DeliveryAssignmentRecord> {
  const res = await apiClient.patch<ApiSuccessResponse<DeliveryAssignmentRecord>>(`/delivery-assignments/${id}/cancel`, { reason });
  return res.data.data!;
}

export async function fetchDeliveryAgents(): Promise<DeliveryAgent[]> {
  const res = await apiClient.get<ApiSuccessResponse<DeliveryAgent[]>>("/delivery-assignments/agents");
  return res.data.data ?? [];
}

export async function fetchDeliveryAssignmentStats(): Promise<{
  totalActive: number;
  byTargetType: Record<string, Record<string, number>>;
}> {
  const res = await apiClient.get<ApiSuccessResponse<any>>("/delivery-assignments/stats");
  return res.data.data!;
}
