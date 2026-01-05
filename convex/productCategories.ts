import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const categoryDoc = v.object({
  _id: v.id("productCategories"),
  _creationTime: v.number(),
  name: v.string(),
  slug: v.string(),
  parentId: v.optional(v.id("productCategories")),
  description: v.optional(v.string()),
  image: v.optional(v.string()),
  order: v.number(),
  active: v.boolean(),
});

export const listAll = query({
  args: {},
  returns: v.array(categoryDoc),
  handler: async (ctx) => {
    return await ctx.db.query("productCategories").collect();
  },
});

export const listActive = query({
  args: {},
  returns: v.array(categoryDoc),
  handler: async (ctx) => {
    return await ctx.db
      .query("productCategories")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

export const listByParent = query({
  args: { parentId: v.optional(v.id("productCategories")) },
  returns: v.array(categoryDoc),
  handler: async (ctx, args) => {
    if (args.parentId === undefined) {
      return await ctx.db
        .query("productCategories")
        .withIndex("by_parent", (q) => q.eq("parentId", undefined))
        .collect();
    }
    return await ctx.db
      .query("productCategories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .collect();
  },
});

export const listByParentOrdered = query({
  args: { parentId: v.optional(v.id("productCategories")) },
  returns: v.array(categoryDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productCategories")
      .withIndex("by_parent_order", (q) => q.eq("parentId", args.parentId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("productCategories") },
  returns: v.union(categoryDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(categoryDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("productCategories")),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  returns: v.id("productCategories"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("productCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error("Slug already exists");
    const count = (await ctx.db.query("productCategories").collect()).length;
    return await ctx.db.insert("productCategories", {
      ...args,
      order: args.order ?? count,
      active: args.active ?? true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("productCategories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    parentId: v.optional(v.id("productCategories")),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const category = await ctx.db.get(id);
    if (!category) throw new Error("Category not found");
    if (args.slug && args.slug !== category.slug) {
      const newSlug = args.slug;
      const existing = await ctx.db
        .query("productCategories")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .unique();
      if (existing) throw new Error("Slug already exists");
    }
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("productCategories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const children = await ctx.db
      .query("productCategories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.id))
      .first();
    if (children) throw new Error("Cannot delete category with children");
    const products = await ctx.db
      .query("products")
      .withIndex("by_category_status", (q) => q.eq("categoryId", args.id))
      .first();
    if (products) throw new Error("Cannot delete category with products");
    await ctx.db.delete(args.id);
    return null;
  },
});

export const reorder = mutation({
  args: { items: v.array(v.object({ id: v.id("productCategories"), order: v.number() })) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const item of args.items) {
      await ctx.db.patch(item.id, { order: item.order });
    }
    return null;
  },
});
