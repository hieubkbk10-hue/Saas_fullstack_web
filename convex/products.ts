import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { productStatus } from "./lib/validators";
import type { Doc } from "./_generated/dataModel";

const productDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("products"),
  categoryId: v.id("productCategories"),
  description: v.optional(v.string()),
  hasVariants: v.optional(v.boolean()),
  image: v.optional(v.string()),
  images: v.optional(v.array(v.string())),
  name: v.string(),
  optionIds: v.optional(v.array(v.id("productOptions"))),
  order: v.number(),
  price: v.number(),
  salePrice: v.optional(v.number()),
  sales: v.number(),
  sku: v.string(),
  slug: v.string(),
  status: productStatus,
  stock: v.number(),
});

const paginatedProducts = v.object({
  continueCursor: v.string(),
  isDone: v.boolean(),
  page: v.array(productDoc),
  pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
  splitCursor: v.optional(v.union(v.string(), v.null())),
});

// ============================================================
// QUERIES
// ============================================================

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) =>  ctx.db.query("products").paginate(args.paginationOpts),
});

// FIX #1: Replace listAll with take() limit - use for admin dropdown/select only
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const maxLimit = args.limit ?? 100; // Default max 100, configurable
    return  ctx.db.query("products").take(maxLimit);
  },
  returns: v.array(productDoc),
});

export const listAdminWithOffset = query({
  args: {
    categoryId: v.optional(v.id("productCategories")),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(productStatus),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 100);
    const offset = args.offset ?? 0;
    const fetchLimit = Math.min(offset + limit + 50, 1000);

    const queryBuilder = args.categoryId && args.status
      ? ctx.db.query("products").withIndex("by_category_status", (q) =>
        q.eq("categoryId", args.categoryId!).eq("status", args.status!)
      )
      : args.categoryId
        ? ctx.db.query("products").withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId!)
        )
        : args.status
          ? ctx.db.query("products").withIndex("by_status_order", (q) => q.eq("status", args.status!))
          : ctx.db.query("products").withIndex("by_status_order");

    let products = await queryBuilder.order("desc").take(fetchLimit);

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      products = products.filter((product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower)
      );
    }

    return products.slice(offset, offset + limit);
  },
  returns: v.array(productDoc),
});

export const countAdmin = query({
  args: {
    categoryId: v.optional(v.id("productCategories")),
    search: v.optional(v.string()),
    status: v.optional(productStatus),
  },
  handler: async (ctx, args) => {
    const limit = 5000;
    const fetchLimit = limit + 1;

    const queryBuilder = args.categoryId && args.status
      ? ctx.db.query("products").withIndex("by_category_status", (q) =>
        q.eq("categoryId", args.categoryId!).eq("status", args.status!)
      )
      : args.categoryId
        ? ctx.db.query("products").withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId!)
        )
        : args.status
          ? ctx.db.query("products").withIndex("by_status_order", (q) => q.eq("status", args.status!))
          : ctx.db.query("products");

    let products = await queryBuilder.take(fetchLimit);

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      products = products.filter((product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower)
      );
    }

    return { count: Math.min(products.length, limit), hasMore: products.length > limit };
  },
  returns: v.object({ count: v.number(), hasMore: v.boolean() }),
});

export const listAdminIds = query({
  args: {
    categoryId: v.optional(v.id("productCategories")),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(productStatus),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 5000, 5000);
    const fetchLimit = limit + 1;

    const queryBuilder = args.categoryId && args.status
      ? ctx.db.query("products").withIndex("by_category_status", (q) =>
        q.eq("categoryId", args.categoryId!).eq("status", args.status!)
      )
      : args.categoryId
        ? ctx.db.query("products").withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId!)
        )
        : args.status
          ? ctx.db.query("products").withIndex("by_status_order", (q) => q.eq("status", args.status!))
          : ctx.db.query("products");

    let products = await queryBuilder.take(fetchLimit);

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      products = products.filter((product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower)
      );
    }

    const hasMore = products.length > limit;
    return { ids: products.slice(0, limit).map((product) => product._id), hasMore };
  },
  returns: v.object({ ids: v.array(v.id("products")), hasMore: v.boolean() }),
});

// FIX #2: Use counter table for count instead of fetching ALL
export const count = query({
  args: { status: v.optional(productStatus) },
  handler: async (ctx, args) => {
    const key = args.status ?? "total";
    const stats = await ctx.db
      .query("productStats")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    return stats?.count ?? 0;
  },
  returns: v.number(),
});

