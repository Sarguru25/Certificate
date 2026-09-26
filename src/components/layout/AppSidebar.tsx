"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SessionUser } from "@/types/auth";
import { CERTIFICATE_TYPE_LIST } from "@/lib/certificateRegistry";
import { hasAnyPermission } from "@/lib/permissions";
import {
  LayoutDashboard,
  FileCheck2,
  FileSpreadsheet,
  Users,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Plus,
} from "lucide-react";

interface AppSidebarProps {
  user: SessionUser | null;
  onNavigate?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ user, onNavigate }) => {
  const pathname = usePathname();
  const router = useRouter();

  const canAccessAdmin =
    user?.roleName === "Administrator" ||
    hasAnyPermission(user, ["users.view", "roles.view"]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error("Logout failed:", e);
      router.push("/login");
    }
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full flex-shrink-0 select-none print:hidden">
      {/* BRAND LOGO & TITLE */}
      <div className="p-4 border-b border-slate-200 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/zeetork-logo.jpeg"
          alt="Zeetork Logo"
          className="h-9 w-auto object-contain"
        />
        {/*<div className="overflow-hidden">
          <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">
            ZEETORK
          </h1>
          <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase truncate">
            Certificates & Quality
          </p>
        </div>*/}
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* MAIN MENU */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            General
          </div>
          <div className="space-y-1">
            <Link
              href="/"
              onClick={onNavigate}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isActive("/")
                  ? "bg-orange-50 text-[#FF2D01] font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
              {isActive("/") && <div className="w-1.5 h-1.5 rounded-full bg-[#FF2D01]" />}
            </Link>

            <Link
              href="/reports"
              onClick={onNavigate}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isActive("/reports")
                  ? "bg-orange-50 text-[#FF2D01] font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Reports & Search</span>
              </div>
              {isActive("/reports") && <div className="w-1.5 h-1.5 rounded-full bg-[#FF2D01]" />}
            </Link>
          </div>
        </div>

        {/* CERTIFICATE TYPES MENU */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Certificates
          </div>
          <div className="space-y-1">
            {CERTIFICATE_TYPE_LIST.map((cert) => {
              const href = `/${cert.key}`;
              const createHref = `/${cert.key}/new`;
              const active = isActive(href);
              const isCreateActive = pathname === createHref;
              return (
                <div
                  key={cert.key}
                  className={`group flex items-center justify-between px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                    active
                      ? "bg-orange-50 text-[#FF2D01] font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className="flex items-center gap-2.5 truncate flex-1 py-1"
                    title={`View ${cert.name} certificates`}
                  >
                    <FileCheck2 className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{cert.name}</span>
                  </Link>

                  <Link
                    href={createHref}
                    onClick={onNavigate}
                    title={`Create New ${cert.name}`}
                    className={`p-1 rounded-lg transition flex items-center justify-center ${
                      isCreateActive
                        ? "bg-[#FF2D01] text-white shadow-xs"
                        : active
                        ? "text-[#FF2D01] hover:bg-orange-100"
                        : "text-slate-400 hover:text-white hover:bg-[#FF2D01] group-hover:text-slate-600"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* ADMINISTRATION (AUTHORIZED ONLY) */}
        {canAccessAdmin && (
          <div>
            <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Administration
            </div>
            <div className="space-y-1">
              <Link
                href="/admin/users"
                onClick={onNavigate}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive("/admin/users")
                    ? "bg-orange-50 text-[#FF2D01] font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Users Directory</span>
                </div>
                {isActive("/admin/users") && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF2D01]" />
                )}
              </Link>

              <Link
                href="/admin/roles"
                onClick={onNavigate}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive("/admin/roles")
                    ? "bg-orange-50 text-[#FF2D01] font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Roles & Permissions</span>
                </div>
                {isActive("/admin/roles") && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF2D01]" />
                )}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* FOOTER USER / LOGOUT ACTION */}
      <div className="p-3 border-t border-slate-200">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </aside>
  );
};
