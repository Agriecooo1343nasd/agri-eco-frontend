"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type PricingContextType = {
  currency: string;
  formatPrice: (amount: number) => string;
  setCurrency: (currency: string) => void;
};

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const PricingProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState("RWF");

  const formatPrice = (amount: number) => {
    if (currency === "RWF") {
      // Convert USD-like prices (e.g. 4.99) to RWF (e.g. 6000)
      // Standard conversion factor for demo purposes
      const rwfAmount = Math.round(amount * 1250);
      return (
        new Intl.NumberFormat("en-RW", {
          style: "currency",
          currency: "RWF",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
          .format(rwfAmount)
          .replace("RWF", "")
          .trim() + " RWF"
      );
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <PricingContext.Provider value={{ currency, formatPrice, setCurrency }}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error("usePricing must be used within a PricingProvider");
  }
  return context;
};
