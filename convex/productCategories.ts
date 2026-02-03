import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

const categoryDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("productCategories"),
  active: v.boolean(),
  description: v.optional(v.string()),
  image: v.optional(v.string()),
  name: v.string(),
  order: v.number(),
  parentId: v.optional(v.id("productCategories")),
  slug: v.string(),
});

export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const maxLimit = args.limit ?? 100;
    return  ctx.db.query("productCategories").take(maxLimit);
  },
  returns: v.array(categoryDoc),
});

export const listAdminWithOffset = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 100);
    const offset = args.offset ?? 0;
    const fetchLimit = Math.min(offset + limit + 50, 1000);

    let categories = await ctx.db.query("productCategories").order("desc").take(fetchLimit);

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      categories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchLower) ||
        category.slug.toLowerCase().includes(searchLower)
      );
    }

    return categories.slice(offset, offset + limit);
  },
  returns: v.array(categoryDoc),
});

export const countAdmin = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = 5000;
    const fetchLimit = limit + 1;

    let categories: Doc<"productCategories">[] = await ctx.db.query("productCategories").take(fetchLimit);

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      categories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchLower) ||
        category.slug.toLowerCase().includes(searchLower)
      );
    }

    return { count: Math.min(categories.length, limit), hasMore: categories.length > limit };
  },
  returns: v.object({ count: v.number(), hasMore: v.boolean() }),
});

export const listAdminIds = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 5000, 5000);
    const fetchLimit = limit + 1;

    let categories: Doc<"productCategories">[] = await ctx.db.query("productCategories").take(fetchLimit);

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      categories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchLower) ||
        category.slug.toLowerCase().includes(searchLower)
      );
    }

    const hasMore = categories.length > limit;
    return { ids: categories.slice(0, limit).map((category) => category._id), hasMore };
  },
  returns: v.object({ ids: v.array(v.id("productCategories")), hasMore: v.boolean() }),
});

export const listActive = query({
  args: {},
  handler: async (ctx) => ctx.db
      .query("productCategories")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect(),
  returns: v.array(categoryDoc),
});

export const listByParent = query({
  args: { parentId: v.optional(v.id("productCategories")) },
  handler: async (ctx, args) => {
    if (args.parentId === undefined) {
      return  ctx.db
        .query("productCategories")
        .withIndex("by_parent", (q) => q.eq("parentId", undefined))
        .collect();
    }
    return  ctx.db
      .query("productCategories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .collect();
  },
  returns: v.array(categoryDoc),
});

export const listByParentOrdered = query({
  args: { parentId: v.optional(v.id("productCategories")) },
  handler: async (ctx, args) => ctx.db
      .query("productCategories")
      .withIndex("by_parent_order", (q) => q.eq("parentId", args.parentId))
      .collect(),
  returns: v.array(categoryDoc),
});

export const getById = query({
  args: { id: v.id("productCategories") },
  handler: async (ctx, args) => ctx.db.get(args.id),
  returns: v.union(categoryDoc, v.null()),
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("productCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique(),
  returns: v.union(categoryDoc, v.null()),
});

export const create = mutation({
  args: {
    active: v.optional(v.boolean()),
    description: v.optional(v.string()),
    image: v.optional(v.string()),
    name: v.string(),
    order: v.optional(v.number()),
    parentId: v.optional(v.id("productCategories")),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("productCategories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) {throw new Error("Slug already exists");}
    
    // FIX: Get last order instead of fetching ALL
    let nextOrder = args.order;
    if (nextOrder === undefined) {
      const lastCategory = await ctx.db
        .query("productCategories")
        .order("desc")
        .first();
      nextOrder = lastCategory ? lastCategory.order + 1 : 0;
    }
    
    return  ctx.db.insert("productCategories", {
      ...args,
      order: nextOrder,
      active: args.active ?? true,
    });
  },
  returns: v.id("productCategories"),
});

export const update = mutation({
  args: {
    active: v.optional(v.boolean()),
    description: v.optional(v.string()),
    id: v.id("productCategories"),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    order: v.optional(v.number()),
    parentId: v.optional(v.id("productCategories")),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const category = await ctx.db.get(id);
    if (!category) {throw new Error("Category not found");}
    if (args.slug && args.slug !== category.slug) {
      const newSlug = args.slug;
      const existing = await ctx.db
        .query("productCategories")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .unique();
      if (existing) {throw new Error("Slug already exists");}
    }
    await ctx.db.patch(id, updates);
    return null;
  },
  returns: v.null(),
});

// FIX HIGH-004: Add count info for better error messages
export const remove = mutation({
  args: { id: v.id("productCategories") },
  handler: async (ctx, args) => {
    const children = await ctx.db
      .query("productCategories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.id))
      .take(100);
    if (children.length > 0) {
      throw new Error(`Không thể xóa danh mục có ${children.length} danh mục con. Vui lòng xóa hoặc di chuyển danh mục con trước.`);
    }
    
    const products = await ctx.db
      .query("products")
      .withIndex("by_category_status", (q) => q.eq("categoryId", args.id))
      .take(100);
    if (products.length > 0) {
      throw new Error(`Không thể xóa danh mục có ${products.length} sản phẩm. Vui lòng xóa hoặc di chuyển sản phẩm trước.`);
    }
    
    await ctx.db.delete(args.id);
    return null;
  },
  returns: v.null(),
});

// FIX HIGH-004: Query to check related data before delete
export const getDeleteInfo = query({
  args: { id: v.id("productCategories") },
  handler: async (ctx, args) => {
    const children = await ctx.db
      .query("productCategories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.id))
      .take(100);
    
    const products = await ctx.db
      .query("products")
      .withIndex("by_category_status", (q) => q.eq("categoryId", args.id))
      .take(100);
    
    return {
      canDelete: children.length === 0 && products.length === 0,
      childrenCount: children.length,
      productsCount: products.length,
    };
  },
  returns: v.object({
    canDelete: v.boolean(),
    childrenCount: v.number(),
    productsCount: v.number(),
  }),
});

export const reorder = mutation({
  args: { items: v.array(v.object({ id: v.id("productCategories"), order: v.number() })) },
  handler: async (ctx, args) => {
    // FIX: Use Promise.all for batch operations
    await Promise.all(
      args.items.map( async (item) => ctx.db.patch(item.id, { order: item.order }))
    );
    return null;
  },
  returns: v.null(),
});
