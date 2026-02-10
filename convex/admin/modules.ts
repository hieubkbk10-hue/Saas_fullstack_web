import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { dependencyType, fieldType, moduleCategory } from "../lib/validators";

// ============ ADMIN MODULES ============

const moduleDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("adminModules"),
  category: moduleCategory,
  dependencies: v.optional(v.array(v.string())),
  dependencyType: v.optional(dependencyType),
  description: v.string(),
  enabled: v.boolean(),
  icon: v.string(),
  isCore: v.boolean(),
  key: v.string(),
  name: v.string(),
  order: v.number(),
  updatedBy: v.optional(v.id("users")),
});

export const listModules = query({
  args: {},
  handler: async (ctx) => ctx.db.query("adminModules").collect(),
  returns: v.array(moduleDoc),
});

export const listEnabledModules = query({
  args: {},
  handler: async (ctx) => ctx.db
      .query("adminModules")
      .withIndex("by_enabled_order", (q) => q.eq("enabled", true))
      .collect(),
  returns: v.array(moduleDoc),
});

export const listModulesByCategory = query({
  args: { category: moduleCategory },
  handler: async (ctx, args) => ctx.db
      .query("adminModules")
      .withIndex("by_category_enabled", (q) => q.eq("category", args.category))
      .collect(),
  returns: v.array(moduleDoc),
});

export const getModuleByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("adminModules")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique(),
  returns: v.union(moduleDoc, v.null()),
});

export const createModule = mutation({
  args: {
    category: moduleCategory,
    dependencies: v.optional(v.array(v.string())),
    dependencyType: v.optional(dependencyType),
    description: v.string(),
    enabled: v.optional(v.boolean()),
    icon: v.string(),
    isCore: v.optional(v.boolean()),
    key: v.string(),
    name: v.string(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("adminModules")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {throw new Error("Module key already exists");}
    const count = (await ctx.db.query("adminModules").collect()).length;
    return  ctx.db.insert("adminModules", {
      ...args,
      enabled: args.enabled ?? true,
      isCore: args.isCore ?? false,
      order: args.order ?? count,
    });
  },
  returns: v.id("adminModules"),
});

export const updateModule = mutation({
  args: {
    category: v.optional(moduleCategory),
    dependencies: v.optional(v.array(v.string())),
    dependencyType: v.optional(dependencyType),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    id: v.id("adminModules"),
    name: v.optional(v.string()),
    order: v.optional(v.number()),
    updatedBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const moduleRecord = await ctx.db.get(id);
    if (!moduleRecord) {throw new Error("Module not found");}
    await ctx.db.patch(id, updates);
    return null;
  },
  returns: v.null(),
});

// SYS-004: Query để lấy các modules phụ thuộc vào module này
export const getDependentModules = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const allModules = await ctx.db.query("adminModules").collect();
    const dependents = allModules.filter(m => 
      m.enabled && m.dependencies?.includes(args.key)
    );
    return dependents.map(m => ({
      enabled: m.enabled,
      key: m.key,
      name: m.name,
    }));
  },
  returns: v.array(v.object({
    enabled: v.boolean(),
    key: v.string(),
    name: v.string(),
  })),
});

export const toggleModule = mutation({
  args: { enabled: v.boolean(), key: v.string(), updatedBy: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const moduleRecord = await ctx.db
      .query("adminModules")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!moduleRecord) {throw new Error("Module not found");}
    if (moduleRecord.isCore && !args.enabled) {
      throw new Error("Cannot disable core module");
    }
    if (args.enabled && args.key === "wishlist") {
      const [products, customers] = await Promise.all([
        ctx.db.query("adminModules").withIndex("by_key", (q) => q.eq("key", "products")).unique(),
        ctx.db.query("adminModules").withIndex("by_key", (q) => q.eq("key", "customers")).unique(),
      ]);
      if (!products?.enabled || !customers?.enabled) {
        throw new Error("Cần bật module Sản phẩm và Khách hàng trước");
      }
    }
    if (args.enabled && moduleRecord.dependencies?.length) {
      for (const depKey of moduleRecord.dependencies) {
        const dep = await ctx.db
          .query("adminModules")
          .withIndex("by_key", (q) => q.eq("key", depKey))
          .unique();
        if (!dep?.enabled) {
          if (moduleRecord.dependencyType === "all") {
            throw new Error(`Dependency module "${depKey}" must be enabled first`);
          }
        }
      }
    }
    await ctx.db.patch(moduleRecord._id, { enabled: args.enabled, updatedBy: args.updatedBy });
    return null;
  },
  returns: v.null(),
});

