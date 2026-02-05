import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

const variantStatus = v.union(v.literal("Active"), v.literal("Inactive"));

const optionValueDoc = v.object({
  customValue: v.optional(v.string()),
  optionId: v.id("productOptions"),
  valueId: v.id("productOptionValues"),
});

const variantDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("productVariants"),
  allowBackorder: v.optional(v.boolean()),
  barcode: v.optional(v.string()),
  image: v.optional(v.string()),
  images: v.optional(v.array(v.string())),
  optionValues: v.array(optionValueDoc),
  order: v.number(),
  price: v.optional(v.number()),
  productId: v.id("products"),
  salePrice: v.optional(v.number()),
  sku: v.string(),
  status: variantStatus,
  stock: v.optional(v.number()),
});

export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const maxLimit = Math.min(args.limit ?? 200, 500);
    return ctx.db.query("productVariants").order("desc").take(maxLimit);
  },
  returns: v.array(variantDoc),
});

export const listByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => ctx.db
      .query("productVariants")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .collect(),
  returns: v.array(variantDoc),
});

export const listByProductActive = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => ctx.db
      .query("productVariants")
      .withIndex("by_product_status", (q) => q.eq("productId", args.productId).eq("status", "Active"))
      .collect(),
  returns: v.array(variantDoc),
});

export const listAdminWithOffset = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    productId: v.optional(v.id("products")),
    search: v.optional(v.string()),
    status: v.optional(variantStatus),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 100);
    const offset = args.offset ?? 0;
    const fetchLimit = Math.min(offset + limit + 50, 1000);

    const queryBuilder = args.productId && args.status
      ? ctx.db
          .query("productVariants")
          .withIndex("by_product_status", (q) => q.eq("productId", args.productId!).eq("status", args.status!))
      : args.productId
        ? ctx.db
            .query("productVariants")
            .withIndex("by_product", (q) => q.eq("productId", args.productId!))
        : ctx.db.query("productVariants");

    let variants: Doc<"productVariants">[] = await queryBuilder.order("desc").take(fetchLimit);

    if (args.status && !args.productId) {
      variants = variants.filter((variant) => variant.status === args.status);
    }

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      variants = variants.filter((variant) => variant.sku.toLowerCase().includes(searchLower));
    }

    return variants.slice(offset, offset + limit);
  },
  returns: v.array(variantDoc),
});

export const countAdmin = query({
  args: {
    productId: v.optional(v.id("products")),
    search: v.optional(v.string()),
    status: v.optional(variantStatus),
  },
  handler: async (ctx, args) => {
    const limit = 5000;
    const fetchLimit = limit + 1;

    const queryBuilder = args.productId
      ? ctx.db
          .query("productVariants")
          .withIndex("by_product", (q) => q.eq("productId", args.productId!))
      : ctx.db.query("productVariants");

    let variants: Doc<"productVariants">[] = await queryBuilder.take(fetchLimit);

    if (args.status) {
      variants = variants.filter((variant) => variant.status === args.status);
    }

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      variants = variants.filter((variant) => variant.sku.toLowerCase().includes(searchLower));
    }

    return { count: Math.min(variants.length, limit), hasMore: variants.length > limit };
  },
  returns: v.object({ count: v.number(), hasMore: v.boolean() }),
});

export const listAdminIds = query({
  args: {
    limit: v.optional(v.number()),
    productId: v.optional(v.id("products")),
    search: v.optional(v.string()),
    status: v.optional(variantStatus),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 5000, 5000);
    const fetchLimit = limit + 1;

    const queryBuilder = args.productId
      ? ctx.db
          .query("productVariants")
          .withIndex("by_product", (q) => q.eq("productId", args.productId!))
      : ctx.db.query("productVariants");

    let variants: Doc<"productVariants">[] = await queryBuilder.take(fetchLimit);

    if (args.status) {
      variants = variants.filter((variant) => variant.status === args.status);
    }

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      variants = variants.filter((variant) => variant.sku.toLowerCase().includes(searchLower));
    }

    const hasMore = variants.length > limit;
    return { ids: variants.slice(0, limit).map((variant) => variant._id), hasMore };
  },
  returns: v.object({ ids: v.array(v.id("productVariants")), hasMore: v.boolean() }),
});

