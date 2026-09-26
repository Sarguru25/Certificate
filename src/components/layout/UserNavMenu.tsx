"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SessionUser } from "@/types/auth";
import { LogOut, ChevronDown, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserNavMenuProps {
  user: SessionUser | null;
}

export const UserNavMenu: React.FC<UserNavMenuProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-xs font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] px-3.5 py-1.5 rounded-xl transition shadow-xs"
      >
        Sign In
      </Link>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ZT";

  return (
    <div className="relative print:hidden" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
      >
        <div className="w-8 h-8 rounded-lg bg-[#FF2D01] text-white font-bold flex items-center justify-center text-xs shadow-xs">
          {initials}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-slate-800 leading-tight">
            {user.name}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {user.roleName || "Employee"}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-[#FF2D01] border border-orange-200 text-[10px] font-semibold">
              <Shield className="w-3 h-3" />
              <span>{user.roleName}</span>
            </div>
          </div>

          <div className="p-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
