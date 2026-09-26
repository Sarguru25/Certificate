import React from "react";
import Link from "next/link";
import { getDashboardStats, listCertificates } from "@/services/certificateService";
import { CERTIFICATE_TYPE_LIST } from "@/lib/certificateRegistry";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CertificateTableRow } from "@/components/certificates/CertificateTableRow";
import { CertificateRowActions } from "@/components/certificates/CertificateRowActions";
import {
  PlusCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  FileEdit,
  Files,
  Search,
  FileSpreadsheet,
  X,
  FileText,
  FileBadge,
} from "lucide-react";

export const revalidate = 0; // Fresh stats on each load

interface DashboardProps {
  searchParams?: Promise<{ search?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const sParams = searchParams ? await searchParams : {};
  const search = (sParams?.search || "").trim();

  const [stats, searchResults, recentCerts] = await Promise.all([
    getDashboardStats(),
    search ? listCertificates({ search, limit: 20 }) : null,
    listCertificates({ page: 1, limit: 5 }),
  ]);

  return (
    <div className="space-y-8">
      {/* SEARCH BAR SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Certificate Search & Tracking
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly find any certificate across all types by entering the Certificate Number or Customer Name
            </p>
          </div>
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#FF2D01]" />
            <span>Open Full Reports</span>
          </Link>
        </div>

        <form method="GET" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Enter Certificate Number (e.g. ZIN2600001) or Customer Name..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF2D01] focus:bg-white transition"
              autoFocus={!!search}
            />
            {search && (
              <Link
                href="/"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#FF2D01] hover:bg-[#e02800] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            {search && (
              <Link
                href="/"
                className="px-3 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl text-xs sm:text-sm font-semibold transition"
              >
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* SEARCH RESULTS (RENDERED IF SEARCH QUERY PROVIDED) */}
      {search && searchResults && (
        <div className="bg-white rounded-3xl border border-orange-200 p-6 shadow-sm ring-1 ring-orange-100 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Search Results
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-[#FF2D01]">
                  {searchResults.pagination.total} {searchResults.pagination.total === 1 ? "match" : "matches"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Showing results matching &ldquo;<span className="font-semibold text-slate-800">{search}</span>&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/reports?search=${encodeURIComponent(search)}`}
                className="text-xs font-bold text-[#FF2D01] hover:underline flex items-center gap-1.5"
              >
                <span>View & Export in Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition"
              >
                Reset
              </Link>
            </div>
          </div>

          {searchResults.items.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-800">No certificates found</div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No certificate matched &ldquo;{search}&rdquo;. Please verify the serial number or customer name.
              </p>
              <div className="mt-4">
                <Link
                  href="/reports"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF2D01] hover:underline"
                >
                  <span>Search in Reports Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-3">Certificate No</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Customer / Model</th>
                    <th className="py-3 px-3">Sales Order / PO</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {searchResults.items.map((item) => {
                    const c = item as unknown as {
                      _id: string;
                      certificateNumber: string;
                      revision: number;
                      certificateType: string;
                      status: string;
                      createdAt: string | Date;
                      certificateData?: {
                        customerName?: string;
                        modelNumber?: string;
                        salesOrderNo?: string;
                        customerPO?: string;
                      };
                    };
                    const custName = c.certificateData?.customerName || "-";
                    const modelNo = c.certificateData?.modelNumber || "-";
                    const soNo = c.certificateData?.salesOrderNo || c.certificateData?.customerPO || "-";
                    return (
                      <CertificateTableRow
                        key={c._id}
                        href={`/${c.certificateType}/${c._id}`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 group-hover:text-[#FF2D01] transition-colors">
                          {c.certificateNumber}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-600 capitalize">
                          {c.certificateType.replace("-", " ")}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                            {custName}
                          </div>
                          <div className="text-[10px] text-slate-400">{modelNo}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {soNo}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={c.status} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <CertificateRowActions
                            certificateId={c._id.toString()}
                            certificateType={c.certificateType}
                            status={c.status}
                          />
                        </td>
                      </CertificateTableRow>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* OVERALL STATISTICS METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total</span>
            <Files className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">All certificates</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Draft</span>
            <FileEdit className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-700 mt-2">
            {stats.draft}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Editable drafts</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
            {stats.pending}
          </div>
          <div className="text-[11px] text-amber-600/70 mt-1 font-medium">Awaiting 2 approvers</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            {stats.approved}
          </div>
          <div className="text-[11px] text-emerald-600/70 mt-1 font-medium">Sealed & locked</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600">Rejected</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600 mt-2">
            {stats.rejected}
          </div>
          <div className="text-[11px] text-red-600/70 mt-1 font-medium">Needs correction</div>
        </div>
      </div>

      {/* CERTIFICATE TYPE CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Certificate Categories
            </h2>
            <p className="text-xs text-slate-500">
              Select a category to view certificates or issue a new document
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CERTIFICATE_TYPE_LIST.map((cert) => {
            const count = stats.countsByType[cert.key] || 0;
            return (
              <div
                key={cert.key}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition group"
              >
                {/* CARD MEDIA / PREVIEW */}
                <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center p-2">
                  {cert.isPdfAsset ? (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF2D01] mb-2 shadow-xs group-hover:scale-105 transition">
                        <FileBadge className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        Warranty Guarantee
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PDF Format Template
                      </span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cert.image}
                      alt={cert.name}
                      className="h-full w-full object-contain group-hover:scale-105 transition duration-300"
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold text-slate-800 shadow-xs border border-slate-200">
                    {cert.prefix}
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#FF2D01] transition">
                      {cert.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {cert.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      {count} {count === 1 ? "Certificate" : "Certificates"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/${cert.key}/new`}
                        title="Create New"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-[#FF2D01] hover:bg-orange-50 border border-slate-200 transition"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/${cert.key}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] transition shadow-xs"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RECENT CERTIFICATES TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Certificates
            </h2>
            <p className="text-xs text-slate-500">
              Latest documents in the quality inspection queue
            </p>
          </div>
          <Link
            href="/solenoid-valve"
            className="text-xs font-bold text-[#FF2D01] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentCerts.items.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No certificates generated yet. Click &ldquo;Open&rdquo; on any category above to create your first certificate.
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-3">Certificate No</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Customer / Model</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCerts.items.map((item) => {
                  const c = item as unknown as {
                    _id: string;
                    certificateNumber: string;
                    revision: number;
                    certificateType: string;
                    status: string;
                    createdAt: string | Date;
                    certificateData?: { customerName?: string; modelNumber?: string };
                  };
                  const custName = c.certificateData?.customerName || "-";
                  const modelNo = c.certificateData?.modelNumber || "-";
                  return (
                    <CertificateTableRow
                      key={c._id}
                      href={`/${c.certificateType}/${c._id}`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 group-hover:text-[#FF2D01] transition-colors">
                        {c.certificateNumber}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-600 capitalize">
                        {c.certificateType.replace("-", " ")}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                          {custName}
                        </div>
                        <div className="text-[10px] text-slate-400">{modelNo}</div>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <CertificateRowActions
                          certificateId={c._id.toString()}
                          certificateType={c.certificateType}
                          status={c.status}
                        />
                      </td>
                    </CertificateTableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
