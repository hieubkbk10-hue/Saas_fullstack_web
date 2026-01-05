import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const homeComponentDoc = v.object({
  _id: v.id("homeComponents"),
  _creationTime: v.number(),
  type: v.string(),
  title: v.string(),
  active: v.boolean(),
  order: v.number(),
  config: v.any(),
});

export const listAll = query({
  args: {},
  returns: v.array(homeComponentDoc),
  handler: async (ctx) => {
    return await ctx.db.query("homeComponents").collect();
  },
});

export const listActive = query({
  args: {},
  returns: v.array(homeComponentDoc),
  handler: async (ctx) => {
    return await ctx.db
      .query("homeComponents")
      .withIndex("by_active_order", (q) => q.eq("active", true))
      .collect();
  },
});

export const listByType = query({
  args: { type: v.string() },
  returns: v.array(homeComponentDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("homeComponents")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("homeComponents") },
  returns: v.union(homeComponentDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    active: v.optional(v.boolean()),
    order: v.optional(v.number()),
    config: v.any(),
  },
  returns: v.id("homeComponents"),
  handler: async (ctx, args) => {
    const count = (await ctx.db.query("homeComponents").collect()).length;
    return await ctx.db.insert("homeComponents", {
      ...args,
      active: args.active ?? true,
      order: args.order ?? count,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("homeComponents"),
    type: v.optional(v.string()),
    title: v.optional(v.string()),
    active: v.optional(v.boolean()),
    order: v.optional(v.number()),
    config: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const component = await ctx.db.get(id);
    if (!component) throw new Error("Component not found");
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const updateConfig = mutation({
  args: { id: v.id("homeComponents"), config: v.any() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const component = await ctx.db.get(args.id);
    if (!component) throw new Error("Component not found");
    await ctx.db.patch(args.id, { config: args.config });
    return null;
  },
});

export const toggle = mutation({
  args: { id: v.id("homeComponents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const component = await ctx.db.get(args.id);
    if (!component) throw new Error("Component not found");
    await ctx.db.patch(args.id, { active: !component.active });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("homeComponents") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

export const reorder = mutation({
  args: { items: v.array(v.object({ id: v.id("homeComponents"), order: v.number() })) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const item of args.items) {
      await ctx.db.patch(item.id, { order: item.order });
    }
    return null;
  },
});

export const duplicate = mutation({
  args: { id: v.id("homeComponents") },
  returns: v.id("homeComponents"),
  handler: async (ctx, args) => {
    const component = await ctx.db.get(args.id);
    if (!component) throw new Error("Component not found");
    const count = (await ctx.db.query("homeComponents").collect()).length;
    return await ctx.db.insert("homeComponents", {
      type: component.type,
      title: `${component.title} (Copy)`,
      active: false,
      order: count,
      config: component.config,
    });
  },
});
