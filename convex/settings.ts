import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const settingDoc = v.object({
  _id: v.id("settings"),
  _creationTime: v.number(),
  key: v.string(),
  value: v.any(),
  group: v.string(),
});

// CRIT-001 FIX: Thêm limit để tránh memory overflow
export const listAll = query({
  args: {},
  returns: v.array(settingDoc),
  handler: async (ctx) => {
    return await ctx.db.query("settings").take(500);
  },
});

export const listByGroup = query({
  args: { group: v.string() },
  returns: v.array(settingDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("settings")
      .withIndex("by_group", (q) => q.eq("group", args.group))
      .collect();
  },
});

export const getByKey = query({
  args: { key: v.string() },
  returns: v.union(settingDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
  },
});

export const getValue = query({
  args: { key: v.string(), defaultValue: v.optional(v.any()) },
  returns: v.any(),
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    return setting?.value ?? args.defaultValue ?? null;
  },
});

// HIGH-001 FIX: Batch load thay vì N+1 queries
export const getMultiple = query({
  args: { keys: v.array(v.string()) },
  returns: v.record(v.string(), v.any()),
  handler: async (ctx, args) => {
    // Batch load tất cả settings 1 lần
    const allSettings = await ctx.db.query("settings").take(500);
    const settingsMap = new Map(allSettings.map(s => [s.key, s.value]));
    
    // Build result từ Map (O(1) lookup)
    const result: Record<string, unknown> = {};
    args.keys.forEach(key => {
      result[key] = settingsMap.get(key) ?? null;
    });
    return result;
  },
});

export const set = mutation({
  args: { key: v.string(), value: v.any(), group: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value, group: args.group });
    } else {
      await ctx.db.insert("settings", args);
    }
    return null;
  },
});

// TICKET #1 FIX: Batch load thay vì N+1 queries
export const setMultiple = mutation({
  args: { settings: v.array(v.object({ key: v.string(), value: v.any(), group: v.string() })) },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Batch load tất cả settings hiện có 1 lần
    const allSettings = await ctx.db.query("settings").take(500);
    const settingsMap = new Map(allSettings.map(s => [s.key, s]));
    
    // Batch updates với Promise.all
    await Promise.all(args.settings.map(async (setting) => {
      const existing = settingsMap.get(setting.key);
      if (existing) {
        await ctx.db.patch(existing._id, { value: setting.value, group: setting.group });
      } else {
        await ctx.db.insert("settings", setting);
      }
    }));
    return null;
  },
});

export const remove = mutation({
  args: { key: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (setting) await ctx.db.delete(setting._id);
    return null;
  },
});

// TICKET #2 FIX: Dùng Promise.all thay vì sequential deletes
export const removeByGroup = mutation({
  args: { group: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_group", (q) => q.eq("group", args.group))
      .collect();
    await Promise.all(settings.map(setting => ctx.db.delete(setting._id)));
    return null;
  },
});

// MED-004 FIX: Thêm limit
export const listGroups = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").take(500);
    const groups = new Set<string>();
    for (const setting of settings) {
      groups.add(setting.group);
    }
    return Array.from(groups).sort();
  },
});
