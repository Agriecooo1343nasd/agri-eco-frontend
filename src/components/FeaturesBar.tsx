"use client";

import { Truck, Leaf, CreditCard, Headphones } from "lucide-react";
import { usePricing } from "@/context/PricingContext";

const FeaturesBar = () => {
  const { formatPrice } = usePricing();

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      desc: `On orders over ${formatPrice(50)}`,
    },
    { icon: Leaf, title: "100% Organic", desc: "Certified organic products" },
    {
      icon: CreditCard,
      title: "Secure Payment",
      desc: "Safe & encrypted checkout",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      desc: "Dedicated customer care",
    },
  ];
  return (
    <section className="bg-accent/50 border-y border-border">
      <div className="container py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">
                  {f.title}
                </h4>
                <p className="text-[11px] text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
