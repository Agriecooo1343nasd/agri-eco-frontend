import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { apiConfig } from "@/lib/config/api";
import {
  clearStoredAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  readStoredAuthSession,
  updateStoredTokens,
} from "@/lib/auth-storage";
import { normalizeApiError, showApiErrorToast } from "@/lib/api/error";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipErrorToast?: boolean;
};

const refreshClient = axios.create({
  baseURL: apiConfig.baseUrl,
  withCredentials: apiConfig.useCookieAuth,
});

export const apiClient = axios.create({
  baseURL: apiConfig.baseUrl,
  withCredentials: apiConfig.useCookieAuth,
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    clearStoredAuthSession();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh-token", { refreshToken })
      .then((response) => {
        const tokens = response.data?.data;
        if (!tokens?.accessToken) {
          clearStoredAuthSession();
          return null;
        }

        updateStoredTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });

        return tokens.accessToken as string;
      })
      .catch(() => {
        clearStoredAuthSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const requestConfig = config as RetryableRequestConfig;
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  headers.set("Accept", "application/json");

  if (!(config.data instanceof FormData) && !headers.get("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getStoredAccessToken();
  if (accessToken && !headers.get("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  requestConfig.headers = headers;
  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestConfig = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const isRefreshCall = requestConfig?.url?.includes("/auth/refresh-token");

    if (
      status === 401 &&
      requestConfig &&
      !requestConfig._retry &&
      !isRefreshCall
    ) {
      requestConfig._retry = true;
      const nextAccessToken = await refreshAccessToken();

      if (nextAccessToken) {
        const headers =
          requestConfig.headers instanceof AxiosHeaders
            ? requestConfig.headers
            : new AxiosHeaders(requestConfig.headers);
        headers.set("Authorization", `Bearer ${nextAccessToken}`);
        requestConfig.headers = headers;
        return apiClient(requestConfig);
      }
    }

    if (!requestConfig?.skipErrorToast) {
      showApiErrorToast(error);
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export function getCurrentAuthHeader(): Record<string, string> {
  const accessToken = getStoredAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export function getCurrentSessionSnapshot() {
  return readStoredAuthSession();
}
