"use client";

import { useFeatures } from "@/context/FeatureContext";
import type { FeatureFlags } from "@/lib/api/settings";

interface FeatureGuardProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGuard({ feature, children, fallback = null }: FeatureGuardProps) {
  const { isFeatureEnabled, isLoading } = useFeatures();

  // Optionally, we could return a skeleton here if isLoading is true and we don't have a global loader
  // But FeatureProvider blocks rendering until initial load anyway.

  if (!isFeatureEnabled(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
