import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { contentStatus } from "./lib/validators";
import * as ServicesModel from "./model/services";
import { Doc } from "./_generated/dataModel";

const serviceDoc = v.object({
  _id: v.id("services"),
  _creationTime: v.number(),
  title: v.string(),
  slug: v.string(),
  content: v.string(),
  excerpt: v.optional(v.string()),
  thumbnail: v.optional(v.string()),
  categoryId: v.id("serviceCategories"),
  price: v.optional(v.number()),
  duration: v.optional(v.string()),
  status: contentStatus,
  views: v.number(),
  publishedAt: v.optional(v.number()),
  order: v.number(),
  featured: v.optional(v.boolean()),
});

const paginatedServices = v.object({
  page: v.array(serviceDoc),
  isDone: v.boolean(),
  continueCursor: v.string(),
  pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
  splitCursor: v.optional(v.union(v.string(), v.null())),
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginatedServices,
  handler: async (ctx, args) => {
    return await ctx.db.query("services").paginate(args.paginationOpts);
  },
});

export const listAll = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(serviceDoc),
  handler: async (ctx, args) => {
    return await ServicesModel.listWithLimit(ctx, { limit: args.limit });
  },
});

export const count = query({
  args: { status: v.optional(contentStatus) },
  returns: v.object({
    count: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    return await ServicesModel.countWithLimit(ctx, { status: args.status });
  },
});

// SVC-001: Legacy count for backward compatibility (returns number)
export const countSimple = query({
  args: { status: v.optional(contentStatus) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const result = await ServicesModel.countWithLimit(ctx, { status: args.status });
    return result.count;
  },
});

export const getById = query({
  args: { id: v.id("services") },
  returns: v.union(serviceDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(serviceDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const listByCategory = query({
  args: {
    categoryId: v.id("serviceCategories"),
    status: v.optional(contentStatus),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginatedServices,
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("services")
        .withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId).eq("status", args.status!)
        )
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("services")
      .withIndex("by_category_status", (q) => q.eq("categoryId", args.categoryId))
      .paginate(args.paginationOpts);
  },
});

export const listPublished = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginatedServices,
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "Published"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// SVC-012: Use by_status_featured index for efficient featured query
export const listFeatured = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(serviceDoc),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 6, 20);
    return await ctx.db
      .query("services")
      .withIndex("by_status_featured", (q) => q.eq("status", "Published").eq("featured", true))
      .order("desc")
      .take(limit);
  },
});

// SVC-003: List most viewed services (like posts.listMostViewed)
export const listMostViewed = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginatedServices,
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_status_views", (q) => q.eq("status", "Published"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// SVC-002: List recent services (non-paginated, for sidebar/widgets)
export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(serviceDoc),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 5, 20);
    return await ctx.db
      .query("services")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "Published"))
      .order("desc")
      .take(limit);
  },
});

// SVC-002: List popular services (non-paginated, for sidebar/widgets)
export const listPopular = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(serviceDoc),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 5, 20);
    return await ctx.db
      .query("services")
      .withIndex("by_status_views", (q) => q.eq("status", "Published"))
      .order("desc")
      .take(limit);
  },
});

export const searchPublished = query({
  args: {
    search: v.optional(v.string()),
    categoryId: v.optional(v.id("serviceCategories")),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("oldest"),
      v.literal("popular"),
      v.literal("title"),
      v.literal("price_asc"),
      v.literal("price_desc")
    )),
    limit: v.optional(v.number()),
  },
  returns: v.array(serviceDoc),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 100);
    const sortBy = args.sortBy ?? "newest";
    
    let services: Doc<"services">[] = [];
    
    if (args.categoryId) {
      services = await ctx.db
        .query("services")
        .withIndex("by_category_status", (q) => 
          q.eq("categoryId", args.categoryId!).eq("status", "Published")
        )
        .take(limit * 2);
    } else {
      if (sortBy === "popular") {
        services = await ctx.db
          .query("services")
          .withIndex("by_status_views", (q) => q.eq("status", "Published"))
          .order("desc")
          .take(limit * 2);
      } else {
        services = await ctx.db
          .query("services")
          .withIndex("by_status_publishedAt", (q) => q.eq("status", "Published"))
          .order(sortBy === "oldest" ? "asc" : "desc")
          .take(limit * 2);
      }
    }
    
    if (args.search && args.search.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      services = services.filter(s => 
        s.title.toLowerCase().includes(searchLower) ||
        (s.excerpt?.toLowerCase().includes(searchLower))
      );
    }
    
    if (args.categoryId || !["newest", "oldest", "popular"].includes(sortBy)) {
      switch (sortBy) {
        case "oldest":
          services.sort((a, b) => (a.publishedAt ?? 0) - (b.publishedAt ?? 0));
          break;
        case "popular":
          services.sort((a, b) => b.views - a.views);
          break;
        case "title":
          services.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
          break;
        case "price_asc":
          services.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
          break;
        case "price_desc":
          services.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
          break;
        default:
          services.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
      }
    }
    
    return services.slice(0, limit);
  },
});

export const countPublished = query({
  args: { categoryId: v.optional(v.id("serviceCategories")) },
  returns: v.number(),
  handler: async (ctx, args) => {
    if (args.categoryId) {
      const services = await ctx.db
        .query("services")
        .withIndex("by_category_status", (q) => 
          q.eq("categoryId", args.categoryId!).eq("status", "Published")
        )
        .take(1000);
      return services.length;
    }
    const services = await ctx.db
      .query("services")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "Published"))
      .take(1000);
    return services.length;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    categoryId: v.id("serviceCategories"),
    price: v.optional(v.number()),
    duration: v.optional(v.string()),
    status: v.optional(contentStatus),
    order: v.optional(v.number()),
    featured: v.optional(v.boolean()),
  },
  returns: v.id("services"),
  handler: async (ctx, args) => {
    return await ServicesModel.create(ctx, args);
  },
});

export const update = mutation({
  args: {
    id: v.id("services"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    thumbnail: v.optional(v.string()),
    categoryId: v.optional(v.id("serviceCategories")),
    price: v.optional(v.number()),
    duration: v.optional(v.string()),
    status: v.optional(contentStatus),
    order: v.optional(v.number()),
    featured: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ServicesModel.update(ctx, args);
    return null;
  },
});

export const incrementViews = mutation({
  args: { id: v.id("services") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ServicesModel.incrementViews(ctx, args);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("services") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ServicesModel.remove(ctx, args);
    return null;
  },
});
