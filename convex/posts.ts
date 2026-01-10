import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { contentStatus } from "./lib/validators";
import * as PostsModel from "./model/posts";
import { Doc } from "./_generated/dataModel";

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

// Pagination result validator - includes new Convex pagination fields
const paginatedPosts = v.object({
  page: v.array(postDoc),
  isDone: v.boolean(),
  continueCursor: v.string(),
  pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
  splitCursor: v.optional(v.union(v.string(), v.null())),
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginatedPosts,
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
  returns: paginatedPosts,
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
  returns: paginatedPosts,
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
  returns: paginatedPosts,
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
  returns: paginatedPosts,
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_status_views", (q) => q.eq("status", "Published"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Search and filter published posts
export const searchPublished = query({
  args: {
    search: v.optional(v.string()),
    categoryId: v.optional(v.id("postCategories")),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("oldest"),
      v.literal("popular"),
      v.literal("title")
    )),
    limit: v.optional(v.number()),
  },
  returns: v.array(postDoc),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 100);
    const sortBy = args.sortBy ?? "newest";
    
    let posts: Doc<"posts">[] = [];
    
    // Filter by category if provided
    if (args.categoryId) {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_category_status", (q) => 
          q.eq("categoryId", args.categoryId!).eq("status", "Published")
        )
        .take(limit * 2); // Get more for client-side filtering
    } else {
      // Get all published posts
      if (sortBy === "popular") {
        posts = await ctx.db
          .query("posts")
          .withIndex("by_status_views", (q) => q.eq("status", "Published"))
          .order("desc")
          .take(limit * 2);
      } else {
        posts = await ctx.db
          .query("posts")
          .withIndex("by_status_publishedAt", (q) => q.eq("status", "Published"))
          .order(sortBy === "oldest" ? "asc" : "desc")
          .take(limit * 2);
      }
    }
    
    // Client-side text search (Convex doesn't have full-text search built-in)
    if (args.search && args.search.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        (post.excerpt?.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort if needed (after category filter)
    if (args.categoryId) {
      switch (sortBy) {
        case "oldest":
          posts.sort((a, b) => (a.publishedAt ?? 0) - (b.publishedAt ?? 0));
          break;
        case "popular":
          posts.sort((a, b) => b.views - a.views);
          break;
        case "title":
          posts.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
          break;
        default: // newest
          posts.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
      }
    } else if (sortBy === "title") {
      posts.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    }
    
    return posts.slice(0, limit);
  },
});

// Get featured posts (most viewed)
export const listFeatured = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(postDoc),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 5, 20);
    return await ctx.db
      .query("posts")
      .withIndex("by_status_views", (q) => q.eq("status", "Published"))
      .order("desc")
      .take(limit);
  },
});

// Count published posts (for result display)
export const countPublished = query({
  args: { categoryId: v.optional(v.id("postCategories")) },
  returns: v.number(),
  handler: async (ctx, args) => {
    if (args.categoryId) {
      const posts = await ctx.db
        .query("posts")
        .withIndex("by_category_status", (q) => 
          q.eq("categoryId", args.categoryId!).eq("status", "Published")
        )
        .take(1000);
      return posts.length;
    }
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "Published"))
      .take(1000);
    return posts.length;
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
