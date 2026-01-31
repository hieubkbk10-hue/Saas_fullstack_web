import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const menuDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("menus"),
  location: v.string(),
  name: v.string(),
});

const menuItemDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("menuItems"),
  active: v.boolean(),
  depth: v.number(),
  icon: v.optional(v.string()),
  label: v.string(),
  menuId: v.id("menus"),
  openInNewTab: v.optional(v.boolean()),
  order: v.number(),
  parentId: v.optional(v.id("menuItems")),
  url: v.string(),
});

// ============ MENUS ============

// HIGH-005 FIX: Thêm limit
export const listMenus = query({
  args: {},
  handler: async (ctx) => ctx.db.query("menus").take(50),
  returns: v.array(menuDoc),
});

export const getMenuById = query({
  args: { id: v.id("menus") },
  handler: async (ctx, args) => ctx.db.get(args.id),
  returns: v.union(menuDoc, v.null()),
});

export const getMenuByLocation = query({
  args: { location: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("menus")
      .withIndex("by_location", (q) => q.eq("location", args.location))
      .unique(),
  returns: v.union(menuDoc, v.null()),
});

export const createMenu = mutation({
  args: { location: v.string(), name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("menus")
      .withIndex("by_location", (q) => q.eq("location", args.location))
      .unique();
    if (existing) {throw new Error("Menu location already exists");}
    return  ctx.db.insert("menus", args);
  },
  returns: v.id("menus"),
});

export const updateMenu = mutation({
  args: {
    id: v.id("menus"),
    location: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const menu = await ctx.db.get(id);
    if (!menu) {throw new Error("Menu not found");}
    if (args.location && args.location !== menu.location) {
      const newLocation = args.location;
      const existing = await ctx.db
        .query("menus")
        .withIndex("by_location", (q) => q.eq("location", newLocation))
        .unique();
      if (existing) {throw new Error("Menu location already exists");}
    }
    await ctx.db.patch(id, updates);
    return null;
  },
  returns: v.null(),
});

// TICKET #4 FIX: Dùng Promise.all thay vì sequential deletes
export const removeMenu = mutation({
  args: { id: v.id("menus") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_menu_order", (q) => q.eq("menuId", args.id))
      .collect();
    await Promise.all(items.map( async item => ctx.db.delete(item._id)));
    await ctx.db.delete(args.id);
    return null;
  },
  returns: v.null(),
});

// ============ MENU ITEMS ============

// HIGH-005 FIX: Thêm limit
export const listMenuItems = query({
  args: { menuId: v.id("menus") },
  handler: async (ctx, args) => ctx.db
      .query("menuItems")
      .withIndex("by_menu_order", (q) => q.eq("menuId", args.menuId))
      .take(200),
  returns: v.array(menuItemDoc),
});

// HIGH-005 FIX: Thêm limit
export const listActiveMenuItems = query({
  args: { menuId: v.id("menus") },
  handler: async (ctx, args) => ctx.db
      .query("menuItems")
      .withIndex("by_menu_active", (q) => q.eq("menuId", args.menuId).eq("active", true))
      .take(100),
  returns: v.array(menuItemDoc),
});

export const getMenuItemById = query({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => ctx.db.get(args.id),
  returns: v.union(menuItemDoc, v.null()),
});

// HIGH-005 FIX: Thêm limit
export const listChildItems = query({
  args: { parentId: v.id("menuItems") },
  handler: async (ctx, args) => ctx.db
      .query("menuItems")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
      .take(50),
  returns: v.array(menuItemDoc),
});

// HIGH-003 FIX: Dùng order("desc").first() thay vì count + MED-005: URL validation
export const createMenuItem = mutation({
  args: {
    active: v.optional(v.boolean()),
    depth: v.optional(v.number()),
    icon: v.optional(v.string()),
    label: v.string(),
    menuId: v.id("menus"),
    openInNewTab: v.optional(v.boolean()),
    order: v.optional(v.number()),
    parentId: v.optional(v.id("menuItems")),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // MED-005: Basic URL validation
    const url = args.url.trim();
    if (!url) {
      throw new Error("URL không được để trống");
    }
    // Allow relative URLs starting with / or #, or absolute URLs
    if (!url.startsWith("/") && !url.startsWith("#") && !url.startsWith("http")) {
      throw new Error("URL phải bắt đầu bằng /, # hoặc http");
    }
    
    // HIGH-003 FIX: Get order from last item instead of count
    const lastItem = await ctx.db
      .query("menuItems")
      .withIndex("by_menu_order", (q) => q.eq("menuId", args.menuId))
      .order("desc")
      .first();
    const newOrder = args.order ?? (lastItem ? lastItem.order + 1 : 0);
    
    return  ctx.db.insert("menuItems", {
      ...args,
      url,
      order: newOrder,
      depth: args.depth ?? 0,
      active: args.active ?? true,
    });
  },
  returns: v.id("menuItems"),
});

// TICKET #7 FIX: Thêm URL validation như createMenuItem
export const updateMenuItem = mutation({
  args: {
    active: v.optional(v.boolean()),
    depth: v.optional(v.number()),
    icon: v.optional(v.string()),
    id: v.id("menuItems"),
    label: v.optional(v.string()),
    openInNewTab: v.optional(v.boolean()),
    order: v.optional(v.number()),
    parentId: v.optional(v.id("menuItems")),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const item = await ctx.db.get(id);
    if (!item) {throw new Error("Menu item not found");}
    
    // URL validation nếu được cập nhật
    if (updates.url !== undefined) {
      const url = updates.url.trim();
      if (!url) {
        throw new Error("URL không được để trống");
      }
      if (!url.startsWith("/") && !url.startsWith("#") && !url.startsWith("http")) {
        throw new Error("URL phải bắt đầu bằng /, # hoặc http");
      }
      updates.url = url;
    }
    
    await ctx.db.patch(id, updates);
    return null;
  },
  returns: v.null(),
});

// TICKET #5 FIX: Recursive delete với Promise.all
export const removeMenuItem = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    // Recursive function để xóa item và tất cả descendants
    const deleteWithChildren = async (itemId: typeof args.id): Promise<void> => {
      const children = await ctx.db
        .query("menuItems")
        .withIndex("by_parent", (q) => q.eq("parentId", itemId))
        .collect();
      // Xóa tất cả children đệ quy (parallel)
      await Promise.all(children.map( async child => deleteWithChildren(child._id)));
      // Xóa item hiện tại
      await ctx.db.delete(itemId);
    };
    
    await deleteWithChildren(args.id);
    return null;
  },
  returns: v.null(),
});

// TICKET #3 FIX: Dùng Promise.all thay vì sequential updates
export const reorderMenuItems = mutation({
  args: { items: v.array(v.object({ depth: v.optional(v.number()), id: v.id("menuItems"), order: v.number() })) },
  handler: async (ctx, args) => {
    await Promise.all(args.items.map( async item => {
      const updates: Record<string, number> = { order: item.order };
      if (item.depth !== undefined) {updates.depth = item.depth;}
      return ctx.db.patch(item.id, updates);
    }));
    return null;
  },
  returns: v.null(),
});

// ============ FULL MENU WITH ITEMS ============

export const getFullMenu = query({
  args: { location: v.string() },
  handler: async (ctx, args) => {
    const menu = await ctx.db
      .query("menus")
      .withIndex("by_location", (q) => q.eq("location", args.location))
      .unique();
    if (!menu) {return null;}
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_menu_active", (q) => q.eq("menuId", menu._id).eq("active", true))
      .collect();
    return { items, menu };
  },
  returns: v.union(
    v.object({
      items: v.array(menuItemDoc),
      menu: menuDoc,
    }),
    v.null()
  ),
});
