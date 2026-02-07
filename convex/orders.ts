import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import * as OrdersModel from "./model/orders";
import type { Doc, Id } from "./_generated/dataModel";

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
  v.literal("VietQR"),
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
  variantId: v.optional(v.id("productVariants")),
  variantTitle: v.optional(v.string()),
});

type VariantPricingSetting = "product" | "variant";
type VariantStockSetting = "product" | "variant";

type OrderItemInput = {
  price: number;
  productId: Id<"products">;
  productName: string;
  quantity: number;
  variantId?: Id<"productVariants">;
  variantTitle?: string;
};

async function getVariantSettings(ctx: MutationCtx): Promise<{
  variantPricing: VariantPricingSetting;
  variantStock: VariantStockSetting;
}> {
  const [variantPricing, variantStock] = await Promise.all([
    ctx.db
      .query("moduleSettings")
      .withIndex("by_module_setting", (q) => q.eq("moduleKey", "products").eq("settingKey", "variantPricing"))
      .unique(),
    ctx.db
      .query("moduleSettings")
      .withIndex("by_module_setting", (q) => q.eq("moduleKey", "products").eq("settingKey", "variantStock"))
      .unique(),
  ]);

  return {
    variantPricing: (variantPricing?.value as VariantPricingSetting) ?? "variant",
    variantStock: (variantStock?.value as VariantStockSetting) ?? "variant",
  };
}

async function buildVariantTitle(ctx: MutationCtx, variant: Doc<"productVariants">): Promise<string | undefined> {
  if (!variant.optionValues.length) {
    return undefined;
  }
  const valueDocs = await Promise.all(variant.optionValues.map((item) => ctx.db.get(item.valueId)));
  const titleParts = variant.optionValues
    .map((item, index) => item.customValue?.trim() || valueDocs[index]?.label || valueDocs[index]?.value)
    .filter((value): value is string => Boolean(value));

  return titleParts.length > 0 ? titleParts.join(" / ") : undefined;
}

async function normalizeOrderItems(
  ctx: MutationCtx,
  items: OrderItemInput[],
  variantPricing: VariantPricingSetting
): Promise<OrderItemInput[]> {
  if (items.length === 0) {
    return items;
  }

  const products = await Promise.all(items.map((item) => ctx.db.get(item.productId)));
  const variants = await Promise.all(items.map((item) => (item.variantId ? ctx.db.get(item.variantId) : null)));

  return Promise.all(items.map(async (item, index) => {
    const product = products[index];
    if (!product) {
      throw new Error("Product not found");
    }

    const variant = variants[index];
    if (item.variantId) {
      if (!variant || variant.productId !== item.productId) {
        throw new Error("Phiên bản không hợp lệ");
      }
    }

    const price = variantPricing === "variant" && variant
      ? (variant.salePrice ?? variant.price ?? item.price)
      : item.price;
    const variantTitle = variant ? await buildVariantTitle(ctx, variant) : undefined;

    return {
      ...item,
      price,
      variantTitle,
    };
  }));
}

async function decrementVariantStock(ctx: MutationCtx, items: OrderItemInput[]) {
  const variantItems = items.filter((item) => item.variantId);
  if (variantItems.length === 0) {
    return;
  }

  const variants = await Promise.all(variantItems.map((item) => ctx.db.get(item.variantId!)));
  await Promise.all(variantItems.map((item, index) => {
    const variant = variants[index];
    if (!variant || variant.stock === undefined) {
      return null;
    }
    const nextStock = Math.max(0, variant.stock - item.quantity);
    return ctx.db.patch(variant._id, { stock: nextStock });
  }));
}

const orderDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("orders"),
  customerId: v.id("customers"),
  items: v.array(orderItemValidator),
  note: v.optional(v.string()),
  promotionId: v.optional(v.id("promotions")),
  promotionCode: v.optional(v.string()),
  discountAmount: v.optional(v.number()),
  orderNumber: v.string(),
  paymentMethod: v.optional(paymentMethod),
  paymentStatus: v.optional(paymentStatus),
  shippingAddress: v.optional(v.string()),
  shippingMethodId: v.optional(v.string()),
  shippingMethodLabel: v.optional(v.string()),
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

