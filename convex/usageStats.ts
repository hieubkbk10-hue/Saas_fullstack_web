import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Average document sizes (in KB) - estimates based on typical data
const AVG_DOC_SIZES: Record<string, number> = {
  activityLogs: 0.5,
  pageViews: 0.3,
  products: 2,
  posts: 5,
  orders: 3,
  customers: 1,
  comments: 0.5,
  notifications: 1,
  default: 1,
};

// Average file sizes (in KB)
const AVG_FILE_SIZE = 500; // 500KB per file

// Helper: Get today's date string
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Helper: Get date string for N days ago
function getDateNDaysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split("T")[0];
}

// Track a database read operation
export const trackDbRead = internalMutation({
  args: {
    table: v.optional(v.string()),
    count: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const date = getTodayDate();
    const count = args.count ?? 1;
    const table = args.table ?? "default";
    const docSize = AVG_DOC_SIZES[table] ?? AVG_DOC_SIZES.default;
    const bandwidthKB = count * docSize;

    const existing = await ctx.db
      .query("usageStats")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        dbReads: existing.dbReads + count,
        estimatedDbBandwidth: existing.estimatedDbBandwidth + bandwidthKB,
      });
    } else {
      await ctx.db.insert("usageStats", {
        date,
        dbReads: count,
        dbWrites: 0,
        fileReads: 0,
        fileWrites: 0,
        estimatedDbBandwidth: bandwidthKB,
        estimatedFileBandwidth: 0,
      });
    }
    return null;
  },
});

// Track a database write operation
export const trackDbWrite = internalMutation({
  args: {
    table: v.optional(v.string()),
    count: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const date = getTodayDate();
    const count = args.count ?? 1;
    const table = args.table ?? "default";
    const docSize = AVG_DOC_SIZES[table] ?? AVG_DOC_SIZES.default;
    const bandwidthKB = count * docSize;

    const existing = await ctx.db
      .query("usageStats")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        dbWrites: existing.dbWrites + count,
        estimatedDbBandwidth: existing.estimatedDbBandwidth + bandwidthKB,
      });
    } else {
      await ctx.db.insert("usageStats", {
        date,
        dbReads: 0,
        dbWrites: count,
        fileReads: 0,
        fileWrites: 0,
        estimatedDbBandwidth: bandwidthKB,
        estimatedFileBandwidth: 0,
      });
    }
    return null;
  },
});

// Track a file read operation
export const trackFileRead = internalMutation({
  args: {
    sizeKB: v.optional(v.number()),
    count: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const date = getTodayDate();
    const count = args.count ?? 1;
    const sizeKB = args.sizeKB ?? AVG_FILE_SIZE;
    const bandwidthKB = count * sizeKB;

    const existing = await ctx.db
      .query("usageStats")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        fileReads: existing.fileReads + count,
        estimatedFileBandwidth: existing.estimatedFileBandwidth + bandwidthKB,
      });
    } else {
      await ctx.db.insert("usageStats", {
        date,
        dbReads: 0,
        dbWrites: 0,
        fileReads: count,
        fileWrites: 0,
        estimatedDbBandwidth: 0,
        estimatedFileBandwidth: bandwidthKB,
      });
    }
    return null;
  },
});

// Track a file write/upload operation
export const trackFileWrite = internalMutation({
  args: {
    sizeKB: v.optional(v.number()),
    count: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const date = getTodayDate();
    const count = args.count ?? 1;
    const sizeKB = args.sizeKB ?? AVG_FILE_SIZE;
    const bandwidthKB = count * sizeKB;

    const existing = await ctx.db
      .query("usageStats")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        fileWrites: existing.fileWrites + count,
        estimatedFileBandwidth: existing.estimatedFileBandwidth + bandwidthKB,
      });
    } else {
      await ctx.db.insert("usageStats", {
        date,
        dbReads: 0,
        dbWrites: 0,
        fileReads: 0,
        fileWrites: count,
        estimatedDbBandwidth: 0,
        estimatedFileBandwidth: bandwidthKB,
      });
    }
    return null;
  },
});

