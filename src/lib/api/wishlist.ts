import { apiClient } from "./client";
import type { ApiSuccessResponse, ApiPagination } from "./types";
import type { Product } from "@/components/ProductCard";

export interface BackendWishlistProduct {
  id: string;
  name: string;
  slug: string;
  sellingPrice: number;
  originalPrice?: number;
  images?: Array<{ url: string; isPrimary?: boolean }>;
  stock: number;
  isActive: boolean;
  averageRating?: number;
}

export interface BackendWishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  product?: BackendWishlistProduct;
}

export interface BackendWishlist {
  id: string;
  userId: string;
  items: BackendWishlistItem[];
  pagination?: ApiPagination;
}

/**
 * Maps a backend product from the wishlist to the frontend Product interface
 */
export function mapWishlistBackendToFrontendProduct(p: BackendWishlistProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.sellingPrice,
    oldPrice: p.originalPrice,
    image: p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url || "/assets/products/placeholder.jpg",
    rating: p.averageRating || 5,
    category: "Produce", // Default
    unit: "piece", // Default
    stock: p.stock,
  };
}

export async function fetchWishlist(query?: Record<string, unknown>): Promise<BackendWishlist> {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      params.append(key, String(value));
    });
  }
  const response = await apiClient.get<ApiSuccessResponse<BackendWishlist>>(`/wishlist${params.toString() ? `?${params.toString()}` : ""}`);
  return response.data.data!;
}

export async function toggleWishlistApi(productId: string): Promise<{ added: boolean; wishlist: BackendWishlist }> {
  const response = await apiClient.post<ApiSuccessResponse<{ added: boolean; wishlist: BackendWishlist }>>(`/wishlist/${productId}`);
  return response.data.data!;
}

export async function removeWishlistItemApi(productId: string): Promise<BackendWishlist> {
  const response = await apiClient.delete<ApiSuccessResponse<BackendWishlist>>(`/wishlist/${productId}`);
  return response.data.data!;
}

export async function clearWishlistApi(): Promise<void> {
  await apiClient.delete("/wishlist");
}
