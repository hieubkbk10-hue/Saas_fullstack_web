import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { productStatus } from "./lib/validators";

const productDoc = v.object({
  _id: v.id("products"),
  _creationTime: v.number(),
  name: v.string(),
  sku: v.string(),
  slug: v.string(),
  categoryId: v.id("productCategories"),
  price: v.number(),
  salePrice: v.optional(v.number()),
  stock: v.number(),
  status: productStatus,
  image: v.optional(v.string()),
  images: v.optional(v.array(v.string())),
  sales: v.number(),
  description: v.optional(v.string()),
  order: v.number(),
});

// ============================================================
// QUERIES
// ============================================================

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(productDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("products").paginate(args.paginationOpts);
  },
});

// FIX #1: Replace listAll with take() limit - use for admin dropdown/select only
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(productDoc),
  handler: async (ctx, args) => {
    const maxLimit = args.limit ?? 100; // Default max 100, configurable
    return await ctx.db.query("products").take(maxLimit);
  },
});

// FIX #2: Use counter table for count instead of fetching ALL
export const count = query({
  args: { status: v.optional(productStatus) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const key = args.status ?? "total";
    const stats = await ctx.db
      .query("productStats")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    return stats?.count ?? 0;
  },
});

// Get counts for all statuses in one query (for dashboard)
export const getStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    active: v.number(),
    draft: v.number(),
    archived: v.number(),
  }),
  handler: async (ctx) => {
    const stats = await ctx.db.query("productStats").collect();
    const statsMap = new Map(stats.map((s) => [s.key, s.count]));
    return {
      total: statsMap.get("total") ?? 0,
      active: statsMap.get("Active") ?? 0,
      draft: statsMap.get("Draft") ?? 0,
      archived: statsMap.get("Archived") ?? 0,
    };
  },
});