// Get counts for all statuses in one query (for dashboard)
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db.query("productStats").collect();
    const statsMap = new Map(stats.map((s) => [s.key, s.count]));
    return {
      active: statsMap.get("Active") ?? 0,
      archived: statsMap.get("Archived") ?? 0,
      draft: statsMap.get("Draft") ?? 0,
      total: statsMap.get("total") ?? 0,
    };
  },
  returns: v.object({
    active: v.number(),
    archived: v.number(),
    draft: v.number(),
    total: v.number(),
  }),
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => ctx.db.get(args.id),
  returns: v.union(productDoc, v.null()),
});

export const getBySku = query({
  args: { sku: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .unique(),
  returns: v.union(productDoc, v.null()),
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique(),
  returns: v.union(productDoc, v.null()),
});

export const listByCategory = query({
  args: {
    categoryId: v.id("productCategories"),
    paginationOpts: paginationOptsValidator,
    status: v.optional(productStatus),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return  ctx.db
        .query("products")
        .withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId).eq("status", args.status!)
        )
        .paginate(args.paginationOpts);
    }
    return  ctx.db
      .query("products")
      .withIndex("by_category_status", (q) => q.eq("categoryId", args.categoryId))
      .paginate(args.paginationOpts);
  },
});

export const listByStatus = query({
  args: { paginationOpts: paginationOptsValidator, status: productStatus },
  handler: async (ctx, args) =>  ctx.db
      .query("products")
      .withIndex("by_status_order", (q) => q.eq("status", args.status))
      .paginate(args.paginationOpts),
});

// FIX #9: Add filter for threshold
export const listLowStock = query({
  args: { paginationOpts: paginationOptsValidator, threshold: v.number() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("products")
      .withIndex("by_status_stock", (q) => q.eq("status", "Active"))
      .filter((q) => q.lt(q.field("stock"), args.threshold))
      .paginate(args.paginationOpts);
    return result;
  },
});

export const listBestSellers = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) =>  ctx.db
      .query("products")
      .withIndex("by_status_sales", (q) => q.eq("status", "Active"))
      .order("desc")
      .paginate(args.paginationOpts),
});

// ============================================================
// PUBLIC QUERIES (for frontend)
// ============================================================

// Paginated published products for usePaginatedQuery hook (infinite scroll)
export const listPublishedPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    categoryId: v.optional(v.id("productCategories")),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("oldest"),
      v.literal("popular"),
    )),
  },
  handler: async (ctx, args) => {
    const sortBy = args.sortBy ?? "newest";

    if (args.categoryId) {
      return ctx.db
        .query("products")
        .withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId!).eq("status", "Active")
        )
        .order(sortBy === "oldest" ? "asc" : "desc")
        .paginate(args.paginationOpts);
    }

    if (sortBy === "popular") {
      return ctx.db
        .query("products")
        .withIndex("by_status_sales", (q) => q.eq("status", "Active"))
        .order("desc")
        .paginate(args.paginationOpts);
    }

    return ctx.db
      .query("products")
      .withIndex("by_status_order", (q) => q.eq("status", "Active"))
      .order(sortBy === "oldest" ? "asc" : "desc")
      .paginate(args.paginationOpts);
  },
  returns: paginatedProducts,
});

