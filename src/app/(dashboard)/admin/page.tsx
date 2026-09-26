import React from "react";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listUsers, listRoles } from "@/services/userService";
import { Users, ShieldAlert, ArrowRight } from "lucide-react";

export default async function AdminOverviewPage() {
  const user = await getAuthenticatedUser();
  if (!user || (user.roleName !== "Administrator" && !user.permissions.includes("users.view"))) {
    redirect("/");
  }

  const [users, roles] = await Promise.all([listUsers(), listRoles()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          System Administration
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage employee accounts, assign approval roles, and configure system security policies
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* USERS DIRECTORY CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Users Directory ({users.length})
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Create and manage employee accounts, assign roles, and handle account activation.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              {users.filter((u) => u.isActive).length} Active Personnel
            </span>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] transition shadow-xs"
            >
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ROLES & PERMISSIONS CARD */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Roles & Permissions ({roles.length})
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Define granular access controls, approval authority, and operational rights across the organization.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              {roles.length} Configured Roles
            </span>
            <Link
              href="/admin/roles"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] transition shadow-xs"
            >
              <span>Manage Roles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
