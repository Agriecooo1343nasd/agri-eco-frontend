"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchFeatureFlags, type FeatureFlags } from "@/lib/api/settings";
import { Loader2 } from "lucide-react";

interface FeatureContextType {
  features: FeatureFlags;
  isLoading: boolean;
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
}

const defaultFeatures: FeatureFlags = {
  shopping: true,
  training: true,
  tours: true,
  artisans: true,
  partnership: true,
};

const FeatureContext = createContext<FeatureContextType>({
  features: defaultFeatures,
  isLoading: true,
  isFeatureEnabled: () => true,
});

export const FeatureProvider = ({ children }: { children: React.ReactNode }) => {
  const [features, setFeatures] = useState<FeatureFlags>(defaultFeatures);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadFeatures = async () => {
      try {
        const data = await fetchFeatureFlags();
        if (mounted) {
          setFeatures({
            shopping: data.shopping ?? true,
            training: data.training ?? true,
            tours: data.tours ?? true,
            artisans: data.artisans ?? true,
            partnership: data.partnership ?? true,
          });
        }
      } catch (error) {
        console.error("Failed to load feature flags:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadFeatures();

    return () => {
      mounted = false;
    };
  }, []);

  const isFeatureEnabled = (feature: keyof FeatureFlags) => {
    return features[feature];
  };

  if (isLoading) {
    // Show a global loading state while features are resolving to prevent layout shift
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <FeatureContext.Provider value={{ features, isLoading, isFeatureEnabled }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = () => {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error("useFeatures must be used within a FeatureProvider");
  }
  return context;
};
