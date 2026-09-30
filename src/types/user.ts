export interface IRole {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  roleId: string | IRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PermissionCode =
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "roles.view"
  | "roles.create"
  | "roles.edit"
  | "roles.delete"
  | "certificates.view"
  | "certificates.create"
  | "certificates.edit"
  | "certificates.delete"
  | "certificates.submit"
  | "certificates.approve"
  | "approve.certificate"
  | "certificates.reject"
  | "reject.certificate"
  | "certificates.download";

export interface PermissionDefinition {
  code: PermissionCode;
  name: string;
  description: string;
  category: "Certificates" | "User Management" | "Role Management";
}
