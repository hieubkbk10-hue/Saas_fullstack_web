import { query, mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ============ CONSTANTS ============
const CART_DEFAULTS = {
  ITEMS_PER_PAGE: 20,
  MAX_ITEMS_PER_PAGE: 100,
  EXPIRY_DAYS: 7,
  MAX_ITEMS_PER_CART: 50,
  CLEANUP_BATCH_SIZE: 100,
} as const;

const cartStatus = v.union(
  v.literal("Active"),
  v.literal("Converted"),
  v.literal("Abandoned")
);

const cartDoc = v.object({
  _id: v.id("carts"),
  _creationTime: v.number(),
  customerId: v.optional(v.id("customers")),
  sessionId: v.optional(v.string()),
  status: cartStatus,
  itemsCount: v.number(),
  totalAmount: v.number(),
  expiresAt: v.optional(v.number()),
  note: v.optional(v.string()),
});

const cartItemDoc = v.object({
  _id: v.id("cartItems"),
  _creationTime: v.number(),
  cartId: v.id("carts"),
  productId: v.id("products"),
  productName: v.string(),
  productImage: v.optional(v.string()),
  quantity: v.number(),
  price: v.number(),
  subtotal: v.number(),
});

// ============ CART QUERIES ============

// FIX Issue #1: Added limit parameter with default
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? CART_DEFAULTS.ITEMS_PER_PAGE, CART_DEFAULTS.MAX_ITEMS_PER_PAGE);
    return await ctx.db
      .query("carts")
      .order("desc")
      .take(limit);
  },
});

// FIX Issue #1: Added paginated query for server-side pagination (Issue #7)
export const listPaginated = query({
  args: {
    status: v.optional(cartStatus),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? CART_DEFAULTS.ITEMS_PER_PAGE, CART_DEFAULTS.MAX_ITEMS_PER_PAGE);
    
    const results = args.status
      ? await ctx.db.query("carts")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .paginate({ numItems: limit, cursor: args.cursor ?? null })
      : await ctx.db.query("carts")
          .order("desc")
          .paginate({ numItems: limit, cursor: args.cursor ?? null });
    
    return {
      items: results.page,
      nextCursor: results.continueCursor,
      isDone: results.isDone,
    };
  },
});

export const listActive = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? CART_DEFAULTS.ITEMS_PER_PAGE, CART_DEFAULTS.MAX_ITEMS_PER_PAGE);
    return await ctx.db
      .query("carts")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .order("desc")
      .take(limit);
  },
});

export const listAbandoned = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? CART_DEFAULTS.ITEMS_PER_PAGE, CART_DEFAULTS.MAX_ITEMS_PER_PAGE);
    return await ctx.db
      .query("carts")
      .withIndex("by_status", (q) => q.eq("status", "Abandoned"))
      .order("desc")
      .take(limit);
  },
});

export const getById = query({
  args: { id: v.id("carts") },
  returns: v.union(cartDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByCustomer = query({
  args: { customerId: v.id("customers") },
  returns: v.union(cartDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("carts")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .filter((q) => q.eq(q.field("status"), "Active"))
      .first();
  },
});

export const getBySession = query({
  args: { sessionId: v.string() },
  returns: v.union(cartDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("carts")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("status"), "Active"))
      .first();
  },
});

// FIX Issue #3 & #10: Added limit to prevent fetching ALL
export const countByStatus = query({
  args: { status: cartStatus },
  returns: v.number(),
  handler: async (ctx, args) => {
    const carts = await ctx.db
      .query("carts")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .take(10000);
    return carts.length;
  },
});

// FIX Issue #10: Added limit to prevent fetching ALL
export const getTotalValue = query({
  args: { limit: v.optional(v.number()) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 1000;
    const carts = await ctx.db
      .query("carts")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .take(limit);
    return carts.reduce((sum, cart) => sum + cart.totalAmount, 0);
  },
});

// FIX Issue #3: Added limit to prevent fetching ALL
export const count = query({
  args: { status: v.optional(cartStatus) },
  returns: v.number(),
  handler: async (ctx, args) => {
    if (args.status) {
      const carts = await ctx.db
        .query("carts")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .take(10000);
      return carts.length;
    }
    const carts = await ctx.db.query("carts").take(10000);
    return carts.length;
  },
});

// Get statistics efficiently - all counts in one query
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const [active, abandoned, converted] = await Promise.all([
      ctx.db.query("carts").withIndex("by_status", (q) => q.eq("status", "Active")).take(10000),
      ctx.db.query("carts").withIndex("by_status", (q) => q.eq("status", "Abandoned")).take(10000),
      ctx.db.query("carts").withIndex("by_status", (q) => q.eq("status", "Converted")).take(10000),
    ]);
    
    const totalValue = active.reduce((sum, cart) => sum + cart.totalAmount, 0);
    
    return {
      total: active.length + abandoned.length + converted.length,
      active: active.length,
      abandoned: abandoned.length,
      converted: converted.length,
      totalValue,
    };
  },
});

