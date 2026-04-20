import {
  type AuthRole,
  type AuthSession,
  type AuthTokens,
  type AuthUser,
} from "@/lib/auth-types";

export const AUTH_STORAGE_KEY = "agri-eco.auth";
export const AUTH_CHANGED_EVENT = "agri-eco-auth-changed";
export const AUTH_COOKIE_AUTHENTICATED = "agri_eco_authenticated";
export const AUTH_COOKIE_ROLE = "agri_eco_role";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifyAuthChanged(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

function setCookie(
  name: string,
  value: string,
  maxAgeSeconds = 60 * 60 * 24 * 7,
) {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (!isBrowser()) return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function syncAuthCookies(session: AuthSession | null) {
  if (!session?.user) {
    clearCookie(AUTH_COOKIE_AUTHENTICATED);
    clearCookie(AUTH_COOKIE_ROLE);
    return;
  }

  setCookie(AUTH_COOKIE_AUTHENTICATED, "1");
  setCookie(AUTH_COOKIE_ROLE, session.user.role || "customer");
}

export function readStoredAuthSession(): AuthSession | null {
  if (!isBrowser()) return null;

  try {
    const value = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!value) return null;
    return JSON.parse(value) as AuthSession;
  } catch (err) {
    console.warn("Auth storage access failed:", err);
    return null;
  }
}

export function writeStoredAuthSession(session: AuthSession): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn("Could not write auth session to localStorage:", err);
  }
  syncAuthCookies(session);
  notifyAuthChanged();
}

export function clearStoredAuthSession(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (err) {
    console.warn("Could not clear auth session from localStorage:", err);
  }
  syncAuthCookies(null);
  notifyAuthChanged();
}

export function getStoredAccessToken(): string | undefined {
  return readStoredAuthSession()?.accessToken;
}

export function getStoredRefreshToken(): string | undefined {
  return readStoredAuthSession()?.refreshToken;
}

export function getStoredAuthUser(): AuthUser | null {
  return readStoredAuthSession()?.user ?? null;
}

export function updateStoredTokens(tokens: AuthTokens): AuthSession | null {
  const current = readStoredAuthSession();
  if (!current?.user) return null;

  const nextSession: AuthSession = {
    ...current,
    ...tokens,
  };

  writeStoredAuthSession(nextSession);
  return nextSession;
}

export function getStoredRole(): AuthRole | undefined {
  return getStoredAuthUser()?.role;
}
