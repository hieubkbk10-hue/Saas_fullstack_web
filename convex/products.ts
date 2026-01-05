import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { productStatus } from "./lib/validators";

const productDoc = v.object({
  _id: v.id("products"),
  _creationTime: v.number(),
  name: v.string(),
  sku: v.string(),
  slug: v.string(),
  categoryId: v.id("productCategories"),
  price: v.number(),
  salePrice: v.optional(v.number()),
  stock: v.number(),
  status: productStatus,
  image: v.optional(v.string()),
  images: v.optional(v.array(v.string())),
  sales: v.number(),
  description: v.optional(v.string()),
  order: v.number(),
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(productDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("products").paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id("products") },
  returns: v.union(productDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySku = query({
  args: { sku: v.string() },
  returns: v.union(productDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .unique();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(productDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const listByCategory = query({
  args: {
    categoryId: v.id("productCategories"),
    status: v.optional(productStatus),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(productDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("products")
        .withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId).eq("status", args.status!)
        )
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("products")
      .withIndex("by_category_status", (q) => q.eq("categoryId", args.categoryId))
      .paginate(args.paginationOpts);
  },
});

export const listByStatus = query({
  args: { status: productStatus, paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(productDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_status_order", (q) => q.eq("status", args.status))
      .paginate(args.paginationOpts);
  },
});

export const listLowStock = query({
  args: { threshold: v.number(), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(productDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_status_stock", (q) => q.eq("status", "Active"))
      .paginate(args.paginationOpts);
  },
});

export const listBestSellers = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(productDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_status_sales", (q) => q.eq("status", "Active"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    slug: v.string(),
    categoryId: v.id("productCategories"),
    price: v.number(),
    salePrice: v.optional(v.number()),
    stock: v.optional(v.number()),
    status: v.optional(productStatus),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.id("products"),
  handler: async (ctx, args) => {
    const existingSku = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .unique();
    if (existingSku) throw new Error("SKU already exists");
    const existingSlug = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existingSlug) throw new Error("Slug already exists");
    const count = (await ctx.db.query("products").collect()).length;
    return await ctx.db.insert("products", {
      ...args,
      stock: args.stock ?? 0,
      status: args.status ?? "Draft",
      sales: 0,
      order: args.order ?? count,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    sku: v.optional(v.string()),
    slug: v.optional(v.string()),
    categoryId: v.optional(v.id("productCategories")),
    price: v.optional(v.number()),
    salePrice: v.optional(v.number()),
    stock: v.optional(v.number()),
    status: v.optional(productStatus),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product not found");
    if (args.sku && args.sku !== product.sku) {
      const newSku = args.sku;
      const existing = await ctx.db
        .query("products")
        .withIndex("by_sku", (q) => q.eq("sku", newSku))
        .unique();
      if (existing) throw new Error("SKU already exists");
    }
    if (args.slug && args.slug !== product.slug) {
      const newSlug = args.slug;
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .unique();
      if (existing) throw new Error("Slug already exists");
    }
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const updateStock = mutation({
  args: { id: v.id("products"), quantity: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    const newStock = product.stock + args.quantity;
    if (newStock < 0) throw new Error("Insufficient stock");
    await ctx.db.patch(args.id, { stock: newStock });
    return null;
  },
});

export const incrementSales = mutation({
  args: { id: v.id("products"), quantity: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(args.id, { sales: product.sales + args.quantity });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

export const reorder = mutation({
  args: { items: v.array(v.object({ id: v.id("products"), order: v.number() })) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const item of args.items) {
      await ctx.db.patch(item.id, { order: item.order });
    }
    return null;
  },
});
