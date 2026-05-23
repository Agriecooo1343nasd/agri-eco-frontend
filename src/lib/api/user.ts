import { apiClient } from "./client";
import type { ApiSuccessResponse, PaginatedResponse } from "./types";

export interface UserAddress {
  id: string;
  userId: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CustomerDashboardData {
  totalOrders: number;
  monthlyOrders: number;
  cartItems: number;
  addressCount: number;
  totalEnrollments: number;
  inProgressEnrollments: number;
  certificateCount: number;
  upcomingTours: number;
  recentOrders: any[]; // Can be further typed if needed
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
}

export interface UserRequest {
  id: string;
  type: "school_visit" | "partnership" | "artisan";
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export async function fetchCustomerDashboard(): Promise<CustomerDashboardData> {
  const response = await apiClient.get<ApiSuccessResponse<CustomerDashboardData>>("/users/dashboard");
  return response.data.data!;
}

export async function updateProfile(data: UserProfileUpdate): Promise<any> {
  const response = await apiClient.patch<ApiSuccessResponse<any>>("/users/profile", data);
  return response.data.data;
}

export async function fetchMyAddresses(): Promise<UserAddress[]> {
  const response = await apiClient.get<ApiSuccessResponse<UserAddress[]>>("/users/addresses");
  return response.data.data!;
}

export async function addAddress(address: Partial<UserAddress>): Promise<UserAddress[]> {
  const response = await apiClient.post<ApiSuccessResponse<UserAddress[]>>("/users/addresses", address);
  return response.data.data!;
}

export async function updateAddress(addressId: string, address: Partial<UserAddress>): Promise<UserAddress[]> {
  const response = await apiClient.put<ApiSuccessResponse<UserAddress[]>>(`/users/addresses/${addressId}`, address);
  return response.data.data!;
}

export async function setDefaultAddress(addressId: string): Promise<UserAddress[]> {
  const response = await apiClient.patch<ApiSuccessResponse<UserAddress[]>>(`/users/addresses/${addressId}/default`);
  return response.data.data!;
}

export async function removeAddress(addressId: string): Promise<UserAddress[]> {
  const response = await apiClient.delete<ApiSuccessResponse<UserAddress[]>>(`/users/addresses/${addressId}`);
  return response.data.data!;
}

export async function fetchMyRequests(params: { type?: string; page?: number; limit?: number } = {}): Promise<PaginatedResponse<UserRequest>> {
  const response = await apiClient.get<PaginatedResponse<UserRequest>>("/users/my-requests", { params });
  return response.data;
}

export interface UserRoleStatus {
  activeRole: string;
  grantedRoles: string[];
  isCustomer: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  isArtisan: boolean;
  isDeliveryAgent: boolean;
  partner: {
    isPartner: boolean;
    partnerStatus: string | null;
    partnerId: string | null;
    hasPendingApplication: boolean;
    latestApplication: any | null;
  };
  artisan: {
    isArtisan: boolean;
    hasPendingApplication: boolean;
    latestApplication: any | null;
  };
}

export async function fetchMyRoleStatus(): Promise<UserRoleStatus> {
  const response = await apiClient.get<ApiSuccessResponse<UserRoleStatus>>("/users/me/role-status");
  return response.data.data!;
}
