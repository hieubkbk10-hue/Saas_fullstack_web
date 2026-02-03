import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { userStatus } from "./lib/validators";

const userDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("users"),
  avatar: v.optional(v.string()),
  email: v.string(),
  lastLogin: v.optional(v.number()),
  name: v.string(),
  phone: v.optional(v.string()),
  roleId: v.id("roles"),
  status: userStatus,
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => ctx.db.query("users").paginate(args.paginationOpts),
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    page: v.array(userDoc),
  }),
});

// USR-003 FIX: Thêm limit để tránh memory overflow
export const listAll = query({
  args: {},
  handler: async (ctx) => ctx.db.query("users").take(500),
  returns: v.array(userDoc),
});

export const listAdminWithOffset = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    roleId: v.optional(v.id("roles")),
    search: v.optional(v.string()),
    status: v.optional(userStatus),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 100);
    const offset = args.offset ?? 0;
    const fetchLimit = Math.min(offset + limit + 50, 1000);

    let users: Doc<"users">[] = [];
    if (args.roleId && args.status) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role_status", (q) => q.eq("roleId", args.roleId!).eq("status", args.status!))
        .order("desc")
        .take(fetchLimit);
    } else if (args.roleId) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role_status", (q) => q.eq("roleId", args.roleId!))
        .order("desc")
        .take(fetchLimit);
    } else if (args.status) {
      users = await ctx.db
        .query("users")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(fetchLimit);
    } else {
      users = await ctx.db.query("users").order("desc").take(fetchLimit);
    }

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      users = users.filter((user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    return users.slice(offset, offset + limit);
  },
  returns: v.array(userDoc),
});

export const countAdmin = query({
  args: {
    roleId: v.optional(v.id("roles")),
    search: v.optional(v.string()),
    status: v.optional(userStatus),
  },
  handler: async (ctx, args) => {
    const limit = 5000;
    const fetchLimit = limit + 1;

    let users: Doc<"users">[] = [];
    if (args.roleId && args.status) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role_status", (q) => q.eq("roleId", args.roleId!).eq("status", args.status!))
        .take(fetchLimit);
    } else if (args.roleId) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role_status", (q) => q.eq("roleId", args.roleId!))
        .take(fetchLimit);
    } else if (args.status) {
      users = await ctx.db
        .query("users")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .take(fetchLimit);
    } else {
      users = await ctx.db.query("users").take(fetchLimit);
    }

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      users = users.filter((user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    return { count: Math.min(users.length, limit), hasMore: users.length > limit };
  },
  returns: v.object({ count: v.number(), hasMore: v.boolean() }),
});

export const listAdminIds = query({
  args: {
    limit: v.optional(v.number()),
    roleId: v.optional(v.id("roles")),
    search: v.optional(v.string()),
    status: v.optional(userStatus),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 5000, 5000);
    const fetchLimit = limit + 1;

    let users: Doc<"users">[] = [];
    if (args.roleId && args.status) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role_status", (q) => q.eq("roleId", args.roleId!).eq("status", args.status!))
        .take(fetchLimit);
    } else if (args.roleId) {
      users = await ctx.db
        .query("users")
        .withIndex("by_role_status", (q) => q.eq("roleId", args.roleId!))
        .take(fetchLimit);
    } else if (args.status) {
      users = await ctx.db
        .query("users")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .take(fetchLimit);
    } else {
      users = await ctx.db.query("users").take(fetchLimit);
    }

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      users = users.filter((user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    const hasMore = users.length > limit;
    return { ids: users.slice(0, limit).map((user) => user._id), hasMore };
  },
  returns: v.object({ ids: v.array(v.id("users")), hasMore: v.boolean() }),
});

// USR-001 FIX: Dùng counter table thay vì fetch ALL
export const count = query({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_key", (q) => q.eq("key", "total"))
      .unique();
    return stats?.count ?? 0;
  },
  returns: v.number(),
});

// Helper: Get count by status from counter table
export const countByStatus = query({
  args: { status: userStatus },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_key", (q) => q.eq("key", args.status))
      .unique();
    return stats?.count ?? 0;
  },
  returns: v.number(),
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => ctx.db.get(args.id),
  returns: v.union(userDoc, v.null()),
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique(),
  returns: v.union(userDoc, v.null()),
});

export const getByRoleAndStatus = query({
  args: {
    paginationOpts: paginationOptsValidator,
    roleId: v.id("roles"),
    status: userStatus,
  },
  handler: async (ctx, args) => ctx.db
      .query("users")
      .withIndex("by_role_status", (q) =>
        q.eq("roleId", args.roleId).eq("status", args.status)
      )
      .paginate(args.paginationOpts),
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    page: v.array(userDoc),
  }),
});

export const getByStatus = query({
  args: { paginationOpts: paginationOptsValidator, status: userStatus },
  handler: async (ctx, args) => ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .paginate(args.paginationOpts),
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    page: v.array(userDoc),
  }),
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
    await ctx.db.insert("userStats", { count: Math.max(0, delta), key });
  }
}

export const create = mutation({
  args: {
    avatar: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    roleId: v.id("roles"),
    status: userStatus,
  },
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
  returns: v.id("users"),
});

export const update = mutation({
  args: {
    avatar: v.optional(v.string()),
    email: v.optional(v.string()),
    id: v.id("users"),
    lastLogin: v.optional(v.number()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    roleId: v.optional(v.id("roles")),
    status: v.optional(userStatus),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const user = await ctx.db.get(id);
    if (!user) {throw new Error("User not found");}
    
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
  returns: v.null(),
});

export const updateLastLogin = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { lastLogin: Date.now() });
    return null;
  },
  returns: v.null(),
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {throw new Error("User not found");}
    
    await ctx.db.delete(args.id);
    
    // Update counters
    await Promise.all([
      updateUserStats(ctx, "total", -1),
      updateUserStats(ctx, user.status, -1),
    ]);
    
    return null;
  },
  returns: v.null(),
});

// USR-005 FIX: Bulk delete with parallel execution
export const bulkRemove = mutation({
  args: { ids: v.array(v.id("users")) },
  handler: async (ctx, args) => {
    const users = await Promise.all(args.ids.map( async (id) => ctx.db.get(id)));
    const validUsers = users.filter((u): u is NonNullable<typeof u> => u !== null);
    
    // Delete all users in parallel
    await Promise.all(args.ids.map( async (id) => ctx.db.delete(id)));
    
    // Update counters
    const statusCounts: Record<string, number> = {};
    validUsers.forEach((u) => {
      statusCounts[u.status] = (statusCounts[u.status] || 0) + 1;
    });
    
    await Promise.all([
      updateUserStats(ctx, "total", -validUsers.length),
      ...Object.entries(statusCounts).map( async ([status, count]) =>
        updateUserStats(ctx, status, -count)
      ),
    ]);
    
    return null;
  },
  returns: v.null(),
});
