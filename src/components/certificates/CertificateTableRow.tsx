"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface CertificateTableRowProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const CertificateTableRow: React.FC<CertificateTableRowProps> = ({
  href,
  children,
  className = "",
}) => {
  const router = useRouter();

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // If the click happened on an interactive child element (link, button, input), let it handle its own click
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button") || target.closest("input")) {
      return;
    }
    router.push(href);
  };

  return (
    <tr
      onClick={handleRowClick}
      className={`cursor-pointer hover:bg-orange-50/40 hover:shadow-2xs transition-colors group ${className}`}
      title="Click row to view certificate"
    >
      {children}
    </tr>
  );
};
