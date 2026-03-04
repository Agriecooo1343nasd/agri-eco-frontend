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

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  wishlistItems: Product[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  isInCart: (productId: number) => boolean;
  moveToCart: (productId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("agri-eco-cart");
    const savedWishlist = localStorage.getItem("agri-eco-wishlist");
    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("agri-eco-cart", JSON.stringify(cartItems));
      localStorage.setItem("agri-eco-wishlist", JSON.stringify(wishlistItems));
    }
  }, [cartItems, wishlistItems, isInitialized]);

  const addToCart = useCallback((product: Product, qty = 1) => {
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
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartTotal = cartItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const addToWishlist = useCallback((product: Product) => {
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
  }, []);

  const removeFromWishlist = useCallback((productId: number) => {
    setWishlistItems((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId: number) => wishlistItems.some((p) => p.id === productId),
    [wishlistItems],
  );

  const isInCart = useCallback(
    (productId: number) => cartItems.some((i) => i.product.id === productId),
    [cartItems],
  );

  const moveToCart = useCallback(
    (productId: number) => {
      const product = wishlistItems.find((p) => p.id === productId);
      if (product) {
        addToCart(product);
        removeFromWishlist(productId);
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
