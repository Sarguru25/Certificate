import { PermissionCode, PermissionDefinition } from "@/types/user";
import { SessionUser } from "@/types/auth";

export const PERMISSIONS_LIST: PermissionDefinition[] = [
  // Certificate permissions
  {
    code: "certificates.view",
    name: "View Certificates",
    description: "Can view certificate dashboard, lists, details and previews",
    category: "Certificates",
  },
  {
    code: "certificates.create",
    name: "Create Certificates",
    description: "Can create new certificate drafts",
    category: "Certificates",
  },
  {
    code: "certificates.edit",
    name: "Edit Certificates",
    description: "Can edit draft and rejected certificates",
    category: "Certificates",
  },
  {
    code: "certificates.delete",
    name: "Delete Certificates",
    description: "Can delete draft certificates",
    category: "Certificates",
  },
  {
    code: "certificates.submit",
    name: "Submit for Approval",
    description: "Can submit certificate drafts to the approval queue",
    category: "Certificates",
  },
  {
    code: "certificates.approve",
    name: "Approve Certificates",
    description: "Authorized to approve pending certificates",
    category: "Certificates",
  },
  {
    code: "certificates.reject",
    name: "Reject Certificates",
    description: "Can reject pending certificates with an auditable reason",
    category: "Certificates",
  },
  {
    code: "certificates.download",
    name: "Download / Print",
    description: "Can download PDF copies and print certificates",
    category: "Certificates",
  },

  // User management permissions
  {
    code: "users.view",
    name: "View Users",
    description: "Can view the employee user directory",
    category: "User Management",
  },
  {
    code: "users.create",
    name: "Create Users",
    description: "Can register new user accounts",
    category: "User Management",
  },
  {
    code: "users.edit",
    name: "Edit Users",
    description: "Can update user details, role, and active status",
    category: "User Management",
  },
  {
    code: "users.delete",
    name: "Deactivate / Delete Users",
    description: "Can deactivate user accounts",
    category: "User Management",
  },

  // Role management permissions
  {
    code: "roles.view",
    name: "View Roles",
    description: "Can view existing roles and their assigned permissions",
    category: "Role Management",
  },
  {
    code: "roles.create",
    name: "Create Roles",
    description: "Can create custom roles with permission sets",
    category: "Role Management",
  },
  {
    code: "roles.edit",
    name: "Edit Roles",
    description: "Can edit custom role names and permission sets",
    category: "Role Management",
  },
  {
    code: "roles.delete",
    name: "Delete Roles",
    description: "Can remove non-system roles",
    category: "Role Management",
  },
];

export const ALL_PERMISSION_CODES: PermissionCode[] = PERMISSIONS_LIST.map(
  (p) => p.code
);

export const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionCode[]> = {
  Administrator: [...ALL_PERMISSION_CODES],
  Approver: [
    "certificates.view",
    "certificates.approve",
    "certificates.reject",
    "certificates.download",
  ],
  Employee: [
    "certificates.view",
    "certificates.create",
    "certificates.edit",
    "certificates.delete",
    "certificates.submit",
    "certificates.download",
  ],
};

/**
 * Check whether a user has a specific permission
 */
export function hasPermission(
  user: SessionUser | null | undefined,
  permission: PermissionCode
): boolean {
  if (!user || !user.isActive) return false;
  if (user.roleName === "Administrator") return true;
  return user.permissions?.includes(permission) ?? false;
}

/**
 * Check whether a user has at least one of the given permissions
 */
export function hasAnyPermission(
  user: SessionUser | null | undefined,
  permissions: PermissionCode[]
): boolean {
  if (!user || !user.isActive) return false;
  if (user.roleName === "Administrator") return true;
  return permissions.some((perm) => user.permissions?.includes(perm));
}
