import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

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

// Queries
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(orderDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("orders").paginate(args.paginationOpts);
  },
});

export const listAll = query({
  args: {},
  returns: v.array(orderDoc),
  handler: async (ctx) => {
    return await ctx.db.query("orders").collect();
  },
});

export const count = query({
  args: { status: v.optional(orderStatus) },
  returns: v.number(),
  handler: async (ctx, args) => {
    if (args.status) {
      const orders = await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
      return orders.length;
    }
    const orders = await ctx.db.query("orders").collect();
    return orders.length;
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  returns: v.union(orderDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  returns: v.union(orderDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
      .unique();
  },
});

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
      .paginate(args.paginationOpts);
  },
});

export const listAllByCustomer = query({
  args: { customerId: v.id("customers") },
  returns: v.array(orderDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();
  },
});

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
      .paginate(args.paginationOpts);
  },
});

// Mutations
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
    // Generate order number: ORD-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomNum}`;

    // Calculate totals
    const subtotal = args.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingFee = args.shippingFee ?? 0;
    const totalAmount = subtotal + shippingFee;

    return await ctx.db.insert("orders", {
      orderNumber,
      customerId: args.customerId,
      items: args.items,
      subtotal,
      shippingFee,
      totalAmount,
      status: "Pending",
      paymentMethod: args.paymentMethod,
      paymentStatus: "Pending",
      shippingAddress: args.shippingAddress,
      note: args.note,
    });
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
    const { id, ...updates } = args;
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found");

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );

    // Skip if no updates
    if (Object.keys(filteredUpdates).length === 0) {
      return null;
    }

    await ctx.db.patch(id, filteredUpdates);
    return null;
  },
});

export const updateStatus = mutation({
  args: { id: v.id("orders"), status: orderStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    await ctx.db.patch(args.id, { status: args.status });
    return null;
  },
});

export const updatePaymentStatus = mutation({
  args: { id: v.id("orders"), paymentStatus: paymentStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    await ctx.db.patch(args.id, { paymentStatus: args.paymentStatus });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");

    // Future: Delete related logs, history, etc.
    // const logs = await ctx.db.query("orderLogs")
    //   .withIndex("by_order", q => q.eq("orderId", args.id))
    //   .collect();
    // for (const log of logs) await ctx.db.delete(log._id);

    await ctx.db.delete(args.id);
    return null;
  },
});

// Query to count orders by customer (for cascade delete check)
export const countByCustomer = query({
  args: { customerId: v.id("customers") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();
    return orders.length;
  },
});

// Delete all orders by customer (for cascade delete)
export const removeByCustomer = mutation({
  args: { customerId: v.id("customers") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();
    
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }
    
    return orders.length;
  },
});
