import { query, mutation, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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

export const listAll = query({
  args: {},
  returns: v.array(cartDoc),
  handler: async (ctx) => {
    return await ctx.db.query("carts").collect();
  },
});

export const listActive = query({
  args: {},
  returns: v.array(cartDoc),
  handler: async (ctx) => {
    return await ctx.db
      .query("carts")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .collect();
  },
});

export const listAbandoned = query({
  args: {},
  returns: v.array(cartDoc),
  handler: async (ctx) => {
    return await ctx.db
      .query("carts")
      .withIndex("by_status", (q) => q.eq("status", "Abandoned"))
      .collect();
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

export const countByStatus = query({
  args: { status: cartStatus },
  returns: v.number(),
  handler: async (ctx, args) => {
    const carts = await ctx.db
      .query("carts")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    return carts.length;
  },
});

export const getTotalValue = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const carts = await ctx.db
      .query("carts")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .collect();
    return carts.reduce((sum, cart) => sum + cart.totalAmount, 0);
  },
});

export const count = query({
  args: { status: v.optional(cartStatus) },
  returns: v.number(),
  handler: async (ctx, args) => {
    if (args.status) {
      const carts = await ctx.db
        .query("carts")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
      return carts.length;
    }
    const carts = await ctx.db.query("carts").collect();
    return carts.length;
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

export const listAllItems = query({
  args: {},
  returns: v.array(cartItemDoc),
  handler: async (ctx) => {
    return await ctx.db.query("cartItems").collect();
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
    // Get expiry days setting if expiresAt not provided
    let expiresAt = args.expiresAt;
    if (!expiresAt) {
      const expirySetting = await ctx.db
        .query("moduleSettings")
        .withIndex("by_module", (q) => q.eq("moduleKey", "cart"))
        .filter((q) => q.eq(q.field("settingKey"), "expiryDays"))
        .first();
      const expiryDays = (expirySetting?.value as number) ?? 7;
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

export const remove = mutation({
  args: { id: v.id("carts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.id);
    if (!cart) throw new Error("Cart not found");

    // Cascade delete cart items
    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", args.id))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

// ============ CART ITEM MUTATIONS ============

export const addItem = mutation({
  args: {
    cartId: v.id("carts"),
    productId: v.id("products"),
    quantity: v.number(),
  },
  returns: v.id("cartItems"),
  handler: async (ctx, args) => {
    const cart = await ctx.db.get(args.cartId);
    if (!cart) throw new Error("Cart not found");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    // Check maxItemsPerCart setting
    const maxItemsSetting = await ctx.db
      .query("moduleSettings")
      .withIndex("by_module", (q) => q.eq("moduleKey", "cart"))
      .filter((q) => q.eq(q.field("settingKey"), "maxItemsPerCart"))
      .first();
    const maxItems = (maxItemsSetting?.value as number) ?? 50;

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

    // Check limit only for new items
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
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    await ctx.db.patch(args.cartId, { itemsCount: 0, totalAmount: 0 });
    return null;
  },
});

// Helper function with proper types
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
      .collect();

    for (const cart of expiredCarts) {
      await ctx.db.patch(cart._id, { status: "Abandoned" });
    }

    return expiredCarts.length;
  },
});
