import { apiClient } from "./client";
import type { ApiSuccessResponse, ApiPagination } from "./types";
import type { Product } from "@/components/ProductCard";
import { toSiteRelativeMediaSrc } from "@/lib/media-url";

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

export interface BackendWishlistArtisanProduct {
  id: string;
  name: string | Record<string, string>;
  price: number;
  image?: string;
  stock: number;
  isActive: boolean;
  artisan?: { id: string; name?: string | Record<string, string> };
}

export interface BackendWishlistItem {
  id: string;
  wishlistId: string;
  productId?: string | null;
  artisanProductId?: string | null;
  itemType?: "product" | "artisan_product";
  product?: BackendWishlistProduct;
  artisanProduct?: BackendWishlistArtisanProduct;
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
function pickLocalizedName(name: string | Record<string, string> | undefined): string {
  if (!name) return "Product";
  if (typeof name === "string") return name;
  return name.en || name.rw || name.fr || (Object.values(name)[0] as string) || "Product";
}

export function mapWishlistBackendToFrontendProduct(p: BackendWishlistProduct): Product {
  const primary =
    p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.sellingPrice,
    oldPrice: p.originalPrice,
    image: primary
      ? toSiteRelativeMediaSrc(primary)
      : "/assets/products/placeholder.jpg",
    rating: p.averageRating || 5,
    category: "Produce",
    unit: "piece",
    stock: p.stock,
  };
}

export function mapWishlistArtisanProductToFrontend(
  ap: BackendWishlistArtisanProduct,
): Product {
  return {
    id: ap.id,
    artisanProductId: ap.id,
    slug: `artisan-product-${ap.id}`,
    name: pickLocalizedName(ap.name),
    price: Number(ap.price),
    image: ap.image
      ? toSiteRelativeMediaSrc(ap.image)
      : "/assets/products/placeholder.jpg",
    rating: 5,
    category: pickLocalizedName(ap.artisan?.name as any) || "Artisan",
    unit: "piece",
    stock: ap.stock,
  };
}

export function mapWishlistItemToProduct(item: BackendWishlistItem): Product {
  const isArtisan =
    item.itemType === "artisan_product" ||
    (Boolean(item.artisanProductId) && Boolean(item.artisanProduct));
  if (isArtisan && item.artisanProduct) {
    return mapWishlistArtisanProductToFrontend(item.artisanProduct);
  }
  if (item.product) {
    return mapWishlistBackendToFrontendProduct(item.product);
  }
  return {
    id: item.productId || item.artisanProductId || item.id,
    slug: "unknown",
    name: "Product",
    price: 0,
    image: "/assets/products/placeholder.jpg",
    rating: 5,
    category: "Produce",
    unit: "piece",
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

/** Controller merges `added` with `wishlist.toJSON()` at the top level. */
export type ToggleWishlistResponse = BackendWishlist & { added: boolean };

export async function toggleWishlistApi(args: {
  productId?: string;
  artisanProductId?: string;
}): Promise<ToggleWishlistResponse> {
  const response = await apiClient.post<ApiSuccessResponse<ToggleWishlistResponse>>(
    "/wishlist/toggle",
    {
      productId: args.productId,
      artisanProductId: args.artisanProductId,
    },
  );
  if (!response.data.data) throw new Error("Wishlist toggle failed");
  return response.data.data;
}

export async function removeWishlistItemApi(
  productIdPath: string,
  opts?: { artisanProductId?: string },
): Promise<BackendWishlist> {
  const q =
    opts?.artisanProductId != null && opts.artisanProductId !== ""
      ? `?artisanProductId=${encodeURIComponent(opts.artisanProductId)}`
      : "";
  const response = await apiClient.delete<ApiSuccessResponse<BackendWishlist>>(
    `/wishlist/${encodeURIComponent(productIdPath)}${q}`,
  );
  if (!response.data.data) throw new Error("Wishlist remove failed");
  return response.data.data;
}

export async function clearWishlistApi(): Promise<void> {
  await apiClient.delete("/wishlist");
}
