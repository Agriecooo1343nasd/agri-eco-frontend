import { apiClient } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/lib/api/types";
import type { Order } from "@/lib/api/orders";
import type { ReturnRecord } from "@/lib/api/returns";

export interface AgentDashboardData {
  stats: {
    totalAssigned: number;
    inTransit: number;
    deliveredToday: number;
    failedOrders: number;
    pendingPickups: number;
  };
  recentOrders: Order[];
  recentReturns: ReturnRecord[];
}

export async function fetchAgentDashboard(): Promise<AgentDashboardData> {
  const res = await apiClient.get<ApiSuccessResponse<AgentDashboardData>>("/agent/me/dashboard");
  return res.data.data!;
}

export async function fetchAgentOrders(query?: string): Promise<{ data: Order[]; pagination: any }> {
  const res = await apiClient.get<ApiSuccessResponse<Order[]>>(`/agent/me/orders${query ? `?${query}` : ""}`);
  return {
    data: res.data.data!,
    pagination: (res.data as any).pagination,
  };
}

export async function fetchAgentOrderById(id: string): Promise<Order> {
  // NOTE: This endpoint might need to be added by the backend dev.
  // Using the admin endpoint as a fallback if the agent has permissions, 
  // otherwise this will need a dedicated agent-specific detail route.
  const res = await apiClient.get<ApiSuccessResponse<Order>>(`/orders/admin/${id}`);
  return res.data.data!;
}

export async function updateAgentDeliveryStatus(
  id: string, 
  status: "picked_up" | "in_transit" | "failed",
  note?: string
): Promise<Order> {
  const res = await apiClient.patch<ApiSuccessResponse<Order>>(`/orders/${id}/agent/status`, {
    status,
    note
  });
  return res.data.data!;
}

export async function confirmAgentDelivery(
  id: string,
  qrPayload: string,
  proof?: { location?: { lat: number; lng: number }; note?: string }
): Promise<Order> {
  const res = await apiClient.post<ApiSuccessResponse<Order>>(`/orders/${id}/qr/confirm-delivery`, {
    qrPayload,
    proof
  });
  return res.data.data!;
}

export async function fetchAgentReturns(query?: string): Promise<{ data: ReturnRecord[]; pagination: any }> {
  const res = await apiClient.get<ApiSuccessResponse<ReturnRecord[]>>(`/agent/me/returns${query ? `?${query}` : ""}`);
  return {
    data: res.data.data!,
    pagination: (res.data as any).pagination,
  };
}

export async function fetchAgentReturnById(id: string): Promise<ReturnRecord> {
  // Using admin route for detail as agent specific one isn't clearly defined in agentRoutes
  const res = await apiClient.get<ApiSuccessResponse<ReturnRecord>>(`/returns/admin/${id}`);
  return res.data.data!;
}

export async function markReturnPickedUp(id: string, note?: string): Promise<ReturnRecord> {
  const res = await apiClient.patch<ApiSuccessResponse<ReturnRecord>>(`/returns/agent/${id}/picked-up`, {
    note
  });
  return res.data.data!;
}

export async function markReturnAtWarehouse(id: string, note?: string): Promise<ReturnRecord> {
  const res = await apiClient.patch<ApiSuccessResponse<ReturnRecord>>(`/returns/agent/${id}/returned-to-warehouse`, {
    note
  });
  return res.data.data!;
}
