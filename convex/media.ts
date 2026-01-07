import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

export const listAll = query({
  args: {},
  returns: v.array(mediaDoc),
  handler: async (ctx) => {
    return await ctx.db.query("images").order("desc").collect();
  },
});

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

export const getById = query({
  args: { id: v.id("images") },
  returns: v.union(mediaDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listByFolder = query({
  args: { folder: v.string() },
  returns: v.array(mediaDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("images")
      .withIndex("by_folder", (q) => q.eq("folder", args.folder))
      .order("desc")
      .collect();
  },
});

export const listByMimeType = query({
  args: { mimeType: v.string() },
  returns: v.array(mediaDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("images")
      .withIndex("by_mimeType", (q) => q.eq("mimeType", args.mimeType))
      .order("desc")
      .collect();
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

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
  returns: v.id("images"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("images", args);
  },
});

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
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("images") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const media = await ctx.db.get(args.id);
    if (!media) throw new Error("Media not found");
    await ctx.storage.delete(media.storageId);
    await ctx.db.delete(args.id);
    return null;
  },
});

export const bulkRemove = mutation({
  args: { ids: v.array(v.id("images")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const media = await ctx.db.get(id);
      if (media) {
        await ctx.storage.delete(media.storageId);
        await ctx.db.delete(id);
      }
    }
    return null;
  },
});

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getFolders = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const images = await ctx.db.query("images").collect();
    const folders = new Set<string>();
    for (const img of images) {
      if (img.folder) {
        folders.add(img.folder);
      }
    }
    return Array.from(folders).sort();
  },
});

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

    return {
      totalCount: images.length,
      totalSize,
      imageCount,
      videoCount,
      documentCount,
      otherCount,
    };
  },
});
