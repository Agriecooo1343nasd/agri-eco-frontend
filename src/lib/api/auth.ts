import { apiClient } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/lib/api/types";
import {
  AUTH_ROLES,
  normalizeAuthUser,
  type AuthRole,
  type AuthSession,
} from "@/lib/auth-types";

export interface RegisterPayload {
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface BackendAuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
}

interface BackendAuthData {
  user: BackendAuthUser;
  accessToken: string;
  refreshToken: string;
}

function toAuthRole(value?: string): AuthRole | undefined {
  if (!value) {
    return undefined;
  }

  return (Object.values(AUTH_ROLES) as string[]).includes(value)
    ? (value as AuthRole)
    : undefined;
}

function toSession(data: BackendAuthData): AuthSession {
  return {
    user: normalizeAuthUser({
      id: data.user.id,
      name:
        [data.user.firstName, data.user.lastName].filter(Boolean).join(" ") ||
        data.user.username ||
        data.user.email,
      email: data.user.email,
      avatar: data.user.avatar,
      role: toAuthRole(data.user.role),
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      username: data.user.username,
      phone: data.user.phone,
    }),
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}

export async function registerRequest(
  payload: RegisterPayload,
): Promise<AuthSession> {
  const response = await apiClient.post<ApiSuccessResponse<BackendAuthData>>(
    "/auth/register",
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing registration response data");
  }

  return toSession(response.data.data);
}

export async function loginRequest(
  payload: LoginPayload,
): Promise<AuthSession> {
  const response = await apiClient.post<ApiSuccessResponse<BackendAuthData>>(
    "/auth/login",
    payload,
  );

  if (!response.data.data) {
    throw new Error("Missing login response data");
  }

  return toSession(response.data.data);
}

export async function forgotPasswordRequest(
  payload: ForgotPasswordPayload,
): Promise<void> {
  await apiClient.post<ApiSuccessResponse<null>>(
    "/auth/forgot-password",
    payload,
  );
}

export async function resetPasswordRequest(
  payload: ResetPasswordPayload,
): Promise<void> {
  await apiClient.post<ApiSuccessResponse<null>>(
    "/auth/reset-password",
    payload,
  );
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post<ApiSuccessResponse<null>>("/auth/logout");
}
