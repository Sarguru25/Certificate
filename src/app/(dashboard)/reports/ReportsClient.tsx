"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CERTIFICATE_TYPE_LIST } from "@/lib/certificateRegistry";
import { CertificateType, CertificateStatus } from "@/types/certificate";
import {
  Search,
  Download,
  Printer,
  FileSpreadsheet,
  Calendar,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  FileEdit,
  ExternalLink,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export interface ReportItem {
  _id: string;
  certificateNumber: string;
  revision: number;
  certificateType: string;
  status: CertificateStatus;
  createdAt: string | Date;
  approvedAt?: string | Date;
  createdBy?: { name?: string; email?: string };
  certificateData?: {
    customerName?: string;
    modelNumber?: string;
    salesOrderNo?: string;
    customerPO?: string;
    certificateDate?: string;
    valveType?: string;
    productName?: string;
    productDescription?: string;
  };
}

interface ReportsClientProps {
  initialItems: ReportItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts: {
    total: number;
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  filters: {
    search?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  };
}

export const ReportsClient: React.FC<ReportsClientProps> = ({
  initialItems,
  pagination,
  counts,
  filters,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(filters.search || "");
  const [type, setType] = useState(filters.type || "all");
  const [status, setStatus] = useState(filters.status || "all");
  const [startDate, setStartDate] = useState(filters.startDate || "");
  const [endDate, setEndDate] = useState(filters.endDate || "");
  const [isExporting, setIsExporting] = useState(false);

  // Apply filters by pushing new URL params
  const handleApplyFilters = (newParams?: Partial<typeof filters>) => {
    const params = new URLSearchParams(searchParams.toString());

    const s = newParams?.search !== undefined ? newParams.search : search;
    const t = newParams?.type !== undefined ? newParams.type : type;
    const st = newParams?.status !== undefined ? newParams.status : status;
    const sd = newParams?.startDate !== undefined ? newParams.startDate : startDate;
    const ed = newParams?.endDate !== undefined ? newParams.endDate : endDate;

    if (s.trim()) params.set("search", s.trim());
    else params.delete("search");

    if (t && t !== "all") params.set("type", t);
    else params.delete("type");

    if (st && st !== "all") params.set("status", st);
    else params.delete("status");

    if (sd) params.set("startDate", sd);
    else params.delete("startDate");

    if (ed) params.set("endDate", ed);
    else params.delete("endDate");

    params.set("page", "1");

    startTransition(() => {
      router.push(`/reports?${params.toString()}`);
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setType("all");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    startTransition(() => {
      router.push("/reports");
    });
  };

  // Quick date presets
  const handleDatePreset = (preset: "today" | "last7" | "thisMonth" | "thisYear" | "all") => {
    const now = new Date();
    let s = "";
    let e = "";

    if (preset === "today") {
      s = now.toISOString().split("T")[0];
      e = s;
    } else if (preset === "last7") {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      s = past.toISOString().split("T")[0];
      e = now.toISOString().split("T")[0];
    } else if (preset === "thisMonth") {
      s = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      e = now.toISOString().split("T")[0];
    } else if (preset === "thisYear") {
      s = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
      e = now.toISOString().split("T")[0];
    } else if (preset === "all") {
      s = "";
      e = "";
    }

    setStartDate(s);
    setEndDate(e);
    handleApplyFilters({ startDate: s, endDate: e });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    startTransition(() => {
      router.push(`/reports?${params.toString()}`);
    });
  };

  // Export full filtered dataset as CSV
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);

      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (type && type !== "all") params.set("type", type);
      if (status && status !== "all") params.set("status", status);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("export", "true");

      const res = await fetch(`/api/certificates?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch export data");
      const data = await res.json();
      const exportItems: ReportItem[] = data.items || [];

      // Build CSV
      const headers = [
        "Certificate Number",
        "Revision",
        "Certificate Type",
        "Customer Name",
        "Sales Order No",
        "Customer PO",
        "Certificate Date",
        "Model / Product",
        "Status",
        "Created By",
        "Approved At",
        "Created Date",
      ];

      const escapeCsv = (str: unknown) => {
        if (str === null || str === undefined) return '""';
        const stringVal = String(str).replace(/"/g, '""');
        return `"${stringVal}"`;
      };

      const rows = exportItems.map((item) => [
        escapeCsv(item.certificateNumber),
        escapeCsv(`R${item.revision}`),
        escapeCsv(item.certificateType),
        escapeCsv(item.certificateData?.customerName || "-"),
        escapeCsv(item.certificateData?.salesOrderNo || "-"),
        escapeCsv(item.certificateData?.customerPO || "-"),
        escapeCsv(item.certificateData?.certificateDate || "-"),
        escapeCsv(item.certificateData?.modelNumber || item.certificateData?.productName || "-"),
        escapeCsv(item.status),
        escapeCsv(item.createdBy?.name || "-"),
        escapeCsv(item.approvedAt ? new Date(item.approvedAt).toLocaleDateString() : "-"),
        escapeCsv(new Date(item.createdAt).toLocaleDateString()),
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().split("T")[0];
      link.setAttribute("href", url);
      link.setAttribute("download", `Zeetork_Certificate_Report_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // Print Report Summary
  const handlePrint = () => {
    window.print();
  };

  const hasActiveFilters = Boolean(
    search.trim() || (type && type !== "all") || (status && status !== "all") || startDate || endDate
  );

  return (
    <div className="space-y-6">
      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block mb-6 border-b border-black pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-black uppercase tracking-tight">
              Zeetork Automation & Controls Pvt Ltd
            </h1>
            <p className="text-xs text-slate-600">
              Quality Assurance Certificate Summary Report — Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/zeetork-logo.jpeg" alt="Logo" className="h-8 w-auto object-contain" />
        </div>
        <div className="mt-3 text-[11px] grid grid-cols-4 gap-2 border-t border-slate-300 pt-2">
          <div>Filter Type: <b>{type === "all" ? "All Types" : type}</b></div>
          <div>Filter Status: <b>{status === "all" ? "All Statuses" : status}</b></div>
          <div>Date Range: <b>{startDate || "Any"} to {endDate || "Any"}</b></div>
          <div>Total Records: <b>{counts.total}</b></div>
        </div>
      </div>

      {/* SCREEN PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Certificate Reports & Search
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-orange-100 text-[#FF2D01] border border-orange-200">
              ZIN Reports
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search across all certificate types by serial number or customer name, filter by date, and export complete reports.
          </p>
        </div>

        {/* EXPORT AND ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting || initialItems.length === 0}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition disabled:opacity-50"
            title="Export filtered records to Microsoft Excel / CSV"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#FF2D01]" />
            ) : (
              <Download className="w-4 h-4 text-emerald-600" />
            )}
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={initialItems.length === 0}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition disabled:opacity-50"
            title="Print formatted report summary"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 print:hidden">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Filtered</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {counts.total}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Matching criteria</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {counts.approved}
          </div>
          <div className="text-[10px] text-emerald-600/70 mt-0.5">Sealed & verified</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {counts.pending}
          </div>
          <div className="text-[10px] text-amber-600/70 mt-0.5">In review queue</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Draft</span>
            <FileEdit className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-700 mt-1">
            {counts.draft}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Editable drafts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600 mt-1">
            {counts.rejected}
          </div>
          <div className="text-[10px] text-red-600/70 mt-0.5">Requires correction</div>
        </div>
      </div>

      {/* FILTER & SEARCH PANEL */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#FF2D01]" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Filter & Search Parameters
            </h2>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#FF2D01] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* INPUTS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* SEARCH INPUT */}
          <div className="relative">
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Certificate No / Customer Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyFilters();
                  }
                }}
                placeholder="e.g. ZIN2600001, Armatury..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF2D01] focus:bg-white transition"
              />
            </div>
          </div>

          {/* CERTIFICATE TYPE DROPDOWN */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Certificate Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                handleApplyFilters({ type: e.target.value });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF2D01] focus:bg-white transition"
            >
              <option value="all">All Certificate Types</option>
              {CERTIFICATE_TYPE_LIST.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS DROPDOWN */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Approval Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                handleApplyFilters({ status: e.target.value });
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF2D01] focus:bg-white transition"
            >
              <option value="all">All Statuses</option>
              <option value="APPROVED">Approved (Locked)</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="DRAFT">Draft</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* DATE RANGE INPUTS */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
              Creation Date Range
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF2D01] focus:bg-white transition"
                title="From Date"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-1/2 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF2D01] focus:bg-white transition"
                title="To Date"
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS & PRESETS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* DATE QUICK PRESETS */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Presets:</span>
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "last7", label: "Last 7 Days" },
              { id: "thisMonth", label: "This Month" },
              { id: "thisYear", label: "This Year" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleDatePreset(p.id as "today" | "last7" | "thisMonth" | "thisYear" | "all")}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* APPLY BUTTON */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleApplyFilters()}
              disabled={isPending}
              className="px-4 py-2 bg-[#FF2D01] hover:bg-[#e02800] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* REPORT DATA TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Certificate Inspection Records
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {initialItems.length} of {pagination.total} matching records
            </p>
          </div>
          <div className="text-xs text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>

        {initialItems.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-800">No certificates match your filters</div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try modifying your search query, changing the date range, or resetting filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Certificate No</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Sales Order / PO</th>
                  <th className="py-3 px-3">Cert Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created By</th>
                  <th className="py-3 px-4 text-right print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialItems.map((item) => {
                  const custName = item.certificateData?.customerName || "-";
                  const soNo = item.certificateData?.salesOrderNo || item.certificateData?.customerPO || "-";
                  const certDate = item.certificateData?.certificateDate || new Date(item.createdAt).toLocaleDateString();

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-orange-50/40 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/${item.certificateType}/${item._id}`)}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-[#FF2D01] transition-colors">
                        {item.certificateNumber}
                        {item.revision > 0 && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-sans">
                            R{item.revision}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-600 capitalize">
                        {item.certificateType.replace("-", " ")}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 truncate max-w-[220px]">
                          {custName}
                        </div>
                        {item.certificateData?.modelNumber && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
                            {item.certificateData.modelNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">
                        {soNo}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        {certDate}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 truncate max-w-[140px]">
                        {item.createdBy?.name || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right print:hidden" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/${item.certificateType}/${item._id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-[#FF2D01] hover:text-white transition"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION BAR */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs print:hidden">
            <span className="text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || isPending}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-semibold text-slate-700">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isPending}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
