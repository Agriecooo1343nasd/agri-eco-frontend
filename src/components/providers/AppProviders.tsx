"use client";

import { useState, type ReactNode } from "react";
import { Provider as ReduxProvider } from "react-redux";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { PricingProvider } from "@/context/PricingContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { showApiErrorToast } from "@/lib/api/error";
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
        queryCache: new QueryCache({
          onError: (error) => {
            showApiErrorToast(error);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            showApiErrorToast(error);
          },
        }),
      }),
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PricingProvider>
            <CartProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </CartProvider>
          </PricingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
