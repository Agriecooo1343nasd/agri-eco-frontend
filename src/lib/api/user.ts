import { apiClient } from "./client";
import type { ApiSuccessResponse } from "./types";

export interface UserAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  isDefault: boolean;
}

export async function fetchMyAddresses(): Promise<UserAddress[]> {
  const response = await apiClient.get<ApiSuccessResponse<UserAddress[]>>("/users/addresses");
  return response.data.data!;
}

export async function addAddress(address: Omit<UserAddress, "id" | "userId" | "isDefault">): Promise<UserAddress> {
  const response = await apiClient.post<ApiSuccessResponse<UserAddress>>("/users/addresses", address);
  return response.data.data!;
}

export async function updateAddress(addressId: string, address: Partial<UserAddress>): Promise<UserAddress> {
  const response = await apiClient.put<ApiSuccessResponse<UserAddress>>(`/users/addresses/${addressId}`, address);
  return response.data.data!;
}

export async function setDefaultAddress(addressId: string): Promise<UserAddress> {
  const response = await apiClient.patch<ApiSuccessResponse<UserAddress>>(`/users/addresses/${addressId}/default`);
  return response.data.data!;
}

export async function removeAddress(addressId: string): Promise<void> {
  await apiClient.delete(`/users/addresses/${addressId}`);
}
