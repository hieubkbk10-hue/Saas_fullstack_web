import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { contentStatus } from "./lib/validators";
import * as PostsModel from "./model/posts";

const postDoc = v.object({
  _id: v.id("posts"),
  _creationTime: v.number(),
  title: v.string(),
  slug: v.string(),
  content: v.string(),
  excerpt: v.optional(v.string()),
  thumbnail: v.optional(v.string()),
  categoryId: v.id("postCategories"),
  authorId: v.id("users"),
  status: contentStatus,
  views: v.number(),
  publishedAt: v.optional(v.number()),
  order: v.number(),
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(postDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("posts").paginate(args.paginationOpts);
  },
});

// Limited list for admin (max 100 items - use pagination for more)
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(postDoc),
  handler: async (ctx, args) => {
    return await PostsModel.listWithLimit(ctx, { limit: args.limit });
  },
});

// Efficient count using take() instead of collect()
export const count = query({
  args: { status: v.optional(contentStatus) },
  returns: v.object({
    count: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    return await PostsModel.countWithLimit(ctx, { status: args.status });
  },
});

// Legacy count for backward compatibility (returns number)
export const countSimple = query({
  args: { status: v.optional(contentStatus) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const result = await PostsModel.countWithLimit(ctx, { status: args.status });
    return result.count;
  },
});

export const getById = query({
  args: { id: v.id("posts") },
  returns: v.union(postDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(postDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const listByCategory = query({
  args: {
    categoryId: v.id("postCategories"),
    status: v.optional(contentStatus),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(postDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("posts")
        .withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId).eq("status", args.status!)
        )
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("posts")
      .withIndex("by_category_status", (q) => q.eq("categoryId", args.categoryId))
      .paginate(args.paginationOpts);
  },
});

export const listByAuthor = query({
  args: {
    authorId: v.id("users"),
    status: v.optional(contentStatus),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(postDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("posts")
        .withIndex("by_author_status", (q) =>
          q.eq("authorId", args.authorId).eq("status", args.status!)
        )
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("posts")
      .withIndex("by_author_status", (q) => q.eq("authorId", args.authorId))
      .paginate(args.paginationOpts);
  },
});

export const listPublished = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(postDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "Published"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listMostViewed = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(postDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_status_views", (q) => q.eq("status", "Published"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    categoryId: v.id("postCategories"),
    authorId: v.id("users"),
    status: v.optional(contentStatus),
    order: v.optional(v.number()),
  },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    return await PostsModel.create(ctx, args);
  },
});

export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    categoryId: v.optional(v.id("postCategories")),
    status: v.optional(contentStatus),
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await PostsModel.update(ctx, args);
    return null;
  },
});

export const incrementViews = mutation({
  args: { id: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await PostsModel.incrementViews(ctx, args);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await PostsModel.remove(ctx, args);
    return null;
  },
});
