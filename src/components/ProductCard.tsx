"use client";

import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { usePricing } from "@/context/PricingContext";

export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  badge?: "sale" | "new" | "organic";
  category: string;
  unit: string;
  shortDescription?: string;
  longDescription?: string;
  stock?: number;
  video?: string;
  reviews?: Array<{
    id: number;
    user: string;
    avatar?: string;
    rating: number;
    date: string;
    comment: string;
  }>;
}

interface ProductCardProps {
  product: Product;
}

const badgeStyles: Record<string, string> = {
  sale: "bg-badge-sale text-card",
  new: "bg-badge-new text-primary-foreground",
  organic: "bg-badge-organic text-secondary-foreground",
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, removeFromCart, addToWishlist, isInWishlist, isInCart } =
    useCart();
  const { formatPrice } = usePricing();
  const wishlisted = isInWishlist(product.id);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>
        {product.badge && product.badge !== "organic" && (
          <span
            className={`absolute top-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${badgeStyles[product.badge]}`}
          >
            {product.badge === "sale" ? `-${discount}%` : product.badge}
          </span>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => addToWishlist(product)}
            className={`bg-card/90 backdrop-blur-sm p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm ${wishlisted ? "text-badge-sale" : ""}`}
            aria-label="Add to wishlist"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
          </button>
          <Link
            href={`/product/${product.id}`}
            className="bg-card/90 backdrop-blur-sm p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm"
            aria-label="View Details"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="p-4">
        <Link href={`/product/${product.id}`} className="block group/title">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            {product.category}
          </p>
          <h3 className="font-semibold text-foreground mt-1 text-sm line-clamp-2 min-h-[2.5rem] group-hover/title:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < product.rating ? "fill-secondary text-secondary" : "text-border"}`}
            />
          ))}
          <span className="text-[11px] text-muted-foreground ml-1">
            ({product.rating}.0)
          </span>
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
          <span className="text-[11px] text-muted-foreground">
            / {product.unit}
          </span>
        </div>
        <button
          onClick={() =>
            isInCart(product.id)
              ? removeFromCart(product.id)
              : addToCart(product)
          }
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            isInCart(product.id)
              ? "bg-accent text-accent-foreground hover:bg-accent/80"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          {isInCart(product.id) ? "Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
