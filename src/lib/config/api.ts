const LOCAL_API_BASE_URL = "http://localhost:5000/api/v1";
const REMOTE_API_BASE_URL = "http://194.163.182.85:5000/api/v1";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const apiBaseUrl = configuredBaseUrl
  ? trimTrailingSlash(configuredBaseUrl)
  : process.env.NODE_ENV === "development"
    ? LOCAL_API_BASE_URL
    : REMOTE_API_BASE_URL;

export const apiConfig = {
  baseUrl: apiBaseUrl,
  localBaseUrl: LOCAL_API_BASE_URL,
  remoteBaseUrl: REMOTE_API_BASE_URL,
  useCookieAuth: process.env.NEXT_PUBLIC_API_USE_COOKIES === "true",
} as const;
