"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  ADMIN_ROLES,
  normalizeAuthUser,
  type AuthRole,
  type AuthSession,
  type AuthUser,
  type LegacyAuthUser,
} from "@/lib/auth-types";
import {
  AUTH_CHANGED_EVENT,
  clearStoredAuthSession,
  readStoredAuthSession,
  writeStoredAuthSession,
} from "@/lib/auth-storage";
import { logoutRequest } from "@/lib/api/auth";
import { clearSession, setSession } from "@/store/auth-slice";
import { useAppDispatch } from "@/store/hooks";

interface AuthContextType {
  user: AuthUser | null;
  tokens: {
    accessToken?: string;
    refreshToken?: string;
  } | null;
  login: (payload: LegacyAuthUser | AuthSession) => void;
  setAuthSession: (payload: LegacyAuthUser | AuthSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitialized: boolean;
  role: AuthRole | null;
  isAdmin: boolean;
  hasRole: (roles: AuthRole | AuthRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeSession(payload: LegacyAuthUser | AuthSession): AuthSession {
  if ("user" in payload) {
    return {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      user: normalizeAuthUser(payload.user),
    };
  }

  return {
    user: normalizeAuthUser(payload),
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const [session, setLocalSession] = useState<AuthSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const hydrateSession = () => {
      try {
        const savedSession = readStoredAuthSession();
        setLocalSession(savedSession);
        dispatch(savedSession ? setSession(savedSession) : clearSession());
      } catch (err) {
        console.error("Auth hydration failed:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    hydrateSession();

    window.addEventListener(AUTH_CHANGED_EVENT, hydrateSession);
    window.addEventListener("storage", hydrateSession);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, hydrateSession);
      window.removeEventListener("storage", hydrateSession);
    };
  }, [dispatch]);

  const setAuthSession = (payload: LegacyAuthUser | AuthSession) => {
    const nextSession = normalizeSession(payload);
    writeStoredAuthSession(nextSession);
    setLocalSession(nextSession);
    dispatch(setSession(nextSession));
  };

  const login = (payload: LegacyAuthUser | AuthSession) => {
    setAuthSession(payload);
  };

  const logout = () => {
    void logoutRequest().catch(() => undefined);
    clearStoredAuthSession();
    setLocalSession(null);
    dispatch(clearSession());
  };

  const user = session?.user ?? null;
  const tokens = session
    ? {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      }
    : null;
  const isAuthenticated = !!user;
  const role = user?.role ?? null;
  const isAdmin = !!role && ADMIN_ROLES.includes(role);

  const hasRole = (roles: AuthRole | AuthRole[]) => {
    if (!role) return false;
    return Array.isArray(roles) ? roles.includes(role) : roles === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        login,
        setAuthSession,
        logout,
        isAuthenticated,
        isInitialized,
        role,
        isAdmin,
        hasRole,
      }}
    >
      {isInitialized ? (
        children
      ) : (
        <div className="min-h-screen bg-background" />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
