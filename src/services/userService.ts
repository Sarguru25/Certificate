import mongoose from "mongoose";
import { User, IUserDocument } from "@/models/User";
import { Role, IRoleDocument } from "@/models/Role";
import { hashPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

export async function listUsers() {
  await connectToDatabase();
  return await User.find()
    .select("-passwordHash")
    .populate("roleId", "name permissions")
    .sort({ createdAt: -1 })
    .lean();
}

export async function getUserById(id: string) {
  await connectToDatabase();
  return await User.findById(id)
    .select("-passwordHash")
    .populate("roleId", "name permissions")
    .lean();
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  roleId: string;
  isActive?: boolean;
}): Promise<IUserDocument> {
  await connectToDatabase();

  const existing = await User.findOne({ email: data.email.toLowerCase().trim() });
  if (existing) {
    throw new Error("A user with this email address already exists.");
  }

  const passwordHash = await hashPassword(data.password);

  const newUser = new User({
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash,
    roleId: new mongoose.Types.ObjectId(data.roleId),
    isActive: data.isActive !== undefined ? data.isActive : true,
  });

  await newUser.save();
  return newUser;
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    roleId?: string;
    isActive?: boolean;
  }
) {
  await connectToDatabase();

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  if (data.email && data.email.toLowerCase().trim() !== user.email) {
    const existing = await User.findOne({
      email: data.email.toLowerCase().trim(),
      _id: { $ne: id },
    });
    if (existing) {
      throw new Error("Email already in use by another account.");
    }
    user.email = data.email.toLowerCase().trim();
  }

  if (data.name) user.name = data.name.trim();
  if (data.roleId) user.roleId = new mongoose.Types.ObjectId(data.roleId);
  if (data.isActive !== undefined) user.isActive = data.isActive;
  if (data.password && data.password.trim()) {
    user.passwordHash = await hashPassword(data.password.trim());
  }

  await user.save();
  return user;
}

export async function listRoles() {
  await connectToDatabase();
  return await Role.find().sort({ name: 1 }).lean();
}

export async function getRoleById(id: string) {
  await connectToDatabase();
  return await Role.findById(id).lean();
}

export async function createRole(data: {
  name: string;
  description?: string;
  permissions: string[];
}): Promise<IRoleDocument> {
  await connectToDatabase();

  const existing = await Role.findOne({ name: data.name.trim() });
  if (existing) {
    throw new Error("A role with this name already exists.");
  }

  const newRole = new Role({
    name: data.name.trim(),
    description: data.description?.trim() || "",
    permissions: data.permissions || [],
    isSystem: false,
  });

  await newRole.save();
  return newRole;
}

export async function updateRole(
  id: string,
  data: {
    name?: string;
    description?: string;
    permissions?: string[];
  }
) {
  await connectToDatabase();

  const role = await Role.findById(id);
  if (!role) {
    throw new Error("Role not found");
  }

  if (data.name && data.name.trim() !== role.name) {
    const existing = await Role.findOne({
      name: data.name.trim(),
      _id: { $ne: id },
    });
    if (existing) {
      throw new Error("Role name already in use.");
    }
    role.name = data.name.trim();
  }

  if (data.description !== undefined) {
    role.description = data.description.trim();
  }
  if (data.permissions) {
    role.permissions = data.permissions;
  }

  await role.save();
  return role;
}

export async function deleteRole(id: string): Promise<void> {
  await connectToDatabase();

  const role = await Role.findById(id);
  if (!role) {
    throw new Error("Role not found");
  }

  if (role.name === "Administrator") {
    throw new Error("The Administrator role cannot be deleted as it is vital to system security.");
  }

  const userCount = await User.countDocuments({ roleId: role._id });
  if (userCount > 0) {
    throw new Error(
      `Cannot delete role '${role.name}' because ${userCount} user(s) are currently assigned to it. Please reassign those users to a different role first.`
    );
  }

  await Role.findByIdAndDelete(id);
}

export async function deleteUser(id: string, currentUserId?: string): Promise<void> {
  await connectToDatabase();

  const user = await User.findById(id).populate("roleId");
  if (!user) {
    throw new Error("User not found");
  }

  if (currentUserId && id === currentUserId) {
    throw new Error("You cannot delete your own account.");
  }

  // Prevent deleting the sole Administrator
  const roleName = (user.roleId as unknown as { name?: string })?.name;
  if (roleName === "Administrator") {
    const adminRole = await Role.findOne({ name: "Administrator" });
    if (adminRole) {
      const adminCount = await User.countDocuments({ roleId: adminRole._id });
      if (adminCount <= 1) {
        throw new Error("Cannot delete the only Administrator account.");
      }
    }
  }

  await User.findByIdAndDelete(id);
}

