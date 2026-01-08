import { query, mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { moduleCategory, fieldType, dependencyType } from "../lib/validators";

// ============ ADMIN MODULES ============

const moduleDoc = v.object({
  _id: v.id("adminModules"),
  _creationTime: v.number(),
  key: v.string(),
  name: v.string(),
  description: v.string(),
  icon: v.string(),
  category: moduleCategory,
  enabled: v.boolean(),
  isCore: v.boolean(),
  dependencies: v.optional(v.array(v.string())),
  dependencyType: v.optional(dependencyType),
  order: v.number(),
  updatedBy: v.optional(v.id("users")),
});

export const listModules = query({
  args: {},
  returns: v.array(moduleDoc),
  handler: async (ctx) => {
    return await ctx.db.query("adminModules").collect();
  },
});

export const listEnabledModules = query({
  args: {},
  returns: v.array(moduleDoc),
  handler: async (ctx) => {
    return await ctx.db
      .query("adminModules")
      .withIndex("by_enabled_order", (q) => q.eq("enabled", true))
      .collect();
  },
});

export const listModulesByCategory = query({
  args: { category: moduleCategory },
  returns: v.array(moduleDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("adminModules")
      .withIndex("by_category_enabled", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const getModuleByKey = query({
  args: { key: v.string() },
  returns: v.union(moduleDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("adminModules")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
  },
});

export const createModule = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    category: moduleCategory,
    enabled: v.optional(v.boolean()),
    isCore: v.optional(v.boolean()),
    dependencies: v.optional(v.array(v.string())),
    dependencyType: v.optional(dependencyType),
    order: v.optional(v.number()),
  },
  returns: v.id("adminModules"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("adminModules")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) throw new Error("Module key already exists");
    const count = (await ctx.db.query("adminModules").collect()).length;
    return await ctx.db.insert("adminModules", {
      ...args,
      enabled: args.enabled ?? true,
      isCore: args.isCore ?? false,
      order: args.order ?? count,
    });
  },
});

export const updateModule = mutation({
  args: {
    id: v.id("adminModules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    category: v.optional(moduleCategory),
    dependencies: v.optional(v.array(v.string())),
    dependencyType: v.optional(dependencyType),
    order: v.optional(v.number()),
    updatedBy: v.optional(v.id("users")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const module = await ctx.db.get(id);
    if (!module) throw new Error("Module not found");
    await ctx.db.patch(id, updates);
    return null;
  },
});

// SYS-004: Query để lấy các modules phụ thuộc vào module này
export const getDependentModules = query({
  args: { key: v.string() },
  returns: v.array(v.object({
    key: v.string(),
    name: v.string(),
    enabled: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const allModules = await ctx.db.query("adminModules").collect();
    const dependents = allModules.filter(m => 
      m.enabled && m.dependencies?.includes(args.key)
    );
    return dependents.map(m => ({
      key: m.key,
      name: m.name,
      enabled: m.enabled,
    }));
  },
});

export const toggleModule = mutation({
  args: { key: v.string(), enabled: v.boolean(), updatedBy: v.optional(v.id("users")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const module = await ctx.db
      .query("adminModules")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!module) throw new Error("Module not found");
    if (module.isCore && !args.enabled) {
      throw new Error("Cannot disable core module");
    }
    if (args.enabled && module.dependencies?.length) {
      for (const depKey of module.dependencies) {
        const dep = await ctx.db
          .query("adminModules")
          .withIndex("by_key", (q) => q.eq("key", depKey))
          .unique();
        if (!dep?.enabled) {
          if (module.dependencyType === "all") {
            throw new Error(`Dependency module "${depKey}" must be enabled first`);
          }
        }
      }
    }
    await ctx.db.patch(module._id, { enabled: args.enabled, updatedBy: args.updatedBy });
    return null;
  },
});

// SYS-004: Toggle với cascade - auto disable các modules con
export const toggleModuleWithCascade = mutation({
  args: { 
    key: v.string(), 
    enabled: v.boolean(), 
    updatedBy: v.optional(v.id("users")),
    cascadeKeys: v.optional(v.array(v.string())), // Modules con cần disable cùng
  },
  returns: v.object({
    success: v.boolean(),
    disabledModules: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const module = await ctx.db
      .query("adminModules")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!module) throw new Error("Module not found");
    if (module.isCore && !args.enabled) {
      throw new Error("Cannot disable core module");
    }
    
    // Khi enable, check dependencies
    if (args.enabled && module.dependencies?.length) {
      for (const depKey of module.dependencies) {
        const dep = await ctx.db
          .query("adminModules")
          .withIndex("by_key", (q) => q.eq("key", depKey))
          .unique();
        if (!dep?.enabled) {
          if (module.dependencyType === "all") {
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
    await ctx.db.patch(module._id, { enabled: args.enabled, updatedBy: args.updatedBy });
    
    return { success: true, disabledModules };
  },
});

export const removeModule = mutation({
  args: { id: v.id("adminModules") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const module = await ctx.db.get(args.id);
    if (!module) throw new Error("Module not found");
    if (module.isCore) throw new Error("Cannot delete core module");
    const fields = await ctx.db
      .query("moduleFields")
      .withIndex("by_module", (q) => q.eq("moduleKey", module.key))
      .collect();
    for (const field of fields) {
      await ctx.db.delete(field._id);
    }
    const features = await ctx.db
      .query("moduleFeatures")
      .withIndex("by_module", (q) => q.eq("moduleKey", module.key))
      .collect();
    for (const feature of features) {
      await ctx.db.delete(feature._id);
    }
    const settings = await ctx.db
      .query("moduleSettings")
      .withIndex("by_module", (q) => q.eq("moduleKey", module.key))
      .collect();
    for (const setting of settings) {
      await ctx.db.delete(setting._id);
    }
    await ctx.db.delete(args.id);
    return null;
  },
});

// ============ MODULE FIELDS ============

const fieldDoc = v.object({
  _id: v.id("moduleFields"),
  _creationTime: v.number(),
  moduleKey: v.string(),
  fieldKey: v.string(),
  name: v.string(),
  type: fieldType,
  required: v.boolean(),
  enabled: v.boolean(),
  isSystem: v.boolean(),
  linkedFeature: v.optional(v.string()),
  order: v.number(),
  group: v.optional(v.string()),
});

export const listModuleFields = query({
  args: { moduleKey: v.string() },
  returns: v.array(fieldDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moduleFields")
      .withIndex("by_module_order", (q) => q.eq("moduleKey", args.moduleKey))
      .collect();
  },
});

export const listEnabledModuleFields = query({
  args: { moduleKey: v.string() },
  returns: v.array(fieldDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moduleFields")
      .withIndex("by_module_enabled", (q) => q.eq("moduleKey", args.moduleKey).eq("enabled", true))
      .collect();
  },
});

export const createModuleField = mutation({
  args: {
    moduleKey: v.string(),
    fieldKey: v.string(),
    name: v.string(),
    type: fieldType,
    required: v.optional(v.boolean()),
    enabled: v.optional(v.boolean()),
    isSystem: v.optional(v.boolean()),
    linkedFeature: v.optional(v.string()),
    order: v.optional(v.number()),
    group: v.optional(v.string()),
  },
  returns: v.id("moduleFields"),
  handler: async (ctx, args) => {
    const count = (
      await ctx.db
        .query("moduleFields")
        .withIndex("by_module", (q) => q.eq("moduleKey", args.moduleKey))
        .collect()
    ).length;
    return await ctx.db.insert("moduleFields", {
      ...args,
      required: args.required ?? false,
      enabled: args.enabled ?? true,
      isSystem: args.isSystem ?? false,
      order: args.order ?? count,
    });
  },
});

export const updateModuleField = mutation({
  args: {
    id: v.id("moduleFields"),
    name: v.optional(v.string()),
    type: v.optional(fieldType),
    required: v.optional(v.boolean()),
    enabled: v.optional(v.boolean()),
    linkedFeature: v.optional(v.string()),
    order: v.optional(v.number()),
    group: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const field = await ctx.db.get(id);
    if (!field) throw new Error("Field not found");
    if (field.isSystem && args.enabled === false) {
      throw new Error("Cannot disable system field");
    }
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const removeModuleField = mutation({
  args: { id: v.id("moduleFields") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const field = await ctx.db.get(args.id);
    if (!field) throw new Error("Field not found");
    if (field.isSystem) throw new Error("Cannot delete system field");
    await ctx.db.delete(args.id);
    return null;
  },
});

// ============ MODULE FEATURES ============

const featureDoc = v.object({
  _id: v.id("moduleFeatures"),
  _creationTime: v.number(),
  moduleKey: v.string(),
  featureKey: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  enabled: v.boolean(),
  linkedFieldKey: v.optional(v.string()),
});

export const listModuleFeatures = query({
  args: { moduleKey: v.string() },
  returns: v.array(featureDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moduleFeatures")
      .withIndex("by_module", (q) => q.eq("moduleKey", args.moduleKey))
      .collect();
  },
});

export const getModuleFeature = query({
  args: { moduleKey: v.string(), featureKey: v.string() },
  returns: v.union(featureDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moduleFeatures")
      .withIndex("by_module_feature", (q) =>
        q.eq("moduleKey", args.moduleKey).eq("featureKey", args.featureKey)
      )
      .unique();
  },
});

export const createModuleFeature = mutation({
  args: {
    moduleKey: v.string(),
    featureKey: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    linkedFieldKey: v.optional(v.string()),
  },
  returns: v.id("moduleFeatures"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("moduleFeatures", {
      ...args,
      enabled: args.enabled ?? true,
    });
  },
});

export const toggleModuleFeature = mutation({
  args: { moduleKey: v.string(), featureKey: v.string(), enabled: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const feature = await ctx.db
      .query("moduleFeatures")
      .withIndex("by_module_feature", (q) =>
        q.eq("moduleKey", args.moduleKey).eq("featureKey", args.featureKey)
      )
      .unique();
    if (!feature) throw new Error("Feature not found");
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
});

export const removeModuleFeature = mutation({
  args: { id: v.id("moduleFeatures") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

// ============ MODULE SETTINGS ============

const settingDoc = v.object({
  _id: v.id("moduleSettings"),
  _creationTime: v.number(),
  moduleKey: v.string(),
  settingKey: v.string(),
  value: v.any(),
});

export const listModuleSettings = query({
  args: { moduleKey: v.string() },
  returns: v.array(settingDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moduleSettings")
      .withIndex("by_module", (q) => q.eq("moduleKey", args.moduleKey))
      .collect();
  },
});

export const getModuleSetting = query({
  args: { moduleKey: v.string(), settingKey: v.string() },
  returns: v.union(settingDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("moduleSettings")
      .withIndex("by_module_setting", (q) =>
        q.eq("moduleKey", args.moduleKey).eq("settingKey", args.settingKey)
      )
      .unique();
  },
});

export const setModuleSetting = mutation({
  args: { moduleKey: v.string(), settingKey: v.string(), value: v.any() },
  returns: v.null(),
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
});

export const removeModuleSetting = mutation({
  args: { moduleKey: v.string(), settingKey: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("moduleSettings")
      .withIndex("by_module_setting", (q) =>
        q.eq("moduleKey", args.moduleKey).eq("settingKey", args.settingKey)
      )
      .unique();
    if (setting) await ctx.db.delete(setting._id);
    return null;
  },
});
