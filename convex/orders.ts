import { mutation, query } from "./_generated/server";
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
  price: v.number(),
  productId: v.id("products"),
  productName: v.string(),
  quantity: v.number(),
});

const orderDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("orders"),
  customerId: v.id("customers"),
  items: v.array(orderItemValidator),
  note: v.optional(v.string()),
  orderNumber: v.string(),
  paymentMethod: v.optional(paymentMethod),
  paymentStatus: v.optional(paymentStatus),
  shippingAddress: v.optional(v.string()),
  shippingFee: v.number(),
  status: orderStatus,
  subtotal: v.number(),
  totalAmount: v.number(),
  trackingNumber: v.optional(v.string()),
});

// ============================================================
// QUERIES
// ============================================================

// Paginated list (for production use)
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => ctx.db.query("orders").order("desc").paginate(args.paginationOpts),
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    page: v.array(orderDoc),
  }),
});

// Limited list for admin (max 100 items - use pagination for more)
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) =>  OrdersModel.listWithLimit(ctx, { limit: args.limit }),
});

// Efficient count using take() instead of collect()
export const count = query({
  args: { status: v.optional(orderStatus) },
  handler: async (ctx, args) => OrdersModel.countWithLimit(ctx, { status: args.status }),
  returns: v.object({
    count: v.number(),
    hasMore: v.boolean(),
  }),
});

// Legacy count for backward compatibility (returns number)
export const countSimple = query({
  args: { status: v.optional(orderStatus) },
  handler: async (ctx, args) => {
    const result = await OrdersModel.countWithLimit(ctx, { status: args.status });
    return result.count;
  },
  returns: v.number(),
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => OrdersModel.getById(ctx, { id: args.id }),
  returns: v.union(orderDoc, v.null()),
});

export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => OrdersModel.getByOrderNumber(ctx, { orderNumber: args.orderNumber }),
  returns: v.union(orderDoc, v.null()),
});

// Paginated list by customer
export const listByCustomer = query({
  args: { customerId: v.id("customers"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .paginate(args.paginationOpts),
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    page: v.array(orderDoc),
  }),
});

// Limited list by customer (max 100 items)
export const listAllByCustomer = query({
  args: { customerId: v.id("customers"), limit: v.optional(v.number()) },
  handler: async (ctx, args) =>  OrdersModel.listByCustomer(ctx, {
      customerId: args.customerId,
      limit: args.limit,
    }),
});

// Paginated list by status
export const listByStatus = query({
  args: { paginationOpts: paginationOptsValidator, status: orderStatus },
  handler: async (ctx, args) => ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .paginate(args.paginationOpts),
  returns: v.object({
    continueCursor: v.string(),
    isDone: v.boolean(),
    page: v.array(orderDoc),
  }),
});

// Limited list by status (max 100 items)
export const listAllByStatus = query({
  args: { limit: v.optional(v.number()), status: orderStatus },
  handler: async (ctx, args) =>  OrdersModel.listByStatus(ctx, {
      limit: args.limit,
      status: args.status,
    }),
});

// Count by customer (efficient)
export const countByCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => OrdersModel.countByCustomer(ctx, { customerId: args.customerId }),
  returns: v.object({
    count: v.number(),
    hasMore: v.boolean(),
  }),
});

// Get order statistics (for dashboard/system page)
export const getStats = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => OrdersModel.getStats(ctx, { limit: args.limit }),
  returns: v.object({
    cancelled: v.number(),
    delivered: v.number(),
    pending: v.number(),
    processing: v.number(),
    total: v.number(),
    totalRevenue: v.number(),
  }),
});

// ============================================================
// MUTATIONS
// ============================================================

export const create = mutation({
  args: {
    customerId: v.id("customers"),
    items: v.array(orderItemValidator),
    note: v.optional(v.string()),
    paymentMethod: v.optional(paymentMethod),
    shippingAddress: v.optional(v.string()),
    shippingFee: v.optional(v.number()),
  },
  handler: async (ctx, args) => OrdersModel.create(ctx, args),
  returns: v.id("orders"),
});

export const update = mutation({
  args: {
    id: v.id("orders"),
    note: v.optional(v.string()),
    paymentMethod: v.optional(paymentMethod),
    paymentStatus: v.optional(paymentStatus),
    shippingAddress: v.optional(v.string()),
    status: v.optional(orderStatus),
    trackingNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await OrdersModel.update(ctx, args);
    return null;
  },
  returns: v.null(),
});

export const updateStatus = mutation({
  args: { id: v.id("orders"), status: orderStatus },
  handler: async (ctx, args) => {
    await OrdersModel.updateStatus(ctx, args);
    return null;
  },
  returns: v.null(),
});

export const updatePaymentStatus = mutation({
  args: { id: v.id("orders"), paymentStatus: paymentStatus },
  handler: async (ctx, args) => {
    await OrdersModel.updatePaymentStatus(ctx, args);
    return null;
  },
  returns: v.null(),
});

export const remove = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    await OrdersModel.remove(ctx, args);
    return null;
  },
  returns: v.null(),
});

// Bulk delete orders
export const bulkRemove = mutation({
  args: { ids: v.array(v.id("orders")) },
  handler: async (ctx, args) => OrdersModel.bulkRemove(ctx, { ids: args.ids }),
  returns: v.number(),
});

// Delete all orders by customer (for cascade delete)
export const removeByCustomer = mutation({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => OrdersModel.removeByCustomer(ctx, args),
  returns: v.number(),
});
