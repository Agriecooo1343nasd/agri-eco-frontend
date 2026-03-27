import { apiClient } from "./client";
import type { ApiSuccessResponse } from "./types";
import type { Product } from "@/components/ProductCard";

export interface BackendCartProduct {
  id: string;
  name: string;
  slug: string;
  sellingPrice: number;
  images?: Array<{ url: string; isPrimary?: boolean }>;
  stock: number;
  isActive: boolean;
}

export interface BackendCartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: BackendCartProduct;
}

export interface BackendCart {
  id: string;
  userId: string;
  items: BackendCartItem[];
}

/**
 * Maps a backend product from the cart to the frontend Product interface
 */
export function mapBackendToFrontendProduct(p: BackendCartProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.sellingPrice,
    image: p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url || "/assets/products/placeholder.jpg",
    rating: 5, // Backend might not provide this in cart items, using default
    category: "Produce", // Default as not provided in specific cart return attributes
    unit: "piece", // Default
    stock: p.stock,
  };
}

export async function fetchCart(): Promise<BackendCart> {
  const response = await apiClient.get<ApiSuccessResponse<BackendCart>>("/cart");
  return response.data.data!;
}

export async function addToCartApi(productId: string, quantity: number = 1): Promise<BackendCart> {
  const response = await apiClient.post<ApiSuccessResponse<BackendCart>>("/cart", {
    productId,
    quantity,
  });
  return response.data.data!;
}

export async function updateCartItemApi(itemId: string, quantity: number): Promise<BackendCart> {
  const response = await apiClient.patch<ApiSuccessResponse<BackendCart>>(`/cart/${itemId}`, {
    quantity,
  });
  return response.data.data!;
}

export async function removeCartItemApi(itemId: string): Promise<BackendCart> {
  const response = await apiClient.delete<ApiSuccessResponse<BackendCart>>(`/cart/${itemId}`);
  return response.data.data!;
}

export async function clearCartApi(): Promise<void> {
  await apiClient.delete("/cart");
}
