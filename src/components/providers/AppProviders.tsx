"use client";

import { useState, type ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { PricingProvider } from "@/context/PricingContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { FeatureProvider } from "@/context/FeatureContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { store } from "@/store";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry(failureCount, error) {
              const status =
                typeof error === "object" && error && "status" in error
                  ? Number((error as { status?: number }).status)
                  : 0;

              if (status >= 400 && status < 500 && status !== 429) {
                return false;
              }

              return failureCount < 2;
            },
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <FeatureProvider>
          <LanguageProvider>
            <AuthProvider>
              <PricingProvider>
                <CartProvider>
                  <TooltipProvider>{children}</TooltipProvider>
                </CartProvider>
              </PricingProvider>
            </AuthProvider>
          </LanguageProvider>
        </FeatureProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