// SYS-004: Toggle với cascade - auto disable các modules con
export const toggleModuleWithCascade = mutation({
  args: { 
    cascadeKeys: v.optional(v.array(v.string())), 
    enabled: v.boolean(), 
    key: v.string(),
    updatedBy: v.optional(v.id("users")), // Modules con cần disable cùng
  },
  handler: async (ctx, args) => {
    const moduleRecord = await ctx.db
      .query("adminModules")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!moduleRecord) {return { disabledModules: [], success: false };}
    if (moduleRecord.isCore && !args.enabled) {
      throw new Error("Cannot disable core module");
    }

    if (args.enabled && args.key === "wishlist") {
      const [products, customers] = await Promise.all([
        ctx.db.query("adminModules").withIndex("by_key", (q) => q.eq("key", "products")).unique(),
        ctx.db.query("adminModules").withIndex("by_key", (q) => q.eq("key", "customers")).unique(),
      ]);
      if (!products?.enabled || !customers?.enabled) {
        throw new Error("Cần bật module Sản phẩm và Khách hàng trước");
      }
    }
    
    // Khi enable, check dependencies
    if (args.enabled && moduleRecord.dependencies?.length) {
      for (const depKey of moduleRecord.dependencies) {
        const dep = await ctx.db
          .query("adminModules")
          .withIndex("by_key", (q) => q.eq("key", depKey))
          .unique();
        if (!dep?.enabled) {
          if (moduleRecord.dependencyType === "all") {
            throw new Error(`Dependency module "${depKey}" must be enabled first`);
          }
        }
      }
    }
    
    const disabledModules: string[] = [];
    
    // Khi disable, cascade disable các modules con
    if (!args.enabled && args.cascadeKeys?.length) {
      for (const cascadeKey of args.cascadeKeys) {
        const cascadeModule = await ctx.db
          .query("adminModules")
          .withIndex("by_key", (q) => q.eq("key", cascadeKey))
          .unique();
        if (cascadeModule && cascadeModule.enabled && !cascadeModule.isCore) {
          await ctx.db.patch(cascadeModule._id, { enabled: false, updatedBy: args.updatedBy });
          disabledModules.push(cascadeKey);
        }
      }
    }
    
    // Toggle module chính
    await ctx.db.patch(moduleRecord._id, { enabled: args.enabled, updatedBy: args.updatedBy });
    
    return { disabledModules, success: true };
  },
  returns: v.object({
    disabledModules: v.array(v.string()),
    success: v.boolean(),
  }),
});

