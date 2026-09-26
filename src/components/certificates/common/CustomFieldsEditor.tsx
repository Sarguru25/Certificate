"use client";

import React from "react";
import { CustomField } from "@/types/certificate";
import { Plus, Trash2 } from "lucide-react";

interface CustomFieldsEditorProps {
  label?: string;
  sectionName: string;
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  showResultField?: boolean;
}

export const CustomFieldsEditor: React.FC<CustomFieldsEditorProps> = ({
  label = "Custom Fields",
  sectionName,
  fields = [],
  onChange,
  showResultField = false,
}) => {
  const handleAdd = () => {
    const newField: CustomField = {
      id: `cf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: "",
      value: "",
      result: showResultField ? "OK" : "-",
    };
    onChange([...fields, newField]);
  };

  const handleUpdate = (id: string, updates: Partial<CustomField>) => {
    const updated = fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
    onChange(updated);
  };

  const handleRemove = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  return (
    <div className="pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-700">
          {label} ({fields.length})
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#FF2D01] bg-[#FF2D01]/10 hover:bg-[#FF2D01]/20 rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Field to {sectionName}</span>
        </button>
      </div>

      {fields.length > 0 && (
        <div className="space-y-2 mt-2">
          {fields.map((field, idx) => (
            <div
              key={field.id}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Item / Parameter Name
                </label>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => handleUpdate(field.id, { name: e.target.value })}
                  placeholder={`e.g. Field ${idx + 1}`}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white font-medium text-slate-800"
                />
              </div>

              <div className="flex-[1.4]">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Details / Criteria
                </label>
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => handleUpdate(field.id, { value: e.target.value })}
                  placeholder="e.g. Specification or value"
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white text-slate-800"
                />
              </div>

              {showResultField && (
                <div className="w-full sm:w-28">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                    Result
                  </label>
                  <input
                    type="text"
                    value={field.result ?? "OK"}
                    onChange={(e) => handleUpdate(field.id, { result: e.target.value })}
                    placeholder="OK / Result"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white font-bold text-slate-800 text-center"
                  />
                </div>
              )}

              <div className="flex items-end justify-end sm:self-center pt-1 sm:pt-4">
                <button
                  type="button"
                  onClick={() => handleRemove(field.id)}
                  title="Remove custom field"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
