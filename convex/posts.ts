import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { contentStatus } from "./lib/validators";
import * as PostsModel from "./model/posts";
import type { Doc } from "./_generated/dataModel";

const postDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("posts"),
  authorId: v.optional(v.id("users")),
  authorName: v.optional(v.string()),
  categoryId: v.id("postCategories"),
  content: v.string(),
  excerpt: v.optional(v.string()),
  order: v.number(),
  publishedAt: v.optional(v.number()),
  slug: v.string(),
  status: contentStatus,
  thumbnail: v.optional(v.string()),
  title: v.string(),
  views: v.number(),
});

// Pagination result validator - includes new Convex pagination fields
const paginatedPosts = v.object({
  continueCursor: v.string(),
  isDone: v.boolean(),
  page: v.array(postDoc),
  pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
  splitCursor: v.optional(v.union(v.string(), v.null())),
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => ctx.db.query("posts").paginate(args.paginationOpts),
  returns: paginatedPosts,
});

// Limited list for admin (max 100 items - use pagination for more)
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => PostsModel.listWithLimit(ctx, { limit: args.limit }),
  returns: v.array(postDoc),
});

// Efficient count using take() instead of collect()
export const count = query({
  args: { status: v.optional(contentStatus) },
  handler: async (ctx, args) => PostsModel.countWithLimit(ctx, { status: args.status }),
  returns: v.object({
    count: v.number(),
    hasMore: v.boolean(),
  }),
});

// Legacy count for backward compatibility (returns number)
export const countSimple = query({
  args: { status: v.optional(contentStatus) },
  handler: async (ctx, args) => {
    const result = await PostsModel.countWithLimit(ctx, { status: args.status });
    return result.count;
  },
  returns: v.number(),
});

export const getById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => ctx.db.get(args.id),
  returns: v.union(postDoc, v.null()),
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique(),
  returns: v.union(postDoc, v.null()),
});

export const listByCategory = query({
  args: {
    categoryId: v.id("postCategories"),
    paginationOpts: paginationOptsValidator,
    status: v.optional(contentStatus),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return  ctx.db
        .query("posts")
        .withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId).eq("status", args.status!)
        )
        .paginate(args.paginationOpts);
    }
    return  ctx.db
      .query("posts")
      .withIndex("by_category_status", (q) => q.eq("categoryId", args.categoryId))
      .paginate(args.paginationOpts);
  },
  returns: paginatedPosts,
});

export const listByAuthor = query({
  args: {
    authorName: v.string(),
    paginationOpts: paginationOptsValidator,
    status: v.optional(contentStatus),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return  ctx.db
        .query("posts")
        .withIndex("by_author_name_status", (q) =>
          q.eq("authorName", args.authorName).eq("status", args.status!)
        )
        .paginate(args.paginationOpts);
    }
    return  ctx.db
      .query("posts")
      .withIndex("by_author_name_status", (q) => q.eq("authorName", args.authorName))
      .paginate(args.paginationOpts);
  },
  returns: paginatedPosts,
});

export const listPublished = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => ctx.db
      .query("posts")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "Published"))
      .order("desc")
      .paginate(args.paginationOpts),
  returns: paginatedPosts,
});

export const listMostViewed = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => ctx.db
      .query("posts")
      .withIndex("by_status_views", (q) => q.eq("status", "Published"))
      .order("desc")
      .paginate(args.paginationOpts),
  returns: paginatedPosts,
});

// Search and filter published posts
export const searchPublished = query({
  args: {
    categoryId: v.optional(v.id("postCategories")),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("oldest"),
      v.literal("popular"),
      v.literal("title")
    )),
  },
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
        case "oldest": {
          posts.sort((a, b) => (a.publishedAt ?? 0) - (b.publishedAt ?? 0));
          break;
        }
        case "popular": {
          posts.sort((a, b) => b.views - a.views);
          break;
        }
        case "title": {
          posts.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
          break;
        }
        default: { // Newest
          posts.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
        }
      }
    } else if (sortBy === "title") {
      posts.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    }
    
    return posts.slice(0, limit);
  },
  returns: v.array(postDoc),
});

// Get featured posts (most viewed)
export const listFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 5, 20);
    return  ctx.db
      .query("posts")
      .withIndex("by_status_views", (q) => q.eq("status", "Published"))
      .order("desc")
      .take(limit);
  },
  returns: v.array(postDoc),
});

// Count published posts (for result display)
export const countPublished = query({
  args: { categoryId: v.optional(v.id("postCategories")) },
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
  returns: v.number(),
});

export const create = mutation({
  args: {
    authorName: v.optional(v.string()),
    categoryId: v.id("postCategories"),
    content: v.string(),
    excerpt: v.optional(v.string()),
    order: v.optional(v.number()),
    slug: v.string(),
    status: v.optional(contentStatus),
    thumbnail: v.optional(v.string()),
    title: v.string(),
  },
  handler: async (ctx, args) => PostsModel.create(ctx, args),
  returns: v.id("posts"),
});

export const update = mutation({
  args: {
    authorName: v.optional(v.string()),
    categoryId: v.optional(v.id("postCategories")),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    id: v.id("posts"),
    order: v.optional(v.number()),
    slug: v.optional(v.string()),
    status: v.optional(contentStatus),
    thumbnail: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await PostsModel.update(ctx, args);
    return null;
  },
  returns: v.null(),
});

export const incrementViews = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await PostsModel.incrementViews(ctx, args);
    return null;
  },
  returns: v.null(),
});

export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await PostsModel.remove(ctx, args);
    return null;
  },
  returns: v.null(),
});
