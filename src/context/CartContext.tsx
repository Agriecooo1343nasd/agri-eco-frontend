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
  mapBackendToFrontendProduct,
} from "@/lib/api/cart";
import {
  fetchWishlist,
  toggleWishlistApi,
  removeWishlistItemApi,
  clearWishlistApi,
  mapWishlistBackendToFrontendProduct,
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount (Guest state)
  useEffect(() => {
    const savedCart = localStorage.getItem("agri-eco-cart");
    const savedWishlist = localStorage.getItem("agri-eco-wishlist");
    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));
    setIsInitialized(true);
  }, []);

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
              product: item.product ? mapBackendToFrontendProduct(item.product) : {} as Product,
              quantity: item.quantity,
            })),
          );

          setWishlistItems(
            wishlistData.items.map((item) =>
              item.product ? mapWishlistBackendToFrontendProduct(item.product) : {} as Product,
            ),
          );
        } catch (error) {
          console.error("Failed to sync cart/wishlist with backend:", error);
        }
      };
      sync();
    }
  }, [isAuthenticated, authInitialized]);

  // Persist guest state to localStorage
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      localStorage.setItem("agri-eco-cart", JSON.stringify(cartItems));
      localStorage.setItem("agri-eco-wishlist", JSON.stringify(wishlistItems));
    }
  }, [cartItems, wishlistItems, isInitialized, isAuthenticated]);

  const addToCart = useCallback(
    async (product: Product, qty = 1) => {
      if (isAuthenticated) {
        try {
          const updatedCart = await addToCartApi(product.id, qty);
          setCartItems(
            updatedCart.items.map((item) => ({
              itemId: item.id,
              product: item.product ? mapBackendToFrontendProduct(item.product) : {} as Product,
              quantity: item.quantity,
            })),
          );
          toast.success("Added to cart", {
            description: `${product.name} synced with your account.`,
          });
        } catch (error) {
          toast.error("Failed to add to cart");
        }
      } else {
        setCartItems((prev) => {
          const existing = prev.find((i) => i.product.id === product.id);
          if (existing) {
            return prev.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + qty }
                : i,
            );
          }
          return [...prev, { product, quantity: qty }];
        });
        toast.success("Added to cart", {
          description: `${product.name} added to your cart.`,
        });
      }
    },
    [isAuthenticated],
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (isAuthenticated) {
        const item = cartItems.find((i) => i.product.id === productId);
        if (item?.itemId) {
          try {
            const updatedCart = await removeCartItemApi(item.itemId);
            setCartItems(
              updatedCart.items.map((i) => ({
                itemId: i.id,
                product: i.product ? mapBackendToFrontendProduct(i.product) : {} as Product,
                quantity: i.quantity,
              })),
            );
          } catch (error) {
            toast.error("Failed to remove item");
          }
        }
      } else {
        setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
      }
    },
    [isAuthenticated, cartItems],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (quantity < 1) return;
      if (isAuthenticated) {
        const item = cartItems.find((i) => i.product.id === productId);
        if (item?.itemId) {
          try {
            const updatedCart = await updateCartItemApi(item.itemId, quantity);
            setCartItems(
              updatedCart.items.map((i) => ({
                itemId: i.id,
                product: i.product ? mapBackendToFrontendProduct(i.product) : {} as Product,
                quantity: i.quantity,
              })),
            );
          } catch (error) {
            toast.error("Failed to update quantity");
          }
        }
      } else {
        setCartItems((prev) =>
          prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
        );
      }
    },
    [isAuthenticated, cartItems],
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await clearCartApi();
        setCartItems([]);
      } catch (error) {
        toast.error("Failed to clear cart");
      }
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const cartTotal = cartItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );
  const cartCount = cartItems.length;

  const addToWishlist = useCallback(
    async (product: Product) => {
      if (isAuthenticated) {
        try {
          const { added, wishlist } = await toggleWishlistApi(product.id);
          setWishlistItems(
            wishlist.items.map((item) =>
              item.product ? mapWishlistBackendToFrontendProduct(item.product) : {} as Product,
            ),
          );
          if (added) {
            toast.success("Added to wishlist");
          } else {
            toast.info("Removed from wishlist");
          }
        } catch (error) {
          toast.error("Failed to update wishlist");
        }
      } else {
        setWishlistItems((prev) => {
          const isAlready = prev.find((p) => p.id === product.id);
          if (isAlready) {
            toast.info("Removed from wishlist", {
              description: `${product.name} removed.`,
            });
            return prev.filter((p) => p.id !== product.id);
          }
          toast.success("Added to wishlist", {
            description: `${product.name} saved.`,
          });
          return [...prev, product];
        });
      }
    },
    [isAuthenticated],
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (isAuthenticated) {
        try {
          const updatedWishlist = await removeWishlistItemApi(productId);
          setWishlistItems(
            updatedWishlist.items.map((item) =>
              item.product ? mapWishlistBackendToFrontendProduct(item.product) : {} as Product,
            ),
          );
        } catch (error) {
          toast.error("Failed to remove from wishlist");
        }
      } else {
        setWishlistItems((prev) => prev.filter((p) => p.id !== productId));
      }
    },
    [isAuthenticated],
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
      {isInitialized ? (
        children
      ) : (
        <div className="min-h-screen bg-background" />
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
