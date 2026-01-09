import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const saveImage = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    alt: v.optional(v.string()),
    folder: v.optional(v.string()),
  },
  returns: v.object({
    id: v.id("images"),
    url: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("images", {
      storageId: args.storageId,
      filename: args.filename,
      mimeType: args.mimeType,
      size: args.size,
      width: args.width,
      height: args.height,
      alt: args.alt,
      folder: args.folder,
    });
    const url = await ctx.storage.getUrl(args.storageId);
    return { id, url };
  },
});

export const deleteImage = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Delete from storage
    await ctx.storage.delete(args.storageId);
    
    // Delete from images table if exists
    const image = await ctx.db
      .query("images")
      .filter(q => q.eq(q.field("storageId"), args.storageId))
      .first();
    if (image) {
      await ctx.db.delete(image._id);
    }
    
    return null;
  },
});

// QA-HIGH-006 FIX: Add limit to prevent fetching ALL images
export const listByFolder = query({
  args: { folder: v.optional(v.string()), limit: v.optional(v.number()) },
  returns: v.array(v.object({
    _id: v.id("images"),
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    url: v.union(v.string(), v.null()),
  })),
  handler: async (ctx, args) => {
    const maxLimit = args.limit ?? 100; // Default max 100
    const images = args.folder
      ? await ctx.db.query("images").withIndex("by_folder", q => q.eq("folder", args.folder)).take(maxLimit)
      : await ctx.db.query("images").take(maxLimit);
    
    const result = await Promise.all(
      images.map(async (img) => ({
        _id: img._id,
        storageId: img.storageId,
        filename: img.filename,
        mimeType: img.mimeType,
        size: img.size,
        url: await ctx.storage.getUrl(img.storageId),
      }))
    );
    
    return result;
  },
});

// QA-HIGH-006 FIX: Cleanup orphaned images with batch processing and limits
export const cleanupOrphanedImages = mutation({
  args: { folder: v.string(), batchSize: v.optional(v.number()) },
  returns: v.object({ deleted: v.number(), hasMore: v.boolean() }),
  handler: async (ctx, args) => {
    const maxBatch = args.batchSize ?? 50; // Process in batches to avoid timeout
    const images = await ctx.db
      .query("images")
      .withIndex("by_folder", q => q.eq("folder", args.folder))
      .take(maxBatch);
    
    if (images.length === 0) {
      return { deleted: 0, hasMore: false };
    }
    
    // Pre-fetch all URLs in parallel
    const imageUrls = await Promise.all(
      images.map(async (img) => ({
        image: img,
        url: await ctx.storage.getUrl(img.storageId),
      }))
    );
    
    // Pre-fetch posts/products once (not per image!)
    let posts: { thumbnail?: string; content: string }[] = [];
    let products: { image?: string; images?: string[]; description?: string }[] = [];
    
    if (args.folder === "posts" || args.folder === "posts-content") {
      posts = await ctx.db.query("posts").take(500);
    }
    if (args.folder === "products" || args.folder === "products-content") {
      products = await ctx.db.query("products").take(500);
    }
    
    // Find orphaned images
    const toDelete: typeof images = [];
    for (const { image, url } of imageUrls) {
      if (!url) continue;
      
      let isUsed = false;
      
      if (args.folder === "posts" || args.folder === "posts-content") {
        isUsed = posts.some(post => 
          post.thumbnail === url || (post.content && post.content.includes(url))
        );
      }
      
      if (args.folder === "products" || args.folder === "products-content") {
        isUsed = isUsed || products.some(product => 
          product.image === url || 
          (product.images && product.images.includes(url)) ||
          (product.description && product.description.includes(url))
        );
      }
      
      if (!isUsed) {
        toDelete.push(image);
      }
    }
    
    // Batch delete
    await Promise.all(toDelete.map(async (image) => {
      await ctx.storage.delete(image.storageId);
      await ctx.db.delete(image._id);
    }));
    
    // Check if there are more images to process
    const remaining = await ctx.db
      .query("images")
      .withIndex("by_folder", q => q.eq("folder", args.folder))
      .first();
    
    return { deleted: toDelete.length, hasMore: remaining !== null };
  },
});
