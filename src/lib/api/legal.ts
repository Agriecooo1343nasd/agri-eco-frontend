import { apiClient } from "@/lib/api/client";
import { type MultiLangValue, emptyLangValue } from "@/components/admin/MultiLangInput";
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
  documentType: "privacy_policy" | "terms_of_service";
  title: MultiLangValue;
  blocks: PolicyBlock[];
  isPublished: boolean;
  publishedAt?: string | null;
  effectiveAt?: string | null;
  updatedAt: string;
}

// Backend models for mapping
interface LegalContentBlock {
  id: string;
  kind: PolicyBlockType;
  title?: MultiLangValue;
  body?: MultiLangValue;
  items?: Record<string, string[]>;
  children?: LegalContentBlock[];
}

interface BackendLegalDocument {
  id: string;
  documentType: "privacy_policy" | "terms_of_service";
  title: MultiLangValue;
  blocks: LegalContentBlock[];
  isPublished: boolean;
  publishedAt?: string | null;
  effectiveAt?: string | null;
  updatedAt: string;
}

/**
 * Maps backend nested block structure to frontend-friendly PolicyBlock structure
 */
function mapFromBackend(block: LegalContentBlock): PolicyBlock {
  const content = block.kind === "checklist" && block.items 
    ? Object.keys(block.items).reduce((acc, lang) => {
        acc[lang as keyof MultiLangValue] = (block.items![lang] || []).join("\n");
        return acc;
      }, emptyLangValue())
    : block.body || emptyLangValue();

  return {
    id: block.id,
    type: block.kind,
    title: block.title || emptyLangValue(),
    content,
    subBlocks: (block.children || []).map(mapFromBackend),
  };
}

/**
 * Maps frontend PolicyBlock structure back to backend nested structure
 */
function mapToBackend(block: PolicyBlock): LegalContentBlock {
  const out: LegalContentBlock = {
    id: block.id,
    kind: block.type,
    title: block.title,
    children: (block.subBlocks || []).map(mapToBackend),
  };

  if (block.type === "checklist") {
    out.items = Object.keys(block.content).reduce((acc, lang) => {
      acc[lang] = block.content[lang as keyof MultiLangValue]
        .split("\n")
        .map(s => s.trim())
        .filter(Boolean);
      return acc;
    }, {} as Record<string, string[]>);
  } else {
    out.body = block.content;
  }

  return out;
}

export async function fetchLegalDocument(
  type: "privacy_policy" | "terms_of_service",
): Promise<LegalDocument> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<BackendLegalDocument>>(
      `/legal/${type}`,
    );
    const data = response.data.data;
    
    if (!data) throw new Error("Document not found");

    return {
      ...data,
      blocks: (data.blocks || []).map(mapFromBackend),
    };
  } catch (error) {
    return {
      id: type,
      documentType: type,
      title: emptyLangValue(),
      blocks: [],
      isPublished: false,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function fetchLegalDocumentAdmin(
  type: "privacy_policy" | "terms_of_service",
): Promise<LegalDocument> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<BackendLegalDocument>>(
      `/legal/admin/${type}`,
    );
    const data = response.data.data;
    
    if (!data) {
      return {
        id: type,
        documentType: type,
        title: emptyLangValue(),
        blocks: [],
        isPublished: false,
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      ...data,
      blocks: (data.blocks || []).map(mapFromBackend),
    };
  } catch (error) {
    throw error;
  }
}

export async function updateLegalDocument(
  type: "privacy_policy" | "terms_of_service",
  blocks: PolicyBlock[],
  title: MultiLangValue,
  isPublished: boolean = true,
): Promise<void> {
  const backendBlocks = blocks.map(mapToBackend);
  await apiClient.put(`/legal/admin/${type}`, { 
    title,
    blocks: backendBlocks,
    isPublished 
  });
}
