export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
  isActive: boolean;
}

export interface AuthTokenPayload {
  sub: string; // User ID
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}
