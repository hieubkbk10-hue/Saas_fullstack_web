import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import * as OrdersModel from "./model/orders";

const orderStatus = v.union(
  v.literal("Pending"),
  v.literal("Processing"),
  v.literal("Shipped"),
  v.literal("Delivered"),
  v.literal("Cancelled")
);

const paymentMethod = v.union(
  v.literal("COD"),
  v.literal("BankTransfer"),
  v.literal("CreditCard"),
  v.literal("EWallet")
);

const paymentStatus = v.union(
  v.literal("Pending"),
  v.literal("Paid"),
  v.literal("Failed"),
  v.literal("Refunded")
);

const orderItemValidator = v.object({
  productId: v.id("products"),
  productName: v.string(),
  quantity: v.number(),
  price: v.number(),
});

const orderDoc = v.object({
  _id: v.id("orders"),
  _creationTime: v.number(),
  orderNumber: v.string(),
  customerId: v.id("customers"),
  items: v.array(orderItemValidator),
  subtotal: v.number(),
  shippingFee: v.number(),
  totalAmount: v.number(),
  status: orderStatus,
  paymentMethod: v.optional(paymentMethod),
  paymentStatus: v.optional(paymentStatus),
  shippingAddress: v.optional(v.string()),
  trackingNumber: v.optional(v.string()),
  note: v.optional(v.string()),
});

// ============================================================
// QUERIES
// ============================================================

// Paginated list (for production use)
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(orderDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("orders").order("desc").paginate(args.paginationOpts);
  },
});

// Limited list for admin (max 100 items - use pagination for more)
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await OrdersModel.listWithLimit(ctx, { limit: args.limit });
  },
});

// Efficient count using take() instead of collect()
export const count = query({
  args: { status: v.optional(orderStatus) },
  returns: v.object({
    count: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    return await OrdersModel.countWithLimit(ctx, { status: args.status });
  },
});

// Legacy count for backward compatibility (returns number)
export const countSimple = query({
  args: { status: v.optional(orderStatus) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const result = await OrdersModel.countWithLimit(ctx, { status: args.status });
    return result.count;
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  returns: v.union(orderDoc, v.null()),
  handler: async (ctx, args) => {
    return await OrdersModel.getById(ctx, { id: args.id });
  },
});

export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  returns: v.union(orderDoc, v.null()),
  handler: async (ctx, args) => {
    return await OrdersModel.getByOrderNumber(ctx, { orderNumber: args.orderNumber });
  },
});

// Paginated list by customer
export const listByCustomer = query({
  args: { customerId: v.id("customers"), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(orderDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Limited list by customer (max 100 items)
export const listAllByCustomer = query({
  args: { customerId: v.id("customers"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await OrdersModel.listByCustomer(ctx, {
      customerId: args.customerId,
      limit: args.limit,
    });
  },
});

// Paginated list by status
export const listByStatus = query({
  args: { status: orderStatus, paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(orderDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Limited list by status (max 100 items)
export const listAllByStatus = query({
  args: { status: orderStatus, limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await OrdersModel.listByStatus(ctx, {
      status: args.status,
      limit: args.limit,
    });
  },
});

// Count by customer (efficient)
export const countByCustomer = query({
  args: { customerId: v.id("customers") },
  returns: v.object({
    count: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    return await OrdersModel.countByCustomer(ctx, { customerId: args.customerId });
  },
});

// Get order statistics (for dashboard/system page)
export const getStats = query({
  args: { limit: v.optional(v.number()) },
  returns: v.object({
    total: v.number(),
    pending: v.number(),
    processing: v.number(),
    delivered: v.number(),
    cancelled: v.number(),
    totalRevenue: v.number(),
  }),
  handler: async (ctx, args) => {
    return await OrdersModel.getStats(ctx, { limit: args.limit });
  },
});

// ============================================================
// MUTATIONS
// ============================================================

export const create = mutation({
  args: {
    customerId: v.id("customers"),
    items: v.array(orderItemValidator),
    shippingFee: v.optional(v.number()),
    paymentMethod: v.optional(paymentMethod),
    shippingAddress: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.id("orders"),
  handler: async (ctx, args) => {
    return await OrdersModel.create(ctx, args);
  },
});

export const update = mutation({
  args: {
    id: v.id("orders"),
    status: v.optional(orderStatus),
    paymentMethod: v.optional(paymentMethod),
    paymentStatus: v.optional(paymentStatus),
    shippingAddress: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await OrdersModel.update(ctx, args);
    return null;
  },
});

export const updateStatus = mutation({
  args: { id: v.id("orders"), status: orderStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    await OrdersModel.updateStatus(ctx, args);
    return null;
  },
});

export const updatePaymentStatus = mutation({
  args: { id: v.id("orders"), paymentStatus: paymentStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    await OrdersModel.updatePaymentStatus(ctx, args);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await OrdersModel.remove(ctx, args);
    return null;
  },
});

// Bulk delete orders
export const bulkRemove = mutation({
  args: { ids: v.array(v.id("orders")) },
  returns: v.number(),
  handler: async (ctx, args) => {
    return await OrdersModel.bulkRemove(ctx, { ids: args.ids });
  },
});

// Delete all orders by customer (for cascade delete)
export const removeByCustomer = mutation({
  args: { customerId: v.id("customers") },
  returns: v.number(),
  handler: async (ctx, args) => {
    return await OrdersModel.removeByCustomer(ctx, args);
  },
});