// Offset-based pagination for URL-based pagination mode
export const listPublishedWithOffset = query({
  args: {
    categoryId: v.optional(v.id("productCategories")),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    search: v.optional(v.string()),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("oldest"),
      v.literal("popular"),
      v.literal("price_asc"),
      v.literal("price_desc"),
      v.literal("name")
    )),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 12, 50);
    const offset = args.offset ?? 0;
    const sortBy = args.sortBy ?? "newest";

    let products: Doc<"products">[] = [];
    const fetchLimit = offset + limit + 10;

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      const fetchLimit = Math.min(offset + limit + 20, 500);
      const searchQuery = ctx.db
        .query("products")
        .withSearchIndex("search_name", (q) => {
          const builder = q.search("name", searchLower).eq("status", "Active");
          return args.categoryId ? builder.eq("categoryId", args.categoryId) : builder;
        });
      products = await searchQuery.take(fetchLimit);
    } else if (args.categoryId) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId!).eq("status", "Active")
        )
        .take(fetchLimit);
    } else if (sortBy === "popular") {
      products = await ctx.db
        .query("products")
        .withIndex("by_status_sales", (q) => q.eq("status", "Active"))
        .order("desc")
        .take(fetchLimit);
    } else {
      products = await ctx.db
        .query("products")
        .withIndex("by_status_order", (q) => q.eq("status", "Active"))
        .take(fetchLimit);
    }

    if (args.search && args.search.trim() && products.length > 0) {
      const searchLower = args.search.toLowerCase().trim();
      products = products.filter((p) => {
        const name = p.name?.toLowerCase() ?? '';
        const sku = p.sku?.toLowerCase() ?? '';
        return name.includes(searchLower) || sku.includes(searchLower);
      });
    }

    switch (sortBy) {
      case "newest": {
        products.sort((a, b) => b._creationTime - a._creationTime);
        break;
      }
      case "oldest": {
        products.sort((a, b) => a._creationTime - b._creationTime);
        break;
      }
      case "popular": {
        products.sort((a, b) => b.sales - a.sales);
        break;
      }
      case "price_asc": {
        products.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      }
      case "price_desc": {
        products.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      }
      case "name": {
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      }
    }

    return products.slice(offset, offset + limit);
  },
  returns: v.array(productDoc),
});

// Search active products with filters
export const searchPublished = query({
  args: {
    categoryId: v.optional(v.id("productCategories")),
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
    sortBy: v.optional(
      v.union(
        v.literal("newest"),
        v.literal("oldest"),
        v.literal("popular"),
        v.literal("price_asc"),
        v.literal("price_desc"),
        v.literal("name")
      )
    ),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 100);
    let products;

    if (args.search?.trim()) {
      const searchLower = args.search.toLowerCase().trim();
      const fetchLimit = Math.min(limit * 2, 200);
      const searchQuery = ctx.db
        .query("products")
        .withSearchIndex("search_name", (q) => {
          const builder = q.search("name", searchLower).eq("status", "Active");
          return args.categoryId ? builder.eq("categoryId", args.categoryId) : builder;
        });
      products = await searchQuery.take(fetchLimit);
    } else if (args.categoryId) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId!).eq("status", "Active")
        )
        .take(limit * 2);
    } else {
      products = await ctx.db
        .query("products")
        .withIndex("by_status_order", (q) => q.eq("status", "Active"))
        .take(limit * 2);
    }

    // Client-side search filter
    if (args.search?.trim() && products.length > 0) {
      const searchLower = args.search.toLowerCase().trim();
      products = products.filter((p) => {
        const name = p.name?.toLowerCase() ?? '';
        const sku = p.sku?.toLowerCase() ?? '';
        return name.includes(searchLower) || sku.includes(searchLower);
      });
    }

    // Sort
    const sortBy = args.sortBy ?? "newest";
    switch (sortBy) {
      case "newest": {
        products.sort((a, b) => b._creationTime - a._creationTime);
        break;
      }
      case "oldest": {
        products.sort((a, b) => a._creationTime - b._creationTime);
        break;
      }
      case "popular": {
        products.sort((a, b) => b.sales - a.sales);
        break;
      }
      case "price_asc": {
        products.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      }
      case "price_desc": {
        products.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      }
      case "name": {
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      }
    }

    return products.slice(0, limit);
  },
  returns: v.array(productDoc),
});

// Count published products
export const countPublished = query({
  args: {
    categoryId: v.optional(v.id("productCategories")),
  },
  handler: async (ctx, args) => {
    if (args.categoryId) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId!).eq("status", "Active")
        )
        .take(1001);
      return products.length;
    }
    const stats = await ctx.db
      .query("productStats")
      .withIndex("by_key", (q) => q.eq("key", "Active"))
      .unique();
    return stats?.count ?? 0;
  },
  returns: v.number(),
});

// Featured products (best sellers)
export const listFeatured = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 8, 20);
    return  ctx.db
      .query("products")
      .withIndex("by_status_sales", (q) => q.eq("status", "Active"))
      .order("desc")
      .take(limit);
  },
  returns: v.array(productDoc),
});

// Recent products
export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 8, 20);
    return  ctx.db
      .query("products")
      .withIndex("by_status_order", (q) => q.eq("status", "Active"))
      .order("desc")
      .take(limit);
  },
  returns: v.array(productDoc),
});

