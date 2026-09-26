import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listRoles } from "@/services/userService";
import { RolesManager } from "@/components/admin/RolesManager";
import { ArrowLeft } from "lucide-react";

import { IRoleDocument } from "@/models/Role";

export const revalidate = 0;

export default async function AdminRolesPage() {
  const user = await getAuthenticatedUser();
  if (!user || (user.roleName !== "Administrator" && !user.permissions.includes("roles.view"))) {
    redirect("/");
  }

  const rawRoles = await listRoles();

  const roles = (rawRoles as unknown as IRoleDocument[]).map((r) => ({
    _id: String(r._id),
    name: r.name,
    description: r.description || "",
    permissions: r.permissions || [],
    isSystem: !!r.isSystem,
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
            Roles & Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Role-based access control for certificate issuing, approvals, and audits
          </p>
        </div>
      </div>

      <RolesManager initialRoles={roles} />
    </div>
  );
}
