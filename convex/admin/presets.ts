import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

const presetDoc = v.object({
  _id: v.id("systemPresets"),
  _creationTime: v.number(),
  key: v.string(),
  name: v.string(),
  description: v.string(),
  enabledModules: v.array(v.string()),
  isDefault: v.optional(v.boolean()),
});

export const listPresets = query({
  args: {},
  returns: v.array(presetDoc),
  handler: async (ctx) => {
    return await ctx.db.query("systemPresets").collect();
  },
});

export const getPresetByKey = query({
  args: { key: v.string() },
  returns: v.union(presetDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("systemPresets")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
  },
});

export const getDefaultPreset = query({
  args: {},
  returns: v.union(presetDoc, v.null()),
  handler: async (ctx) => {
    const presets = await ctx.db.query("systemPresets").collect();
    return presets.find((p) => p.isDefault) ?? null;
  },
});

export const createPreset = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    description: v.string(),
    enabledModules: v.array(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  returns: v.id("systemPresets"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("systemPresets")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) throw new Error("Preset key already exists");
    if (args.isDefault) {
      const allPresets = await ctx.db.query("systemPresets").collect();
      for (const preset of allPresets) {
        if (preset.isDefault) {
          await ctx.db.patch(preset._id, { isDefault: false });
        }
      }
    }
    return await ctx.db.insert("systemPresets", args);
  },
});

export const updatePreset = mutation({
  args: {
    id: v.id("systemPresets"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    enabledModules: v.optional(v.array(v.string())),
    isDefault: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const preset = await ctx.db.get(id);
    if (!preset) throw new Error("Preset not found");
    if (args.isDefault) {
      const allPresets = await ctx.db.query("systemPresets").collect();
      for (const p of allPresets) {
        if (p.isDefault && p._id !== id) {
          await ctx.db.patch(p._id, { isDefault: false });
        }
      }
    }
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const removePreset = mutation({
  args: { id: v.id("systemPresets") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const preset = await ctx.db.get(args.id);
    if (!preset) throw new Error("Preset not found");
    if (preset.isDefault) throw new Error("Cannot delete default preset");
    await ctx.db.delete(args.id);
    return null;
  },
});

export const applyPreset = mutation({
  args: { key: v.string(), updatedBy: v.optional(v.id("users")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const preset = await ctx.db
      .query("systemPresets")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!preset) throw new Error("Preset not found");
    const allModules = await ctx.db.query("adminModules").collect();
    for (const moduleRecord of allModules) {
      if (moduleRecord.isCore) continue;
      const shouldEnable = preset.enabledModules.includes(moduleRecord.key);
      if (moduleRecord.enabled !== shouldEnable) {
        await ctx.db.patch(moduleRecord._id, {
          enabled: shouldEnable,
          updatedBy: args.updatedBy,
        });
      }
    }
    return null;
  },
});

export const createPresetFromCurrent = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    description: v.string(),
  },
  returns: v.id("systemPresets"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("systemPresets")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) throw new Error("Preset key already exists");
    const enabledModules = await ctx.db
      .query("adminModules")
      .withIndex("by_enabled_order", (q) => q.eq("enabled", true))
      .collect();
    return await ctx.db.insert("systemPresets", {
      ...args,
      enabledModules: enabledModules.map((m) => m.key),
    });
  },
});

export const duplicatePreset = mutation({
  args: { id: v.id("systemPresets"), newKey: v.string(), newName: v.string() },
  returns: v.id("systemPresets"),
  handler: async (ctx, args) => {
    const preset = await ctx.db.get(args.id);
    if (!preset) throw new Error("Preset not found");
    const existing = await ctx.db
      .query("systemPresets")
      .withIndex("by_key", (q) => q.eq("key", args.newKey))
      .unique();
    if (existing) throw new Error("Preset key already exists");
    return await ctx.db.insert("systemPresets", {
      key: args.newKey,
      name: args.newName,
      description: preset.description,
      enabledModules: preset.enabledModules,
      isDefault: false,
    });
  },
});
