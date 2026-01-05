import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const settingDoc = v.object({
  _id: v.id("settings"),
  _creationTime: v.number(),
  key: v.string(),
  value: v.any(),
  group: v.string(),
});

export const listAll = query({
  args: {},
  returns: v.array(settingDoc),
  handler: async (ctx) => {
    return await ctx.db.query("settings").collect();
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

export const getMultiple = query({
  args: { keys: v.array(v.string()) },
  returns: v.record(v.string(), v.any()),
  handler: async (ctx, args) => {
    const result: Record<string, unknown> = {};
    for (const key of args.keys) {
      const setting = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique();
      result[key] = setting?.value ?? null;
    }
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

export const setMultiple = mutation({
  args: { settings: v.array(v.object({ key: v.string(), value: v.any(), group: v.string() })) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const setting of args.settings) {
      const existing = await ctx.db
        .query("settings")
        .withIndex("by_key", (q) => q.eq("key", setting.key))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, { value: setting.value, group: setting.group });
      } else {
        await ctx.db.insert("settings", setting);
      }
    }
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

export const removeByGroup = mutation({
  args: { group: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_group", (q) => q.eq("group", args.group))
      .collect();
    for (const setting of settings) {
      await ctx.db.delete(setting._id);
    }
    return null;
  },
});

export const listGroups = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").collect();
    const groups = new Set<string>();
    for (const setting of settings) {
      groups.add(setting.group);
    }
    return Array.from(groups).sort();
  },
});
