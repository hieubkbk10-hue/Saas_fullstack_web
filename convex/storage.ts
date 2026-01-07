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

export const listByFolder = query({
  args: { folder: v.optional(v.string()) },
  returns: v.array(v.object({
    _id: v.id("images"),
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    url: v.union(v.string(), v.null()),
  })),
  handler: async (ctx, args) => {
    const images = args.folder
      ? await ctx.db.query("images").withIndex("by_folder", q => q.eq("folder", args.folder)).collect()
      : await ctx.db.query("images").collect();
    
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

// Cleanup orphaned images (images not used anywhere)
export const cleanupOrphanedImages = mutation({
  args: { folder: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("images")
      .withIndex("by_folder", q => q.eq("folder", args.folder))
      .collect();
    
    let deletedCount = 0;
    
    for (const image of images) {
      const url = await ctx.storage.getUrl(image.storageId);
      if (!url) continue;
      
      let isUsed = false;
      
      // Check if image is used in posts
      if (args.folder === "posts" || args.folder === "posts-content") {
        const posts = await ctx.db.query("posts").collect();
        isUsed = posts.some(post => 
          post.thumbnail === url || (post.content && post.content.includes(url))
        );
      }
      
      // Check if image is used in products
      if (args.folder === "products" || args.folder === "products-content") {
        const products = await ctx.db.query("products").collect();
        isUsed = isUsed || products.some(product => 
          product.image === url || 
          (product.images && product.images.includes(url)) ||
          (product.description && product.description.includes(url))
        );
      }
      
      if (!isUsed) {
        await ctx.storage.delete(image.storageId);
        await ctx.db.delete(image._id);
        deletedCount++;
      }
    }
    
    return deletedCount;
  },
});
