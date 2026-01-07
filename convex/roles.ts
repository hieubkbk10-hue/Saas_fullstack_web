import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

const roleDoc = v.object({
  _id: v.id("roles"),
  _creationTime: v.number(),
  name: v.string(),
  description: v.string(),
  color: v.optional(v.string()),
  isSystem: v.boolean(),
  isSuperAdmin: v.optional(v.boolean()),
  permissions: v.record(v.string(), v.array(v.string())),
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(roleDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("roles").paginate(args.paginationOpts);
  },
});

export const listAll = query({
  args: {},
  returns: v.array(roleDoc),
  handler: async (ctx) => {
    return await ctx.db.query("roles").collect();
  },
});

export const getById = query({
  args: { id: v.id("roles") },
  returns: v.union(roleDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByName = query({
  args: { name: v.string() },
  returns: v.union(roleDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
  },
});

export const getSystemRoles = query({
  args: {},
  returns: v.array(roleDoc),
  handler: async (ctx) => {
    return await ctx.db
      .query("roles")
      .withIndex("by_isSystem", (q) => q.eq("isSystem", true))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    color: v.optional(v.string()),
    isSystem: v.optional(v.boolean()),
    isSuperAdmin: v.optional(v.boolean()),
    permissions: v.record(v.string(), v.array(v.string())),
  },
  returns: v.id("roles"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("roles")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique();
    if (existing) {
      throw new Error(`Tên vai trò "${args.name}" đã tồn tại`);
    }
    return await ctx.db.insert("roles", {
      ...args,
      isSystem: args.isSystem ?? false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("roles"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    permissions: v.optional(v.record(v.string(), v.array(v.string()))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const role = await ctx.db.get(id);
    if (!role) throw new Error("Không tìm thấy vai trò");
    if (role.isSystem) throw new Error("Không thể chỉnh sửa vai trò hệ thống");
    
    // Check unique name if updating name
    if (updates.name && updates.name !== role.name) {
      const existing = await ctx.db
        .query("roles")
        .withIndex("by_name", (q) => q.eq("name", updates.name!))
        .unique();
      if (existing) {
        throw new Error(`Tên vai trò "${updates.name}" đã tồn tại`);
      }
    }
    
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("roles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const role = await ctx.db.get(args.id);
    if (!role) throw new Error("Không tìm thấy vai trò");
    if (role.isSystem) throw new Error("Không thể xóa vai trò hệ thống");
    
    const usersWithRole = await ctx.db
      .query("users")
      .withIndex("by_role_status", (q) => q.eq("roleId", args.id))
      .collect();
    
    if (usersWithRole.length > 0) {
      throw new Error(`Không thể xóa vai trò "${role.name}" vì đang được gán cho ${usersWithRole.length} người dùng`);
    }
    
    await ctx.db.delete(args.id);
    return null;
  },
});

export const checkPermission = query({
  args: {
    roleId: v.id("roles"),
    module: v.string(),
    action: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const role = await ctx.db.get(args.roleId);
    if (!role) return false;
    if (role.isSuperAdmin) return true;
    const modulePermissions = role.permissions[args.module];
    if (!modulePermissions) return false;
    return modulePermissions.includes(args.action);
  },
});

export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const roles = await ctx.db.query("roles").collect();
    return roles.length;
  },
});

export const getStats = query({
  args: {},
  returns: v.object({
    totalCount: v.number(),
    systemCount: v.number(),
    customCount: v.number(),
    superAdminCount: v.number(),
  }),
  handler: async (ctx) => {
    const roles = await ctx.db.query("roles").collect();
    let systemCount = 0;
    let superAdminCount = 0;

    for (const r of roles) {
      if (r.isSystem) systemCount++;
      if (r.isSuperAdmin) superAdminCount++;
    }

    return {
      totalCount: roles.length,
      systemCount,
      customCount: roles.length - systemCount,
      superAdminCount,
    };
  },
});

export const getUserCountByRole = query({
  args: {},
  returns: v.array(v.object({
    roleId: v.id("roles"),
    roleName: v.string(),
    userCount: v.number(),
  })),
  handler: async (ctx) => {
    const roles = await ctx.db.query("roles").collect();
    const users = await ctx.db.query("users").collect();

    const result = roles.map(role => {
      const userCount = users.filter(u => u.roleId === role._id).length;
      return {
        roleId: role._id,
        roleName: role.name,
        userCount,
      };
    });

    return result;
  },
});
