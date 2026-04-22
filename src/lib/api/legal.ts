import { apiClient } from "@/lib/api/client";
import { type MultiLangValue } from "@/components/admin/MultiLangInput";
import { type ApiSuccessResponse } from "@/lib/api/types";

export type PolicyBlockType = "text" | "checklist";

export interface PolicyBlock {
  id: string;
  title: MultiLangValue;
  content: MultiLangValue;
  type: PolicyBlockType;
  subBlocks?: PolicyBlock[];
}

export interface LegalDocument {
  id: string;
  type: "privacy_policy" | "terms_of_service";
  blocks: PolicyBlock[];
  updatedAt: string;
}

export async function fetchLegalDocument(
  type: "privacy_policy" | "terms_of_service",
): Promise<LegalDocument> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<LegalDocument>>(
      `/legal/${type}`,
    );
    return (
      response.data.data || {
        id: type,
        type,
        blocks: [],
        updatedAt: new Date().toISOString(),
      }
    );
  } catch (error) {
    // If not found, return empty structure
    return {
      id: type,
      type,
      blocks: [],
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function updateLegalDocument(
  type: "privacy_policy" | "terms_of_service",
  blocks: PolicyBlock[],
): Promise<void> {
  await apiClient.put(`/legal/${type}`, { blocks });
}
