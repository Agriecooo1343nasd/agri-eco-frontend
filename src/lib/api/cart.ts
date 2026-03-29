import { apiClient } from "./client";
import type { ApiSuccessResponse } from "./types";
import type { Product } from "@/components/ProductCard";
import { toSiteRelativeMediaSrc } from "@/lib/media-url";

export interface BackendCartProduct {
  id: string;
  name: string;
  slug: string;
  sellingPrice: number;
  images?: Array<{ url: string; isPrimary?: boolean }>;
  stock: number;
  isActive: boolean;
}

export interface BackendCartArtisanProduct {
  id: string;
  name: string | Record<string, string>;
  price: number;
  image?: string;
  stock: number;
  isActive: boolean;
  artisan?: { id: string; name?: string | Record<string, string> };
}

export interface BackendCartItem {
  id: string;
  cartId: string;
  productId: string | null;
  artisanProductId?: string | null;
  itemType?: "product" | "artisan_product";
  quantity: number;
  price: number;
  product?: BackendCartProduct;
  artisanProduct?: BackendCartArtisanProduct;
}

export interface BackendCart {
  id: string;
  userId: string;
  items: BackendCartItem[];
}

/**
 * Maps a backend product from the cart to the frontend Product interface
 */
function pickLocalizedName(name: string | Record<string, string> | undefined): string {
  if (!name) return "Product";
  if (typeof name === "string") return name;
  return name.en || name.rw || name.fr || (Object.values(name)[0] as string) || "Product";
}

export function mapBackendToFrontendProduct(p: BackendCartProduct): Product {
  const primary =
    p.images?.find((img) => img.isPrimary)?.url || p.images?.[0]?.url;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.sellingPrice,
    image: primary
      ? toSiteRelativeMediaSrc(primary)
      : "/assets/products/placeholder.jpg",
    rating: 5,
    category: "Produce",
    unit: "piece",
    stock: p.stock,
  };
}

export function mapArtisanCartProductToFrontend(
  ap: BackendCartArtisanProduct,
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

export function mapBackendCartItemToProduct(item: BackendCartItem): Product {
  const isArtisan =
    item.itemType === "artisan_product" ||
    (Boolean(item.artisanProductId) && Boolean(item.artisanProduct));
  if (isArtisan && item.artisanProduct) {
    return mapArtisanCartProductToFrontend(item.artisanProduct);
  }
  if (item.product) {
    return mapBackendToFrontendProduct(item.product);
  }
  return {
    id: item.productId || item.artisanProductId || item.id,
    slug: "unknown",
    name: "Product",
    price: item.price,
    image: "/assets/products/placeholder.jpg",
    rating: 5,
    category: "Produce",
    unit: "piece",
  };
}

export async function fetchCart(): Promise<BackendCart> {
  const response = await apiClient.get<ApiSuccessResponse<BackendCart>>("/cart");
  return response.data.data!;
}

export async function addToCartApi(
  args: { productId?: string; artisanProductId?: string; quantity?: number },
): Promise<BackendCart> {
  const quantity = args.quantity ?? 1;
  const body =
    args.artisanProductId != null && args.artisanProductId !== ""
      ? { artisanProductId: args.artisanProductId, quantity }
      : { productId: args.productId!, quantity };
  const response = await apiClient.post<ApiSuccessResponse<BackendCart>>(
    "/cart",
    body,
  );
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
