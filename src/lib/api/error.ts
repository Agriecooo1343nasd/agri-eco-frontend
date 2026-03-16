import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import type { ApiErrorResponse, AppApiError } from "@/lib/api/types";

function flattenErrors(errors: unknown): string[] {
  if (!errors) return [];

  if (Array.isArray(errors)) {
    return errors.flatMap((entry) => {
      if (typeof entry === "string") return [entry];
      if (entry && typeof entry === "object") {
        const field = "field" in entry ? String(entry.field) : undefined;
        const message = "message" in entry ? String(entry.message) : undefined;
        return [
          field && message
            ? `${field}: ${message}`
            : message || JSON.stringify(entry),
        ];
      }
      return [String(entry)];
    });
  }

  if (errors && typeof errors === "object") {
    const maybeDetails = (errors as { details?: unknown }).details;
    if (Array.isArray(maybeDetails)) {
      return flattenErrors(maybeDetails);
    }

    return Object.entries(errors as Record<string, unknown>).map(
      ([key, value]) => {
        if (typeof value === "string") return `${key}: ${value}`;
        return `${key}: ${JSON.stringify(value)}`;
      },
    );
  }

  return [String(errors)];
}

export function normalizeApiError(error: unknown): AppApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const status = axiosError.response?.status ?? 500;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Something went wrong";
    const appError = new Error(message) as AppApiError;
    appError.status = status;
    appError.errors = axiosError.response?.data?.errors;
    appError.raw = error;
    return appError;
  }

  if (error instanceof Error) {
    const appError = error as AppApiError;
    appError.status = (appError.status as number | undefined) ?? 500;
    return appError;
  }

  const fallbackError = new Error("Unexpected error") as AppApiError;
  fallbackError.status = 500;
  fallbackError.raw = error;
  return fallbackError;
}

function getErrorTitle(status: number): string {
  switch (status) {
    case 400:
      return "Request issue";
    case 401:
      return "Authentication required";
    case 403:
      return "Access denied";
    case 404:
      return "Not found";
    case 409:
      return "Conflict detected";
    case 422:
      return "Validation failed";
    case 429:
      return "Too many requests";
    default:
      return status >= 500 ? "Server error" : "Request failed";
  }
}

export function showApiErrorToast(error: unknown): AppApiError {
  const apiError = normalizeApiError(error);
  const details = flattenErrors(apiError.errors).slice(0, 3).join(" • ");

  toast.error(getErrorTitle(apiError.status), {
    description: details || apiError.message,
    duration: 7000,
  });

  return apiError;
}
