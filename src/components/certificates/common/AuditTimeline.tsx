import React, { useState } from "react";
import { AuditEntry } from "@/types/certificate";
import { History, ChevronDown, ChevronUp, UserCheck } from "lucide-react";

interface AuditTimelineProps {
  history: AuditEntry[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ history = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!history || history.length === 0) {
    return null;
  }

  // Show only 3 most recent entries if collapsed
  const displayedEntries = isExpanded ? [...history].reverse() : [...history].reverse().slice(0, 3);

  const getBadgeColor = (action: string) => {
    switch (action) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "PARTIALLY_APPROVED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "SUBMITTED":
      case "RESUBMITTED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "REVISION_CREATED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CREATED":
      case "UPDATED":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Audit Trail & History ({history.length})
          </h3>
        </div>
        {history.length > 3 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-[#FF2D01] hover:underline flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                View Full Trail ({history.length}) <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="relative pl-6 pt-4 space-y-4 before:absolute before:left-2 before:top-5 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {displayedEntries.map((entry, idx) => {
          const dateStr = new Date(entry.performedAt).toLocaleString();
          return (
            <div key={idx} className="relative group">
              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#FF2D01] shadow-xs" />
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getBadgeColor(
                      entry.action
                    )}`}
                  >
                    {entry.action.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] text-slate-400">{dateStr}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>{entry.performedByName || "System"}</span>
                </div>
                {entry.note && (
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed break-words bg-white/70 p-2 rounded-lg border border-slate-100">
                    {entry.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
