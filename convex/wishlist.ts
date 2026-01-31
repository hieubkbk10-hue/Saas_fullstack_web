import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

// Helper: Validate foreign keys và maxItems (DRY)
async function validateWishlistAdd(
  ctx: MutationCtx,
  customerId: Id<"customers">,
  productId: Id<"products">
) {
  const customer = await ctx.db.get(customerId);
  if (!customer) {throw new Error("Customer not found");}

  const product = await ctx.db.get(productId);
  if (!product) {throw new Error("Product not found");}

  const existing = await ctx.db
    .query("wishlist")
    .withIndex("by_customer_product", (q) =>
      q.eq("customerId", customerId).eq("productId", productId)
    )
    .unique();
  if (existing) {throw new Error("Product already in wishlist");}

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
  _creationTime: v.number(),
  _id: v.id("wishlist"),
  customerId: v.id("customers"),
  note: v.optional(v.string()),
  productId: v.id("products"),
});

// Queries
// WL-001 FIX: Thêm limit parameter để tránh fetch all
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 100, 500);
    return  ctx.db.query("wishlist").take(limit);
  },
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) =>  ctx.db.query("wishlist").paginate(args.paginationOpts),
});

// WL-001 FIX: Thêm limit để tránh fetch all chỉ để count
export const count = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10_000;
    const items = await ctx.db.query("wishlist").take(limit);
    return items.length;
  },
  returns: v.number(),
});

export const getById = query({
  args: { id: v.id("wishlist") },
  handler: async (ctx, args) => ctx.db.get(args.id),
  returns: v.union(wishlistDoc, v.null()),
});

// WL-005 FIX: Thêm limit parameter
export const listByCustomer = query({
  args: { 
    customerId: v.id("customers"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200);
    return  ctx.db
      .query("wishlist")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .take(limit);
  },
});

// WL-005 FIX: Thêm limit parameter
export const listByProduct = query({
  args: { 
    limit: v.optional(v.number()),
    productId: v.id("products")
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200);
    return  ctx.db
      .query("wishlist")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .take(limit);
  },
});

// WL-003 FIX: Thêm limit để giới hạn fetch
export const countByCustomer = query({
  args: { 
    customerId: v.id("customers"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 1000;
    const items = await ctx.db
      .query("wishlist")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .take(limit);
    return items.length;
  },
  returns: v.number(),
});

// WL-003 FIX: Thêm limit để giới hạn fetch
export const countByProduct = query({
  args: { 
    limit: v.optional(v.number()),
    productId: v.id("products")
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 1000;
    const items = await ctx.db
      .query("wishlist")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .take(limit);
    return items.length;
  },
  returns: v.number(),
});

export const isInWishlist = query({
  args: { customerId: v.id("customers"), productId: v.id("products") },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("wishlist")
      .withIndex("by_customer_product", (q) => 
        q.eq("customerId", args.customerId).eq("productId", args.productId)
      )
      .unique();
    return item !== null;
  },
  returns: v.boolean(),
});

// Mutations
export const add = mutation({
  args: {
    customerId: v.id("customers"),
    note: v.optional(v.string()),
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    await validateWishlistAdd(ctx, args.customerId, args.productId);

    return  ctx.db.insert("wishlist", {
      customerId: args.customerId,
      note: args.note,
      productId: args.productId,
    });
  },
  returns: v.id("wishlist"),
});

export const update = mutation({
  args: {
    id: v.id("wishlist"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const item = await ctx.db.get(id);
    if (!item) {throw new Error("Wishlist item not found");}
    await ctx.db.patch(id, updates);
    return null;
  },
  returns: v.null(),
});

export const remove = mutation({
  args: { id: v.id("wishlist") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) {throw new Error("Wishlist item not found");}
    await ctx.db.delete(args.id);
    return null;
  },
  returns: v.null(),
});

export const removeByCustomerProduct = mutation({
  args: { customerId: v.id("customers"), productId: v.id("products") },
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
  returns: v.null(),
});

// WL-002 FIX: Sử dụng Promise.all thay vì sequential deletes
export const clearByCustomer = mutation({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("wishlist")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();
    
    await Promise.all(items.map( async (item) => ctx.db.delete(item._id)));
    return null;
  },
  returns: v.null(),
});

export const toggle = mutation({
  args: { customerId: v.id("customers"), productId: v.id("products") },
  handler: async (ctx, args) => {
    // Validate customer/product exists
    const customer = await ctx.db.get(args.customerId);
    if (!customer) {throw new Error("Customer not found");}

    const product = await ctx.db.get(args.productId);
    if (!product) {throw new Error("Product not found");}

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
  returns: v.object({ added: v.boolean(), id: v.optional(v.id("wishlist")) }),
});
