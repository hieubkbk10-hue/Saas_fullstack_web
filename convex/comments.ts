import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { commentStatus, targetType } from "./lib/validators";
import * as CommentsModel from "./model/comments";

const commentDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("comments"),
  authorEmail: v.optional(v.string()),
  authorIp: v.optional(v.string()),
  authorName: v.string(),
  content: v.string(),
  customerId: v.optional(v.id("customers")),
  likesCount: v.optional(v.number()),
  parentId: v.optional(v.id("comments")),
  rating: v.optional(v.number()),
  status: commentStatus,
  targetId: v.string(),
  targetType: targetType,
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) =>  ctx.db.query("comments").paginate(args.paginationOpts),
});

// Limited list for admin (max 100 items)
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => CommentsModel.listWithLimit(ctx, { limit: args.limit }),
  returns: v.array(commentDoc),
});

export const listByTargetType = query({
  args: { limit: v.optional(v.number()), targetType: targetType },
  handler: async (ctx, args) => CommentsModel.listByTargetType(ctx, { 
      limit: args.limit, 
      targetType: args.targetType 
    }),
  returns: v.array(commentDoc),
});

// Paginated version for system page
export const listByTargetTypePaginated = query({
  args: { paginationOpts: paginationOptsValidator, targetType: targetType },
  handler: async (ctx, args) => ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("targetType"), args.targetType))
      .paginate(args.paginationOpts),
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    page: v.array(commentDoc),
    pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
});

// Efficient count using take()
export const countByTargetType = query({
  args: { targetType: targetType },
  handler: async (ctx, args) => CommentsModel.countByTargetType(ctx, { targetType: args.targetType }),
  returns: v.number(),
});

export const getById = query({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => CommentsModel.getById(ctx, args),
  returns: v.union(commentDoc, v.null()),
});

// Efficient count
export const count = query({
  args: { status: v.optional(commentStatus) },
  handler: async (ctx, args) => CommentsModel.countWithLimit(ctx, { status: args.status }),
  returns: v.object({
    count: v.number(),
    hasMore: v.boolean(),
  }),
});

export const listByTarget = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(commentStatus),
    targetId: v.string(),
    targetType: targetType,
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return  ctx.db
        .query("comments")
        .withIndex("by_target_status", (q) =>
          q.eq("targetType", args.targetType).eq("targetId", args.targetId).eq("status", args.status!)
        )
        .paginate(args.paginationOpts);
    }
    return  ctx.db
      .query("comments")
      .withIndex("by_target_status", (q) =>
        q.eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .paginate(args.paginationOpts);
  },
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    page: v.array(commentDoc),
    pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
});

export const listByStatus = query({
  args: { paginationOpts: paginationOptsValidator, status: commentStatus },
  handler: async (ctx, args) => ctx.db
      .query("comments")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .paginate(args.paginationOpts),
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    page: v.array(commentDoc),
    pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
});

export const listPending = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => ctx.db
      .query("comments")
      .withIndex("by_status", (q) => q.eq("status", "Pending"))
      .paginate(args.paginationOpts),
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    page: v.array(commentDoc),
    pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
});

export const listByParent = query({
  args: { limit: v.optional(v.number()), parentId: v.id("comments") },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100);
    return  ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .take(limit);
  },
  returns: v.array(commentDoc),
});

export const listByCustomer = query({
  args: { customerId: v.id("customers"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => ctx.db
      .query("comments")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .paginate(args.paginationOpts),
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    page: v.array(commentDoc),
    pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
});

export const create = mutation({
  args: {
    authorEmail: v.optional(v.string()),
    authorIp: v.optional(v.string()),
    authorName: v.string(),
    content: v.string(),
    customerId: v.optional(v.id("customers")),
    parentId: v.optional(v.id("comments")),
    rating: v.optional(v.number()),
    status: v.optional(commentStatus),
    targetId: v.string(),
    targetType: targetType,
  },
  handler: async (ctx, args) => CommentsModel.create(ctx, args),
  returns: v.id("comments"),
});

export const update = mutation({
  args: {
    authorEmail: v.optional(v.string()),
    authorName: v.optional(v.string()),
    content: v.optional(v.string()),
    id: v.id("comments"),
    rating: v.optional(v.number()),
    status: v.optional(commentStatus),
  },
  handler: async (ctx, args) => {
    await CommentsModel.update(ctx, args);
    return null;
  },
  returns: v.null(),
});

export const updateStatus = mutation({
  args: { id: v.id("comments"), status: commentStatus },
  handler: async (ctx, args) => {
    await CommentsModel.updateStatus(ctx, args);
    return null;
  },
  returns: v.null(),
});

export const approve = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    await CommentsModel.approve(ctx, args);
    return null;
  },
  returns: v.null(),
});

export const markAsSpam = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    await CommentsModel.markAsSpam(ctx, args);
    return null;
  },
  returns: v.null(),
});

export const bulkUpdateStatus = mutation({
  args: { ids: v.array(v.id("comments")), status: commentStatus },
  handler: async (ctx, args) => {
    await CommentsModel.bulkUpdateStatus(ctx, args);
    return null;
  },
  returns: v.null(),
});

export const remove = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    await CommentsModel.remove(ctx, args);
    return null;
  },
  returns: v.null(),
});

export const incrementLike = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    await CommentsModel.incrementLike(ctx, args);
    return null;
  },
  returns: v.null(),
});

export const decrementLike = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    await CommentsModel.decrementLike(ctx, args);
    return null;
  },
  returns: v.null(),
});

// Efficient count pending using take()
export const countPending = query({
  args: {},
  handler: async (ctx) => CommentsModel.countPending(ctx),
  returns: v.number(),
});
