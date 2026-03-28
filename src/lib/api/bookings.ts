import { apiClient } from "@/lib/api/client";
import type { ApiPagination, ApiSuccessResponse } from "@/lib/api/types";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "waitlisted";
export type BookingPaymentStatus = "pending" | "failed" | "paid" | "refunded";
export type BookingType = "individual" | "group";

export interface Booking {
  id: string;
  referenceNumber: string;
  experienceId: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  participants: number;
  bookingType: BookingType;
  date: string;
  timeSlot: string;
  specialRequirements?: string;
  status: BookingStatus;
  paymentStatus: BookingPaymentStatus;
  paymentMethod?: string;
  amountRwf: number;
  currency: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingPayload {
  experienceId: string;
  fullName: string;
  email: string;
  phone: string;
  participants: number;
  bookingType: BookingType;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  specialRequirements?: string;
  paymentMethod?: string;
  partnerId?: string;
  amountRwf?: number;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const response = await apiClient.post<ApiSuccessResponse<Booking>>("/bookings", payload);
  if (!response.data.data) {
    throw new Error("Failed to create booking");
  }
  return response.data.data;
}

export async function fetchMyBookings(): Promise<Booking[]> {
  const response = await apiClient.get<ApiSuccessResponse<Booking[]>>("/bookings/my");
  return response.data.data ?? [];
}

/* ---------- Admin ---------- */

export interface FetchAdminBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

export interface AdminBookingExperience {
  id: string;
  title: { en: string; rw?: string; fr?: string; sw?: string };
  slug: string;
  type: string;
  heroImage?: string;
  priceRwf: number;
}

export interface AdminBookingSlot {
  id: string;
  date: string;
  timeSlot: string;
  capacity: number;
  bookedParticipants: number;
}

export interface AdminBooking extends Booking {
  experience?: AdminBookingExperience;
  slot?: AdminBookingSlot;
}

export interface FetchAdminBookingsResult {
  data: AdminBooking[];
  pagination: ApiPagination;
}

export async function fetchAdminBookings(
  params: FetchAdminBookingsParams,
): Promise<FetchAdminBookingsResult> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status) query.set("status", params.status);
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);

  const qs = query.toString();
  const response = await apiClient.get<ApiSuccessResponse<AdminBooking[]>>(
    `/bookings/admin${qs ? `?${qs}` : ""}`,
  );
  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination ?? {
      total: 0, page: params.page ?? 1, limit: params.limit ?? 20,
      pages: 1, hasNext: false, hasPrev: false,
    },
  };
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  cancellationReason?: string,
): Promise<AdminBooking> {
  const response = await apiClient.patch<ApiSuccessResponse<AdminBooking>>(
    `/bookings/admin/${id}/status`,
    { status, ...(cancellationReason ? { cancellationReason } : {}) },
  );
  if (!response.data.data) throw new Error("Failed to update booking status");
  return response.data.data;
}
