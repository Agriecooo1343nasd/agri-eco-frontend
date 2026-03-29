import { apiClient } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/lib/api/types";

export interface CommunityStats {
  totalArtisans: number;
  totalPartners: number;
  totalProducts: number;
  totalExperiences: number;
}

export async function fetchCommunityStats(): Promise<CommunityStats> {
  const response = await apiClient.get<ApiSuccessResponse<CommunityStats>>(
    "/community/stats",
  );

  return (
    response.data.data ?? {
      totalArtisans: 0,
      totalPartners: 0,
      totalProducts: 0,
      totalExperiences: 0,
    }
  );
}
