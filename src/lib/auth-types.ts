export const AUTH_ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  STAFF: "staff",
  MANAGER: "manager",
  MEMBER: "member",
  PARTNER: "partner",
  FARMER: "farmer",
  DELIVERY_AGENT: "delivery_agent",
  ARTISAN: "artisan",
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];

export const ADMIN_ROLES: AuthRole[] = [
  AUTH_ROLES.ADMIN,
  AUTH_ROLES.STAFF,
  AUTH_ROLES.MANAGER,
  AUTH_ROLES.MEMBER,
];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  avatar?: string;
  role?: AuthRole;
  roles?: AuthRole[];
}

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthSession extends AuthTokens {
  user: AuthUser;
}

export type LegacyAuthUser = {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
  role?: AuthRole;
  roles?: AuthRole[];
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
};

export function normalizeAuthUser(user: LegacyAuthUser): AuthUser {
  const fallbackName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ");

  return {
    id: user.id,
    email: user.email,
    name: user.name || fallbackName || user.username || user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    roles: user.roles,
  };
}
