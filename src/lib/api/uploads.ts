import { apiClient } from "./client";
import type { ApiSuccessResponse } from "./types";

export interface UploadedFileInfo {
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

export async function uploadSingleImage(file: File): Promise<UploadedFileInfo> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await apiClient.post<ApiSuccessResponse<UploadedFileInfo>>(
    "/upload/single",
    formData,
  );

  if (!response.data.data) {
    throw new Error("Upload failed: missing file response data");
  }

  return response.data.data;
}

export async function uploadMultipleImages(
  files: File[],
): Promise<UploadedFileInfo[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await apiClient.post<ApiSuccessResponse<UploadedFileInfo[]>>(
    "/upload/multiple",
    formData,
  );

  return response.data.data ?? [];
}
