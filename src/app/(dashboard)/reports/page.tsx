import React from "react";
import { listCertificates } from "@/services/certificateService";
import { ReportsClient, ReportItem } from "./ReportsClient";

export const revalidate = 0; // Fresh report on each load

interface ReportsPageProps {
  searchParams?: Promise<{
    search?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const sParams = searchParams ? await searchParams : {};
  const search = sParams.search || "";
  const type = sParams.type || "all";
  const status = sParams.status || "all";
  const startDate = sParams.startDate || "";
  const endDate = sParams.endDate || "";
  const page = parseInt(sParams.page || "1", 10);
  const limit = parseInt(sParams.limit || "20", 10);

  const result = await listCertificates({
    search: search.trim() || undefined,
    certificateType: type !== "all" ? type : undefined,
    status: status !== "all" ? status : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit,
  });

  return (
    <ReportsClient
      initialItems={JSON.parse(JSON.stringify(result.items)) as ReportItem[]}
      pagination={result.pagination}
      counts={
        result.counts || {
          total: result.pagination.total,
          draft: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        }
      }
      filters={{
        search,
        type,
        status,
        startDate,
        endDate,
      }}
    />
  );
}
