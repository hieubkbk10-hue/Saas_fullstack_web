import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const menuDoc = v.object({
  _id: v.id("menus"),
  _creationTime: v.number(),
  name: v.string(),
  location: v.string(),
});

const menuItemDoc = v.object({
  _id: v.id("menuItems"),
  _creationTime: v.number(),
  menuId: v.id("menus"),
  label: v.string(),
  url: v.string(),
  order: v.number(),
  depth: v.number(),
  parentId: v.optional(v.id("menuItems")),
  icon: v.optional(v.string()),
  openInNewTab: v.optional(v.boolean()),
  active: v.boolean(),
});

// ============ MENUS ============

export const listMenus = query({
  args: {},
  returns: v.array(menuDoc),
  handler: async (ctx) => {
    return await ctx.db.query("menus").collect();
  },
});

export const getMenuById = query({
  args: { id: v.id("menus") },
  returns: v.union(menuDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getMenuByLocation = query({
  args: { location: v.string() },
  returns: v.union(menuDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menus")
      .withIndex("by_location", (q) => q.eq("location", args.location))
      .unique();
  },
});

export const createMenu = mutation({
  args: { name: v.string(), location: v.string() },
  returns: v.id("menus"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("menus")
      .withIndex("by_location", (q) => q.eq("location", args.location))
      .unique();
    if (existing) throw new Error("Menu location already exists");
    return await ctx.db.insert("menus", args);
  },
});

export const updateMenu = mutation({
  args: {
    id: v.id("menus"),
    name: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const menu = await ctx.db.get(id);
    if (!menu) throw new Error("Menu not found");
    if (args.location && args.location !== menu.location) {
      const newLocation = args.location;
      const existing = await ctx.db
        .query("menus")
        .withIndex("by_location", (q) => q.eq("location", newLocation))
        .unique();
      if (existing) throw new Error("Menu location already exists");
    }
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const removeMenu = mutation({
  args: { id: v.id("menus") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_menu_order", (q) => q.eq("menuId", args.id))
      .collect();
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

// ============ MENU ITEMS ============

export const listMenuItems = query({
  args: { menuId: v.id("menus") },
  returns: v.array(menuItemDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_menu_order", (q) => q.eq("menuId", args.menuId))
      .collect();
  },
});

export const listActiveMenuItems = query({
  args: { menuId: v.id("menus") },
  returns: v.array(menuItemDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_menu_active", (q) => q.eq("menuId", args.menuId).eq("active", true))
      .collect();
  },
});

export const getMenuItemById = query({
  args: { id: v.id("menuItems") },
  returns: v.union(menuItemDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listChildItems = query({
  args: { parentId: v.id("menuItems") },
  returns: v.array(menuItemDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .collect();
  },
});

export const createMenuItem = mutation({
  args: {
    menuId: v.id("menus"),
    label: v.string(),
    url: v.string(),
    order: v.optional(v.number()),
    depth: v.optional(v.number()),
    parentId: v.optional(v.id("menuItems")),
    icon: v.optional(v.string()),
    openInNewTab: v.optional(v.boolean()),
    active: v.optional(v.boolean()),
  },
  returns: v.id("menuItems"),
  handler: async (ctx, args) => {
    const count = (
      await ctx.db
        .query("menuItems")
        .withIndex("by_menu_order", (q) => q.eq("menuId", args.menuId))
        .collect()
    ).length;
    return await ctx.db.insert("menuItems", {
      ...args,
      order: args.order ?? count,
      depth: args.depth ?? 0,
      active: args.active ?? true,
    });
  },
});

export const updateMenuItem = mutation({
  args: {
    id: v.id("menuItems"),
    label: v.optional(v.string()),
    url: v.optional(v.string()),
    order: v.optional(v.number()),
    depth: v.optional(v.number()),
    parentId: v.optional(v.id("menuItems")),
    icon: v.optional(v.string()),
    openInNewTab: v.optional(v.boolean()),
    active: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Menu item not found");
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const removeMenuItem = mutation({
  args: { id: v.id("menuItems") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const children = await ctx.db
      .query("menuItems")
      .withIndex("by_parent", (q) => q.eq("parentId", args.id))
      .collect();
    for (const child of children) {
      await ctx.db.delete(child._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

export const reorderMenuItems = mutation({
  args: { items: v.array(v.object({ id: v.id("menuItems"), order: v.number(), depth: v.optional(v.number()) })) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const item of args.items) {
      const updates: Record<string, number> = { order: item.order };
      if (item.depth !== undefined) updates.depth = item.depth;
      await ctx.db.patch(item.id, updates);
    }
    return null;
  },
});

// ============ FULL MENU WITH ITEMS ============

export const getFullMenu = query({
  args: { location: v.string() },
  returns: v.union(
    v.object({
      menu: menuDoc,
      items: v.array(menuItemDoc),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const menu = await ctx.db
      .query("menus")
      .withIndex("by_location", (q) => q.eq("location", args.location))
      .unique();
    if (!menu) return null;
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_menu_active", (q) => q.eq("menuId", menu._id).eq("active", true))
      .collect();
    return { menu, items };
  },
});
