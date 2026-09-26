import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCertificateConfig, isValidCertificateType } from "@/lib/certificateRegistry";
import { listCertificates } from "@/services/certificateService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CertificateTableRow } from "@/components/certificates/CertificateTableRow";
import { CertificateRowActions } from "@/components/certificates/CertificateRowActions";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Calendar,
  User,
} from "lucide-react";

interface PageProps {
  params: Promise<{ certificateType: string }>;
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function CertificateListPage({
  params,
  searchParams,
}: PageProps) {
  const { certificateType } = await params;

  if (!isValidCertificateType(certificateType)) {
    notFound();
  }

  const config = getCertificateConfig(certificateType)!;
  const sParams = await searchParams;
  const search = sParams.search || "";
  const status = sParams.status || "all";
  const page = parseInt(sParams.page || "1", 10);

  const { items, pagination } = await listCertificates({
    certificateType,
    search,
    status,
    page,
    limit: 20,
  });

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Draft", value: "DRAFT" },
    { label: "Pending Approval", value: "PENDING_APPROVAL" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER WITH TITLE & ACTION BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {config.name} Certificates
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-orange-100 text-[#FF2D01] border border-orange-200">
              {config.prefix}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {config.description}
          </p>
        </div>

        <Link
          href={`/${certificateType}/new`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] active:bg-[#c72300] shadow-sm transition w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Certificate</span>
        </Link>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <form method="GET" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by Certificate No, Customer Name, SO No, Model..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#FF2D01] focus:border-transparent transition"
            />
          </div>

          <input type="hidden" name="status" value={status} />

          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition"
          >
            Search
          </button>
        </form>

        {/* STATUS PILLS */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">
            Filter:
          </span>
          {statusOptions.map((opt) => {
            const isSelected = status.toUpperCase() === opt.value.toUpperCase();
            return (
              <Link
                key={opt.value}
                href={`/${certificateType}?status=${opt.value}&search=${encodeURIComponent(
                  search
                )}`}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  isSelected
                    ? "bg-[#FF2D01] text-white font-bold shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* CERTIFICATES LIST: MOBILE CARDS & DESKTOP TABLE */}
      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF2D01] flex items-center justify-center mx-auto mb-3">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No certificates found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || status !== "all"
              ? "Try adjusting your search query or filters to find what you are looking for."
              : `No ${config.name} certificates have been created yet.`}
          </p>
          <div className="mt-5">
            <Link
              href={`/${certificateType}/new`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Certificate</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* MOBILE CARDS VIEW (< lg) */}
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {items.map((c) => {
              const data = c.certificateData as unknown as Record<string, string>;
              const custName = data?.customerName || "Unnamed Customer";
              const soNo = data?.salesOrderNo || "-";
              const modelNo = data?.modelNumber || "-";
              const createdByName =
                typeof c.createdBy === "object" && c.createdBy !== null && "name" in c.createdBy
                  ? String((c.createdBy as { name?: string }).name || "Employee")
                  : "Employee";

              return (
                <div
                  key={c._id.toString()}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-orange-300 p-4 shadow-xs hover:shadow-md transition-all space-y-3 group"
                >
                  <Link
                    href={`/${certificateType}/${c._id}`}
                    className="block space-y-3 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-[#FF2D01] transition-colors">
                            {c.certificateNumber}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 mt-1">
                          {custName}
                        </div>
                      </div>
                      <StatusBadge status={c.status} size="sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                      <div>
                        <span className="font-semibold text-slate-700">SO No:</span>{" "}
                        {soNo}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Model:</span>{" "}
                        {modelNo}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <User className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{createdByName}</span>
                      </div>
                    </div>
                  </Link>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Actions</span>
                    <CertificateRowActions
                      certificateId={c._id.toString()}
                      certificateType={certificateType}
                      status={c.status}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* DESKTOP TABLE VIEW (>= lg) */}
          <div className="hidden lg:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Certificate No</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Sales Order No</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((c) => {
                  const data = c.certificateData as unknown as Record<string, string>;
                  const custName = data?.customerName || "-";
                  const soNo = data?.salesOrderNo || "-";

                  return (
                    <CertificateTableRow
                      key={c._id.toString()}
                      href={`/${certificateType}/${c._id}`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 group-hover:text-[#FF2D01] transition-colors">
                          {c.certificateNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 max-w-[220px] truncate">
                        {custName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{soNo}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <CertificateRowActions
                          certificateId={c._id.toString()}
                          certificateType={certificateType}
                          status={c.status}
                        />
                      </td>
                    </CertificateTableRow>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-medium">
                Showing {items.length} of {pagination.total} records
              </span>
              <div className="flex items-center gap-1">
                <Link
                  href={`/${certificateType}?page=${Math.max(page - 1, 1)}&status=${status}&search=${encodeURIComponent(search)}`}
                  className={`p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold ${
                    page <= 1 ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                <span className="px-3 text-xs font-bold text-slate-700">
                  Page {page} of {pagination.totalPages}
                </span>
                <Link
                  href={`/${certificateType}?page=${Math.min(page + 1, pagination.totalPages)}&status=${status}&search=${encodeURIComponent(search)}`}
                  className={`p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-semibold ${
                    page >= pagination.totalPages ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
