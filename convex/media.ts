import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

// ============ VALIDATORS ============
const mediaDoc = v.object({
  _id: v.id("images"),
  _creationTime: v.number(),
  storageId: v.id("_storage"),
  filename: v.string(),
  mimeType: v.string(),
  size: v.number(),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  alt: v.optional(v.string()),
  folder: v.optional(v.string()),
  uploadedBy: v.optional(v.id("users")),
});

const mediaWithUrl = v.object({
  _id: v.id("images"),
  _creationTime: v.number(),
  storageId: v.id("_storage"),
  filename: v.string(),
  mimeType: v.string(),
  size: v.number(),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  alt: v.optional(v.string()),
  folder: v.optional(v.string()),
  uploadedBy: v.optional(v.id("users")),
  url: v.union(v.string(), v.null()),
});

// ============ QUERIES ============

// List with pagination
export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(mediaDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("images").order("desc").paginate(args.paginationOpts);
  },
});

// List all (for System Config preview - limited)
export const listAll = query({
  args: {},
  returns: v.array(mediaDoc),
  handler: async (ctx) => {
    return await ctx.db.query("images").order("desc").take(100);
  },
});

// List with URLs (for Admin grid view)
export const listWithUrls = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(mediaWithUrl),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const images = await ctx.db.query("images").order("desc").take(limit);
    
    return await Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await ctx.storage.getUrl(img.storageId),
      }))
    );
  },
});

// Get by ID
export const getById = query({
  args: { id: v.id("images") },
  returns: v.union(mediaDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get by ID with URL
export const getByIdWithUrl = query({
  args: { id: v.id("images") },
  returns: v.union(mediaWithUrl, v.null()),
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.id);
    if (!image) return null;
    const url = await ctx.storage.getUrl(image.storageId);
    return { ...image, url };
  },
});

// List by folder with pagination
export const listByFolder = query({
  args: { folder: v.string(), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(mediaDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("images")
      .withIndex("by_folder", (q) => q.eq("folder", args.folder))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// List by mimeType with pagination
export const listByMimeType = query({
  args: { mimeType: v.string(), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(mediaDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("images")
      .withIndex("by_mimeType", (q) => q.eq("mimeType", args.mimeType))
      .paginate(args.paginationOpts);
  },
});

// List by uploader
export const listByUploader = query({
  args: { uploadedBy: v.id("users"), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(mediaDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("images")
      .withIndex("by_uploadedBy", (q) => q.eq("uploadedBy", args.uploadedBy))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Get URL from storageId
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Get all folders
export const getFolders = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const images = await ctx.db.query("images").collect();
    const folders = new Set<string>();
    for (const img of images) {
      if (img.folder) folders.add(img.folder);
    }
    return Array.from(folders).sort();
  },
});

// Get statistics
export const getStats = query({
  args: {},
  returns: v.object({
    totalCount: v.number(),
    totalSize: v.number(),
    imageCount: v.number(),
    videoCount: v.number(),
    documentCount: v.number(),
    otherCount: v.number(),
  }),
  handler: async (ctx) => {
    const images = await ctx.db.query("images").collect();
    let totalSize = 0;
    let imageCount = 0;
    let videoCount = 0;
    let documentCount = 0;
    let otherCount = 0;

    for (const img of images) {
      totalSize += img.size;
      if (img.mimeType.startsWith("image/")) {
        imageCount++;
      } else if (img.mimeType.startsWith("video/")) {
        videoCount++;
      } else if (
        img.mimeType === "application/pdf" ||
        img.mimeType.includes("document") ||
        img.mimeType.includes("spreadsheet")
      ) {
        documentCount++;
      } else {
        otherCount++;
      }
    }

    return { totalCount: images.length, totalSize, imageCount, videoCount, documentCount, otherCount };
  },
});

// Count media
export const count = query({
  args: { folder: v.optional(v.string()) },
  returns: v.number(),
  handler: async (ctx, args) => {
    if (args.folder) {
      const items = await ctx.db
        .query("images")
        .withIndex("by_folder", (q) => q.eq("folder", args.folder))
        .collect();
      return items.length;
    }
    const items = await ctx.db.query("images").collect();
    return items.length;
  },
});

// ============ MUTATIONS ============

// Generate upload URL
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create media record
export const create = mutation({
  args: {
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    alt: v.optional(v.string()),
    folder: v.optional(v.string()),
    uploadedBy: v.optional(v.id("users")),
  },
  returns: v.object({
    id: v.id("images"),
    url: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("images", args);
    const url = await ctx.storage.getUrl(args.storageId);
    return { id, url };
  },
});

// Update media metadata
export const update = mutation({
  args: {
    id: v.id("images"),
    filename: v.optional(v.string()),
    alt: v.optional(v.string()),
    folder: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const media = await ctx.db.get(id);
    if (!media) throw new Error("Media not found");
    
    // Filter out undefined values
    const filteredUpdates: Record<string, string> = {};
    if (updates.filename !== undefined) filteredUpdates.filename = updates.filename;
    if (updates.alt !== undefined) filteredUpdates.alt = updates.alt;
    if (updates.folder !== undefined) filteredUpdates.folder = updates.folder;
    
    await ctx.db.patch(id, filteredUpdates);
    return null;
  },
});

// Remove single media
export const remove = mutation({
  args: { id: v.id("images") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.id);
    if (!media) throw new Error("Media not found");
    
    try {
      await ctx.storage.delete(media.storageId);
    } catch {
      // Storage file might already be deleted
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

// Bulk remove
export const bulkRemove = mutation({
  args: { ids: v.array(v.id("images")) },
  returns: v.number(),
  handler: async (ctx, args) => {
    let count = 0;
    for (const id of args.ids) {
      const media = await ctx.db.get(id);
      if (media) {
        try {
          await ctx.storage.delete(media.storageId);
        } catch {
          // Storage file might already be deleted
        }
        await ctx.db.delete(id);
        count++;
      }
    }
    return count;
  },
});