export const removeModule = mutation({
  args: { id: v.id("adminModules") },
  handler: async (ctx, args) => {
    const moduleRecord = await ctx.db.get(args.id);
    if (!moduleRecord) {throw new Error("Module not found");}
    if (moduleRecord.isCore) {throw new Error("Cannot delete core module");}
    const fields = await ctx.db
      .query("moduleFields")
      .withIndex("by_module", (q) => q.eq("moduleKey", moduleRecord.key))
      .collect();
    for (const field of fields) {
      await ctx.db.delete(field._id);
    }
    const features = await ctx.db
      .query("moduleFeatures")
      .withIndex("by_module", (q) => q.eq("moduleKey", moduleRecord.key))
      .collect();
    for (const feature of features) {
      await ctx.db.delete(feature._id);
    }
    const settings = await ctx.db
      .query("moduleSettings")
      .withIndex("by_module", (q) => q.eq("moduleKey", moduleRecord.key))
      .collect();
    for (const setting of settings) {
      await ctx.db.delete(setting._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
  returns: v.null(),
});

// ============ MODULE FIELDS ============

const fieldDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("moduleFields"),
  enabled: v.boolean(),
  fieldKey: v.string(),
  group: v.optional(v.string()),
  isSystem: v.boolean(),
  linkedFeature: v.optional(v.string()),
  moduleKey: v.string(),
  name: v.string(),
  order: v.number(),
  required: v.boolean(),
  type: fieldType,
});

export const listModuleFields = query({
  args: { moduleKey: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("moduleFields")
      .withIndex("by_module_order", (q) => q.eq("moduleKey", args.moduleKey))
      .collect(),
  returns: v.array(fieldDoc),
});

export const listEnabledModuleFields = query({
  args: { moduleKey: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("moduleFields")
      .withIndex("by_module_enabled", (q) => q.eq("moduleKey", args.moduleKey).eq("enabled", true))
      .collect(),
  returns: v.array(fieldDoc),
});

export const createModuleField = mutation({
  args: {
    enabled: v.optional(v.boolean()),
    fieldKey: v.string(),
    group: v.optional(v.string()),
    isSystem: v.optional(v.boolean()),
    linkedFeature: v.optional(v.string()),
    moduleKey: v.string(),
    name: v.string(),
    order: v.optional(v.number()),
    required: v.optional(v.boolean()),
    type: fieldType,
  },
  handler: async (ctx, args) => {
    const count = (
      await ctx.db
        .query("moduleFields")
        .withIndex("by_module", (q) => q.eq("moduleKey", args.moduleKey))
        .collect()
    ).length;
    return  ctx.db.insert("moduleFields", {
      ...args,
      required: args.required ?? false,
      enabled: args.enabled ?? true,
      isSystem: args.isSystem ?? false,
      order: args.order ?? count,
    });
  },
  returns: v.id("moduleFields"),
});

export const updateModuleField = mutation({
  args: {
    enabled: v.optional(v.boolean()),
    group: v.optional(v.string()),
    id: v.id("moduleFields"),
    linkedFeature: v.optional(v.string()),
    name: v.optional(v.string()),
    order: v.optional(v.number()),
    required: v.optional(v.boolean()),
    type: v.optional(fieldType),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const field = await ctx.db.get(id);
    if (!field) {throw new Error("Field not found");}
    if (field.isSystem && args.enabled === false) {
      throw new Error("Cannot disable system field");
    }
    await ctx.db.patch(id, updates);
    return null;
  },
  returns: v.null(),
});

export const removeModuleField = mutation({
  args: { id: v.id("moduleFields") },
  handler: async (ctx, args) => {
    const field = await ctx.db.get(args.id);
    if (!field) {throw new Error("Field not found");}
    if (field.isSystem) {throw new Error("Cannot delete system field");}
    await ctx.db.delete(args.id);
    return null;
  },
  returns: v.null(),
});

// ============ MODULE FEATURES ============

const featureDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("moduleFeatures"),
  description: v.optional(v.string()),
  enabled: v.boolean(),
  featureKey: v.string(),
  linkedFieldKey: v.optional(v.string()),
  moduleKey: v.string(),
  name: v.string(),
});

export const listModuleFeatures = query({
  args: { moduleKey: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("moduleFeatures")
      .withIndex("by_module", (q) => q.eq("moduleKey", args.moduleKey))
      .collect(),
  returns: v.array(featureDoc),
});

export const getModuleFeature = query({
  args: { featureKey: v.string(), moduleKey: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("moduleFeatures")
      .withIndex("by_module_feature", (q) =>
        q.eq("moduleKey", args.moduleKey).eq("featureKey", args.featureKey)
      )
      .unique(),
  returns: v.union(featureDoc, v.null()),
});

export const createModuleFeature = mutation({
  args: {
    description: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    featureKey: v.string(),
    linkedFieldKey: v.optional(v.string()),
    moduleKey: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => ctx.db.insert("moduleFeatures", {
      ...args,
      enabled: args.enabled ?? true,
    }),
  returns: v.id("moduleFeatures"),
});

export const toggleModuleFeature = mutation({
  args: { enabled: v.boolean(), featureKey: v.string(), moduleKey: v.string() },
  handler: async (ctx, args) => {
    const feature = await ctx.db
      .query("moduleFeatures")
      .withIndex("by_module_feature", (q) =>
        q.eq("moduleKey", args.moduleKey).eq("featureKey", args.featureKey)
      )
      .unique();
    if (!feature) {throw new Error("Feature not found");}
    await ctx.db.patch(feature._id, { enabled: args.enabled });
    if (feature.linkedFieldKey) {
      const fields = await ctx.db
        .query("moduleFields")
        .withIndex("by_module", (q) => q.eq("moduleKey", args.moduleKey))
        .collect();
      const linkedField = fields.find((f) => f.fieldKey === feature.linkedFieldKey);
      if (linkedField && !linkedField.isSystem) {
        await ctx.db.patch(linkedField._id, { enabled: args.enabled });
      }
    }
    return null;
  },
  returns: v.null(),
});

export const removeModuleFeature = mutation({
  args: { id: v.id("moduleFeatures") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
  returns: v.null(),
});

// ============ MODULE SETTINGS ============

const settingDoc = v.object({
  _creationTime: v.number(),
  _id: v.id("moduleSettings"),
  moduleKey: v.string(),
  settingKey: v.string(),
  value: v.any(),
});

export const listModuleSettings = query({
  args: { moduleKey: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("moduleSettings")
      .withIndex("by_module", (q) => q.eq("moduleKey", args.moduleKey))
      .collect(),
  returns: v.array(settingDoc),
});

export const getModuleSetting = query({
  args: { moduleKey: v.string(), settingKey: v.string() },
  handler: async (ctx, args) => ctx.db
      .query("moduleSettings")
      .withIndex("by_module_setting", (q) =>
        q.eq("moduleKey", args.moduleKey).eq("settingKey", args.settingKey)
      )
      .unique(),
  returns: v.union(settingDoc, v.null()),
});

export const setModuleSetting = mutation({
  args: { moduleKey: v.string(), settingKey: v.string(), value: v.any() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("moduleSettings")
      .withIndex("by_module_setting", (q) =>
        q.eq("moduleKey", args.moduleKey).eq("settingKey", args.settingKey)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("moduleSettings", args);
    }
    return null;
  },
  returns: v.null(),
});

export const removeModuleSetting = mutation({
  args: { moduleKey: v.string(), settingKey: v.string() },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("moduleSettings")
      .withIndex("by_module_setting", (q) =>
        q.eq("moduleKey", args.moduleKey).eq("settingKey", args.settingKey)
      )
      .unique();
    if (setting) {await ctx.db.delete(setting._id);}
    return null;
  },
  returns: v.null(),
});
