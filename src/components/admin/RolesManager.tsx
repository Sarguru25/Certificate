"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PERMISSIONS_LIST } from "@/lib/permissions";
import { Plus, Shield, Pencil, Trash2, CheckCircle2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export interface RoleItem {
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

interface RolesManagerProps {
  initialRoles: RoleItem[];
}

export const RolesManager: React.FC<RolesManagerProps> = ({ initialRoles }) => {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleItem[]>(initialRoles);

  // Success / Error alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Create role modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit role modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editRoleDescription, setEditRoleDescription] = useState("");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Delete role confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshRolesList = async () => {
    try {
      const res = await fetch("/api/roles");
      const json = await res.json();
      if (json.roles) {
        setRoles(json.roles);
      }
    } catch {
      // Fallback router refresh
      router.refresh();
    }
  };

  // --- Create Handlers ---
  const handleToggleCreatePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelectAllCreate = () => {
    setSelectedPermissions(PERMISSIONS_LIST.map((p) => p.code));
  };

  const handleDeselectAllCreate = () => {
    setSelectedPermissions([]);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roleName,
          description: roleDescription,
          permissions: selectedPermissions,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create role");

      setSuccessMsg(`Role "${roleName}" was successfully created.`);
      setCreateModalOpen(false);
      setRoleName("");
      setRoleDescription("");
      setSelectedPermissions([]);
      await refreshRolesList();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error creating role");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Edit Handlers ---
  const openEditModal = (role: RoleItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEditingRole(role);
    setEditRoleName(role.name);
    setEditRoleDescription(role.description || "");
    setEditPermissions(role.permissions || []);
    setEditModalOpen(true);
  };

  const handleToggleEditPermission = (code: string) => {
    setEditPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSelectAllEdit = () => {
    setEditPermissions(PERMISSIONS_LIST.map((p) => p.code));
  };

  const handleDeselectAllEdit = () => {
    setEditPermissions([]);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    setIsEditing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/roles/${editingRole._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editRoleName,
          description: editRoleDescription,
          permissions: editPermissions,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update role");

      setSuccessMsg(`Role "${editRoleName}" was successfully updated.`);
      setEditModalOpen(false);
      setEditingRole(null);
      await refreshRolesList();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error updating role");
    } finally {
      setIsEditing(false);
    }
  };

  // --- Delete Handlers ---
  const openDeleteDialog = (role: RoleItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/roles/${roleToDelete._id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete role");

      setSuccessMsg(`Role "${roleToDelete.name}" was successfully deleted.`);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
      await refreshRolesList();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error deleting role");
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* GLOBAL NOTIFICATION ALERTS */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 font-bold ml-2">
            ×
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* TOP ACTIONS */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setErrorMsg(null);
            setSuccessMsg(null);
            setRoleName("");
            setRoleDescription("");
            setSelectedPermissions([]);
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Role</span>
        </button>
      </div>

      {/* ROLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roles.map((role) => {
          const isAdministrator = role.name === "Administrator";

          return (
            <div
              key={role._id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-orange-50 text-[#FF2D01] rounded-xl">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {role.name}
                      </h3>
                      {role.isSystem ? (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          System Role
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">
                          Custom Role
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                    {role.permissions?.length || 0} Perms
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-3 leading-relaxed min-h-[36px]">
                  {role.description || "No description provided."}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">
                    Key Granted Permissions:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.slice(0, 5).map((perm: string) => (
                      <span
                        key={perm}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600"
                      >
                        {perm}
                      </span>
                    ))}
                    {role.permissions?.length > 5 && (
                      <span className="text-[10px] font-semibold text-slate-400 self-center pl-1">
                        +{role.permissions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD ACTION FOOTER */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(role)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition"
                  title={`Edit ${role.name} Role`}
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Role</span>
                </button>

                {isAdministrator ? (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 px-2 py-1 bg-slate-50 rounded-lg cursor-not-allowed"
                    title="The Administrator role is vital to system security and cannot be deleted."
                  >
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Protected</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(role)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition"
                    title={`Delete ${role.name} Role`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE ROLE MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Custom Security Role"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Senior QA Reviewer"
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Operational responsibilities and authorization scope"
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Grant Permissions ({selectedPermissions.length} selected)
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllCreate}
                  className="text-[#FF2D01] font-semibold hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllCreate}
                  className="text-slate-500 font-semibold hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-2 divide-y divide-slate-100">
              {PERMISSIONS_LIST.map((p) => {
                const isChecked = selectedPermissions.includes(p.code);
                return (
                  <label
                    key={p.code}
                    className="flex items-start gap-2.5 pt-2 first:pt-0 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCreatePermission(p.code)}
                      className="mt-0.5 accent-[#FF2D01] rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {p.name}
                        <span className="ml-2 font-mono text-[10px] text-slate-400 font-normal">
                          ({p.code})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 leading-tight">
                        {p.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Save Role"}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT ROLE MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingRole(null);
        }}
        title={`Edit Role: ${editingRole?.name || ""}`}
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateRole} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={editingRole?.name === "Administrator"}
              value={editRoleName}
              onChange={(e) => setEditRoleName(e.target.value)}
              className={`w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] ${
                editingRole?.name === "Administrator"
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                  : ""
              }`}
            />
            {editingRole?.name === "Administrator" && (
              <span className="text-[11px] text-slate-400 mt-1 block">
                The name of the Administrator system role cannot be modified.
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={editRoleDescription}
              onChange={(e) => setEditRoleDescription(e.target.value)}
              placeholder="Operational responsibilities and authorization scope"
              className="w-full text-sm border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Grant Permissions ({editPermissions.length} selected)
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllEdit}
                  className="text-[#FF2D01] font-semibold hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAllEdit}
                  className="text-slate-500 font-semibold hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-3 space-y-2 divide-y divide-slate-100">
              {PERMISSIONS_LIST.map((p) => {
                const isChecked = editPermissions.includes(p.code);
                return (
                  <label
                    key={p.code}
                    className="flex items-start gap-2.5 pt-2 first:pt-0 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleEditPermission(p.code)}
                      className="mt-0.5 accent-[#FF2D01] rounded"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {p.name}
                        <span className="ml-2 font-mono text-[10px] text-slate-400 font-normal">
                          ({p.code})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 leading-tight">
                        {p.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setEditModalOpen(false);
                setEditingRole(null);
              }}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEditing}
              className="px-5 py-2 text-xs font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isEditing ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setRoleToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete Role "${roleToDelete?.name || ""}"`}
        message={`Are you sure you want to permanently delete the "${roleToDelete?.name}" role?\n\nNote: If any users are currently assigned to this role, deletion will be blocked until they are reassigned.`}
        confirmLabel="Delete Role"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
