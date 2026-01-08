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

// ============ HELPER FUNCTIONS ============

// Get media type key from mimeType
function getMediaTypeKey(mimeType: string): "image" | "video" | "document" | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf" || mimeType.includes("document") || mimeType.includes("spreadsheet")) {
    return "document";
  }
  return "other";
}

// Update mediaStats counter (increment or decrement)
async function updateMediaStats(
  ctx: { db: any },
  typeKey: "total" | "image" | "video" | "document" | "other",
  countDelta: number,
  sizeDelta: number
) {
  const existing = await ctx.db
    .query("mediaStats")
    .withIndex("by_key", (q: any) => q.eq("key", typeKey))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      count: Math.max(0, existing.count + countDelta),
      totalSize: Math.max(0, existing.totalSize + sizeDelta),
    });
  } else if (countDelta > 0) {
    await ctx.db.insert("mediaStats", {
      key: typeKey,
      count: countDelta,
      totalSize: sizeDelta,
    });
  }
}

// Update mediaFolders counter
async function updateMediaFolder(
  ctx: { db: any },
  folderName: string | undefined,
  countDelta: number
) {
  if (!folderName) return;

  const existing = await ctx.db
    .query("mediaFolders")
    .withIndex("by_name", (q: any) => q.eq("name", folderName))
    .first();

  if (existing) {
    const newCount = existing.count + countDelta;
    if (newCount <= 0) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.patch(existing._id, { count: newCount });
    }
  } else if (countDelta > 0) {
    await ctx.db.insert("mediaFolders", { name: folderName, count: countDelta });
  }
}

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

// Get all folders (optimized - reads from mediaFolders table)
export const getFolders = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const folders = await ctx.db.query("mediaFolders").collect();
    return folders.map(f => f.name).sort();
  },
});

// Get statistics (optimized - reads from mediaStats counter table)
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
    const stats = await ctx.db.query("mediaStats").collect();
    const statsMap = new Map(stats.map(s => [s.key, s]));

    const total = statsMap.get("total");
    const image = statsMap.get("image");
    const video = statsMap.get("video");
    const document = statsMap.get("document");
    const other = statsMap.get("other");

    return {
      totalCount: total?.count ?? 0,
      totalSize: total?.totalSize ?? 0,
      imageCount: image?.count ?? 0,
      videoCount: video?.count ?? 0,
      documentCount: document?.count ?? 0,
      otherCount: other?.count ?? 0,
    };
  },
});

// Count media (optimized - reads from counter tables)
export const count = query({
  args: { folder: v.optional(v.string()) },
  returns: v.number(),
  handler: async (ctx, args) => {
    if (args.folder) {
      const folderName = args.folder;
      const folderRecord = await ctx.db
        .query("mediaFolders")
        .withIndex("by_name", (q) => q.eq("name", folderName))
        .first();
      return folderRecord?.count ?? 0;
    }
    const totalStat = await ctx.db
      .query("mediaStats")
      .withIndex("by_key", (q) => q.eq("key", "total"))
      .first();
    return totalStat?.count ?? 0;
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

    // Update counters
    const typeKey = getMediaTypeKey(args.mimeType);
    await updateMediaStats(ctx, "total", 1, args.size);
    await updateMediaStats(ctx, typeKey, 1, args.size);
    await updateMediaFolder(ctx, args.folder, 1);

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
    
    // Update folder counter if folder changed
    if (updates.folder !== undefined && updates.folder !== media.folder) {
      await updateMediaFolder(ctx, media.folder, -1); // Decrement old folder
      await updateMediaFolder(ctx, updates.folder, 1);  // Increment new folder
    }
    
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

    // Update counters
    const typeKey = getMediaTypeKey(media.mimeType);
    await updateMediaStats(ctx, "total", -1, -media.size);
    await updateMediaStats(ctx, typeKey, -1, -media.size);
    await updateMediaFolder(ctx, media.folder, -1);

    return null;
  },
});

// Bulk remove (optimized - batch load to avoid N+1)
export const bulkRemove = mutation({
  args: { ids: v.array(v.id("images")) },
  returns: v.number(),
  handler: async (ctx, args) => {
    // Batch load all media items (avoid N+1)
    const mediaItems = await Promise.all(args.ids.map(id => ctx.db.get(id)));
    const validItems = mediaItems.filter((m): m is NonNullable<typeof m> => m !== null);

    // Aggregate counter updates
    const statsUpdates: Record<string, { count: number; size: number }> = {
      total: { count: 0, size: 0 },
      image: { count: 0, size: 0 },
      video: { count: 0, size: 0 },
      document: { count: 0, size: 0 },
      other: { count: 0, size: 0 },
    };
    const folderUpdates: Record<string, number> = {};

    // Delete items and aggregate stats
    for (const media of validItems) {
      try {
        await ctx.storage.delete(media.storageId);
      } catch {
        // Storage file might already be deleted
      }
      await ctx.db.delete(media._id);

      // Aggregate counter changes
      const typeKey = getMediaTypeKey(media.mimeType);
      statsUpdates.total.count++;
      statsUpdates.total.size += media.size;
      statsUpdates[typeKey].count++;
      statsUpdates[typeKey].size += media.size;
      if (media.folder) {
        folderUpdates[media.folder] = (folderUpdates[media.folder] || 0) + 1;
      }
    }

    // Batch update mediaStats
    for (const [key, { count, size }] of Object.entries(statsUpdates)) {
      if (count > 0) {
        await updateMediaStats(ctx, key as any, -count, -size);
      }
    }

    // Batch update mediaFolders
    for (const [folder, count] of Object.entries(folderUpdates)) {
      await updateMediaFolder(ctx, folder, -count);
    }

    return validItems.length;
  },
});
