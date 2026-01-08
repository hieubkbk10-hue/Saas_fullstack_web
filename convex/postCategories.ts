import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import * as CategoriesModel from "./model/postCategories";

const categoryDoc = v.object({
  _id: v.id("postCategories"),
  _creationTime: v.number(),
  name: v.string(),
  slug: v.string(),
  parentId: v.optional(v.id("postCategories")),
  description: v.optional(v.string()),
  thumbnail: v.optional(v.string()),
  order: v.number(),
  active: v.boolean(),
});

// Limited list for admin (max 100 items)
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(categoryDoc),
  handler: async (ctx, args) => {
    return await CategoriesModel.listWithLimit(ctx, { limit: args.limit });
  },
});

export const listActive = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(categoryDoc),
  handler: async (ctx, args) => {
    return await CategoriesModel.listActive(ctx, { limit: args.limit });
  },
});

export const listByParent = query({
  args: { parentId: v.optional(v.id("postCategories")) },
  returns: v.array(categoryDoc),
  handler: async (ctx, args) => {
    return await CategoriesModel.listByParent(ctx, { parentId: args.parentId });
  },
});

export const listByParentOrdered = query({
  args: { parentId: v.optional(v.id("postCategories")) },
  returns: v.array(categoryDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("postCategories")
      .withIndex("by_parent_order", (q) => q.eq("parentId", args.parentId))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("postCategories") },
  returns: v.union(categoryDoc, v.null()),
  handler: async (ctx, args) => {
    return await CategoriesModel.getById(ctx, args);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(categoryDoc, v.null()),
  handler: async (ctx, args) => {
    return await CategoriesModel.getBySlug(ctx, args);
  },
});

// Count categories efficiently
export const count = query({
  args: {},
  returns: v.object({
    count: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx) => {
    return await CategoriesModel.countWithLimit(ctx);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    parentId: v.optional(v.id("postCategories")),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  returns: v.id("postCategories"),
  handler: async (ctx, args) => {
    return await CategoriesModel.create(ctx, args);
  },
});

export const update = mutation({
  args: {
    id: v.id("postCategories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    parentId: v.optional(v.id("postCategories")),
    description: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    order: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await CategoriesModel.update(ctx, args);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("postCategories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await CategoriesModel.remove(ctx, args);
    return null;
  },
});

export const reorder = mutation({
  args: { items: v.array(v.object({ id: v.id("postCategories"), order: v.number() })) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await CategoriesModel.reorder(ctx, args);
    return null;
  },
});
