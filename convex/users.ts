import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
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
    status: v.union(
      v.literal("Active"),
      v.literal("Inactive"),
      v.literal("Banned")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role_status", (q) =>
        q.eq("roleId", args.roleId).eq("status", args.status)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    roleId: v.id("roles"),
    status: v.union(
      v.literal("Active"),
      v.literal("Inactive"),
      v.literal("Banned")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      ...args,
      lastLogin: undefined,
    });
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
    status: v.optional(
      v.union(
        v.literal("Active"),
        v.literal("Inactive"),
        v.literal("Banned")
      )
    ),
    lastLogin: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