export const listAdminWithOffset = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    paymentStatus: v.optional(paymentStatus),
    search: v.optional(v.string()),
    status: v.optional(orderStatus),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 100);
    const offset = args.offset ?? 0;
    const fetchLimit = Math.min(offset + limit + 50, 1000);

    let orders: Doc<"orders">[] = [];
    if (args.status) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(fetchLimit);
    } else {
      orders = await ctx.db.query("orders").order("desc").take(fetchLimit);
    }

    if (args.paymentStatus) {
      orders = orders.filter((order) => order.paymentStatus === args.paymentStatus);
    }

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      orders = orders.filter((order) => order.orderNumber.toLowerCase().includes(searchLower));
    }

    return orders.slice(offset, offset + limit);
  },
  returns: v.array(orderDoc),
});

export const countAdmin = query({
  args: {
    paymentStatus: v.optional(paymentStatus),
    search: v.optional(v.string()),
    status: v.optional(orderStatus),
  },
  handler: async (ctx, args) => {
    const limit = 5000;
    const fetchLimit = limit + 1;

    let orders: Doc<"orders">[] = [];
    if (args.status) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .take(fetchLimit);
    } else {
      orders = await ctx.db.query("orders").take(fetchLimit);
    }

    if (args.paymentStatus) {
      orders = orders.filter((order) => order.paymentStatus === args.paymentStatus);
    }

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      orders = orders.filter((order) => order.orderNumber.toLowerCase().includes(searchLower));
    }

    return { count: Math.min(orders.length, limit), hasMore: orders.length > limit };
  },
  returns: v.object({ count: v.number(), hasMore: v.boolean() }),
});

export const listAdminIds = query({
  args: {
    limit: v.optional(v.number()),
    paymentStatus: v.optional(paymentStatus),
    search: v.optional(v.string()),
    status: v.optional(orderStatus),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 5000, 5000);
    const fetchLimit = limit + 1;

    let orders: Doc<"orders">[] = [];
    if (args.status) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .take(fetchLimit);
    } else {
      orders = await ctx.db.query("orders").take(fetchLimit);
    }

    if (args.paymentStatus) {
      orders = orders.filter((order) => order.paymentStatus === args.paymentStatus);
    }

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      orders = orders.filter((order) => order.orderNumber.toLowerCase().includes(searchLower));
    }

    const hasMore = orders.length > limit;
    return { ids: orders.slice(0, limit).map((order) => order._id), hasMore };
  },
  returns: v.object({ ids: v.array(v.id("orders")), hasMore: v.boolean() }),
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
    shippingMethodId: v.optional(v.string()),
    shippingMethodLabel: v.optional(v.string()),
    shippingAddress: v.optional(v.string()),
    shippingFee: v.optional(v.number()),
    promotionId: v.optional(v.id("promotions")),
    promotionCode: v.optional(v.string()),
    discountAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { variantPricing, variantStock } = await getVariantSettings(ctx);
    const normalizedItems = await normalizeOrderItems(ctx, args.items, variantPricing);
    const orderId = await OrdersModel.create(ctx, {
      ...args,
      items: normalizedItems,
    });

    if (variantStock === "variant") {
      await decrementVariantStock(ctx, normalizedItems);
    }

    return orderId;
  },
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

export const cancel = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await OrdersModel.getById(ctx, { id: args.id });
    if (!order) {
      throw new Error("Order not found");
    }
    if (order.status !== "Pending") {
      throw new Error("Chỉ có thể hủy đơn hàng đang chờ xử lý");
    }
    await OrdersModel.updateStatus(ctx, { id: args.id, status: "Cancelled" });
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
