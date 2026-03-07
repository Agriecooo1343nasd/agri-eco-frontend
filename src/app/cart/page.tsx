"use client";

import Link from "next/link";
import {
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturesBar from "@/components/FeaturesBar";
import { useCart } from "@/context/CartContext";
import { usePricing } from "@/context/PricingContext";

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    wishlistItems,
    moveToCart,
    removeFromWishlist,
  } = useCart();
  const { formatPrice } = usePricing();

  const shipping = cartTotal > 50 ? 0 : 5.99;
  const grandTotal = cartTotal + shipping;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-primary/10 via-accent to-primary/5 border-b border-border">
        <div className="container py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
            Shopping Cart
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary font-semibold">Cart</span>
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold font-heading text-foreground">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mt-2">
              Looks like you haven't added anything yet.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 min-w-0">
              {/* Header row (desktop) */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center bg-card border border-border rounded-xl p-4 mb-4 text-sm font-semibold text-muted-foreground">
                <span>Product</span>
                <span className="text-center">Price</span>
                <span className="text-center">Quantity</span>
                <span className="text-center">Subtotal</span>
                <span className="w-10" />
              </div>

              <div className="space-y-4">
                {cartItems.map(({ product, quantity }) => {
                  const subtotal = product.price * quantity;
                  const hasDiscount = !!product.oldPrice;
                  return (
                    <div
                      key={product.id}
                      className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center"
                    >
                      {/* Product info */}
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            {product.category}
                          </p>
                          <h3 className="font-semibold text-foreground text-sm">
                            {product.name}
                          </h3>
                          {hasDiscount && (
                            <span className="text-[10px] font-bold uppercase text-badge-sale bg-badge-sale/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                              Sale
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="font-bold text-foreground">
                          {formatPrice(product.price)}
                        </span>
                        {hasDiscount && (
                          <span className="block text-price-old line-through text-xs">
                            {formatPrice(product.oldPrice!)}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          / {product.unit}
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity - 1)
                            }
                            disabled={quantity <= 1}
                            className="p-2 hover:bg-accent disabled:opacity-40 transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-semibold text-foreground">
                            {quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(product.id, quantity + 1)
                            }
                            className="p-2 hover:bg-accent transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="text-center">
                        <span className="font-bold text-primary text-lg">
                          {formatPrice(subtotal)}
                        </span>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors justify-self-center"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bottom actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                <Link
                  href="/shop"
                  className="flex items-center gap-2 border border-border px-5 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-colors"
                >
                  ← Continue Shopping
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-2 border border-destructive/30 px-5 py-2.5 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                      Clear Cart
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <AlertDialogTitle>
                          Empty Shopping Cart?
                        </AlertDialogTitle>
                      </div>
                      <AlertDialogDescription>
                        Are you sure you want to remove all items from your
                        cart? This action cannot be undone and you will have to
                        add your items again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep My Items</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearCart}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      >
                        Yes, Clear Cart
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-36">
                <h3 className="font-heading font-bold text-foreground text-lg mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Subtotal ({cartItems.length} items)
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold text-foreground">
                      {shipping === 0 ? (
                        <span className="text-primary font-bold">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Free shipping on orders over {formatPrice(50)}
                    </p>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-bold text-primary text-xl">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Section */}
        {wishlistItems.length > 0 && (
          <div className="mt-16 border-t border-border pt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold font-heading text-foreground">
                  From Your Wishlist
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Items you've saved for later. Ready to add them to your order?
                </p>
              </div>
              <Link
                href="/wishlist"
                className="text-primary font-bold hover:underline text-sm flex items-center gap-1"
              >
                View Full Wishlist <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistItems.map((product) => (
                <div
                  key={product.id}
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Link href={`/product/${product.id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-card/80 backdrop-blur-sm rounded-full text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {product.category}
                    </p>
                    <Link
                      href={`/product/${product.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      <h3 className="font-semibold text-foreground text-sm mt-1 line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <button
                        onClick={() => moveToCart(product.id)}
                        className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        <Plus className="h-3 w-3" /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <FeaturesBar />
      <Footer />
    </div>
  );
};

export default CartPage;
