import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// ============================================================
// HELPER FUNCTIONS - Orders Model Layer
// ============================================================

const MAX_ITEMS_LIMIT = 100;
const MAX_COUNT_LIMIT = 1000;

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";
type PaymentMethod = "COD" | "BankTransfer" | "CreditCard" | "EWallet";

type OrderItem = {
  productId: Id<"products">;
  productName: string;
  quantity: number;
  price: number;
};

/**
 * Get order by ID with null check
 */
export async function getById(
  ctx: QueryCtx,
  { id }: { id: Id<"orders"> }
): Promise<Doc<"orders"> | null> {
  return await ctx.db.get(id);
}

/**
 * Get order by ID or throw error
 */
export async function getByIdOrThrow(
  ctx: QueryCtx,
  { id }: { id: Id<"orders"> }
): Promise<Doc<"orders">> {
  const order = await ctx.db.get(id);
  if (!order) throw new Error("Order not found");
  return order;
}

/**
 * Get order by order number
 */
export async function getByOrderNumber(
  ctx: QueryCtx,
  { orderNumber }: { orderNumber: string }
): Promise<Doc<"orders"> | null> {
  return await ctx.db
    .query("orders")
    .withIndex("by_orderNumber", (q) => q.eq("orderNumber", orderNumber))
    .unique();
}

/**
 * List orders with limit (for admin listing without pagination)
 * Use take() instead of collect() to limit bandwidth
 */
export async function listWithLimit(
  ctx: QueryCtx,
  { limit = MAX_ITEMS_LIMIT }: { limit?: number } = {}
): Promise<Doc<"orders">[]> {
  return await ctx.db
    .query("orders")
    .order("desc")
    .take(Math.min(limit, MAX_ITEMS_LIMIT));
}

/**
 * List orders by status with limit
 */
export async function listByStatus(
  ctx: QueryCtx,
  { status, limit = MAX_ITEMS_LIMIT }: { status: OrderStatus; limit?: number }
): Promise<Doc<"orders">[]> {
  return await ctx.db
    .query("orders")
    .withIndex("by_status", (q) => q.eq("status", status))
    .order("desc")
    .take(Math.min(limit, MAX_ITEMS_LIMIT));
}

/**
 * List orders by customer with limit
 */
export async function listByCustomer(
  ctx: QueryCtx,
  { customerId, limit = MAX_ITEMS_LIMIT }: { customerId: Id<"customers">; limit?: number }
): Promise<Doc<"orders">[]> {
  return await ctx.db
    .query("orders")
    .withIndex("by_customer", (q) => q.eq("customerId", customerId))
    .order("desc")
    .take(Math.min(limit, MAX_ITEMS_LIMIT));
}

/**
 * Count orders efficiently using take() and checking length
 */
export async function countWithLimit(
  ctx: QueryCtx,
  { status, limit = MAX_COUNT_LIMIT }: { status?: OrderStatus; limit?: number } = {}
): Promise<{ count: number; hasMore: boolean }> {
  const query = status
    ? ctx.db.query("orders").withIndex("by_status", (q) => q.eq("status", status))
    : ctx.db.query("orders");

  const items = await query.take(limit + 1);
  return {
    count: Math.min(items.length, limit),
    hasMore: items.length > limit,
  };
}

/**
 * Count orders by customer
 */
export async function countByCustomer(
  ctx: QueryCtx,
  { customerId, limit = MAX_COUNT_LIMIT }: { customerId: Id<"customers">; limit?: number }
): Promise<{ count: number; hasMore: boolean }> {
  const items = await ctx.db
    .query("orders")
    .withIndex("by_customer", (q) => q.eq("customerId", customerId))
    .take(limit + 1);

  return {
    count: Math.min(items.length, limit),
    hasMore: items.length > limit,
  };
}

/**
 * Generate unique order number: ORD-YYYYMMDD-XXXX
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomNum}`;
}

/**
 * Calculate order totals
 */