// ============ CART ITEM QUERIES ============

export const listCartItems = query({
  args: { cartId: v.id("carts") },
  returns: v.array(cartItemDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", args.cartId))
      .collect();
  },
});

// FIX Issue #2: Added limit to prevent fetching ALL items
export const listAllItems = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? CART_DEFAULTS.ITEMS_PER_PAGE, CART_DEFAULTS.MAX_ITEMS_PER_PAGE);
    return await ctx.db.query("cartItems").order("desc").take(limit);
  },
});

// Count all items efficiently
export const countAllItems = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const items = await ctx.db.query("cartItems").take(10000);
    return items.length;
  },
});

// ============ CART MUTATIONS ============

export const create = mutation({
  args: {
    customerId: v.optional(v.id("customers")),
    sessionId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  returns: v.id("carts"),
  handler: async (ctx, args) => {
    let expiresAt = args.expiresAt;
    if (!expiresAt) {
      const expirySetting = await ctx.db
        .query("moduleSettings")
        .withIndex("by_module", (q) => q.eq("moduleKey", "cart"))
        .filter((q) => q.eq(q.field("settingKey"), "expiryDays"))
        .first();
      const expiryDays = (expirySetting?.value as number) ?? CART_DEFAULTS.EXPIRY_DAYS;
      expiresAt = Date.now() + expiryDays * 24 * 60 * 60 * 1000;
    }

    return await ctx.db.insert("carts", {
      customerId: args.customerId,
      sessionId: args.sessionId,
      status: "Active",
      itemsCount: 0,
      totalAmount: 0,
      expiresAt,
      note: args.note,
    });
  },
});

export const updateStatus = mutation({
  args: { id: v.id("carts"), status: cartStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.id);
    if (!cart) throw new Error("Cart not found");
    await ctx.db.patch(args.id, { status: args.status });
    return null;
  },
});

export const updateNote = mutation({
  args: { id: v.id("carts"), note: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.id);
    if (!cart) throw new Error("Cart not found");
    await ctx.db.patch(args.id, { note: args.note });
    return null;
  },
});

