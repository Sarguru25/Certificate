import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listUsers, listRoles } from "@/services/userService";
import { UsersManager } from "@/components/admin/UsersManager";
import { ArrowLeft } from "lucide-react";

import { IRoleDocument } from "@/models/Role";

export const revalidate = 0;

interface PopulatedRole {
  _id: { toString(): string } | string;
  name: string;
  permissions?: string[];
}

interface RawUserItem {
  _id: { toString(): string } | string;
  name: string;
  email: string;
  roleId?: PopulatedRole;
  isActive: boolean;
}

export default async function AdminUsersPage() {
  const user = await getAuthenticatedUser();
  if (!user || (user.roleName !== "Administrator" && !user.permissions.includes("users.view"))) {
    redirect("/");
  }

  const [rawUsers, rawRoles] = await Promise.all([listUsers(), listRoles()]);

  const users = (rawUsers as unknown as RawUserItem[]).map((u) => ({
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    roleId: u.roleId
      ? {
          _id: u.roleId._id.toString(),
          name: u.roleId.name,
          permissions: u.roleId.permissions || [],
        }
      : undefined,
    isActive: u.isActive,
  }));

  const roles = (rawRoles as unknown as IRoleDocument[]).map((r) => ({
    _id: String(r._id),
    name: r.name,
    permissions: r.permissions || [],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Users Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorized personnel with access to create, verify, and approve certificates
          </p>
        </div>
      </div>

      <UsersManager initialUsers={users} roles={roles} />
    </div>
  );
}
