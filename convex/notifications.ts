import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const notificationType = v.union(
  v.literal("info"),
  v.literal("success"),
  v.literal("warning"),
  v.literal("error")
);

const notificationTargetType = v.union(
  v.literal("all"),
  v.literal("customers"),
  v.literal("users"),
  v.literal("specific")
);

const notificationStatus = v.union(
  v.literal("Draft"),
  v.literal("Scheduled"),
  v.literal("Sent"),
  v.literal("Cancelled")
);

const notificationDoc = v.object({
  _id: v.id("notifications"),
  _creationTime: v.number(),
  title: v.string(),
  content: v.string(),
  type: notificationType,
  targetType: notificationTargetType,
  targetIds: v.optional(v.array(v.string())),
  status: notificationStatus,
  sendEmail: v.optional(v.boolean()),
  scheduledAt: v.optional(v.number()),
  sentAt: v.optional(v.number()),
  readCount: v.number(),
  order: v.number(),
});

// Queries
export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const notifications = await ctx.db.query("notifications").collect();
    return notifications.length;
  },
});

export const countByStatus = query({
  args: { status: notificationStatus },
  returns: v.number(),
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    return notifications.length;
  },
});

export const listAll = query({
  args: {},
  returns: v.array(notificationDoc),
  handler: async (ctx) => {
    return await ctx.db.query("notifications").collect();
  },
});

export const getById = query({
  args: { id: v.id("notifications") },
  returns: v.union(notificationDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listByStatus = query({
  args: { status: notificationStatus },
  returns: v.array(notificationDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const listByType = query({
  args: { type: notificationType },
  returns: v.array(notificationDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

export const listScheduled = query({
  args: {},
  returns: v.array(notificationDoc),
  handler: async (ctx) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_status", (q) => q.eq("status", "Scheduled"))
      .collect();
  },
});

// Mutations
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: notificationType,
    targetType: notificationTargetType,
    targetIds: v.optional(v.array(v.string())),
    status: v.optional(notificationStatus),
    sendEmail: v.optional(v.boolean()),
    scheduledAt: v.optional(v.number()),
  },
  returns: v.id("notifications"),
  handler: async (ctx, args) => {
    const lastNotif = await ctx.db
      .query("notifications")
      .order("desc")
      .first();
    const order = lastNotif ? lastNotif.order + 1 : 0;

    return await ctx.db.insert("notifications", {
      ...args,
      status: args.status ?? "Draft",
      readCount: 0,
      order,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("notifications"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    type: v.optional(notificationType),
    targetType: v.optional(notificationTargetType),
    targetIds: v.optional(v.array(v.string())),
    status: v.optional(notificationStatus),
    sendEmail: v.optional(v.boolean()),
    scheduledAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const notif = await ctx.db.get(id);
    if (!notif) throw new Error("Notification not found");
    if (notif.status === "Sent") {
      throw new Error("Cannot edit sent notification");
    }
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const send = mutation({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const notif = await ctx.db.get(args.id);
    if (!notif) throw new Error("Notification not found");
    if (notif.status === "Sent") {
      throw new Error("Notification already sent");
    }
    await ctx.db.patch(args.id, {
      status: "Sent",
      sentAt: Date.now(),
    });
    return null;
  },
});

export const cancel = mutation({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const notif = await ctx.db.get(args.id);
    if (!notif) throw new Error("Notification not found");
    if (notif.status === "Sent") {
      throw new Error("Cannot cancel sent notification");
    }
    await ctx.db.patch(args.id, { status: "Cancelled" });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

export const incrementReadCount = mutation({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const notif = await ctx.db.get(args.id);
    if (!notif) throw new Error("Notification not found");
    await ctx.db.patch(args.id, { readCount: notif.readCount + 1 });
    return null;
  },
});
