import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

const logDoc = v.object({
  _id: v.id("activityLogs"),
  _creationTime: v.number(),
  userId: v.id("users"),
  action: v.string(),
  targetType: v.string(),
  targetId: v.string(),
  details: v.optional(v.any()),
  ip: v.optional(v.string()),
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(logDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("activityLogs").order("desc").paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id("activityLogs") },
  returns: v.union(logDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listByUser = query({
  args: { userId: v.id("users"), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(logDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByTargetType = query({
  args: { targetType: v.string(), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(logDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_targetType", (q) => q.eq("targetType", args.targetType))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listByAction = query({
  args: { action: v.string(), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(logDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_action", (q) => q.eq("action", args.action))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const log = mutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    details: v.optional(v.any()),
    ip: v.optional(v.string()),
  },
  returns: v.id("activityLogs"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityLogs", args);
  },
});

export const logInternal = internalMutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    details: v.optional(v.any()),
    ip: v.optional(v.string()),
  },
  returns: v.id("activityLogs"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("activityLogs", args);
  },
});

export const getRecentByUser = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  returns: v.array(logDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activityLogs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 10);
  },
});

// OPTIMIZED: Use limit instead of collect() to prevent bandwidth explosion
const MAX_LOGS_LIMIT = 5000;

export const getStats = query({
  args: { since: v.optional(v.number()) },
  returns: v.object({
    totalLogs: v.number(),
    byAction: v.array(v.object({ action: v.string(), count: v.number() })),
    byTargetType: v.array(v.object({ targetType: v.string(), count: v.number() })),
  }),
  handler: async (ctx, args) => {
    // OPTIMIZED: Use take() with limit instead of collect()
    const logs = await ctx.db.query("activityLogs")
      .order("desc")
      .take(MAX_LOGS_LIMIT);
    
    const filteredLogs = args.since
      ? logs.filter((l) => l._creationTime >= args.since!)
      : logs;
    
    const actionCounts: Record<string, number> = {};
    const targetCounts: Record<string, number> = {};
    for (const log of filteredLogs) {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      targetCounts[log.targetType] = (targetCounts[log.targetType] || 0) + 1;
    }
    return {
      totalLogs: filteredLogs.length,
      byAction: Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count),
      byTargetType: Object.entries(targetCounts)
        .map(([targetType, count]) => ({ targetType, count }))
        .sort((a, b) => b.count - a.count),
    };
  },
});

// OPTIMIZED: Batch delete with limit to prevent timeout
export const cleanup = internalMutation({
  args: { olderThan: v.number() },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Batch delete: only delete up to 1000 records per call to avoid timeout
    const BATCH_SIZE = 1000;
    const logs = await ctx.db.query("activityLogs")
      .order("asc")
      .take(BATCH_SIZE);
    
    let deleted = 0;
    for (const log of logs) {
      if (log._creationTime < args.olderThan) {
        await ctx.db.delete(log._id);
        deleted++;
      }
    }
    return deleted;
  },
});
