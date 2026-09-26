"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Plus, Shield, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  roleId?: {
    _id: string;
    name: string;
    permissions: string[];
  };
  isActive: boolean;
}

interface RoleItem {
  _id: string;
  name: string;
  permissions: string[];
}

interface UsersManagerProps {
  initialUsers: UserItem[];
  roles: RoleItem[];
}

export const UsersManager: React.FC<UsersManagerProps> = ({
  initialUsers,
  roles,
}) => {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);

  // Success / Error alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Create user modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRoleId, setNewRoleId] = useState(roles[0]?._id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit user modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRoleId, setEditRoleId] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Delete user confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshUsersList = async () => {
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.users) {
        setUsers(json.users);
      }
    } catch {
      router.refresh();
    }
  };

  // --- CREATE USER ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          roleId: newRoleId,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create user");

      setSuccessMsg(`User "${newName}" was successfully created.`);
      setCreateModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      await refreshUsersList();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error creating user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- EDIT USER ---
  const openEditModal = (user: UserItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword("");
    setEditRoleId(user.roleId?._id || roles[0]?._id || "");
    setEditIsActive(user.isActive);
    setEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsEditing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: {
        name: string;
        email: string;
        roleId: string;
        isActive: boolean;
        password?: string;
      } = {
        name: editName,
        email: editEmail,
        roleId: editRoleId,
        isActive: editIsActive,
      };

      if (editPassword && editPassword.trim().length >= 6) {
        payload.password = editPassword.trim();
      }

      const res = await fetch(`/api/users/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update user");

      setSuccessMsg(`User "${editName}" was successfully updated.`);
      setEditModalOpen(false);
      setEditingUser(null);
      await refreshUsersList();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error updating user");
    } finally {
      setIsEditing(false);
    }
  };

  // --- DELETE USER ---
  const openDeleteDialog = (user: UserItem) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/users/${userToDelete._id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete user");

      setSuccessMsg(`User "${userToDelete.name}" was successfully deleted.`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      await refreshUsersList();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error deleting user");
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- TOGGLE ACTIVE ---
  const handleToggleActive = async (user: UserItem) => {
    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
        );
        setSuccessMsg(
          `User "${user.name}" was ${user.isActive ? "deactivated" : "activated"}.`
        );
      } else {
        const json = await res.json();
        setErrorMsg(json.error || "Failed to change user status.");
      }
    } catch (e) {
      console.error("Failed to toggle user status:", e);
      setErrorMsg("Failed to toggle user status.");
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
            setNewName("");
            setNewEmail("");
            setNewPassword("");
            setNewRoleId(roles[0]?._id || "");
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3.5 px-4">Employee Name</th>
                <th className="py-3.5 px-4">Corporate Email</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const roleName = u.roleId?.name || "Unassigned";
                return (
                  <tr key={u._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {u.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-[#FF2D01] border border-orange-200">
                        <Shield className="w-3 h-3" />
                        <span>{roleName}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          className={`text-xs font-semibold px-2 py-1 rounded-lg border transition ${
                            u.isActive
                              ? "text-slate-600 border-slate-200 hover:bg-slate-100"
                              : "text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                          }`}
                          title={u.isActive ? "Deactivate User" : "Activate User"}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition"
                          title={`Edit ${u.name}`}
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteDialog(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition"
                          title={`Delete ${u.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New User Account"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. KARTHIKEYAN.A"
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Corporate Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="name@zeetork.com"
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Role <span className="text-red-500">*</span>
            </label>
            <select
              value={newRoleId}
              onChange={(e) => setNewRoleId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.permissions?.length || 0} permissions)
                </option>
              ))}
            </select>
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
              {isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingUser(null);
        }}
        title={`Edit User: ${editingUser?.name || ""}`}
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Corporate Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Role <span className="text-red-500">*</span>
            </label>
            <select
              value={editRoleId}
              onChange={(e) => setEditRoleId(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.permissions?.length || 0} permissions)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Status
            </label>
            <select
              value={editIsActive ? "active" : "inactive"}
              onChange={(e) => setEditIsActive(e.target.value === "active")}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01] bg-white cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="inactive">Deactivated</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Update Password
            </label>
            <input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="Leave blank to keep existing password"
              minLength={6}
              className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#FF2D01]"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Only enter a value if you wish to reset this employee&apos;s password (min 6 chars).
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setEditModalOpen(false);
                setEditingUser(null);
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

      {/* DELETE USER CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete User "${userToDelete?.name || ""}"`}
        message={`Are you sure you want to permanently delete the user account for "${userToDelete?.name}" (${userToDelete?.email})?\n\nThis action cannot be undone.`}
        confirmLabel="Delete User"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
