import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { contentStatus } from "./lib/validators";

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
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error("Slug already exists");
    const count = (await ctx.db.query("posts").collect()).length;
    const status = args.status ?? "Draft";
    return await ctx.db.insert("posts", {
      ...args,
      status,
      views: 0,
      publishedAt: status === "Published" ? Date.now() : undefined,
      order: args.order ?? count,
    });
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
    const { id, ...updates } = args;
    const post = await ctx.db.get(id);
    if (!post) throw new Error("Post not found");
    if (args.slug && args.slug !== post.slug) {
      const newSlug = args.slug;
      const existing = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .unique();
      if (existing) throw new Error("Slug already exists");
    }
    const patchData: Record<string, unknown> = { ...updates };
    if (args.status === "Published" && post.status !== "Published") {
      patchData.publishedAt = Date.now();
    }
    await ctx.db.patch(id, patchData);
    return null;
  },
});

export const incrementViews = mutation({
  args: { id: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post not found");
    await ctx.db.patch(args.id, { views: post.views + 1 });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_target_status", (q) =>
        q.eq("targetType", "post").eq("targetId", args.id)
      )
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});
