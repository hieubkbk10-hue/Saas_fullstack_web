import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { commentStatus, targetType } from "./lib/validators";

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

export const listAll = query({
  args: {},
  returns: v.array(commentDoc),
  handler: async (ctx) => {
    return await ctx.db.query("comments").collect();
  },
});

export const listByTargetType = query({
  args: { targetType: targetType },
  returns: v.array(commentDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_target_status", (q) => q.eq("targetType", args.targetType))
      .collect();
  },
});

export const countByTargetType = query({
  args: { targetType: targetType },
  returns: v.number(),
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_target_status", (q) => q.eq("targetType", args.targetType))
      .collect();
    return comments.length;
  },
});

export const getById = query({
  args: { id: v.id("comments") },
  returns: v.union(commentDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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
  args: { parentId: v.id("comments") },
  returns: v.array(commentDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .collect();
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
    // Lấy default status từ module settings nếu không truyền status
    let finalStatus = args.status;
    if (!finalStatus) {
      const defaultStatusSetting = await ctx.db
        .query("moduleSettings")
        .withIndex("by_module_setting", (q) =>
          q.eq("moduleKey", "comments").eq("settingKey", "defaultStatus")
        )
        .unique();
      finalStatus = (defaultStatusSetting?.value as "Pending" | "Approved" | "Spam") || "Pending";
    }
    
    return await ctx.db.insert("comments", {
      content: args.content,
      authorName: args.authorName,
      authorEmail: args.authorEmail,
      authorIp: args.authorIp,
      targetType: args.targetType,
      targetId: args.targetId,
      parentId: args.parentId,
      customerId: args.customerId,
      status: finalStatus,
    });
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
    const { id, ...updates } = args;
    const comment = await ctx.db.get(id);
    if (!comment) throw new Error("Comment not found");
    
    const patchData: Record<string, unknown> = {};
    if (updates.content !== undefined) patchData.content = updates.content;
    if (updates.authorName !== undefined) patchData.authorName = updates.authorName;
    if (updates.authorEmail !== undefined) patchData.authorEmail = updates.authorEmail;
    if (updates.status !== undefined) patchData.status = updates.status;
    
    if (Object.keys(patchData).length > 0) {
      await ctx.db.patch(id, patchData);
    }
    return null;
  },
});

export const updateStatus = mutation({
  args: { id: v.id("comments"), status: commentStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");
    await ctx.db.patch(args.id, { status: args.status });
    return null;
  },
});

export const approve = mutation({
  args: { id: v.id("comments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "Approved" });
    return null;
  },
});

export const markAsSpam = mutation({
  args: { id: v.id("comments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "Spam" });
    return null;
  },
});

export const bulkUpdateStatus = mutation({
  args: { ids: v.array(v.id("comments")), status: commentStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.patch(id, { status: args.status });
    }
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("comments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const children = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.id))
      .collect();
    for (const child of children) {
      await ctx.db.delete(child._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

export const countPending = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("comments")
      .withIndex("by_status", (q) => q.eq("status", "Pending"))
      .collect();
    return pending.length;
  },
});
