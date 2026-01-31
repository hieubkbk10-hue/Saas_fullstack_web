import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { productStatus } from "./lib/validators";

const productDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("products"),
  categoryId: v.id("productCategories"),
  description: v.optional(v.string()),
  image: v.optional(v.string()),
  images: v.optional(v.array(v.string())),
  name: v.string(),
  order: v.number(),
  price: v.number(),
  salePrice: v.optional(v.number()),
  sales: v.number(),
  sku: v.string(),
  slug: v.string(),
  status: productStatus,
  stock: v.number(),
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

    if (args.categoryId) {
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
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower)
      );
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
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    name: v.string(),
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
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    name: v.optional(v.string()),
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
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) {throw new Error("Product not found");}

    // Collect all related items first
    const [comments, wishlistItems, cartItems] = await Promise.all([
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
    ]);

    // Batch delete all related items with Promise.all
    await Promise.all([
      ...comments.map( async (c) => ctx.db.delete(c._id)),
      ...wishlistItems.map( async (w) => ctx.db.delete(w._id)),
      ...cartItems.map( async (c) => ctx.db.delete(c._id)),
    ]);

    // Delete the product
    await ctx.db.delete(args.id);

    // Update stats
    await updateStats(ctx, { old: product.status });

    return null;
  },
  returns: v.null(),
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