// Public mutation for tracking (can be called from client)
export const track = mutation({
  args: {
    type: v.union(
      v.literal("dbRead"),
      v.literal("dbWrite"),
      v.literal("fileRead"),
      v.literal("fileWrite")
    ),
    table: v.optional(v.string()),
    count: v.optional(v.number()),
    sizeKB: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const date = getTodayDate();
    const count = args.count ?? 1;

    let bandwidthKB = 0;
    if (args.type === "dbRead" || args.type === "dbWrite") {
      const table = args.table ?? "default";
      const docSize = AVG_DOC_SIZES[table] ?? AVG_DOC_SIZES.default;
      bandwidthKB = count * docSize;
    } else {
      bandwidthKB = count * (args.sizeKB ?? AVG_FILE_SIZE);
    }

    const existing = await ctx.db
      .query("usageStats")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();

    if (existing) {
      const updates: Record<string, number> = {};
      if (args.type === "dbRead") {
        updates.dbReads = existing.dbReads + count;
        updates.estimatedDbBandwidth = existing.estimatedDbBandwidth + bandwidthKB;
      } else if (args.type === "dbWrite") {
        updates.dbWrites = existing.dbWrites + count;
        updates.estimatedDbBandwidth = existing.estimatedDbBandwidth + bandwidthKB;
      } else if (args.type === "fileRead") {
        updates.fileReads = existing.fileReads + count;
        updates.estimatedFileBandwidth = existing.estimatedFileBandwidth + bandwidthKB;
      } else if (args.type === "fileWrite") {
        updates.fileWrites = existing.fileWrites + count;
        updates.estimatedFileBandwidth = existing.estimatedFileBandwidth + bandwidthKB;
      }
      await ctx.db.patch(existing._id, updates);
    } else {
      await ctx.db.insert("usageStats", {
        date,
        dbReads: args.type === "dbRead" ? count : 0,
        dbWrites: args.type === "dbWrite" ? count : 0,
        fileReads: args.type === "fileRead" ? count : 0,
        fileWrites: args.type === "fileWrite" ? count : 0,
        estimatedDbBandwidth: args.type.startsWith("db") ? bandwidthKB : 0,
        estimatedFileBandwidth: args.type.startsWith("file") ? bandwidthKB : 0,
      });
    }
    return null;
  },
});

// Average sizes for bandwidth estimation (in KB)
const PAGEVIEW_SIZE_KB = 0.5; // ~500 bytes per pageview record
const ACTIVITY_LOG_SIZE_KB = 1; // ~1KB per activity log
const FILE_AVG_SIZE_KB = 200; // Average file size for media operations

