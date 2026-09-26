import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Certificate Management & Approval System | Zeetork Automation & Controls",
  description:
    "Enterprise Certificate Management, Quality Inspection & Two-Person Approval System for Zeetork Automation & Controls Private Limited.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F7F7F7] text-[#222222]">
        {children}
      </body>
    </html>
  );
}
