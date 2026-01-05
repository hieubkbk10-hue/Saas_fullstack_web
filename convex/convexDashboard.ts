import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("convexDashboard"),
      _creationTime: v.number(),
      dashboardUrl: v.string(),
      email: v.optional(v.string()),
      password: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const config = await ctx.db.query("convexDashboard").first();
    return config ?? null;
  },
});

export const upsert = mutation({
  args: {
    dashboardUrl: v.string(),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("convexDashboard"),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("convexDashboard").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("convexDashboard", args);
  },
});

export const remove = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("convexDashboard").first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});
