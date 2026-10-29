"use client";

import React, { useState } from "react";
import {
  ValveFunctionalTestCertificateData,
  ValveFunctionalTestProductGroup,
  ValveFunctionalTestLineItem,
} from "@/types/certificate";
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ClipboardPaste,
  ArrowDownToLine,
  Hash,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { SignatorySelector } from "../common/SignatorySelector";
import { normalizeProductGroups } from "./Template";

interface ValveFunctionalTestFormProps {
  data: ValveFunctionalTestCertificateData;
  onChange: (newData: ValveFunctionalTestCertificateData) => void;
  errors?: Record<string, string>;
  onSaveDraft?: () => void;
  onSubmitForApproval?: () => void;
  onCancel?: () => void;
  isSaving?: boolean;
  submitLabel?: string;
  onSwitchToPreview?: () => void;
}

let uniqueIdCounter = 0;
function generateUniqueId(prefix = "vft"): string {
  uniqueIdCounter += 1;
  return `${prefix}-${Date.now()}-${uniqueIdCounter}`;
}

const DEFAULT_STROKE = "3.0 sec";

function createDefaultItem(sNo: number, tagNo: string): ValveFunctionalTestLineItem {
  return {
    id: generateUniqueId("item"),
    sNo,
    tagNo,
    actuatorSerialNo: "",
    stroke1Open: DEFAULT_STROKE,
    stroke1Close: DEFAULT_STROKE,
    stroke2Open: DEFAULT_STROKE,
    stroke2Close: DEFAULT_STROKE,
    stroke3Open: DEFAULT_STROKE,
    stroke3Close: DEFAULT_STROKE,
    valveFunction: "Pass",
  };
}

function createDefaultGroup(index: number): ValveFunctionalTestProductGroup {
  return {
    id: generateUniqueId("group"),
    groupName: `Product Group ${index + 1}`,
    valveType: "Butterfly",
    valveSize: '10"',
    endConnection: "Flanged",
    pressureRating: "4 bar",
    moc: "WCB Body ss316/PTF",
    actType: "Pneumatic actuator",
    actuatorModel: "ZRC20SA",
    failPosition: "Fail Close",
    hasLsb: false,
    lsbModelNo: "",
    lsbFunction: "Pass",
    hasSov: false,
    sovModelNo: "",
    sovFunction: "Pass",
    hasPositioner: false,
    posinier: "",
    poFunction: "Pass",
    hasAfr: false,
    afrModelNo: "",
    afrFunction: "Pass",
    hasValve: true,
    valveFunction: "Pass",
    hasActuator: true,
    actuatorFunction: "Pass",
    valveAssemblyFunction: "Pass",
    items: [createDefaultItem(1, "1")],
  };
}

