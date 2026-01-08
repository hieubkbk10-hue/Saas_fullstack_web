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

// USR-003 FIX: Thêm limit để tránh memory overflow (roles thường ít nên 100 là đủ)
export const listAll = query({
  args: {},
  returns: v.array(roleDoc),
  handler: async (ctx) => {
    return await ctx.db.query("roles").take(100);
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

// Helper function to update roleStats counter
async function updateRoleStats(
  ctx: { db: any },
  key: string,
  delta: number
) {
  const stats = await ctx.db
    .query("roleStats")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .unique();
  if (stats) {
    await ctx.db.patch(stats._id, { count: Math.max(0, stats.count + delta) });
  } else {
    await ctx.db.insert("roleStats", { key, count: Math.max(0, delta) });
  }
}

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
    const roleId = await ctx.db.insert("roles", {
      ...args,
      isSystem: args.isSystem ?? false,
    });
    
    // Update counters
    const updates = [updateRoleStats(ctx, "total", 1)];
    if (args.isSystem) updates.push(updateRoleStats(ctx, "system", 1));
    if (args.isSuperAdmin) updates.push(updateRoleStats(ctx, "superAdmin", 1));
    await Promise.all(updates);
    
    return roleId;
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
      .take(1);
    
    if (usersWithRole.length > 0) {
      throw new Error(`Không thể xóa vai trò "${role.name}" vì đang được gán cho người dùng`);
    }
    
    await ctx.db.delete(args.id);
    
    // Update counters
    const updates = [updateRoleStats(ctx, "total", -1)];
    if (role.isSystem) updates.push(updateRoleStats(ctx, "system", -1));
    if (role.isSuperAdmin) updates.push(updateRoleStats(ctx, "superAdmin", -1));
    await Promise.all(updates);
    
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

// USR-002 FIX: Dùng counter table thay vì fetch ALL
export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const stats = await ctx.db
      .query("roleStats")
      .withIndex("by_key", (q) => q.eq("key", "total"))
      .unique();
    return stats?.count ?? 0;
  },
});

// USR-002 FIX: Dùng counter table cho stats
export const getStats = query({
  args: {},
  returns: v.object({
    totalCount: v.number(),
    systemCount: v.number(),
    customCount: v.number(),
    superAdminCount: v.number(),
  }),
  handler: async (ctx) => {
    const [total, system, superAdmin] = await Promise.all([
      ctx.db.query("roleStats").withIndex("by_key", (q) => q.eq("key", "total")).unique(),
      ctx.db.query("roleStats").withIndex("by_key", (q) => q.eq("key", "system")).unique(),
      ctx.db.query("roleStats").withIndex("by_key", (q) => q.eq("key", "superAdmin")).unique(),
    ]);

    const totalCount = total?.count ?? 0;
    const systemCount = system?.count ?? 0;
    const superAdminCount = superAdmin?.count ?? 0;

    return {
      totalCount,
      systemCount,
      customCount: totalCount - systemCount,
      superAdminCount,
    };
  },
});

// USR-004 FIX: Optimize với Map lookup thay vì filter O(n²)
export const getUserCountByRole = query({
  args: {},
  returns: v.array(v.object({
    roleId: v.id("roles"),
    roleName: v.string(),
    userCount: v.number(),
  })),
  handler: async (ctx) => {
    const [roles, users] = await Promise.all([
      ctx.db.query("roles").take(100),
      ctx.db.query("users").take(500),
    ]);

    // Build Map for O(1) lookup instead of O(n) filter
    const userCountMap = new Map<string, number>();
    users.forEach((u) => {
      const count = userCountMap.get(u.roleId) || 0;
      userCountMap.set(u.roleId, count + 1);
    });

    return roles.map((role) => ({
      roleId: role._id,
      roleName: role.name,
      userCount: userCountMap.get(role._id) || 0,
    }));
  },
});