export function calculateTotals(
  items: OrderItem[],
  shippingFee: number = 0
): { subtotal: number; totalAmount: number } {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    subtotal,
    totalAmount: subtotal + shippingFee,
  };
}

/**
 * Create order
 */
export async function create(
  ctx: MutationCtx,
  args: {
    customerId: Id<"customers">;
    items: OrderItem[];
    shippingFee?: number;
    paymentMethod?: PaymentMethod;
    shippingAddress?: string;
    note?: string;
  }
): Promise<Id<"orders">> {
  const orderNumber = generateOrderNumber();
  const { subtotal, totalAmount } = calculateTotals(args.items, args.shippingFee);

  return await ctx.db.insert("orders", {
    orderNumber,
    customerId: args.customerId,
    items: args.items,
    subtotal,
    shippingFee: args.shippingFee ?? 0,
    totalAmount,
    status: "Pending",
    paymentMethod: args.paymentMethod,
    paymentStatus: "Pending",
    shippingAddress: args.shippingAddress,
    note: args.note,
  });
}

/**
 * Update order
 */
export async function update(
  ctx: MutationCtx,
  args: {
    id: Id<"orders">;
    status?: OrderStatus;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    shippingAddress?: string;
    trackingNumber?: string;
    note?: string;
  }
): Promise<void> {
  await getByIdOrThrow(ctx, { id: args.id });

  const { id, ...updates } = args;
  const filteredUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  );

  if (Object.keys(filteredUpdates).length === 0) return;

  await ctx.db.patch(id, filteredUpdates);
}

/**
 * Update order status
 */
export async function updateStatus(
  ctx: MutationCtx,
  { id, status }: { id: Id<"orders">; status: OrderStatus }
): Promise<void> {
  await getByIdOrThrow(ctx, { id });
  await ctx.db.patch(id, { status });
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  ctx: MutationCtx,
  { id, paymentStatus }: { id: Id<"orders">; paymentStatus: PaymentStatus }
): Promise<void> {
  await getByIdOrThrow(ctx, { id });
  await ctx.db.patch(id, { paymentStatus });
}

/**
 * Delete order
 */
export async function remove(
  ctx: MutationCtx,
  { id }: { id: Id<"orders"> }
): Promise<void> {
  await getByIdOrThrow(ctx, { id });
  await ctx.db.delete(id);
}

/**
 * Bulk delete orders
 */
export async function bulkRemove(
  ctx: MutationCtx,
  { ids }: { ids: Id<"orders">[] }
): Promise<number> {
  let deletedCount = 0;
  for (const id of ids) {
    const order = await ctx.db.get(id);
    if (order) {
      await ctx.db.delete(id);
      deletedCount++;
    }
  }
  return deletedCount;
}

/**
 * Delete all orders by customer (for cascade delete)
 */
export async function removeByCustomer(
  ctx: MutationCtx,
  { customerId }: { customerId: Id<"customers"> }
): Promise<number> {
  const orders = await ctx.db
    .query("orders")
    .withIndex("by_customer", (q) => q.eq("customerId", customerId))
    .collect();

  for (const order of orders) {
    await ctx.db.delete(order._id);
  }

  return orders.length;
}

/**
 * Get order statistics (for dashboard)
 */
export async function getStats(
  ctx: QueryCtx,
  { limit = 100 }: { limit?: number } = {}
): Promise<{
  total: number;
  pending: number;
  processing: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}> {
  const orders = await ctx.db.query("orders").order("desc").take(limit);

  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    processing: orders.filter((o) => o.status === "Processing" || o.status === "Shipped").length,
    delivered: orders.filter((o) => o.status === "Delivered").length,
    cancelled: orders.filter((o) => o.status === "Cancelled").length,
    totalRevenue: orders
      .filter((o) => o.status === "Delivered")
      .reduce((sum, o) => sum + o.totalAmount, 0),
  };
}
