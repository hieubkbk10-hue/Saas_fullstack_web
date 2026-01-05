import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

const visitorDoc = v.object({
  _id: v.id("visitors"),
  _creationTime: v.number(),
  sessionId: v.string(),
  ip: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  referrer: v.optional(v.string()),
  path: v.string(),
  country: v.optional(v.string()),
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(visitorDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("visitors").order("desc").paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id("visitors") },
  returns: v.union(visitorDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listBySession = query({
  args: { sessionId: v.string() },
  returns: v.array(visitorDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("visitors")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const listByPath = query({
  args: { path: v.string(), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(visitorDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("visitors")
      .withIndex("by_path", (q) => q.eq("path", args.path))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const track = mutation({
  args: {
    sessionId: v.string(),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    path: v.string(),
    country: v.optional(v.string()),
  },
  returns: v.id("visitors"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("visitors", args);
  },
});

export const getStats = query({
  args: {},
  returns: v.object({
    totalVisits: v.number(),
    uniqueSessions: v.number(),
    topPages: v.array(v.object({ path: v.string(), count: v.number() })),
  }),
  handler: async (ctx) => {
    const visitors = await ctx.db.query("visitors").collect();
    const sessions = new Set<string>();
    const pageCounts: Record<string, number> = {};
    for (const visitor of visitors) {
      sessions.add(visitor.sessionId);
      pageCounts[visitor.path] = (pageCounts[visitor.path] || 0) + 1;
    }
    const topPages = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    return {
      totalVisits: visitors.length,
      uniqueSessions: sessions.size,
      topPages,
    };
  },
});

export const getRecentStats = query({
  args: { since: v.number() },
  returns: v.object({
    totalVisits: v.number(),
    uniqueSessions: v.number(),
  }),
  handler: async (ctx, args) => {
    const visitors = await ctx.db.query("visitors").collect();
    const recentVisitors = visitors.filter((v) => v._creationTime >= args.since);
    const sessions = new Set<string>();
    for (const visitor of recentVisitors) {
      sessions.add(visitor.sessionId);
    }
    return {
      totalVisits: recentVisitors.length,
      uniqueSessions: sessions.size,
    };
  },
});

export const cleanup = internalMutation({
  args: { olderThan: v.number() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const visitors = await ctx.db.query("visitors").collect();
    let deleted = 0;
    for (const visitor of visitors) {
      if (visitor._creationTime < args.olderThan) {
        await ctx.db.delete(visitor._id);
        deleted++;
      }
    }
    return deleted;
  },
});
