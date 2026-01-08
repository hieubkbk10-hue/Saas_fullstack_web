import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { commentStatus, targetType } from "./lib/validators";
import * as CommentsModel from "./model/comments";

const commentDoc = v.object({
  _id: v.id("comments"),
  _creationTime: v.number(),
  content: v.string(),
  authorName: v.string(),
  authorEmail: v.optional(v.string()),
  authorIp: v.optional(v.string()),
  targetType: targetType,
  targetId: v.string(),
  parentId: v.optional(v.id("comments")),
  status: commentStatus,
  customerId: v.optional(v.id("customers")),
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(commentDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("comments").paginate(args.paginationOpts);
  },
});

// Limited list for admin (max 100 items)
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(commentDoc),
  handler: async (ctx, args) => {
    return await CommentsModel.listWithLimit(ctx, { limit: args.limit });
  },
});

export const listByTargetType = query({
  args: { targetType: targetType, limit: v.optional(v.number()) },
  returns: v.array(commentDoc),
  handler: async (ctx, args) => {
    return await CommentsModel.listByTargetType(ctx, { 
      targetType: args.targetType, 
      limit: args.limit 
    });
  },
});

// Efficient count using take()
export const countByTargetType = query({
  args: { targetType: targetType },
  returns: v.number(),
  handler: async (ctx, args) => {
    return await CommentsModel.countByTargetType(ctx, { targetType: args.targetType });
  },
});

export const getById = query({
  args: { id: v.id("comments") },
  returns: v.union(commentDoc, v.null()),
  handler: async (ctx, args) => {
    return await CommentsModel.getById(ctx, args);
  },
});

// Efficient count
export const count = query({
  args: { status: v.optional(commentStatus) },
  returns: v.object({
    count: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    return await CommentsModel.countWithLimit(ctx, { status: args.status });
  },
});

export const listByTarget = query({
  args: {
    targetType: targetType,
    targetId: v.string(),
    status: v.optional(commentStatus),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(commentDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("comments")
        .withIndex("by_target_status", (q) =>
          q.eq("targetType", args.targetType).eq("targetId", args.targetId).eq("status", args.status!)
        )
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("comments")
      .withIndex("by_target_status", (q) =>
        q.eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .paginate(args.paginationOpts);
  },
});

export const listByStatus = query({
  args: { status: commentStatus, paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(commentDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .paginate(args.paginationOpts);
  },
});

export const listPending = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(commentDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_status", (q) => q.eq("status", "Pending"))
      .paginate(args.paginationOpts);
  },
});

export const listByParent = query({
  args: { parentId: v.id("comments"), limit: v.optional(v.number()) },
  returns: v.array(commentDoc),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100);
    return await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .take(limit);
  },
});

export const listByCustomer = query({
  args: { customerId: v.id("customers"), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(commentDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .paginate(args.paginationOpts);
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    authorName: v.string(),
    authorEmail: v.optional(v.string()),
    authorIp: v.optional(v.string()),
    targetType: targetType,
    targetId: v.string(),
    parentId: v.optional(v.id("comments")),
    customerId: v.optional(v.id("customers")),
    status: v.optional(commentStatus),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    return await CommentsModel.create(ctx, args);
  },
});

export const update = mutation({
  args: {
    id: v.id("comments"),
    content: v.optional(v.string()),
    authorName: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
    status: v.optional(commentStatus),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await CommentsModel.update(ctx, args);
    return null;
  },
});

export const updateStatus = mutation({
  args: { id: v.id("comments"), status: commentStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    await CommentsModel.updateStatus(ctx, args);
    return null;
  },
});

export const approve = mutation({
  args: { id: v.id("comments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await CommentsModel.approve(ctx, args);
    return null;
  },
});

export const markAsSpam = mutation({
  args: { id: v.id("comments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await CommentsModel.markAsSpam(ctx, args);
    return null;
  },
});

export const bulkUpdateStatus = mutation({
  args: { ids: v.array(v.id("comments")), status: commentStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    await CommentsModel.bulkUpdateStatus(ctx, args);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("comments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await CommentsModel.remove(ctx, args);
    return null;
  },
});

// Efficient count pending using take()
export const countPending = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    return await CommentsModel.countPending(ctx);
  },
});
