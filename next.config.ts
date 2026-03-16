import type { NextConfig } from "next";

const LOCAL_API_BASE_URL = "http://localhost:5000/api/v1";
const REMOTE_API_BASE_URL = "http://194.163.182.85:5000/api/v1";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function toApiOrigin(apiBaseUrl: string): string {
  return trimTrailingSlash(apiBaseUrl).replace(/\/api\/v1\/?$/, "");
}

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const apiBaseUrl = configuredBaseUrl
  ? trimTrailingSlash(configuredBaseUrl)
  : process.env.NODE_ENV === "development"
    ? LOCAL_API_BASE_URL
    : REMOTE_API_BASE_URL;

const mediaOrigin = toApiOrigin(apiBaseUrl);

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${mediaOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