export const markAsAbandoned = mutation({
  args: { id: v.id("carts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.id);
    if (!cart) throw new Error("Cart not found");
    await ctx.db.patch(args.id, { status: "Abandoned" });
    return null;
  },
});

export const markAsConverted = mutation({
  args: { id: v.id("carts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.id);
    if (!cart) throw new Error("Cart not found");
    await ctx.db.patch(args.id, { status: "Converted" });
    return null;
  },
});

// FIX Issue #4: Use Promise.all instead of sequential loop
export const remove = mutation({
  args: { id: v.id("carts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.id);
    if (!cart) throw new Error("Cart not found");

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", args.id))
      .collect();
    
    // FIX: Parallel delete instead of sequential
    await Promise.all(items.map(item => ctx.db.delete(item._id)));
    await ctx.db.delete(args.id);
    return null;
  },
});

// ============ CART ITEM MUTATIONS ============

// FIX Issue #11: Added quantity validation
export const addItem = mutation({
  args: {
    cartId: v.id("carts"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  returns: v.id("cartItems"),
  handler: async (ctx, args) => {
    // FIX Issue #11: Validate quantity > 0
    if (args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const cart = await ctx.db.get(args.cartId);
    if (!cart) throw new Error("Cart not found");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const maxItemsSetting = await ctx.db
      .query("moduleSettings")
      .withIndex("by_module", (q) => q.eq("moduleKey", "cart"))
      .filter((q) => q.eq(q.field("settingKey"), "maxItemsPerCart"))
      .first();
    const maxItems = (maxItemsSetting?.value as number) ?? CART_DEFAULTS.MAX_ITEMS_PER_CART;

    const existingItem = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", args.cartId))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    if (existingItem) {
      const newQuantity = existingItem.quantity + args.quantity;
      const newSubtotal = existingItem.price * newQuantity;
      await ctx.db.patch(existingItem._id, {
        quantity: newQuantity,
        subtotal: newSubtotal,
      });
      await recalculateCart(ctx, args.cartId);
      return existingItem._id;
    }

    const currentItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", args.cartId))
      .collect();
    if (currentItems.length >= maxItems) {
      throw new Error(`Giỏ hàng đã đạt giới hạn ${maxItems} sản phẩm`);
    }

    const price = product.salePrice ?? product.price;
    const itemId = await ctx.db.insert("cartItems", {
      cartId: args.cartId,
      productId: args.productId,
      productName: product.name,
      productImage: product.image,
      quantity: args.quantity,
      price,
      subtotal: price * args.quantity,
    });

    await recalculateCart(ctx, args.cartId);
    return itemId;
  },
});

export const updateItemQuantity = mutation({
  args: {
    itemId: v.id("cartItems"),
    quantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Cart item not found");

    if (args.quantity <= 0) {
      await ctx.db.delete(args.itemId);
    } else {
      await ctx.db.patch(args.itemId, {
        quantity: args.quantity,
        subtotal: item.price * args.quantity,
      });
    }

    await recalculateCart(ctx, item.cartId);
    return null;
  },
});

export const removeItem = mutation({
  args: { itemId: v.id("cartItems") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Cart item not found");

    await ctx.db.delete(args.itemId);
    await recalculateCart(ctx, item.cartId);
    return null;
  },
});

// FIX Issue #5: Use Promise.all instead of sequential loop
export const clearCart = mutation({
  args: { cartId: v.id("carts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.cartId);
    if (!cart) throw new Error("Cart not found");

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", args.cartId))
      .collect();
    
    // FIX: Parallel delete instead of sequential
    await Promise.all(items.map(item => ctx.db.delete(item._id)));
    await ctx.db.patch(args.cartId, { itemsCount: 0, totalAmount: 0 });
    return null;
  },
});

async function recalculateCart(ctx: MutationCtx, cartId: Id<"carts">) {
  const items = await ctx.db
    .query("cartItems")
    .withIndex("by_cart", (q) => q.eq("cartId", cartId))
    .collect();

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  await ctx.db.patch(cartId, { itemsCount, totalAmount });
}

// ============ CLEANUP MUTATIONS ============

// FIX Issue #6: Use Promise.all with batch size limit
export const cleanupExpiredCarts = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const now = Date.now();
    const expiredCarts = await ctx.db
      .query("carts")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .filter((q) => 
        q.and(
          q.neq(q.field("expiresAt"), undefined),
          q.lt(q.field("expiresAt"), now)
        )
      )
      .take(CART_DEFAULTS.CLEANUP_BATCH_SIZE);

    // FIX: Parallel patch instead of sequential
    await Promise.all(
      expiredCarts.map(cart => ctx.db.patch(cart._id, { status: "Abandoned" }))
    );

    return expiredCarts.length;
  },
});
