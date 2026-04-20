"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useEffect,
} from "react";
import type { Product } from "@/components/ProductCard";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import {
  fetchCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
  mapBackendCartItemToProduct,
} from "@/lib/api/cart";
import {
  fetchWishlist,
  toggleWishlistApi,
  removeWishlistItemApi,
  clearWishlistApi,
  mapWishlistItemToProduct,
} from "@/lib/api/wishlist";

export interface CartItem {
  itemId?: string; // Backend-provided item ID
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  wishlistItems: Product[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isInCart: (productId: string) => boolean;
  moveToCart: (productId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isInitialized: authInitialized } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  // Sync with backend when authenticated
  useEffect(() => {
    if (authInitialized && isAuthenticated) {
      const sync = async () => {
        try {
          const [cartData, wishlistData] = await Promise.all([
            fetchCart(),
            fetchWishlist(),
          ]);

          setCartItems(
            cartData.items.map((item) => ({
              itemId: item.id,
              product: mapBackendCartItemToProduct(item),
              quantity: item.quantity,
            })),
          );

          setWishlistItems(
            wishlistData.items.map((item) => mapWishlistItemToProduct(item)),
          );
        } catch (error) {
          console.error("Failed to sync cart/wishlist with backend:", error);
        }
      };
      sync();
    } else if (authInitialized && !isAuthenticated) {
      setCartItems([]);
      setWishlistItems([]);
    }
  }, [isAuthenticated, authInitialized]);

  const requireAuth = () => {
    toast.error("Authentication required", {
      description: "Please log in to continue.",
    });
    setTimeout(() => {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }, 1500);
  };

  const addToCart = useCallback(
    async (product: Product, qty = 1) => {
      if (!isAuthenticated) return requireAuth();
      try {
        const updatedCart = await addToCartApi(
          product.artisanProductId
            ? { artisanProductId: product.artisanProductId, quantity: qty }
            : { productId: product.id, quantity: qty },
        );
        setCartItems(
          updatedCart.items.map((item) => ({
            itemId: item.id,
            product: mapBackendCartItemToProduct(item),
            quantity: item.quantity,
          })),
        );
        toast.success("Added to cart", {
          description: `${product.name} synced with your account.`,
        });
      } catch (error) {
        toast.error("Failed to add to cart");
      }
    },
    [isAuthenticated],
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return requireAuth();
      const item = cartItems.find((i) => i.product.id === productId);
      if (item?.itemId) {
        try {
          const updatedCart = await removeCartItemApi(item.itemId);
          setCartItems(
            updatedCart.items.map((i) => ({
              itemId: i.id,
              product: mapBackendCartItemToProduct(i),
              quantity: i.quantity,
            })),
          );
        } catch (error) {
          toast.error("Failed to remove item");
        }
      }
    },
    [isAuthenticated, cartItems],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!isAuthenticated) return requireAuth();
      if (quantity < 1) return;
      const item = cartItems.find((i) => i.product.id === productId);
      if (item?.itemId) {
        try {
          const updatedCart = await updateCartItemApi(item.itemId, quantity);
          setCartItems(
            updatedCart.items.map((i) => ({
              itemId: i.id,
              product: mapBackendCartItemToProduct(i),
              quantity: i.quantity,
            })),
          );
        } catch (error) {
          toast.error("Failed to update quantity");
        }
      }
    },
    [isAuthenticated, cartItems],
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return requireAuth();
    try {
      await clearCartApi();
      setCartItems([]);
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  }, [isAuthenticated]);

  const cartTotal = cartItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );
  const cartCount = cartItems.length;

  const addToWishlist = useCallback(
    async (product: Product) => {
      if (!isAuthenticated) return requireAuth();
      try {
        const result = await toggleWishlistApi(
          product.artisanProductId
            ? { artisanProductId: product.artisanProductId }
            : { productId: product.id },
        );
        setWishlistItems(
          (result.items ?? []).map((item) =>
            mapWishlistItemToProduct(item as any),
          ),
        );
        if (result.added) {
          toast.success("Added to wishlist");
        } else {
          toast.info("Removed from wishlist");
        }
      } catch (error) {
        toast.error("Failed to update wishlist");
      }
    },
    [isAuthenticated],
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return requireAuth();
      try {
        const productMeta = wishlistItems.find((p) => p.id === productId);
        const updatedWishlist = await removeWishlistItemApi(
          productId,
          productMeta?.artisanProductId
            ? { artisanProductId: productMeta.artisanProductId }
            : undefined,
        );
        setWishlistItems(
          updatedWishlist.items.map((item) => mapWishlistItemToProduct(item as any)),
        );
      } catch (error) {
        toast.error("Failed to remove from wishlist");
      }
    },
    [isAuthenticated, wishlistItems],
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlistItems.some((p) => p.id === productId),
    [wishlistItems],
  );

  const isInCart = useCallback(
    (productId: string) => cartItems.some((i) => i.product.id === productId),
    [cartItems],
  );

  const moveToCart = useCallback(
    async (productId: string) => {
      const product = wishlistItems.find((p) => p.id === productId);
      if (product) {
        await addToCart(product);
        await removeFromWishlist(productId);
      }
    },
    [wishlistItems, addToCart, removeFromWishlist],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        isInCart,
        moveToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
