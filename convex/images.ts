import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

const imageDoc = v.object({
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

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(imageDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("images").order("desc").paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id("images") },
  returns: v.union(imageDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listByFolder = query({
  args: { folder: v.string(), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(imageDoc),
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

export const listByMimeType = query({
  args: { mimeType: v.string(), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(imageDoc),
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

export const listByUploader = query({
  args: { uploadedBy: v.id("users"), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(imageDoc),
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

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getImageWithUrl = query({
  args: { id: v.id("images") },
  returns: v.union(
    v.object({
      image: imageDoc,
      url: v.union(v.string(), v.null()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.id);
    if (!image) return null;
    const url = await ctx.storage.getUrl(image.storageId);
    return { image, url };
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
    alt: v.optional(v.string()),
    folder: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const image = await ctx.db.get(id);
    if (!image) throw new Error("Image not found");
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("images") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.id);
    if (!image) throw new Error("Image not found");
    await ctx.storage.delete(image.storageId);
    await ctx.db.delete(args.id);
    return null;
  },
});

export const bulkRemove = mutation({
  args: { ids: v.array(v.id("images")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const image = await ctx.db.get(id);
      if (image) {
        await ctx.storage.delete(image.storageId);
        await ctx.db.delete(id);
      }
    }
    return null;
  },
});

export const listFolders = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const images = await ctx.db.query("images").collect();
    const folders = new Set<string>();
    for (const image of images) {
      if (image.folder) folders.add(image.folder);
    }
    return Array.from(folders).sort();
  },
});
