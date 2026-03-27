import { apiClient } from "./client";
import type { ApiPagination, ApiSuccessResponse } from "./types";
import { OrderStatus, PaymentStatus } from "@/constants/order-status"; // Assuming we can share these or we define them

export interface OrderShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  shippingAddress: OrderShippingAddress;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus | string;
  paymentStatus: PaymentStatus | string;
  paymentMethod: string;
  customerNote?: string;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface PlaceOrderPayload {
  shippingAddress: OrderShippingAddress;
  paymentMethod: string;
  notes?: string;
  discountCode?: string;
  shippingCost?: number;
  tax?: number;
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<Order> {
  const response = await apiClient.post<ApiSuccessResponse<Order>>("/orders", payload);
  return response.data.data!;
}

export interface FetchOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  order?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

export async function fetchMyOrders(params: FetchOrdersParams = {}): Promise<{ data: Order[], pagination: ApiPagination }> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "All") query.set("status", params.status);
  if (params.sort) query.set("sort", params.sort);
  if (params.order) query.set("order", params.order);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  
  const response = await apiClient.get<ApiSuccessResponse<Order[]>>(`/orders/my-orders?${query.toString()}`);
  return {
    data: response.data.data!,
    pagination: response.data.pagination!
  };
}

export async function fetchOrderById(id: string): Promise<Order> {
  const response = await apiClient.get<ApiSuccessResponse<Order>>(`/orders/my-orders/${id}`);
  return response.data.data!;
}

/**
 * Fetches an order by its human-readable order number (e.g. ORD-202403-XXXX)
 * Uses the search query on my-orders to find the specific order.
 */
export async function fetchOrderByNumber(orderNumber: string): Promise<Order | null> {
  const response = await apiClient.get<ApiSuccessResponse<Order[]>>("/orders/my-orders", {
    params: { search: orderNumber }
  });
  const orders = response.data.data || [];
  // Ensure strict match on orderNumber
  return orders.find(o => o.orderNumber === orderNumber) || null;
}

export async function initiatePayment(orderId: string, provider: string, method: string): Promise<any> {
    const response = await apiClient.post<ApiSuccessResponse<any>>("/payment/initiate", {
        orderId,
        provider,
        method
    });
    return response.data.data!;
}
