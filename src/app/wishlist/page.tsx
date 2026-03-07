"use client";

import Link from "next/link";
import {
  ChevronRight,
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturesBar from "@/components/FeaturesBar";
import { useCart } from "@/context/CartContext";
import { usePricing } from "@/context/PricingContext";

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, moveToCart, isInCart } = useCart();
  const { formatPrice } = usePricing();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-primary/10 via-accent to-primary/5 border-b border-border">
        <div className="container py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
            My Wishlist
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary font-semibold">Wishlist</span>
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold font-heading text-foreground">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mt-2">
              Save your favourite products here for later.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground py-3 px-6 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              You have{" "}
              <span className="font-bold text-foreground">
                {wishlistItems.length}
              </span>{" "}
              item{wishlistItems.length > 1 ? "s" : ""} in your wishlist.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {wishlistItems.map((product) => {
                const discount = product.oldPrice
                  ? Math.round(
                      ((product.oldPrice - product.price) / product.oldPrice) *
                        100,
                    )
                  : 0;
                const alreadyInCart = isInCart(product.id);

                return (
                  <div
                    key={product.id}
                    className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {product.badge === "sale" && (
                        <span className="absolute top-3 left-3 bg-badge-sale text-card text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                          -{discount}%
                        </span>
                      )}
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm p-2 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {product.category}
                      </p>
                      <h3 className="font-semibold text-foreground mt-1 text-sm line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < product.rating ? "fill-secondary text-secondary" : "text-border"}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-foreground text-lg">
                          {formatPrice(product.price)}
                        </span>
                        {product.oldPrice && (
                          <span className="text-price-old line-through text-sm">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => moveToCart(product.id)}
                        disabled={alreadyInCart}
                        className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                          alreadyInCart
                            ? "bg-accent text-accent-foreground cursor-default"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {alreadyInCart ? "Already in Cart" : "Move to Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <FeaturesBar />
      <Footer />
    </div>
  );
};

export default WishlistPage;
