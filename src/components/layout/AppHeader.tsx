"use client";

import React, { useState } from "react";
import { SessionUser } from "@/types/auth";
import { UserNavMenu } from "./UserNavMenu";
import { AppSidebar } from "./AppSidebar";
import { Menu, X } from "lucide-react";
import Link from "next/link";

interface AppHeaderProps {
  user: SessionUser | null;
  title?: string;
  subtitle?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  title,
  subtitle,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs print:hidden">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
          {/* LEFT: MOBILE HAMBURGER & LOGO / TITLE */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 lg:hidden">
              <Link href="/" className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/zeetork-logo.jpeg"
                  alt="Zeetork Logo"
                  className="h-7 w-auto object-contain"
                />
                <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                  ZEETORK
                </span>
              </Link>
            </div>

            <div className="hidden lg:block">
              {title && (
                <div className="flex items-baseline gap-2">
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    {title}
                  </h2>
                  {subtitle && (
                    <span className="text-xs text-slate-500 font-medium">
                      — {subtitle}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: USER PROFILE & ACTIONS */}
          <div className="flex items-center gap-3">
            <UserNavMenu user={user} />
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER MODAL */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex print:hidden animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Sidebar */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 shadow-2xl animate-fadeIn">
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AppSidebar user={user} onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};