// Popular products (by sales)
export const listPopular = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 8, 20);
    return  ctx.db
      .query("products")
      .withIndex("by_status_sales", (q) => q.eq("status", "Active"))
      .order("desc")
      .take(limit);
  },
  returns: v.array(productDoc),
});

// Increment views
export const incrementViews = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {return null;}
    // Note: products schema doesn't have views field, using sales as proxy or skip
    return null;
  },
  returns: v.null(),
});

// ============================================================
// MUTATIONS
// ============================================================

// Helper: Update stats counters
async function updateStats(
  ctx: MutationCtx,
  statusChange: { old?: string; new?: string }
) {
  // Update total count
  const totalStats = await ctx.db
    .query("productStats")
    .withIndex("by_key", (q) => q.eq("key", "total"))
    .unique();

  if (statusChange.new && !statusChange.old) {
    // Creating new product
    if (totalStats) {
      await ctx.db.patch(totalStats._id, {
        count: totalStats.count + 1,
        lastOrder: totalStats.lastOrder + 1,
      });
    } else {
      await ctx.db.insert("productStats", { count: 1, key: "total", lastOrder: 0 });
    }
  } else if (statusChange.old && !statusChange.new) {
    // Deleting product
    if (totalStats && totalStats.count > 0) {
      await ctx.db.patch(totalStats._id, { count: totalStats.count - 1 });
    }
  }

  // Update status-specific counts
  if (statusChange.old) {
    const oldStatus = statusChange.old;
    const oldStats = await ctx.db
      .query("productStats")
      .withIndex("by_key", (q) => q.eq("key", oldStatus))
      .unique();
    if (oldStats && oldStats.count > 0) {
      await ctx.db.patch(oldStats._id, { count: oldStats.count - 1 });
    }
  }

  if (statusChange.new) {
    const newStatus = statusChange.new;
    const newStats = await ctx.db
      .query("productStats")
      .withIndex("by_key", (q) => q.eq("key", newStatus))
      .unique();
    if (newStats) {
      await ctx.db.patch(newStats._id, { count: newStats.count + 1 });
    } else {
      await ctx.db.insert("productStats", { count: 1, key: newStatus, lastOrder: 0 });
    }
  }
}

// Helper: Get next order value from stats (FIX #3)
async function getNextOrder(ctx: MutationCtx): Promise<number> {
  const totalStats = await ctx.db
    .query("productStats")
    .withIndex("by_key", (q) => q.eq("key", "total"))
    .unique();
  return totalStats?.lastOrder ?? 0;
}

export const create = mutation({
  args: {
    categoryId: v.id("productCategories"),
    description: v.optional(v.string()),
    hasVariants: v.optional(v.boolean()),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    name: v.string(),
    optionIds: v.optional(v.array(v.id("productOptions"))),
    order: v.optional(v.number()),
    price: v.number(),
    salePrice: v.optional(v.number()),
    sku: v.string(),
    slug: v.string(),
    status: v.optional(productStatus),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate unique SKU
    const existingSku = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .unique();
    if (existingSku) {throw new Error("SKU already exists");}

    // Validate unique slug
    const existingSlug = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existingSlug) {throw new Error("Slug already exists");}

    // FIX #3: Get next order from stats instead of fetching ALL
    const nextOrder = await getNextOrder(ctx);
    
    // FIX #12: Get default status from module settings instead of hardcoded
    let defaultStatus: "Draft" | "Active" | "Archived" = "Draft";
    if (!args.status) {
      const setting = await ctx.db
        .query("moduleSettings")
        .withIndex("by_module_setting", (q) => 
          q.eq("moduleKey", "products").eq("settingKey", "defaultStatus")
        )
        .unique();
      if (setting?.value === "Active") {defaultStatus = "Active";}
    }
    const status = args.status ?? defaultStatus;

    const productId = await ctx.db.insert("products", {
      ...args,
      stock: args.stock ?? 0,
      status,
      sales: 0,
      order: args.order ?? nextOrder,
      hasVariants: args.hasVariants ?? false,
      optionIds: args.optionIds,
    });

    // Update stats counters
    await updateStats(ctx, { new: status });

    return productId;
  },
  returns: v.id("products"),
});

