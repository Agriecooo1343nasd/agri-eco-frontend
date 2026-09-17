import type { NextConfig } from "next";

const LOCAL_API_BASE_URL = "http://localhost:5000/api/v1";
const REMOTE_API_BASE_URL = "http://194.163.182.85:5000/api/v1";
const LOCAL_API_ORIGIN = "http://localhost:5000";
const REMOTE_API_ORIGIN = "http://194.163.182.85:5000";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function toApiOrigin(apiBaseUrl: string): string {
  return trimTrailingSlash(apiBaseUrl).replace(/\/api\/v1\/?$/, "");
}

function resolveProxyOrigin(): string {
  const configuredProxyOrigin = process.env.API_PROXY_TARGET?.trim();
  if (configuredProxyOrigin) {
    return trimTrailingSlash(configuredProxyOrigin);
  }

  const publicBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (
    publicBaseUrl?.startsWith("http://") ||
    publicBaseUrl?.startsWith("https://")
  ) {
    return toApiOrigin(publicBaseUrl);
  }

  return process.env.NODE_ENV === "development"
    ? LOCAL_API_ORIGIN
    : REMOTE_API_ORIGIN;
}

const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const apiBaseUrl = configuredBaseUrl
  ? trimTrailingSlash(configuredBaseUrl)
  : process.env.NODE_ENV === "development"
    ? LOCAL_API_BASE_URL
    : REMOTE_API_BASE_URL;

const mediaOrigin = toApiOrigin(apiBaseUrl);
const proxyOrigin = resolveProxyOrigin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "194.163.182.85",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${proxyOrigin}/api/v1/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${proxyOrigin || mediaOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