// Get bandwidth data for chart - aggregates from pageViews + activityLogs
export const getBandwidthData = query({
  args: {
    range: v.union(
      v.literal("today"),
      v.literal("7d"),
      v.literal("1m"),
      v.literal("3m"),
      v.literal("1y")
    ),
  },
  returns: v.object({
    data: v.array(
      v.object({
        time: v.string(),
        dbBandwidth: v.number(),
        fileBandwidth: v.number(),
      })
    ),
    totalDbBandwidth: v.number(),
    totalFileBandwidth: v.number(),
    hasData: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();

    // Define range configurations
    const configs: Record<
      string,
      { days: number; points: number; format: (d: Date) => string }
    > = {
      today: {
        days: 1,
        points: 12, // hourly for today
        format: (d) => `${d.getHours()}:00`,
      },
      "7d": {
        days: 7,
        points: 7,
        format: (d) => `${d.getDate()}/${d.getMonth() + 1}`,
      },
      "1m": {
        days: 30,
        points: 10,
        format: (d) => `${d.getDate()}/${d.getMonth() + 1}`,
      },
      "3m": {
        days: 90,
        points: 12,
        format: (d) => `${d.getDate()}/${d.getMonth() + 1}`,
      },
      "1y": {
        days: 365,
        points: 12,
        format: (d) => `T${d.getMonth() + 1}`,
      },
    };

    const config = configs[args.range];
    const startTime = now - config.days * 24 * 60 * 60 * 1000;

    // Fetch pageViews in range (limit to prevent bandwidth explosion)
    const pageViews = await ctx.db
      .query("pageViews")
      .order("desc")
      .take(10000);
    const pageViewsInRange = pageViews.filter((pv) => pv._creationTime >= startTime);

    // Fetch activityLogs in range
    const activityLogs = await ctx.db
      .query("activityLogs")
      .order("desc")
      .take(5000);
    const activityLogsInRange = activityLogs.filter((al) => al._creationTime >= startTime);

    // Count media-related activities for file bandwidth
    const mediaActivities = activityLogsInRange.filter(
      (al) => al.targetType === "media" || al.targetType === "images"
    );

    // Group by time periods
    const intervalMs = (config.days * 24 * 60 * 60 * 1000) / config.points;
    const result: { time: string; dbBandwidth: number; fileBandwidth: number }[] = [];

    for (let i = config.points - 1; i >= 0; i--) {
      const periodEnd = now - i * intervalMs;
      const periodStart = periodEnd - intervalMs;

      // Count items in this period
      const pvCount = pageViewsInRange.filter(
        (pv) => pv._creationTime >= periodStart && pv._creationTime < periodEnd
      ).length;

      const alCount = activityLogsInRange.filter(
        (al) => al._creationTime >= periodStart && al._creationTime < periodEnd
      ).length;

      const mediaCount = mediaActivities.filter(
        (al) => al._creationTime >= periodStart && al._creationTime < periodEnd
      ).length;

      // Calculate bandwidth (convert to MB)
      const dbBandwidthKB = pvCount * PAGEVIEW_SIZE_KB + alCount * ACTIVITY_LOG_SIZE_KB;
      const fileBandwidthKB = mediaCount * FILE_AVG_SIZE_KB;

      const date = new Date(periodEnd);
      result.push({
        time: config.format(date),
        dbBandwidth: Math.round(dbBandwidthKB / 1024 * 100) / 100, // MB with 2 decimals
        fileBandwidth: Math.round(fileBandwidthKB / 1024 * 100) / 100,
      });
    }

    const totalDbBandwidth = Math.round(result.reduce((sum, d) => sum + d.dbBandwidth, 0) * 100) / 100;
    const totalFileBandwidth = Math.round(result.reduce((sum, d) => sum + d.fileBandwidth, 0) * 100) / 100;
    const hasData = pageViewsInRange.length > 0 || activityLogsInRange.length > 0;

    return {
      data: result,
      totalDbBandwidth,
      totalFileBandwidth,
      hasData,
    };
  },
});

// Get today's stats summary
export const getTodayStats = query({
  args: {},
  returns: v.union(
    v.object({
      date: v.string(),
      dbReads: v.number(),
      dbWrites: v.number(),
      fileReads: v.number(),
      fileWrites: v.number(),
      estimatedDbBandwidth: v.number(),
      estimatedFileBandwidth: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const date = getTodayDate();
    const stat = await ctx.db
      .query("usageStats")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();

    if (!stat) return null;

    return {
      date: stat.date,
      dbReads: stat.dbReads,
      dbWrites: stat.dbWrites,
      fileReads: stat.fileReads,
      fileWrites: stat.fileWrites,
      estimatedDbBandwidth: stat.estimatedDbBandwidth,
      estimatedFileBandwidth: stat.estimatedFileBandwidth,
    };
  },
});

// Cleanup old stats (keep last 400 days)
export const cleanup = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const cutoffDate = getDateNDaysAgo(400);
    const oldStats = await ctx.db
      .query("usageStats")
      .withIndex("by_date")
      .collect();

    let deleted = 0;
    for (const stat of oldStats) {
      if (stat.date < cutoffDate) {
        await ctx.db.delete(stat._id);
        deleted++;
      }
    }
    return deleted;
  },
});