export const getById = query({
  args: { id: v.id("products") },
  returns: v.union(productDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySku = query({
  args: { sku: v.string() },
  returns: v.union(productDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .unique();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(productDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const listByCategory = query({
  args: {
    categoryId: v.id("productCategories"),
    status: v.optional(productStatus),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(productDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("products")
        .withIndex("by_category_status", (q) =>
          q.eq("categoryId", args.categoryId).eq("status", args.status!)
        )
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("products")
      .withIndex("by_category_status", (q) => q.eq("categoryId", args.categoryId))
      .paginate(args.paginationOpts);
  },
});

export const listByStatus = query({
  args: { status: productStatus, paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(productDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_status_order", (q) => q.eq("status", args.status))
      .paginate(args.paginationOpts);
  },
});

// FIX #9: Add filter for threshold
export const listLowStock = query({
  args: { threshold: v.number(), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(productDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
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
  returns: v.object({
    page: v.array(productDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_status_sales", (q) => q.eq("status", "Active"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// ============================================================
// MUTATIONS
// ============================================================

// Helper: Update stats counters
async function updateStats(
  ctx: { db: any },
  statusChange: { old?: string; new?: string }
) {
  // Update total count
  const totalStats = await ctx.db
    .query("productStats")
    .withIndex("by_key", (q: any) => q.eq("key", "total"))
    .unique();

  if (statusChange.new && !statusChange.old) {
    // Creating new product
    if (totalStats) {
      await ctx.db.patch(totalStats._id, {
        count: totalStats.count + 1,
        lastOrder: totalStats.lastOrder + 1,
      });
    } else {
      await ctx.db.insert("productStats", { key: "total", count: 1, lastOrder: 0 });
    }
  } else if (statusChange.old && !statusChange.new) {
    // Deleting product
    if (totalStats && totalStats.count > 0) {
      await ctx.db.patch(totalStats._id, { count: totalStats.count - 1 });
    }
  }

  // Update status-specific counts
  if (statusChange.old) {
    const oldStats = await ctx.db
      .query("productStats")
      .withIndex("by_key", (q: any) => q.eq("key", statusChange.old))
      .unique();
    if (oldStats && oldStats.count > 0) {
      await ctx.db.patch(oldStats._id, { count: oldStats.count - 1 });
    }
  }

  if (statusChange.new) {
    const newStats = await ctx.db
      .query("productStats")
      .withIndex("by_key", (q: any) => q.eq("key", statusChange.new))
      .unique();
    if (newStats) {
      await ctx.db.patch(newStats._id, { count: newStats.count + 1 });
    } else {
      await ctx.db.insert("productStats", { key: statusChange.new, count: 1, lastOrder: 0 });
    }
  }
}

// Helper: Get next order value from stats (FIX #3)
async function getNextOrder(ctx: { db: any }): Promise<number> {
  const totalStats = await ctx.db
    .query("productStats")
    .withIndex("by_key", (q: any) => q.eq("key", "total"))
    .unique();
  return totalStats?.lastOrder ?? 0;
}

export const create = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    slug: v.string(),
    categoryId: v.id("productCategories"),
    price: v.number(),
    salePrice: v.optional(v.number()),
    stock: v.optional(v.number()),
    status: v.optional(productStatus),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.id("products"),
  handler: async (ctx, args) => {
    // Validate unique SKU
    const existingSku = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .unique();
    if (existingSku) throw new Error("SKU already exists");

    // Validate unique slug
    const existingSlug = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existingSlug) throw new Error("Slug already exists");

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
      if (setting?.value === "Active") defaultStatus = "Active";
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
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    sku: v.optional(v.string()),
    slug: v.optional(v.string()),
    categoryId: v.optional(v.id("productCategories")),
    price: v.optional(v.number()),
    salePrice: v.optional(v.number()),
    stock: v.optional(v.number()),
    status: v.optional(productStatus),
    image: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product not found");

    // Validate unique SKU if changing
    if (args.sku && args.sku !== product.sku) {
      const newSku = args.sku;
      const existing = await ctx.db
        .query("products")
        .withIndex("by_sku", (q) => q.eq("sku", newSku))
        .unique();
      if (existing) throw new Error("SKU already exists");
    }

    // Validate unique slug if changing
    if (args.slug && args.slug !== product.slug) {
      const newSlug = args.slug;
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .unique();
      if (existing) throw new Error("Slug already exists");
    }

    // Update stats if status changed
    if (args.status && args.status !== product.status) {
      await updateStats(ctx, { old: product.status, new: args.status });
    }

    await ctx.db.patch(id, updates);
    return null;
  },
});

export const updateStock = mutation({
  args: { id: v.id("products"), quantity: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    const newStock = product.stock + args.quantity;
    if (newStock < 0) throw new Error("Insufficient stock");
    await ctx.db.patch(args.id, { stock: newStock });
    return null;
  },
});

export const incrementSales = mutation({
  args: { id: v.id("products"), quantity: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");
    await ctx.db.patch(args.id, { sales: product.sales + args.quantity });
    return null;
  },
});

// FIX #7: Batch delete with Promise.all for cascade operations
export const remove = mutation({
  args: { id: v.id("products") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) throw new Error("Product not found");

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
      ...comments.map((c) => ctx.db.delete(c._id)),
      ...wishlistItems.map((w) => ctx.db.delete(w._id)),
      ...cartItems.map((c) => ctx.db.delete(c._id)),
    ]);

    // Delete the product
    await ctx.db.delete(args.id);

    // Update stats
    await updateStats(ctx, { old: product.status });

    return null;
  },
});

// FIX #4: Batch reorder with Promise.all
export const reorder = mutation({
  args: { items: v.array(v.object({ id: v.id("products"), order: v.number() })) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await Promise.all(
      args.items.map((item) => ctx.db.patch(item.id, { order: item.order }))
    );
    return null;
  },
});

// Bulk delete for admin (FIX #10 support)
export const bulkRemove = mutation({
  args: { ids: v.array(v.id("products")) },
  returns: v.number(),
  handler: async (ctx, args) => {
    let deletedCount = 0;

    for (const id of args.ids) {
      const product = await ctx.db.get(id);
      if (!product) continue;

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
        ...comments.map((c) => ctx.db.delete(c._id)),
        ...wishlistItems.map((w) => ctx.db.delete(w._id)),
        ...cartItems.map((c) => ctx.db.delete(c._id)),
      ]);

      // Delete product and update stats
      await ctx.db.delete(id);
      await updateStats(ctx, { old: product.status });
      deletedCount++;
    }

    return deletedCount;
  },
});

// Initialize stats (run once or when resetting)
export const initStats = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Clear existing stats
    const existingStats = await ctx.db.query("productStats").collect();
    await Promise.all(existingStats.map((s) => ctx.db.delete(s._id)));

    // Count products by status
    const products = await ctx.db.query("products").collect();
    const counts = { total: 0, Active: 0, Draft: 0, Archived: 0 };
    let maxOrder = 0;

    for (const p of products) {
      counts.total++;
      counts[p.status as keyof typeof counts]++;
      if (p.order > maxOrder) maxOrder = p.order;
    }

    // Insert stats
    await Promise.all([
      ctx.db.insert("productStats", { key: "total", count: counts.total, lastOrder: maxOrder }),
      ctx.db.insert("productStats", { key: "Active", count: counts.Active, lastOrder: 0 }),
      ctx.db.insert("productStats", { key: "Draft", count: counts.Draft, lastOrder: 0 }),
      ctx.db.insert("productStats", { key: "Archived", count: counts.Archived, lastOrder: 0 }),
    ]);

    return null;
  },
});