export const update = mutation({
  args: {
    categoryId: v.optional(v.id("productCategories")),
    description: v.optional(v.string()),
    id: v.id("products"),
    hasVariants: v.optional(v.boolean()),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    name: v.optional(v.string()),
    optionIds: v.optional(v.array(v.id("productOptions"))),
    order: v.optional(v.number()),
    price: v.optional(v.number()),
    salePrice: v.optional(v.number()),
    sku: v.optional(v.string()),
    slug: v.optional(v.string()),
    status: v.optional(productStatus),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const product = await ctx.db.get(id);
    if (!product) {throw new Error("Product not found");}

    // Validate unique SKU if changing
    if (args.sku && args.sku !== product.sku) {
      const newSku = args.sku;
      const existing = await ctx.db
        .query("products")
        .withIndex("by_sku", (q) => q.eq("sku", newSku))
        .unique();
      if (existing) {throw new Error("SKU already exists");}
    }

    // Validate unique slug if changing
    if (args.slug && args.slug !== product.slug) {
      const newSlug = args.slug;
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .unique();
      if (existing) {throw new Error("Slug already exists");}
    }

    // Update stats if status changed
    if (args.status && args.status !== product.status) {
      await updateStats(ctx, { new: args.status, old: product.status });
    }

    await ctx.db.patch(id, updates);
    return null;
  },
  returns: v.null(),
});

export const updateStock = mutation({
  args: { id: v.id("products"), quantity: v.number() },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {throw new Error("Product not found");}
    const newStock = product.stock + args.quantity;
    if (newStock < 0) {throw new Error("Insufficient stock");}
    await ctx.db.patch(args.id, { stock: newStock });
    return null;
  },
  returns: v.null(),
});

export const incrementSales = mutation({
  args: { id: v.id("products"), quantity: v.number() },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {throw new Error("Product not found");}
    await ctx.db.patch(args.id, { sales: product.sales + args.quantity });
    return null;
  },
  returns: v.null(),
});

// FIX #7: Batch delete with Promise.all for cascade operations
export const remove = mutation({
  args: { cascade: v.optional(v.boolean()), id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {throw new Error("Product not found");}

    const [commentPreview, wishlistPreview, cartPreview, variantPreview] = await Promise.all([
      ctx.db
        .query("comments")
        .withIndex("by_target_status", (q) =>
          q.eq("targetType", "product").eq("targetId", args.id)
        )
        .take(1),
      ctx.db
        .query("wishlist")
        .withIndex("by_product", (q) => q.eq("productId", args.id))
        .take(1),
      ctx.db
        .query("cartItems")
        .withIndex("by_product", (q) => q.eq("productId", args.id))
        .take(1),
      ctx.db
        .query("productVariants")
        .withIndex("by_product", (q) => q.eq("productId", args.id))
        .take(1),
    ]);

    if (!args.cascade && (commentPreview.length > 0 || wishlistPreview.length > 0 || cartPreview.length > 0 || variantPreview.length > 0)) {
      throw new Error("Sản phẩm có dữ liệu liên quan. Vui lòng xác nhận xóa tất cả.");
    }

    if (args.cascade) {
      const [comments, wishlistItems, cartItems, variants] = await Promise.all([
        ctx.db
          .query("comments")
          .withIndex("by_target_status", (q) =>
            q.eq("targetType", "product").eq("targetId", args.id)
          )
          .collect(),
        ctx.db
          .query("wishlist")
          .withIndex("by_product", (q) => q.eq("productId", args.id))
          .collect(),
        ctx.db
          .query("cartItems")
          .withIndex("by_product", (q) => q.eq("productId", args.id))
          .collect(),
        ctx.db
          .query("productVariants")
          .withIndex("by_product", (q) => q.eq("productId", args.id))
          .collect(),
      ]);

      await Promise.all([
        ...comments.map( async (c) => ctx.db.delete(c._id)),
        ...wishlistItems.map( async (w) => ctx.db.delete(w._id)),
        ...cartItems.map( async (c) => ctx.db.delete(c._id)),
        ...variants.map( async (variant) => ctx.db.delete(variant._id)),
      ]);
    }

    await ctx.db.delete(args.id);
    await updateStats(ctx, { old: product.status });

    return null;
  },
  returns: v.null(),
});

