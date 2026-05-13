import { apiClient } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/lib/api/types";

export interface FeatureFlags {
  shopping: boolean;
  training: boolean;
  tours: boolean;
}

export type FeatureKey = keyof FeatureFlags;

export interface AppSetting {
  value: any;
  label: string;
  type: "string" | "boolean" | "number" | "json";
}

export type SettingsGroup = Record<string, AppSetting>;
export type GroupedSettings = Record<string, SettingsGroup>;

export async function fetchFeatureFlags(): Promise<FeatureFlags> {
  const res = await apiClient.get<ApiSuccessResponse<FeatureFlags>>("/settings/features");
  return res.data.data!;
}

export async function updateFeatureFlag(feature: FeatureKey, enabled: boolean): Promise<void> {
  await apiClient.patch(`/settings/features/${feature}`, { enabled });
}

export async function fetchAllSettings(): Promise<GroupedSettings> {
  const res = await apiClient.get<ApiSuccessResponse<GroupedSettings>>("/settings");
  return res.data.data!;
}

export async function updateSettings(settings: Array<{ key: string; value: any }>): Promise<void> {
  await apiClient.put("/settings", { settings });
}
