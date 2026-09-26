import React from "react";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F7]">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AppSidebar user={user} />
      </div>

      {/* MAIN APPLICATION VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader user={user} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