export const getById = query({
  args: { id: v.id("productVariants") },
  handler: async (ctx, args) => ctx.db.get(args.id),
  returns: v.union(variantDoc, v.null()),
});

export const getBySku = query({
  args: { sku: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("productVariants")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .unique(),
  returns: v.union(variantDoc, v.null()),
});

export const create = mutation({
  args: {
    allowBackorder: v.optional(v.boolean()),
    barcode: v.optional(v.string()),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    optionValues: v.array(optionValueDoc),
    order: v.optional(v.number()),
    price: v.optional(v.number()),
    productId: v.id("products"),
    salePrice: v.optional(v.number()),
    sku: v.string(),
    status: v.optional(variantStatus),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {throw new Error("Product không tồn tại");}

    const existingSku = await ctx.db
      .query("productVariants")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .unique();
    if (existingSku) {throw new Error("SKU đã tồn tại");}

    const optionValueIds = args.optionValues.map((item) => item.valueId);
    const optionValues = await Promise.all(
      optionValueIds.map( async (id) => ctx.db.get(id))
    );
    optionValues.forEach((value, index) => {
      const input = args.optionValues[index];
      if (!value) {throw new Error("Option value không tồn tại");}
      if (value.optionId !== input.optionId) {
        throw new Error("Option value không khớp với optionId");
      }
    });

    let nextOrder = args.order;
    if (nextOrder === undefined) {
      const lastVariant = await ctx.db
        .query("productVariants")
        .withIndex("by_product_order", (q) => q.eq("productId", args.productId))
        .order("desc")
        .first();
      nextOrder = lastVariant ? lastVariant.order + 1 : 0;
    }

    return ctx.db.insert("productVariants", {
      ...args,
      order: nextOrder,
      status: args.status ?? "Active",
    });
  },
  returns: v.id("productVariants"),
});

export const update = mutation({
  args: {
    allowBackorder: v.optional(v.boolean()),
    barcode: v.optional(v.string()),
    id: v.id("productVariants"),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    optionValues: v.optional(v.array(optionValueDoc)),
    order: v.optional(v.number()),
    price: v.optional(v.number()),
    productId: v.optional(v.id("products")),
    salePrice: v.optional(v.number()),
    sku: v.optional(v.string()),
    status: v.optional(variantStatus),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const variant = await ctx.db.get(id);
    if (!variant) {throw new Error("Variant không tồn tại");}

    if (updates.sku && updates.sku !== variant.sku) {
      const existingSku = await ctx.db
        .query("productVariants")
        .withIndex("by_sku", (q) => q.eq("sku", updates.sku!))
        .unique();
      if (existingSku) {throw new Error("SKU đã tồn tại");}
    }

    if (updates.optionValues) {
      const optionValues = await Promise.all(
        updates.optionValues.map( async (item) => ctx.db.get(item.valueId))
      );
      optionValues.forEach((value, index) => {
        const input = updates.optionValues![index];
        if (!value) {throw new Error("Option value không tồn tại");}
        if (value.optionId !== input.optionId) {
          throw new Error("Option value không khớp với optionId");
        }
      });
    }

    if (updates.productId && updates.productId !== variant.productId) {
      const product = await ctx.db.get(updates.productId);
      if (!product) {throw new Error("Product không tồn tại");}
    }

    await ctx.db.patch(id, updates);
    return null;
  },
  returns: v.null(),
});

export const remove = mutation({
  args: { id: v.id("productVariants") },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.id);
    if (!variant) {throw new Error("Variant không tồn tại");}
    await ctx.db.delete(args.id);
    return null;
  },
  returns: v.null(),
});

export const reorder = mutation({
  args: { items: v.array(v.object({ id: v.id("productVariants"), order: v.number() })) },
  handler: async (ctx, args) => {
    await Promise.all(
      args.items.map( async (item) => ctx.db.patch(item.id, { order: item.order }))
    );
    return null;
  },
  returns: v.null(),
});
