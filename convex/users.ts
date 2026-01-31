import { query, mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { userStatus } from "./lib/validators";

const userDoc = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  avatar: v.optional(v.string()),
  roleId: v.id("roles"),
  status: userStatus,
  lastLogin: v.optional(v.number()),
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(userDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("users").paginate(args.paginationOpts);
  },
});

// USR-003 FIX: Thêm limit để tránh memory overflow
export const listAll = query({
  args: {},
  returns: v.array(userDoc),
  handler: async (ctx) => {
    return await ctx.db.query("users").take(500);
  },
});

// USR-001 FIX: Dùng counter table thay vì fetch ALL
export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_key", (q) => q.eq("key", "total"))
      .unique();
    return stats?.count ?? 0;
  },
});

// Helper: Get count by status from counter table
export const countByStatus = query({
  args: { status: userStatus },
  returns: v.number(),
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_key", (q) => q.eq("key", args.status))
      .unique();
    return stats?.count ?? 0;
  },
});

export const getById = query({
  args: { id: v.id("users") },
  returns: v.union(userDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  returns: v.union(userDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getByRoleAndStatus = query({
  args: {
    roleId: v.id("roles"),
    status: userStatus,
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(userDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role_status", (q) =>
        q.eq("roleId", args.roleId).eq("status", args.status)
      )
      .paginate(args.paginationOpts);
  },
});

export const getByStatus = query({
  args: { status: userStatus, paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(userDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .paginate(args.paginationOpts);
  },
});

// Helper function to update userStats counter
async function updateUserStats(
  ctx: MutationCtx,
  key: string,
  delta: number
) {
  const stats = await ctx.db
    .query("userStats")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (stats) {
    await ctx.db.patch(stats._id, { count: Math.max(0, stats.count + delta) });
  } else {
    await ctx.db.insert("userStats", { key, count: Math.max(0, delta) });
  }
}

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    roleId: v.id("roles"),
    status: userStatus,
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) {
      throw new Error("Email already exists");
    }
    const userId = await ctx.db.insert("users", { ...args });
    
    // Update counters
    await Promise.all([
      updateUserStats(ctx, "total", 1),
      updateUserStats(ctx, args.status, 1),
    ]);
    
    return userId;
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    roleId: v.optional(v.id("roles")),
    status: v.optional(userStatus),
    lastLogin: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const user = await ctx.db.get(id);
    if (!user) throw new Error("User not found");
    
    // Update status counters if status changed
    if (updates.status && updates.status !== user.status) {
      await Promise.all([
        updateUserStats(ctx, user.status, -1),
        updateUserStats(ctx, updates.status, 1),
      ]);
    }
    
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const updateLastLogin = mutation({
  args: { id: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastLogin: Date.now() });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) throw new Error("User not found");
    
    await ctx.db.delete(args.id);
    
    // Update counters
    await Promise.all([
      updateUserStats(ctx, "total", -1),
      updateUserStats(ctx, user.status, -1),
    ]);
    
    return null;
  },
});

// USR-005 FIX: Bulk delete with parallel execution
export const bulkRemove = mutation({
  args: { ids: v.array(v.id("users")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const users = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
    const validUsers = users.filter((u): u is NonNullable<typeof u> => u !== null);
    
    // Delete all users in parallel
    await Promise.all(args.ids.map((id) => ctx.db.delete(id)));
    
    // Update counters
    const statusCounts: Record<string, number> = {};
    validUsers.forEach((u) => {
      statusCounts[u.status] = (statusCounts[u.status] || 0) + 1;
    });
    
    await Promise.all([
      updateUserStats(ctx, "total", -validUsers.length),
      ...Object.entries(statusCounts).map(([status, count]) =>
        updateUserStats(ctx, status, -count)
      ),
    ]);
    
    return null;
  },
});
