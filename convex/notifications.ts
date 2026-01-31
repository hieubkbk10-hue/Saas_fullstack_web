import { query, mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

// CRIT-003 FIX: Helper function to update notificationStats counter
async function updateNotificationStats(
  ctx: MutationCtx,
  key: string,
  delta: number
) {
  const stats = await ctx.db
    .query("notificationStats")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();
  if (stats) {
    await ctx.db.patch(stats._id, { count: Math.max(0, stats.count + delta) });
  } else {
    await ctx.db.insert("notificationStats", { key, count: Math.max(0, delta) });
  }
}

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
// CRIT-003 FIX: Dùng counter table thay vì fetch ALL
export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const stats = await ctx.db
      .query("notificationStats")
      .withIndex("by_key", (q) => q.eq("key", "total"))
      .unique();
    return stats?.count ?? 0;
  },
});

// CRIT-003 FIX: Dùng counter table thay vì fetch ALL
export const countByStatus = query({
  args: { status: notificationStatus },
  returns: v.number(),
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("notificationStats")
      .withIndex("by_key", (q) => q.eq("key", args.status))
      .unique();
    return stats?.count ?? 0;
  },
});

// CRIT-003 FIX: Thêm limit
export const listAll = query({
  args: {},
  returns: v.array(notificationDoc),
  handler: async (ctx) => {
    return await ctx.db.query("notifications").take(500);
  },
});

export const getById = query({
  args: { id: v.id("notifications") },
  returns: v.union(notificationDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// CRIT-003 FIX: Thêm limit
export const listByStatus = query({
  args: { status: notificationStatus },
  returns: v.array(notificationDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .take(200);
  },
});

// CRIT-003 FIX: Thêm limit
export const listByType = query({
  args: { type: notificationType },
  returns: v.array(notificationDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .take(200);
  },
});

// CRIT-003 FIX: Thêm limit
export const listScheduled = query({
  args: {},
  returns: v.array(notificationDoc),
  handler: async (ctx) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_status", (q) => q.eq("status", "Scheduled"))
      .take(100);
  },
});

// Mutations
// CRIT-003 FIX: Update counters khi create
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
    const status = args.status ?? "Draft";

    const id = await ctx.db.insert("notifications", {
      ...args,
      status,
      readCount: 0,
      order,
    });
    
    // Update counters
    await Promise.all([
      updateNotificationStats(ctx, "total", 1),
      updateNotificationStats(ctx, status, 1),
    ]);
    
    return id;
  },
});

// TICKET #9 FIX: Update counters khi status thay đổi
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
    
    // Update counters nếu status thay đổi
    if (args.status !== undefined && args.status !== notif.status) {
      await Promise.all([
        updateNotificationStats(ctx, notif.status, -1),
        updateNotificationStats(ctx, args.status, 1),
      ]);
    }
    
    await ctx.db.patch(id, updates);
    return null;
  },
});

// CRIT-003 FIX: Update counters khi send
export const send = mutation({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const notif = await ctx.db.get(args.id);
    if (!notif) throw new Error("Notification not found");
    if (notif.status === "Sent") {
      throw new Error("Notification already sent");
    }
    
    const oldStatus = notif.status;
    await ctx.db.patch(args.id, {
      status: "Sent",
      sentAt: Date.now(),
    });
    
    // Update counters
    await Promise.all([
      updateNotificationStats(ctx, oldStatus, -1),
      updateNotificationStats(ctx, "Sent", 1),
    ]);
    
    return null;
  },
});

// CRIT-003 FIX: Update counters khi cancel
export const cancel = mutation({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const notif = await ctx.db.get(args.id);
    if (!notif) throw new Error("Notification not found");
    if (notif.status === "Sent") {
      throw new Error("Cannot cancel sent notification");
    }
    
    const oldStatus = notif.status;
    await ctx.db.patch(args.id, { status: "Cancelled" });
    
    // Update counters
    await Promise.all([
      updateNotificationStats(ctx, oldStatus, -1),
      updateNotificationStats(ctx, "Cancelled", 1),
    ]);
    
    return null;
  },
});

// MED-002 FIX: Check status trước khi xóa + update counters
export const remove = mutation({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const notif = await ctx.db.get(args.id);
    if (!notif) throw new Error("Notification not found");
    
    // MED-002: Không cho xóa thông báo đã gửi (để giữ audit trail)
    if (notif.status === "Sent") {
      throw new Error("Không thể xóa thông báo đã gửi");
    }
    
    await ctx.db.delete(args.id);
    
    // Update counters
    await Promise.all([
      updateNotificationStats(ctx, "total", -1),
      updateNotificationStats(ctx, notif.status, -1),
    ]);
    
    return null;
  },
});

// CRIT-003 FIX: Update totalReads counter
export const incrementReadCount = mutation({
  args: { id: v.id("notifications") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const notif = await ctx.db.get(args.id);
    if (!notif) throw new Error("Notification not found");
    await ctx.db.patch(args.id, { readCount: notif.readCount + 1 });
    
    // Update totalReads counter
    await updateNotificationStats(ctx, "totalReads", 1);
    
    return null;
  },
});