export const ValveFunctionalTestForm: React.FC<ValveFunctionalTestFormProps> = ({
  data,
  onChange,
  errors = {},
  onSaveDraft,
  onSubmitForApproval,
  onCancel,
  isSaving = false,
  submitLabel = "Save & Submit for Approval",
  onSwitchToPreview,
}) => {
  // Ensure groups exist
  const productGroups = normalizeProductGroups(data);

  // UI state
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [openSections, setOpenSections] = useState({
    commonInfo: true,
    groups: true,
    signatories: true,
  });

  // Excel paste modal state
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pasteTargetGroupIndex, setPasteTargetGroupIndex] = useState(0);
  const [pasteText, setPasteText] = useState("");

  // Auto numbering modal state
  const [autoNumberModalOpen, setAutoNumberModalOpen] = useState(false);
  const [autoNumberGroupIndex, setAutoNumberGroupIndex] = useState(0);
  const [tagPrefix, setTagPrefix] = useState("TAG-");
  const [tagStartNum, setTagStartNum] = useState(1);
  const [actuatorPrefix, setActuatorPrefix] = useState("ACT-");
  const [actuatorStartNum, setActuatorStartNum] = useState(1);

  // Quick search
  const [groupSearchTerms, setGroupSearchTerms] = useState<Record<number, string>>({});

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper to commit updated groups and maintain synchronized flat lineItems
  const commitGroups = (updatedGroups: ValveFunctionalTestProductGroup[]) => {
    const flatLineItems: ValveFunctionalTestLineItem[] = [];
    let globalSNo = 1;

    updatedGroups.forEach((group) => {
      group.items.forEach((item) => {
        flatLineItems.push({
          ...item,
          sNo: item.sNo !== undefined ? item.sNo : globalSNo,
          valveType: group.valveType,
          valveSize: group.valveSize,
          endConnection: group.endConnection,
          moc: group.moc,
          actType: group.actType,
          model: group.actuatorModel,
          failPosition: group.failPosition,
          hasLsb: group.hasLsb,
          lsbModelNo: group.lsbModelNo,
          lsbFunction: group.lsbFunction,
          hasSov: group.hasSov,
          sovModelNo: group.sovModelNo,
          sovFunction: group.sovFunction,
          hasPositioner: group.hasPositioner,
          posinier: group.posinier,
          poFunction: group.poFunction,
          hasAfr: group.hasAfr,
          afrModelNo: group.afrModelNo,
          afrFunction: group.afrFunction,
          valveFunction: group.valveAssemblyFunction,
        });
        globalSNo++;
      });
    });

    onChange({
      ...data,
      productGroups: updatedGroups,
      lineItems: flatLineItems,
    });
  };

  const handleCommonChange = <K extends keyof ValveFunctionalTestCertificateData>(
    field: K,
    value: ValveFunctionalTestCertificateData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  // Update a field in a specific product group
  const handleGroupFieldChange = <K extends keyof ValveFunctionalTestProductGroup>(
    groupIndex: number,
    field: K,
    value: ValveFunctionalTestProductGroup[K]
  ) => {
    const updated = [...productGroups];
    updated[groupIndex] = {
      ...updated[groupIndex],
      [field]: value,
    };
    commitGroups(updated);
  };

  // Add new product group
  const handleAddProductGroup = () => {
    const newGroup = createDefaultGroup(productGroups.length);
    const updated = [...productGroups, newGroup];
    commitGroups(updated);
    setActiveGroupIndex(updated.length - 1);
  };

  // Duplicate an existing product group (clones all specifications)
  const handleDuplicateProductGroup = (groupIndex: number) => {
    const source = productGroups[groupIndex];
    const duplicated: ValveFunctionalTestProductGroup = {
      ...source,
      id: generateUniqueId("group"),
      groupName: `${source.groupName || `Group ${groupIndex + 1}`} (Copy)`,
      items: source.items.map((it, idx) => ({
        ...it,
        id: generateUniqueId("item"),
        sNo: idx + 1,
      })),
    };
    const updated = [...productGroups];
    updated.splice(groupIndex + 1, 0, duplicated);
    commitGroups(updated);
    setActiveGroupIndex(groupIndex + 1);
  };

  // Remove a product group
  const handleDeleteProductGroup = (groupIndex: number) => {
    if (productGroups.length <= 1) {
      alert("A certificate must contain at least 1 identical product group.");
      return;
    }
    const confirmDelete = window.confirm(
      `Delete "${productGroups[groupIndex].groupName || `Group ${groupIndex + 1}`}" and its items?`
    );
    if (!confirmDelete) return;

    const updated = productGroups.filter((_, idx) => idx !== groupIndex);
    commitGroups(updated);
    setActiveGroupIndex(Math.max(0, groupIndex - 1));
  };

  // Add rows to a specific group
  const handleAddItemsToGroup = (groupIndex: number, count: number) => {
    const group = productGroups[groupIndex];
    const currentItems = group.items || [];
    const baseItem = currentItems[currentItems.length - 1];
    const newItems: ValveFunctionalTestLineItem[] = [];

    for (let i = 0; i < count; i++) {
      const nextNum = currentItems.length + i + 1;
      newItems.push({
        id: generateUniqueId("item"),
        sNo: nextNum,
        tagNo: String(nextNum),
        actuatorSerialNo: "",
        stroke1Open: baseItem?.stroke1Open || DEFAULT_STROKE,
        stroke1Close: baseItem?.stroke1Close || DEFAULT_STROKE,
        stroke2Open: baseItem?.stroke2Open || DEFAULT_STROKE,
        stroke2Close: baseItem?.stroke2Close || DEFAULT_STROKE,
        stroke3Open: baseItem?.stroke3Open || DEFAULT_STROKE,
        stroke3Close: baseItem?.stroke3Close || DEFAULT_STROKE,
        valveFunction: baseItem?.valveFunction || "Pass",
      });
    }

    const updated = [...productGroups];
    updated[groupIndex] = {
      ...group,
      items: [...currentItems, ...newItems],
    };
    commitGroups(updated);
  };

  // Duplicate specific row inside a group
  const handleDuplicateItem = (groupIndex: number, itemIndex: number) => {
    const group = productGroups[groupIndex];
    const source = group.items[itemIndex];
    const duplicated: ValveFunctionalTestLineItem = {
      ...source,
      id: generateUniqueId("item"),
      sNo: group.items.length + 1,
      tagNo: `${source.tagNo}-COPY`,
    };
    const updatedItems = [...group.items];
    updatedItems.splice(itemIndex + 1, 0, duplicated);

    const updated = [...productGroups];
    updated[groupIndex] = { ...group, items: updatedItems };
    commitGroups(updated);
  };

  // Delete row inside a group
  const handleDeleteItem = (groupIndex: number, itemIndex: number) => {
    const group = productGroups[groupIndex];
    if (group.items.length <= 1) {
      alert("Each product group must have at least 1 line item.");
      return;
    }
    const updatedItems = group.items.filter((_, idx) => idx !== itemIndex);
    const updated = [...productGroups];
    updated[groupIndex] = { ...group, items: updatedItems };
    commitGroups(updated);
  };

  // Change individual cell in group item
  const handleItemFieldChange = (
    groupIndex: number,
    itemIndex: number,
    field: keyof ValveFunctionalTestLineItem,
    val: string | number
  ) => {
    const group = productGroups[groupIndex];
    const updatedItems = [...group.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      [field]: val,
    };
    const updated = [...productGroups];
    updated[groupIndex] = { ...group, items: updatedItems };
    commitGroups(updated);
  };

  // Copy row 1 stroke timings down to all rows in group
  const handleFillDownTimings = (groupIndex: number) => {
    const group = productGroups[groupIndex];
    if (group.items.length <= 1) return;
    const row1 = group.items[0];

    const updatedItems = group.items.map((it, idx) => {
      if (idx === 0) return it;
      return {
        ...it,
        stroke1Open: row1.stroke1Open,
        stroke1Close: row1.stroke1Close,
        stroke2Open: row1.stroke2Open,
        stroke2Close: row1.stroke2Close,
        stroke3Open: row1.stroke3Open,
        stroke3Close: row1.stroke3Close,
      };
    });

    const updated = [...productGroups];
    updated[groupIndex] = { ...group, items: updatedItems };
    commitGroups(updated);
  };

  // Auto generate tags & actuator serials for group
  const handleApplyAutoNumbering = () => {
    const group = productGroups[autoNumberGroupIndex];
    const updatedItems = group.items.map((it, idx) => ({
      ...it,
      tagNo: `${tagPrefix}${String(tagStartNum + idx).padStart(3, "0")}`,
      actuatorSerialNo: actuatorPrefix
        ? `${actuatorPrefix}${String(actuatorStartNum + idx).padStart(3, "0")}`
        : it.actuatorSerialNo,
    }));

    const updated = [...productGroups];
    updated[autoNumberGroupIndex] = { ...group, items: updatedItems };
    commitGroups(updated);
    setAutoNumberModalOpen(false);
  };

  // Handle pasting data from Excel
  const handleImportPastedData = () => {
    if (!pasteText.trim()) return;
    const group = productGroups[pasteTargetGroupIndex];

    const lines = pasteText
      .trim()
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0);

    const parsedItems: ValveFunctionalTestLineItem[] = [];

    lines.forEach((line, i) => {
      const cols = line.split("\t").map((c) => c.trim());
      // Columns: [Tag No, Actuator Serial No, Stroke 1 O, Stroke 1 C, Stroke 2 O, Stroke 2 C, Stroke 3 O, Stroke 3 C]
      const nextNum = group.items.length + i + 1;
      parsedItems.push({
        id: generateUniqueId("item"),
        sNo: nextNum,
        tagNo: cols[0] || String(nextNum),
        actuatorSerialNo: cols[1] || "",
        stroke1Open: cols[2] || DEFAULT_STROKE,
        stroke1Close: cols[3] || DEFAULT_STROKE,
        stroke2Open: cols[4] || DEFAULT_STROKE,
        stroke2Close: cols[5] || DEFAULT_STROKE,
        stroke3Open: cols[6] || DEFAULT_STROKE,
        stroke3Close: cols[7] || DEFAULT_STROKE,
        valveFunction: "Pass",
      });
    });

    if (parsedItems.length > 0) {
      const updated = [...productGroups];
      updated[pasteTargetGroupIndex] = {
        ...group,
        items: [...group.items, ...parsedItems],
      };
      commitGroups(updated);
      setPasteText("");
      setPasteModalOpen(false);
    }
  };

  // Calculate totals for KPI badges
  let totalItemsAcrossAllGroups = 0;
  let totalPagesAcrossAllGroups = 0;
  productGroups.forEach((g) => {
    const count = g.items?.length || 0;
    totalItemsAcrossAllGroups += count;
    totalPagesAcrossAllGroups += Math.max(1, Math.ceil(count / 15));
  });

  return (
    <div className="space-y-6 w-full pb-16">
      {/* ============================================================== */}
      {/* TOP KPI & NAVIGATION BANNER                                     */}
      {/* ============================================================== */}
      {/* <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-[#FF2D01] text-white">
              Multi-Model Order
            </span>
            <span className="text-xs text-slate-300">
              15 Line Items per Certificate Page (Max)
            </span>
          </div>
          <h2 className="text-xl font-black mt-1 text-white">
            Valve Functional Test Entry
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Group valves with identical specifications together to produce compact, professional reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Models / Groups
            </span>
            <span className="text-lg font-black text-white">
              {productGroups.length}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Valves
            </span>
            <span className="text-lg font-black text-amber-400">
              {totalItemsAcrossAllGroups}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              PDF Pages
            </span>
            <span className="text-lg font-black text-emerald-400">
              {totalPagesAcrossAllGroups} {totalPagesAcrossAllGroups === 1 ? "Page" : "Pages"}
            </span>
          </div>

          {onSwitchToPreview && (
            <button
              type="button"
              onClick={onSwitchToPreview}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF2D01] to-orange-600 hover:from-[#e02600] hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition transform active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Report ({totalPagesAcrossAllGroups} Pgs)</span>
            </button>
          )}
        </div>
      </div> */}

      {/* ============================================================== */}
      {/* 1. COMMON HEADER FIELDS CARD (SHARED FOR ALL MODELS)           */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("commonInfo")}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 transition border-b border-slate-200/80"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FF2D01] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm text-slate-900">
                1. Order & Customer Details
              </h3>
              <p className="text-xs text-slate-500">
                Applied to the top header of every page in this certificate
              </p>
            </div>
          </div>
          {openSections.commonInfo ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.commonInfo && (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.customerName || ""}
                onChange={(e) => handleCommonChange("customerName", e.target.value)}
                placeholder="e.g. Truflow Solutions Private Limited"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#FF2D01] focus:border-transparent outline-none"
              />
              {errors?.customerName && (
                <p className="text-[11px] text-red-500 mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sales Order No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.salesOrderNo || ""}
                onChange={(e) => handleCommonChange("salesOrderNo", e.target.value)}
                placeholder="e.g. ZIS26001"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#FF2D01] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer PO No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.customerPO || ""}
                onChange={(e) => handleCommonChange("customerPO", e.target.value)}
                placeholder="e.g. INP2526001"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#FF2D01] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date of Test
              </label>
              <input
                type="date"
                value={data.dateOfTest || ""}
                onChange={(e) => handleCommonChange("dateOfTest", e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#FF2D01] focus:border-transparent outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. IDENTICAL PRODUCT GROUPS (MODELS & CORRESPONDING ITEMS)      */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                2. Identical Product Groups (Models & Specifications)
              </h3>
              <p className="text-xs text-slate-500">
                Create a product group for each valve model. Each group fits up to 15 line items per PDF page.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddProductGroup}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF2D01] hover:bg-[#e02600] text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Product Model</span>
          </button>
        </div>

        {/* Group Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-3 px-4 bg-slate-100/60 border-b border-slate-200 overflow-x-auto">
          {productGroups.map((group, idx) => {
            const isActive = idx === activeGroupIndex;
            const itemsCount = group.items?.length || 0;
            const pagesForGroup = Math.max(1, Math.ceil(itemsCount / 15));

            return (
              <button
                key={group.id || idx}
                type="button"
                onClick={() => setActiveGroupIndex(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${isActive
                    ? "bg-white text-[#FF2D01] shadow-xs border border-slate-200"
                    : "text-slate-600 hover:bg-white/60"
                  }`}
              >
                <span>
                  {group.groupName ||
                    `${group.valveType || "Model"} ${group.valveSize || idx + 1}`}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive
                      ? "bg-orange-100 text-[#FF2D01]"
                      : "bg-slate-200 text-slate-600"
                    }`}
                >
                  {itemsCount} Items • {pagesForGroup} {pagesForGroup === 1 ? "Page" : "Pages"}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleAddProductGroup}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition whitespace-nowrap cursor-pointer border border-dashed border-slate-300"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Model</span>
          </button>
        </div>

        {/* Active Product Group Body */}
        {productGroups[activeGroupIndex] && (
          <div className="p-5 space-y-6">
            {/* Group Title and Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-blue-50/40 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                  {activeGroupIndex + 1}
                </span>
                <input
                  type="text"
                  value={productGroups[activeGroupIndex].groupName || ""}
                  onChange={(e) =>
                    handleGroupFieldChange(activeGroupIndex, "groupName", e.target.value)
                  }
                  placeholder={`e.g. Model ${activeGroupIndex + 1}: Butterfly Valve 10"`}
                  className="px-2.5 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg focus:border-blue-500 outline-none w-64"
                />
                <span className="text-xs text-slate-500">
                  ({productGroups[activeGroupIndex].items?.length || 0} Line Items •{" "}
                  {Math.max(
                    1,
                    Math.ceil((productGroups[activeGroupIndex].items?.length || 0) / 15)
                  )}{" "}
                  PDF Pages)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDuplicateProductGroup(activeGroupIndex)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                  title="Duplicate this model's specifications to a new group"
                >
                  <Copy className="w-3 h-3 text-blue-600" />
                  <span>Duplicate Model</span>
                </button>

                {productGroups.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteProductGroup(activeGroupIndex)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Model</span>
                  </button>
                )}
              </div>
            </div>

            {/* PART A: IDENTICAL SPECIFICATIONS GRID */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Shared Specifications for this Model</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Printed at top of certificate for all items in this group)
                </span>
              </div>

              {/* Specifications Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Valve Type
                  </label>
                  <input
                    type="text"
                    value={productGroups[activeGroupIndex].valveType || ""}
                    onChange={(e) =>
                      handleGroupFieldChange(activeGroupIndex, "valveType", e.target.value)
                    }
                    placeholder="Butterfly"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#FF2D01]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Valve Size
                  </label>
                  <input
                    type="text"
                    value={productGroups[activeGroupIndex].valveSize || ""}
                    onChange={(e) =>
                      handleGroupFieldChange(activeGroupIndex, "valveSize", e.target.value)
                    }
                    placeholder='10"'
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#FF2D01]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    End Connection
                  </label>
                  <input
                    type="text"
                    value={productGroups[activeGroupIndex].endConnection || ""}
                    onChange={(e) =>
                      handleGroupFieldChange(activeGroupIndex, "endConnection", e.target.value)
                    }
                    placeholder="Flanged"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#FF2D01]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Pressure Rating
                  </label>
                  <input
                    type="text"
                    value={productGroups[activeGroupIndex].pressureRating || ""}
                    onChange={(e) =>
                      handleGroupFieldChange(activeGroupIndex, "pressureRating", e.target.value)
                    }
                    placeholder="4 bar"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#FF2D01]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    MOC
                  </label>
                  <input
                    type="text"
                    value={productGroups[activeGroupIndex].moc || ""}
                    onChange={(e) =>
                      handleGroupFieldChange(activeGroupIndex, "moc", e.target.value)
                    }
                    placeholder="WCB Body"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#FF2D01]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Actuator Type
                  </label>
                  <input
                    type="text"
                    value={productGroups[activeGroupIndex].actType || ""}
                    onChange={(e) =>
                      handleGroupFieldChange(activeGroupIndex, "actType", e.target.value)
                    }
                    placeholder="Pneumatic actuator"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#FF2D01]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Actuator Model
                  </label>
                  <input
                    type="text"
                    value={productGroups[activeGroupIndex].actuatorModel || ""}
                    onChange={(e) =>
                      handleGroupFieldChange(activeGroupIndex, "actuatorModel", e.target.value)
                    }
                    placeholder="ZRC20SA"
                    className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg outline-none focus:border-[#FF2D01]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Fail Position
                  </label>
                  <input
                    type="text"
                    value={productGroups[activeGroupIndex].failPosition || ""}
                    onChange={(e) =>
                      handleGroupFieldChange(activeGroupIndex, "failPosition", e.target.value)
                    }
                    placeholder="Fail Close"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-[#FF2D01]"
                  />
                </div>
              </div>

              {/* Accessories Row (Positioner, SOV, LSB, AFR) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Accessories Configuration
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Unchecked accessories are automatically excluded from the certificate table
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                  {/* Positioner */}
                  <div className={`p-2.5 rounded-lg border transition ${
                    productGroups[activeGroupIndex].hasPositioner
                      ? "bg-white border-purple-300"
                      : "bg-slate-50 border-slate-200 opacity-70"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-purple-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(productGroups[activeGroupIndex].hasPositioner)}
                          onChange={(e) =>
                            handleGroupFieldChange(
                              activeGroupIndex,
                              "hasPositioner",
                              e.target.checked
                            )
                          }
                          className="rounded text-purple-600"
                        />
                        <span>Positioner Model</span>
                      </label>
                      <select
                        disabled={!productGroups[activeGroupIndex].hasPositioner}
                        value={productGroups[activeGroupIndex].poFunction || "Pass"}
                        onChange={(e) =>
                          handleGroupFieldChange(activeGroupIndex, "poFunction", e.target.value)
                        }
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 outline-none disabled:opacity-50"
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="NA">NA</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      disabled={!productGroups[activeGroupIndex].hasPositioner}
                      value={
                        productGroups[activeGroupIndex].hasPositioner
                          ? productGroups[activeGroupIndex].posinier || ""
                          : ""
                      }
                      onChange={(e) =>
                        handleGroupFieldChange(activeGroupIndex, "posinier", e.target.value)
                      }
                      placeholder={
                        productGroups[activeGroupIndex].hasPositioner ? "e.g. YT-1000" : "Disabled"
                      }
                      className={`w-full px-2 py-1 text-xs border rounded-lg outline-none ${
                        productGroups[activeGroupIndex].hasPositioner
                          ? "bg-white border-purple-300"
                          : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      }`}
                    />
                  </div>

                  {/* SOV */}
                  <div className={`p-2.5 rounded-lg border transition ${
                    productGroups[activeGroupIndex].hasSov
                      ? "bg-white border-amber-300"
                      : "bg-slate-50 border-slate-200 opacity-70"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-amber-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(productGroups[activeGroupIndex].hasSov)}
                          onChange={(e) =>
                            handleGroupFieldChange(activeGroupIndex, "hasSov", e.target.checked)
                          }
                          className="rounded text-amber-600"
                        />
                        <span>SOV Model No</span>
                      </label>
                      <select
                        disabled={!productGroups[activeGroupIndex].hasSov}
                        value={productGroups[activeGroupIndex].sovFunction || "Pass"}
                        onChange={(e) =>
                          handleGroupFieldChange(activeGroupIndex, "sovFunction", e.target.value)
                        }
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 outline-none disabled:opacity-50"
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="NA">NA</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      disabled={!productGroups[activeGroupIndex].hasSov}
                      value={
                        productGroups[activeGroupIndex].hasSov
                          ? productGroups[activeGroupIndex].sovModelNo || ""
                          : ""
                      }
                      onChange={(e) =>
                        handleGroupFieldChange(activeGroupIndex, "sovModelNo", e.target.value)
                      }
                      placeholder={
                        productGroups[activeGroupIndex].hasSov ? "e.g. 5/2 Single Coil" : "Disabled"
                      }
                      className={`w-full px-2 py-1 text-xs border rounded-lg outline-none ${
                        productGroups[activeGroupIndex].hasSov
                          ? "bg-white border-amber-300"
                          : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      }`}
                    />
                  </div>

                  {/* LSB */}
                  <div className={`p-2.5 rounded-lg border transition ${
                    productGroups[activeGroupIndex].hasLsb
                      ? "bg-white border-blue-300"
                      : "bg-slate-50 border-slate-200 opacity-70"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-blue-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(productGroups[activeGroupIndex].hasLsb)}
                          onChange={(e) =>
                            handleGroupFieldChange(activeGroupIndex, "hasLsb", e.target.checked)
                          }
                          className="rounded text-blue-600"
                        />
                        <span>LSB Model No</span>
                      </label>
                      <select
                        disabled={!productGroups[activeGroupIndex].hasLsb}
                        value={productGroups[activeGroupIndex].lsbFunction || "Pass"}
                        onChange={(e) =>
                          handleGroupFieldChange(activeGroupIndex, "lsbFunction", e.target.value)
                        }
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 outline-none disabled:opacity-50"
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="NA">NA</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      disabled={!productGroups[activeGroupIndex].hasLsb}
                      value={
                        productGroups[activeGroupIndex].hasLsb
                          ? productGroups[activeGroupIndex].lsbModelNo || ""
                          : ""
                      }
                      onChange={(e) =>
                        handleGroupFieldChange(activeGroupIndex, "lsbModelNo", e.target.value)
                      }
                      placeholder={
                        productGroups[activeGroupIndex].hasLsb ? "e.g. APL-210N" : "Disabled"
                      }
                      className={`w-full px-2 py-1 text-xs border rounded-lg outline-none ${
                        productGroups[activeGroupIndex].hasLsb
                          ? "bg-white border-blue-300"
                          : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      }`}
                    />
                  </div>

                  {/* AFR */}
                  <div className={`p-2.5 rounded-lg border transition ${
                    productGroups[activeGroupIndex].hasAfr
                      ? "bg-white border-emerald-300"
                      : "bg-slate-50 border-slate-200 opacity-70"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(productGroups[activeGroupIndex].hasAfr)}
                          onChange={(e) =>
                            handleGroupFieldChange(activeGroupIndex, "hasAfr", e.target.checked)
                          }
                          className="rounded text-emerald-600"
                        />
                        <span>AFR Model No</span>
                      </label>
                      <select
                        disabled={!productGroups[activeGroupIndex].hasAfr}
                        value={productGroups[activeGroupIndex].afrFunction || "Pass"}
                        onChange={(e) =>
                          handleGroupFieldChange(activeGroupIndex, "afrFunction", e.target.value)
                        }
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 outline-none disabled:opacity-50"
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="NA">NA</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      disabled={!productGroups[activeGroupIndex].hasAfr}
                      value={
                        productGroups[activeGroupIndex].hasAfr
                          ? productGroups[activeGroupIndex].afrModelNo || ""
                          : ""
                      }
                      onChange={(e) =>
                        handleGroupFieldChange(activeGroupIndex, "afrModelNo", e.target.value)
                      }
                      placeholder={
                        productGroups[activeGroupIndex].hasAfr ? "e.g. AFR-200" : "Disabled"
                      }
                      className={`w-full px-2 py-1 text-xs border rounded-lg outline-none ${
                        productGroups[activeGroupIndex].hasAfr
                          ? "bg-white border-emerald-300"
                          : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      }`}
                    />
                  </div>
                </div>

                {/* Test Results Summary Bar (Mirrors the PDF Certificate Table) */}
                <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                      Test Result Row (Certificate Columns: Valve | Actuator | Positioner | SOV | LSB | AFR)
                    </span>
                    <span className="text-[10px] text-slate-500 italic">
                      Columns update dynamically based on accessories checked above
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Valve */}
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-700">Valve:</span>
                      <select
                        value={productGroups[activeGroupIndex].valveFunction || productGroups[activeGroupIndex].valveAssemblyFunction || "Pass"}
                        onChange={(e) => {
                          handleGroupFieldChange(activeGroupIndex, "valveFunction", e.target.value);
                          handleGroupFieldChange(activeGroupIndex, "valveAssemblyFunction", e.target.value);
                        }}
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 outline-none"
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </div>

                    {/* Actuator */}
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-700">Actuator:</span>
                      <select
                        value={productGroups[activeGroupIndex].actuatorFunction || "Pass"}
                        onChange={(e) =>
                          handleGroupFieldChange(activeGroupIndex, "actuatorFunction", e.target.value)
                        }
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 outline-none"
                      >
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </div>

                    {/* Positioner */}
                    {productGroups[activeGroupIndex].hasPositioner && (
                      <div className="flex items-center gap-1.5 bg-purple-50/80 px-2.5 py-1.5 rounded-lg border border-purple-200">
                        <span className="font-bold text-purple-700">Positioner:</span>
                        <select
                          value={productGroups[activeGroupIndex].poFunction || "Pass"}
                          onChange={(e) =>
                            handleGroupFieldChange(activeGroupIndex, "poFunction", e.target.value)
                          }
                          className="text-xs font-bold text-purple-800 bg-white px-1.5 py-0.5 rounded border border-purple-200 outline-none"
                        >
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                        </select>
                      </div>
                    )}

                    {/* SOV */}
                    {productGroups[activeGroupIndex].hasSov && (
                      <div className="flex items-center gap-1.5 bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200">
                        <span className="font-bold text-amber-700">SOV:</span>
                        <select
                          value={productGroups[activeGroupIndex].sovFunction || "Pass"}
                          onChange={(e) =>
                            handleGroupFieldChange(activeGroupIndex, "sovFunction", e.target.value)
                          }
                          className="text-xs font-bold text-amber-800 bg-white px-1.5 py-0.5 rounded border border-amber-200 outline-none"
                        >
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                        </select>
                      </div>
                    )}

                    {/* LSB */}
                    {productGroups[activeGroupIndex].hasLsb && (
                      <div className="flex items-center gap-1.5 bg-blue-50/80 px-2.5 py-1.5 rounded-lg border border-blue-200">
                        <span className="font-bold text-blue-700">LSB:</span>
                        <select
                          value={productGroups[activeGroupIndex].lsbFunction || "Pass"}
                          onChange={(e) =>
                            handleGroupFieldChange(activeGroupIndex, "lsbFunction", e.target.value)
                          }
                          className="text-xs font-bold text-blue-800 bg-white px-1.5 py-0.5 rounded border border-blue-200 outline-none"
                        >
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                        </select>
                      </div>
                    )}

                    {/* AFR */}
                    {productGroups[activeGroupIndex].hasAfr && (
                      <div className="flex items-center gap-1.5 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                        <span className="font-bold text-emerald-700">AFR:</span>
                        <select
                          value={productGroups[activeGroupIndex].afrFunction || "Pass"}
                          onChange={(e) =>
                            handleGroupFieldChange(activeGroupIndex, "afrFunction", e.target.value)
                          }
                          className="text-xs font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200 outline-none"
                        >
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PART B: LINE ITEMS SPREADSHEET (MAX 15 ROWS PER PDF PAGE) */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span>Valves List for this Model</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                      {productGroups[activeGroupIndex].items.length} Valves entered
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {Math.max(
                        1,
                        Math.ceil(productGroups[activeGroupIndex].items.length / 15)
                      )}{" "}
                      PDF Pages
                    </span>
                  </h4>
                  {/* <p className="text-[11px] text-slate-500 mt-0.5">
                    Items are automatically divided into pages of up to 15 items. Notice the colored &quot;Page&quot; indicators on each row below.
                  </p> */}
                </div>

                {/* Batch Tools Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAddItemsToGroup(activeGroupIndex, 1)}
                    className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition"
                  >
                    +1 Row
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItemsToGroup(activeGroupIndex, 5)}
                    className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition"
                  >
                    +5 Rows
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddItemsToGroup(activeGroupIndex, 15)}
                    className="px-2.5 py-1 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition"
                    title="Add exactly 15 rows (1 full PDF page)"
                  >
                    +15 Rows (1 Page)
                  </button>

                  <span className="text-slate-300">|</span>

                  <button
                    type="button"
                    onClick={() => {
                      setAutoNumberGroupIndex(activeGroupIndex);
                      setAutoNumberModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                    title="Auto generate sequential tag numbers and actuator serials"
                  >
                    <Hash className="w-3.5 h-3.5 text-blue-600" />
                    <span>Auto Number</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFillDownTimings(activeGroupIndex)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                    title="Copy row 1 stroke timings to all rows in this group"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fill Down Timings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPasteTargetGroupIndex(activeGroupIndex);
                      setPasteModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Paste Excel</span>
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto max-h-[550px] overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                <table className="w-full min-w-[950px] border-collapse text-left text-xs">
                  <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-300 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-2 border-r border-slate-300 w-12 text-center">#</th>
                      <th className="p-2 border-r border-slate-300 w-24 text-center">PDF Page</th>
                      <th className="p-2 border-r border-slate-300 w-44">
                        Valve Tag No. / Serial No. <span className="text-red-500">*</span>
                      </th>
                      <th className="p-2 border-r border-slate-300 w-44">
                        Actuator Tag No. / Serial No.
                      </th>
                      <th className="p-2 border-r border-slate-300 text-center" colSpan={2}>
                        Stroke 1 (Open / Close)
                      </th>
                      <th className="p-2 border-r border-slate-300 text-center" colSpan={2}>
                        Stroke 2 (Open / Close)
                      </th>
                      <th className="p-2 border-r border-slate-300 text-center" colSpan={2}>
                        Stroke 3 (Open / Close)
                      </th>
                      <th className="p-2 w-20 text-center">Actions</th>
                    </tr>
                    <tr className="bg-slate-50 border-b border-slate-300 text-[10px] text-slate-500 lowercase text-center">
                      <th className="border-r border-slate-300"></th>
                      <th className="border-r border-slate-300"></th>
                      <th className="border-r border-slate-300"></th>
                      <th className="border-r border-slate-300"></th>
                      <th className="border-r border-slate-200 py-1 font-semibold">open</th>
                      <th className="border-r border-slate-300 py-1 font-semibold">close</th>
                      <th className="border-r border-slate-200 py-1 font-semibold">open</th>
                      <th className="border-r border-slate-300 py-1 font-semibold">close</th>
                      <th className="border-r border-slate-200 py-1 font-semibold">open</th>
                      <th className="border-r border-slate-300 py-1 font-semibold">close</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {productGroups[activeGroupIndex].items.map((item, idx) => {
                      const pageNumberInGroup = Math.floor(idx / 15) + 1;
                      const isPageBoundary = idx > 0 && idx % 15 === 0;

                      return (
                        <tr
                          key={item.id || idx}
                          className={`hover:bg-slate-50/80 transition ${isPageBoundary ? "border-t-2 border-t-blue-400" : ""
                            }`}
                        >
                          {/* S.No */}
                          <td className="p-1.5 border-r border-slate-200 text-center font-mono font-bold text-slate-500">
                            {idx + 1}
                          </td>

                          {/* PDF Page Indicator Badge */}
                          <td className="p-1.5 border-r border-slate-200 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black ${pageNumberInGroup % 2 === 1
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                                }`}
                            >
                              Page {pageNumberInGroup}
                            </span>
                          </td>

                          {/* Valve Tag No. */}
                          <td className="p-1 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.tagNo || ""}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  activeGroupIndex,
                                  idx,
                                  "tagNo",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. V-001"
                              className="w-full px-2 py-1 text-xs font-bold border border-transparent hover:border-slate-300 focus:border-[#FF2D01] rounded outline-none"
                            />
                          </td>

                          {/* Actuator Serial No. */}
                          <td className="p-1 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.actuatorSerialNo || ""}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  activeGroupIndex,
                                  idx,
                                  "actuatorSerialNo",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. ACT-2024-001"
                              className="w-full px-2 py-1 text-xs font-mono border border-transparent hover:border-slate-300 focus:border-[#FF2D01] rounded outline-none"
                            />
                          </td>

                          {/* Stroke 1 Open */}
                          <td className="p-1 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.stroke1Open || ""}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  activeGroupIndex,
                                  idx,
                                  "stroke1Open",
                                  e.target.value
                                )
                              }
                              placeholder="3.0 sec"
                              className="w-full px-1.5 py-1 text-xs text-center border border-transparent hover:border-slate-300 focus:border-[#FF2D01] rounded outline-none"
                            />
                          </td>

                          {/* Stroke 1 Close */}
                          <td className="p-1 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.stroke1Close || ""}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  activeGroupIndex,
                                  idx,
                                  "stroke1Close",
                                  e.target.value
                                )
                              }
                              placeholder="3.0 sec"
                              className="w-full px-1.5 py-1 text-xs text-center border border-transparent hover:border-slate-300 focus:border-[#FF2D01] rounded outline-none"
                            />
                          </td>

                          {/* Stroke 2 Open */}
                          <td className="p-1 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.stroke2Open || ""}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  activeGroupIndex,
                                  idx,
                                  "stroke2Open",
                                  e.target.value
                                )
                              }
                              placeholder="3.0 sec"
                              className="w-full px-1.5 py-1 text-xs text-center border border-transparent hover:border-slate-300 focus:border-[#FF2D01] rounded outline-none"
                            />
                          </td>

                          {/* Stroke 2 Close */}
                          <td className="p-1 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.stroke2Close || ""}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  activeGroupIndex,
                                  idx,
                                  "stroke2Close",
                                  e.target.value
                                )
                              }
                              placeholder="3.0 sec"
                              className="w-full px-1.5 py-1 text-xs text-center border border-transparent hover:border-slate-300 focus:border-[#FF2D01] rounded outline-none"
                            />
                          </td>

                          {/* Stroke 3 Open */}
                          <td className="p-1 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.stroke3Open || ""}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  activeGroupIndex,
                                  idx,
                                  "stroke3Open",
                                  e.target.value
                                )
                              }
                              placeholder="3.0 sec"
                              className="w-full px-1.5 py-1 text-xs text-center border border-transparent hover:border-slate-300 focus:border-[#FF2D01] rounded outline-none"
                            />
                          </td>

                          {/* Stroke 3 Close */}
                          <td className="p-1 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.stroke3Close || ""}
                              onChange={(e) =>
                                handleItemFieldChange(
                                  activeGroupIndex,
                                  idx,
                                  "stroke3Close",
                                  e.target.value
                                )
                              }
                              placeholder="3.0 sec"
                              className="w-full px-1.5 py-1 text-xs text-center border border-transparent hover:border-slate-300 focus:border-[#FF2D01] rounded outline-none"
                            />
                          </td>

                          {/* Actions */}
                          <td className="p-1 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDuplicateItem(activeGroupIndex, idx)}
                                title="Duplicate this row"
                                className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(activeGroupIndex, idx)}
                                title="Delete row"
                                className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Page Break helper note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  Total <strong>{productGroups[activeGroupIndex].items.length} valves</strong> in this model will generate{" "}
                  <strong className="text-blue-600">
                    {Math.max(
                      1,
                      Math.ceil(productGroups[activeGroupIndex].items.length / 15)
                    )}{" "}
                    pages
                  </strong>{" "}
                  (max 15 rows per page).
                </span>
                <button
                  type="button"
                  onClick={() => handleAddItemsToGroup(activeGroupIndex, 15)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  + Add Next Page (15 Items)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. SIGNATORIES SECTION                                         */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("signatories")}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 transition border-b border-slate-200/80"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm text-slate-900">
                3. Authorized Signatories
              </h3>
              <p className="text-xs text-slate-500">
                Performed by (Test Engineer) and Verified by (Quality Manager)
              </p>
            </div>
          </div>
          {openSections.signatories ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {openSections.signatories && (
          <div className="p-5 bg-white">
            <SignatorySelector
              witnessedBy={data.witnessedBy}
              verifiedBy={data.verifiedBy}
              witnessSignatureUrl={data.witnessSignatureUrl}
              verifiedSignatureUrl={data.verifiedSignatureUrl}
              onChangeWitnessedBy={(name: string, sigUrl?: string) =>
                onChange({
                  ...data,
                  witnessedBy: name,
                  witnessSignatureUrl: sigUrl,
                })
              }
              onChangeVerifiedBy={(name: string, sigUrl?: string) =>
                onChange({
                  ...data,
                  verifiedBy: name,
                  verifiedSignatureUrl: sigUrl,
                })
              }
            />
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: EXCEL PASTE MODAL                                     */}
      {/* ============================================================== */}
      {pasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-emerald-600" />
                <span>Paste from Excel / Spreadsheet</span>
              </h3>
              <button
                type="button"
                onClick={() => setPasteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Copy columns from Excel and paste here. Tab-separated columns will be parsed automatically:
              <br />
              <code className="text-[11px] bg-slate-100 p-1 rounded font-mono block mt-1">
                Tag No [tab] Actuator Serial No [tab] Stroke 1 O [tab] Stroke 1 C [tab] Stroke 2 O [tab] Stroke 2 C [tab] Stroke 3 O [tab] Stroke 3 C
              </code>
            </p>

            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="V-001	ACT-001	3.0 sec	3.0 sec	3.0 sec	3.0 sec	3.0 sec	3.0 sec
V-002	ACT-002	3.0 sec	3.0 sec	3.0 sec	3.0 sec	3.0 sec	3.0 sec"
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPasteModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportPastedData}
                disabled={!pasteText.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs"
              >
                Add Items to Model
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: AUTO-NUMBERING MODAL                                  */}
      {/* ============================================================== */}
      {autoNumberModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-600" />
                <span>Auto-Generate Sequential Numbers</span>
              </h3>
              <button
                type="button"
                onClick={() => setAutoNumberModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Quickly fill all rows in this model with sequential tag numbers and actuator serials.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valve Tag Prefix
                  </label>
                  <input
                    type="text"
                    value={tagPrefix}
                    onChange={(e) => setTagPrefix(e.target.value)}
                    placeholder="TAG-"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Number
                  </label>
                  <input
                    type="number"
                    value={tagStartNum}
                    onChange={(e) => setTagStartNum(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Actuator Serial Prefix
                  </label>
                  <input
                    type="text"
                    value={actuatorPrefix}
                    onChange={(e) => setActuatorPrefix(e.target.value)}
                    placeholder="ACT-"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Number
                  </label>
                  <input
                    type="number"
                    value={actuatorStartNum}
                    onChange={(e) =>
                      setActuatorStartNum(parseInt(e.target.value, 10) || 1)
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAutoNumberModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyAutoNumbering}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Apply to All Rows
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BOTTOM ACTION BAR                                              */}
      {/* ============================================================== */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-3.5 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
          )}

          {onSwitchToPreview && (
            <button
              type="button"
              onClick={onSwitchToPreview}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition inline-flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>Preview ({totalPagesAcrossAllGroups} Pages)</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition"
            >
              Save as Draft
            </button>
          )}

          {onSubmitForApproval && (
            <button
              type="button"
              onClick={onSubmitForApproval}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#FF2D01] to-orange-600 hover:from-[#e02600] hover:to-orange-500 rounded-xl shadow-md transition"
            >
              {isSaving ? "Saving..." : submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
