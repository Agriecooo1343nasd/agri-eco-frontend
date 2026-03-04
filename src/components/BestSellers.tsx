"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const tabs = ["Best Deals", "Fruits", "Vegetables", "Honey", "All Products"];

const BestSellers = () => {
  const [activeTab, setActiveTab] = useState("Best Deals");

  const filtered =
    activeTab === "Best Deals"
      ? products.filter((p) => p.oldPrice)
      : activeTab === "All Products"
        ? products
        : products.filter((p) => p.category === activeTab);

  return (
    <section id="products" className="py-12 md:py-16">
      <div className="container">
        <h2 className="section-heading">Our Products</h2>
        <p className="section-subheading">
          Handpicked organic products delivered fresh from local farms
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-8">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No products found in this category.
          </p>
        )}
      </div>
    </section>
  );
};

export default BestSellers;