export const getDeleteInfo = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const [variantsPreview, variantsCount, commentsCount, wishlistCount, cartCount] = await Promise.all([
      ctx.db.query("productVariants").withIndex("by_product", (q) => q.eq("productId", args.id)).take(10),
      ctx.db.query("productVariants").withIndex("by_product", (q) => q.eq("productId", args.id)).take(1001),
      ctx.db.query("comments").withIndex("by_target_status", (q) => q.eq("targetType", "product").eq("targetId", args.id)).take(1001),
      ctx.db.query("wishlist").withIndex("by_product", (q) => q.eq("productId", args.id)).take(1001),
      ctx.db.query("cartItems").withIndex("by_product", (q) => q.eq("productId", args.id)).take(1001),
    ]);

    return {
      canDelete: true,
      dependencies: [
        {
          count: Math.min(variantsCount.length, 1000),
          hasMore: variantsCount.length > 1000,
          label: "Biến thể",
          preview: variantsPreview.map((variant) => ({ id: variant._id, name: variant.sku })),
        },
        {
          count: Math.min(commentsCount.length, 1000),
          hasMore: commentsCount.length > 1000,
          label: "Bình luận",
          preview: [],
        },
        {
          count: Math.min(wishlistCount.length, 1000),
          hasMore: wishlistCount.length > 1000,
          label: "Wishlist",
          preview: [],
        },
        {
          count: Math.min(cartCount.length, 1000),
          hasMore: cartCount.length > 1000,
          label: "Giỏ hàng",
          preview: [],
        },
      ],
    };
  },
  returns: v.object({
    canDelete: v.boolean(),
    dependencies: v.array(v.object({
      count: v.number(),
      hasMore: v.boolean(),
      label: v.string(),
      preview: v.array(v.object({ id: v.string(), name: v.string() })),
    })),
  }),
});

// FIX #4: Batch reorder with Promise.all
export const reorder = mutation({
  args: { items: v.array(v.object({ id: v.id("products"), order: v.number() })) },
  handler: async (ctx, args) => {
    await Promise.all(
      args.items.map( async (item) => ctx.db.patch(item.id, { order: item.order }))
    );
    return null;
  },
  returns: v.null(),
});

// Bulk delete for admin (FIX #10 support)
export const bulkRemove = mutation({
  args: { ids: v.array(v.id("products")) },
  handler: async (ctx, args) => {
    let deletedCount = 0;

    for (const id of args.ids) {
      const product = await ctx.db.get(id);
      if (!product) {continue;}

      // Collect related items
      const [comments, wishlistItems, cartItems] = await Promise.all([
        ctx.db
          .query("comments")
          .withIndex("by_target_status", (q) =>
            q.eq("targetType", "product").eq("targetId", id)
          )
          .collect(),
        ctx.db
          .query("wishlist")
          .withIndex("by_product", (q) => q.eq("productId", id))
          .collect(),
        ctx.db
          .query("cartItems")
          .withIndex("by_product", (q) => q.eq("productId", id))
          .collect(),
      ]);

      // Batch delete related items
      await Promise.all([
        ...comments.map( async (c) => ctx.db.delete(c._id)),
        ...wishlistItems.map( async (w) => ctx.db.delete(w._id)),
        ...cartItems.map( async (c) => ctx.db.delete(c._id)),
      ]);

      // Delete product and update stats
      await ctx.db.delete(id);
      await updateStats(ctx, { old: product.status });
      deletedCount++;
    }

    return deletedCount;
  },
  returns: v.number(),
});

// Initialize stats (run once or when resetting)
export const initStats = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing stats
    const existingStats = await ctx.db.query("productStats").collect();
    await Promise.all(existingStats.map( async (s) => ctx.db.delete(s._id)));

    // Count products by status
    const products = await ctx.db.query("products").collect();
    const counts = { Active: 0, Archived: 0, Draft: 0, total: 0 };
    let maxOrder = 0;

    for (const p of products) {
      counts.total++;
      counts[p.status as keyof typeof counts]++;
      if (p.order > maxOrder) {maxOrder = p.order;}
    }

    // Insert stats
    await Promise.all([
      ctx.db.insert("productStats", { count: counts.total, key: "total", lastOrder: maxOrder }),
      ctx.db.insert("productStats", { count: counts.Active, key: "Active", lastOrder: 0 }),
      ctx.db.insert("productStats", { count: counts.Draft, key: "Draft", lastOrder: 0 }),
      ctx.db.insert("productStats", { count: counts.Archived, key: "Archived", lastOrder: 0 }),
    ]);

    return null;
  },
  returns: v.null(),
});
