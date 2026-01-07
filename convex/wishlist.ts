import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { Id } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

// Helper: Validate foreign keys và maxItems (DRY)
async function validateWishlistAdd(
  ctx: MutationCtx,
  customerId: Id<"customers">,
  productId: Id<"products">
) {
  const customer = await ctx.db.get(customerId);
  if (!customer) throw new Error("Customer not found");

  const product = await ctx.db.get(productId);
  if (!product) throw new Error("Product not found");

  const existing = await ctx.db
    .query("wishlist")
    .withIndex("by_customer_product", (q) =>
      q.eq("customerId", customerId).eq("productId", productId)
    )
    .unique();
  if (existing) throw new Error("Product already in wishlist");

  const maxSetting = await ctx.db
    .query("moduleSettings")
    .withIndex("by_module_setting", (q) =>
      q.eq("moduleKey", "wishlist").eq("settingKey", "maxItemsPerCustomer")
    )
    .unique();
  const maxItems = (maxSetting?.value as number) || 50;

  const currentItems = await ctx.db
    .query("wishlist")
    .withIndex("by_customer", (q) => q.eq("customerId", customerId))
    .collect();

  if (currentItems.length >= maxItems) {
    throw new Error(`Đã đạt giới hạn ${maxItems} sản phẩm yêu thích`);
  }
}

const wishlistDoc = v.object({
  _id: v.id("wishlist"),
  _creationTime: v.number(),
  customerId: v.id("customers"),
  productId: v.id("products"),
  note: v.optional(v.string()),
});

// Queries
export const listAll = query({
  args: {},
  returns: v.array(wishlistDoc),
  handler: async (ctx) => {
    return await ctx.db.query("wishlist").collect();
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(wishlistDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("wishlist").paginate(args.paginationOpts);
  },
});

export const count = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const items = await ctx.db.query("wishlist").collect();
    return items.length;
  },
});

export const getById = query({
  args: { id: v.id("wishlist") },
  returns: v.union(wishlistDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listByCustomer = query({
  args: { customerId: v.id("customers") },
  returns: v.array(wishlistDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wishlist")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();
  },
});

export const listByProduct = query({
  args: { productId: v.id("products") },
  returns: v.array(wishlistDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wishlist")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
  },
});

export const countByCustomer = query({
  args: { customerId: v.id("customers") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("wishlist")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();
    return items.length;
  },
});

export const countByProduct = query({
  args: { productId: v.id("products") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("wishlist")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect();
    return items.length;
  },
});

export const isInWishlist = query({
  args: { customerId: v.id("customers"), productId: v.id("products") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("wishlist")
      .withIndex("by_customer_product", (q) => 
        q.eq("customerId", args.customerId).eq("productId", args.productId)
      )
      .unique();
    return item !== null;
  },
});

// Mutations
export const add = mutation({
  args: {
    customerId: v.id("customers"),
    productId: v.id("products"),
    note: v.optional(v.string()),
  },
  returns: v.id("wishlist"),
  handler: async (ctx, args) => {
    await validateWishlistAdd(ctx, args.customerId, args.productId);

    return await ctx.db.insert("wishlist", {
      customerId: args.customerId,
      productId: args.productId,
      note: args.note,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("wishlist"),
    note: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Wishlist item not found");
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("wishlist") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Wishlist item not found");
    await ctx.db.delete(args.id);
    return null;
  },
});

export const removeByCustomerProduct = mutation({
  args: { customerId: v.id("customers"), productId: v.id("products") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("wishlist")
      .withIndex("by_customer_product", (q) => 
        q.eq("customerId", args.customerId).eq("productId", args.productId)
      )
      .unique();
    
    if (item) {
      await ctx.db.delete(item._id);
    }
    return null;
  },
});

export const clearByCustomer = mutation({
  args: { customerId: v.id("customers") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("wishlist")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();
    
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    return null;
  },
});

export const toggle = mutation({
  args: { customerId: v.id("customers"), productId: v.id("products") },
  returns: v.object({ added: v.boolean(), id: v.optional(v.id("wishlist")) }),
  handler: async (ctx, args) => {
    // Validate customer/product exists
    const customer = await ctx.db.get(args.customerId);
    if (!customer) throw new Error("Customer not found");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const existing = await ctx.db
      .query("wishlist")
      .withIndex("by_customer_product", (q) =>
        q.eq("customerId", args.customerId).eq("productId", args.productId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { added: false };
    }

    // Check maxItemsPerCustomer when adding
    const maxSetting = await ctx.db
      .query("moduleSettings")
      .withIndex("by_module_setting", (q) =>
        q.eq("moduleKey", "wishlist").eq("settingKey", "maxItemsPerCustomer")
      )
      .unique();
    const maxItems = (maxSetting?.value as number) || 50;

    const currentItems = await ctx.db
      .query("wishlist")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();

    if (currentItems.length >= maxItems) {
      throw new Error(`Đã đạt giới hạn ${maxItems} sản phẩm yêu thích`);
    }

    const id = await ctx.db.insert("wishlist", {
      customerId: args.customerId,
      productId: args.productId,
    });
    return { added: true, id };
  },
});
