"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PneumaticActuatorCertificateData,
  PneumaticActuatorLineItem,
} from "@/types/certificate";
import {
  FileText,
  Settings,
  Plus,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
} from "lucide-react";

interface ActuatorModelItem {
  series: string;
  actingType: "Double Acting" | "Single Acting";
  model: string;
  openTime?: number;
  closeTime?: number;
  springs?: Record<string, { open: number; close: number }>;
}

interface PneumaticActuatorFormProps {
  data: PneumaticActuatorCertificateData;
  onChange: (newData: PneumaticActuatorCertificateData) => void;
  errors?: Record<string, string>;
  onSaveDraft?: () => void;
  onSubmitForApproval?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  submitLabel?: string;
}

let itemIdCounter = 0;
function generateUniqueItemId(): string {
  itemIdCounter += 1;
  return `item-${Date.now()}-${itemIdCounter}`;
}

export const PneumaticActuatorForm: React.FC<PneumaticActuatorFormProps> = ({
  data,
  onChange,
  onSaveDraft,
  onSubmitForApproval,
  onCancel,
  isSaving = false,
  submitLabel = "Save & Submit for Approval",
}) => {
  const [openSections, setOpenSections] = useState({
    info: true,
    lineItems: true,
    verification: true,
  });

  const [actuatorModels, setActuatorModels] = useState<ActuatorModelItem[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  // Fetch actuator models on mount
  useEffect(() => {
    let isMounted = true;
    async function loadModels() {
      try {
        setLoadingModels(true);
        const res = await fetch("/api/actuator-models");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.models)) {
          setActuatorModels(json.models);
        }
      } catch (err) {
        console.error("Failed to fetch actuator models:", err);
      } finally {
        if (isMounted) setLoadingModels(false);
      }
    }
    loadModels();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = <K extends keyof PneumaticActuatorCertificateData>(
    field: K,
    value: PneumaticActuatorCertificateData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  // Ensure line items array exists
  const lineItems: PneumaticActuatorLineItem[] =
    data.lineItems && data.lineItems.length > 0
      ? data.lineItems
      : [
          {
            id: "item-1",
            sNo: 1,
            actuatorMake: "ZEETORK",
            actuatorModel: "ZRC8DA",
            springQty: "N/A for DA",
            actuatorSerialNo: "250106464",
            accessoriesCheck: "NA",
            testPrBar: "6",
            stroke1Open: "0.3S",
            stroke1Close: "0.3S",
            stroke2Open: "0.3S",
            stroke2Close: "0.3S",
            stroke3Open: "0.3S",
            stroke3Close: "0.3S",
            result: "Pass",
          },
        ];

  const updateLineItems = (newItems: PneumaticActuatorLineItem[]) => {
    // Re-index sNo
    const reindexed = newItems.map((item, idx) => ({
      ...item,
      sNo: idx + 1,
    }));
    onChange({ ...data, lineItems: reindexed });
  };

  const handleAddLineItem = () => {
    const newItem: PneumaticActuatorLineItem = {
      id: generateUniqueItemId(),
      sNo: lineItems.length + 1,
      actuatorMake: "ZEETORK",
      actuatorModel: "ZRC8DA",
      springQty: "N/A for DA",
      actuatorSerialNo: "",
      accessoriesCheck: "NA",
      testPrBar: "6",
      stroke1Open: "0.3S",
      stroke1Close: "0.3S",
      stroke2Open: "0.3S",
      stroke2Close: "0.3S",
      stroke3Open: "0.3S",
      stroke3Close: "0.3S",
      result: "Pass",
    };
    updateLineItems([...lineItems, newItem]);
  };

  const handleDuplicateLineItem = (index: number) => {
    const source = lineItems[index];
    const duplicated: PneumaticActuatorLineItem = {
      ...source,
      id: generateUniqueItemId(),
      sNo: lineItems.length + 1,
      actuatorSerialNo: "", // prompt for new serial number
    };
    const updated = [...lineItems];
    updated.splice(index + 1, 0, duplicated);
    updateLineItems(updated);
  };

  const handleDeleteLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    const updated = lineItems.filter((_, idx) => idx !== index);
    updateLineItems(updated);
  };

  const handleLineItemFieldChange = (
    index: number,
    field: keyof PneumaticActuatorLineItem,
    value: unknown
  ) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    updateLineItems(updated);
  };

  // Handle Model Selection with Auto-Fill Logic
  const handleSelectModel = (index: number, selectedModelName: string) => {
    const modelObj = actuatorModels.find(
      (m) => m.model.toUpperCase() === selectedModelName.toUpperCase()
    );

    const isDA =
      selectedModelName.toUpperCase().endsWith("DA") ||
      (modelObj && modelObj.actingType === "Double Acting");

    const updated = [...lineItems];
    const current = updated[index];

    if (isDA) {
      const openTime = modelObj?.openTime ?? 0.3;
      const closeTime = modelObj?.closeTime ?? 0.3;
      const openStr = `${openTime}S`;
      const closeStr = `${closeTime}S`;

      updated[index] = {
        ...current,
        actuatorModel: selectedModelName,
        springQty: "N/A for DA",
        stroke1Open: openStr,
        stroke1Close: closeStr,
        stroke2Open: openStr,
        stroke2Close: closeStr,
        stroke3Open: openStr,
        stroke3Close: closeStr,
      };
    } else {
      // Single Acting (SA)
      const defaultSpring = "6";
      let openStr = "0.3S";
      let closeStr = "0.4S";

      if (modelObj?.springs && modelObj.springs[defaultSpring]) {
        openStr = `${modelObj.springs[defaultSpring].open}S`;
        closeStr = `${modelObj.springs[defaultSpring].close}S`;
      }

      updated[index] = {
        ...current,
        actuatorModel: selectedModelName,
        springQty: defaultSpring,
        stroke1Open: openStr,
        stroke1Close: closeStr,
        stroke2Open: openStr,
        stroke2Close: closeStr,
        stroke3Open: openStr,
        stroke3Close: closeStr,
      };
    }

    updateLineItems(updated);
  };

  // Handle Spring Qty Change for Single Acting (SA)
  const handleSpringQtyChange = (index: number, springQty: string) => {
    const updated = [...lineItems];
    const current = updated[index];
    const modelObj = actuatorModels.find(
      (m) => m.model.toUpperCase() === current.actuatorModel.toUpperCase()
    );

    let openStr = current.stroke1Open;
    let closeStr = current.stroke1Close;

    if (modelObj?.springs && modelObj.springs[springQty]) {
      openStr = `${modelObj.springs[springQty].open}S`;
      closeStr = `${modelObj.springs[springQty].close}S`;
    }

    updated[index] = {
      ...current,
      springQty,
      stroke1Open: openStr,
      stroke1Close: closeStr,
      stroke2Open: openStr,
      stroke2Close: closeStr,
      stroke3Open: openStr,
      stroke3Close: closeStr,
    };

    updateLineItems(updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. GENERAL INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("info")}
          className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF2D01]" />
            <h3 className="font-semibold text-slate-800">
              General Information
            </h3>
          </div>
          {openSections.info ? (
            <ChevronUp className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          )}
        </button>

        {openSections.info && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={data.customerName ?? ""}
                onChange={(e) => handleChange("customerName", e.target.value)}
                placeholder="Armatury Bauen Olomouc Controls Private Limited"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Customer PO
              </label>
              <input
                type="text"
                value={data.customerPO ?? ""}
                onChange={(e) => handleChange("customerPO", e.target.value)}
                placeholder="PO00900"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Customer PO Date
              </label>
              <input
                type="text"
                value={data.customerPODate ?? ""}
                onChange={(e) => handleChange("customerPODate", e.target.value)}
                placeholder="10-09-2026"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Sales Order No
              </label>
              <input
                type="text"
                value={data.salesOrderNo ?? ""}
                onChange={(e) => handleChange("salesOrderNo", e.target.value)}
                placeholder="ZIS26270145"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Sales Order Date
              </label>
              <input
                type="text"
                value={data.salesOrderDate ?? ""}
                onChange={(e) => handleChange("salesOrderDate", e.target.value)}
                placeholder="10-09-2026"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Certificate Date
              </label>
              <input
                type="date"
                value={data.certificateDate ?? ""}
                onChange={(e) => handleChange("certificateDate", e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Testing Location
              </label>
              <input
                type="text"
                value={data.testingLocation ?? "Coimbatore"}
                onChange={(e) => handleChange("testingLocation", e.target.value)}
                placeholder="Coimbatore"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. ACTUATOR LINE ITEMS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FF2D01]" />
            <h3 className="font-semibold text-slate-800">
              Pneumatic Actuator Line Items ({lineItems.length})
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddLineItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF2D01] text-white text-xs font-semibold hover:bg-[#e02700] transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Line Item</span>
            </button>
            <button
              type="button"
              onClick={() => toggleSection("lineItems")}
              className="text-slate-500 hover:text-slate-700"
            >
              {openSections.lineItems ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {openSections.lineItems && (
          <div className="p-6 space-y-6">
            {lineItems.map((item, index) => (
              <LineItemCard
                key={item.id || `item-${index}`}
                index={index}
                item={item}
                totalCount={lineItems.length}
                actuatorModels={actuatorModels}
                loadingModels={loadingModels}
                onFieldChange={(field, val) =>
                  handleLineItemFieldChange(index, field, val)
                }
                onSelectModel={(modelName) =>
                  handleSelectModel(index, modelName)
                }
                onSpringQtyChange={(qty) => handleSpringQtyChange(index, qty)}
                onDuplicate={() => handleDuplicateLineItem(index)}
                onDelete={() => handleDeleteLineItem(index)}
              />
            ))}

            {/* Bottom Add Line Item Bar */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleAddLineItem}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border-2 border-dashed border-[#FF2D01]/50 text-[#FF2D01] font-semibold text-sm hover:bg-[#FF2D01]/5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Another Actuator Line Item</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. SIGNATURES & VERIFICATION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("verification")}
          className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#FF2D01]" />
            <h3 className="font-semibold text-slate-800">
              Signatures &amp; Verification
            </h3>
          </div>
          {openSections.verification ? (
            <ChevronUp className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          )}
        </button>

        {openSections.verification && (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Performed By (Witnessed By)
              </label>
              <input
                type="text"
                value={data.witnessedBy ?? ""}
                onChange={(e) => handleChange("witnessedBy", e.target.value)}
                placeholder="SIVAGANESHAN.V.A"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Verified By
              </label>
              <input
                type="text"
                value={data.verifiedBy ?? ""}
                onChange={(e) => handleChange("verifiedBy", e.target.value)}
                placeholder="KARTHIKEYAN.A"
                className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            </div>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
          >
            Cancel
          </button>
        )}

        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
        )}

        {onSubmitForApproval && (
          <button
            type="button"
            onClick={onSubmitForApproval}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold text-white bg-[#FF2D01] hover:bg-[#e02700] rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isSaving ? "Processing..." : submitLabel}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * LineItemCard Component
 * Manages an individual actuator row with searchable model dropdown and auto-filled timings.
 */
interface LineItemCardProps {
  index: number;
  item: PneumaticActuatorLineItem;
  totalCount: number;
  actuatorModels: ActuatorModelItem[];
  loadingModels: boolean;
  onFieldChange: (field: keyof PneumaticActuatorLineItem, value: unknown) => void;
  onSelectModel: (modelName: string) => void;
  onSpringQtyChange: (qty: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const LineItemCard: React.FC<LineItemCardProps> = ({
  index,
  item,
  totalCount,
  actuatorModels,
  loadingModels,
  onFieldChange,
  onSelectModel,
  onSpringQtyChange,
  onDuplicate,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const modelSearch = searchQuery !== null ? searchQuery : (item.actuatorModel || "");

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearchQuery(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isDA =
    (item.actuatorModel || "").toUpperCase().endsWith("DA");
  const isSA =
    (item.actuatorModel || "").toUpperCase().endsWith("SA");

  const filteredModels = actuatorModels.filter((m) =>
    m.model.toUpperCase().includes((modelSearch || "").toUpperCase().trim())
  );

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
      {/* Item Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#FF2D01] text-white text-xs font-bold">
            {index + 1}
          </span>
          <span className="font-semibold text-slate-800 text-sm">
            {item.actuatorMake || "ZEETORK"} - {item.actuatorModel || "Actuator"}
          </span>
          {isDA && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
              Double Acting (DA)
            </span>
          )}
          {isSA && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
              Single Acting (SA)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDuplicate}
            title="Duplicate Line Item"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition"
          >
            <Copy className="w-4 h-4" />
          </button>
          {totalCount > 1 && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete Line Item"
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Fields: 2-column specifications + 3-column test parameters */}
      <div className="space-y-3.5">
        {/* Row 1 & 2: Actuator Specifications (2 balanced columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Actuator Make */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Actuator Make
            </label>
            <input
              type="text"
              value={item.actuatorMake ?? "ZEETORK"}
              onChange={(e) => onFieldChange("actuatorMake", e.target.value)}
              placeholder="ZEETORK"
              className="w-full text-xs sm:text-sm font-semibold uppercase border border-slate-300 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
          </div>

          {/* Actuator Model Autocomplete */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Actuator Model (Search)
            </label>
            <div className="relative">
              <input
                type="text"
                value={modelSearch}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                  onFieldChange("actuatorModel", e.target.value);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="e.g. ZRC8DA or ZRC8SA"
                className="w-full text-xs sm:text-sm font-medium border border-slate-300 rounded-xl px-3 py-2 pr-9 bg-white outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* Autocomplete Dropdown */}
            {isDropdownOpen && (
              <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs">
                {loadingModels && (
                  <div className="px-3 py-2 text-slate-400">Loading models...</div>
                )}
                {!loadingModels && filteredModels.length === 0 && (
                  <div className="px-3 py-2 text-slate-400">No models found</div>
                )}
                {!loadingModels &&
                  filteredModels.map((m) => (
                    <button
                      key={m.model}
                      type="button"
                      onClick={() => {
                        setSearchQuery(null);
                        setIsDropdownOpen(false);
                        onSelectModel(m.model);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 transition ${
                        item.actuatorModel === m.model
                          ? "bg-[#FF2D01]/10 text-[#FF2D01] font-semibold"
                          : "text-slate-700"
                      }`}
                    >
                      <span>{m.model}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {m.series} • {m.actingType === "Double Acting" ? "DA" : "SA"}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Spring Qty */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Spring Qty
            </label>
            {isDA ? (
              <input
                type="text"
                readOnly
                value="N/A for DA"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-100 text-slate-600 font-medium cursor-not-allowed"
              />
            ) : isSA ? (
              <select
                value={item.springQty || "6"}
                onChange={(e) => onSpringQtyChange(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#FF2D01] font-medium"
              >
                {["6", "7", "8", "9", "10", "11", "12"].map((qty) => (
                  <option key={qty} value={qty}>
                    {qty} Springs
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={item.springQty ?? ""}
                onChange={(e) => onFieldChange("springQty", e.target.value)}
                placeholder="e.g. 6 to 12 or N/A"
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#FF2D01]"
              />
            )}
          </div>

          {/* Actuator Serial No. */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Actuator Serial No. <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={item.actuatorSerialNo ?? ""}
              onChange={(e) => onFieldChange("actuatorSerialNo", e.target.value)}
              placeholder="e.g. 250106464"
              className="w-full text-xs sm:text-sm font-mono border border-slate-300 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
          </div>
        </div>

        {/* Row 3: Operational Tests (3 balanced columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          {/* Accessories Check */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Accessories Check
            </label>
            <input
              type="text"
              value={item.accessoriesCheck ?? "NA"}
              onChange={(e) => onFieldChange("accessoriesCheck", e.target.value)}
              placeholder="NA"
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
          </div>

          {/* Test Pr. Bar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Test Pr. Bar
            </label>
            <input
              type="text"
              value={item.testPrBar ?? "6"}
              onChange={(e) => onFieldChange("testPrBar", e.target.value)}
              placeholder="6"
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
          </div>

          {/* Result */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Result
            </label>
            <select
              value={item.result || "Pass"}
              onChange={(e) => onFieldChange("result", e.target.value)}
              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#FF2D01] font-bold text-emerald-700"
            >
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
          </div>
        </div>
      </div>

      {/* Auto-filled Stroke Timings (Stroke 1, Stroke 2, Stroke 3) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800">
            Stroke Performance Timings
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Calculated from {item.actuatorModel || "selected model"} {item.springQty ? `(${item.springQty})` : ""}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Stroke 1 */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Stroke 1</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Open</label>
                <input
                  type="text"
                  value={item.stroke1Open ?? ""}
                  onChange={(e) => onFieldChange("stroke1Open", e.target.value)}
                  placeholder="0.3S"
                  className="w-full font-mono text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-center outline-none focus:ring-2 focus:ring-[#FF2D01]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Close</label>
                <input
                  type="text"
                  value={item.stroke1Close ?? ""}
                  onChange={(e) => onFieldChange("stroke1Close", e.target.value)}
                  placeholder="0.3S"
                  className="w-full font-mono text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-center outline-none focus:ring-2 focus:ring-[#FF2D01]"
                />
              </div>
            </div>
          </div>

          {/* Stroke 2 */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Stroke 2</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Open</label>
                <input
                  type="text"
                  value={item.stroke2Open ?? ""}
                  onChange={(e) => onFieldChange("stroke2Open", e.target.value)}
                  placeholder="0.3S"
                  className="w-full font-mono text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-center outline-none focus:ring-2 focus:ring-[#FF2D01]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Close</label>
                <input
                  type="text"
                  value={item.stroke2Close ?? ""}
                  onChange={(e) => onFieldChange("stroke2Close", e.target.value)}
                  placeholder="0.3S"
                  className="w-full font-mono text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-center outline-none focus:ring-2 focus:ring-[#FF2D01]"
                />
              </div>
            </div>
          </div>

          {/* Stroke 3 */}
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Stroke 3</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Open</label>
                <input
                  type="text"
                  value={item.stroke3Open ?? ""}
                  onChange={(e) => onFieldChange("stroke3Open", e.target.value)}
                  placeholder="0.3S"
                  className="w-full font-mono text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-center outline-none focus:ring-2 focus:ring-[#FF2D01]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Close</label>
                <input
                  type="text"
                  value={item.stroke3Close ?? ""}
                  onChange={(e) => onFieldChange("stroke3Close", e.target.value)}
                  placeholder="0.3S"
                  className="w-full font-mono text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-center outline-none focus:ring-2 focus:ring-[#FF2D01]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
