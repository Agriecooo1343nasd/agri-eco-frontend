"use client";

import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/components/ProductCard";
import Link from "next/link";

interface ShopProductCardProps {
  product: Product;
  listView?: boolean;
}

const badgeStyles: Record<string, string> = {
  sale: "bg-badge-sale text-card",
  new: "bg-badge-new text-primary-foreground",
  organic: "bg-badge-organic text-secondary-foreground",
};

const ShopProductCard = ({ product, listView }: ShopProductCardProps) => {
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  if (listView) {
    return (
      <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 flex">
        <div className="relative w-48 sm:w-56 shrink-0 overflow-hidden bg-muted">
          <Link href={`/product/${product.id}`} className="block w-full h-full">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </Link>
          {product.badge && (
            <span
              className={`absolute top-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${badgeStyles[product.badge]}`}
            >
              {product.badge === "sale" ? `-${discount}%` : product.badge}
            </span>
          )}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => addToWishlist(product)}
              className={`bg-card/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-md ${wishlisted ? "text-badge-sale" : ""}`}
              aria-label="Add to wishlist"
            >
              <Heart
                className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`}
              />
            </button>
            <Link
              href={`/product/${product.id}`}
              className="bg-card/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-md"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <button
              onClick={() => addToCart(product)}
              className="bg-card/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-md"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-5 flex flex-col justify-center flex-1">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            {product.category}
          </p>
          <Link
            href={`/product/${product.id}`}
            className="hover:text-primary transition-colors"
          >
            <h3 className="font-semibold text-foreground mt-1 text-base">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < product.rating ? "fill-secondary text-secondary" : "text-border"}`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              ({product.rating}.0)
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-foreground text-lg">
              ${product.price.toFixed(2)}
            </span>
            {product.oldPrice && (
              <span className="text-price-old line-through text-sm">
                ${product.oldPrice.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              / {product.unit}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 hidden sm:block">
            Fresh, organic and hand-picked for quality. Farm to table goodness.
          </p>
          <button
            onClick={() => addToCart(product)}
            className="mt-3 w-fit flex items-center gap-2 bg-primary text-primary-foreground py-2.5 px-6 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>
    );
  }

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
        {product.badge && (
          <span
            className={`absolute top-3 left-3 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${badgeStyles[product.badge]}`}
          >
            {product.badge === "sale" ? `-${discount}%` : product.badge}
          </span>
        )}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => addToWishlist(product)}
            className={`bg-card/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all shadow-md transform translate-y-3 group-hover:translate-y-0 duration-300 ${wishlisted ? "text-badge-sale" : ""}`}
            aria-label="Add to wishlist"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
          </button>
          <Link
            href={`/product/${product.id}`}
            className="bg-card/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all shadow-md transform translate-y-3 group-hover:translate-y-0 duration-300 delay-75"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            onClick={() => addToCart(product)}
            className="bg-card/90 backdrop-blur-sm p-2.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all shadow-md transform translate-y-3 group-hover:translate-y-0 duration-300 delay-150"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          {product.category}
        </p>
        <Link
          href={`/product/${product.id}`}
          className="hover:text-primary transition-colors"
        >
          <h3 className="font-semibold text-foreground mt-1 text-sm line-clamp-2 min-h-[2.5rem]">
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
            ${product.price.toFixed(2)}
          </span>
          {product.oldPrice && (
            <span className="text-price-old line-through text-sm">
              ${product.oldPrice.toFixed(2)}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">
            / {product.unit}
          </span>
        </div>
        <button
          onClick={() => addToCart(product)}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ShopProductCard;
