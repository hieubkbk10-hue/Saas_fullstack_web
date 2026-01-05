import { v } from "convex/values";

// ============================================================
// SHARED VALIDATORS - Reusable validator fragments
// ============================================================

// Status validators
export const userStatus = v.union(
  v.literal("Active"),
  v.literal("Inactive"),
  v.literal("Banned")
);

export const customerStatus = v.union(
  v.literal("Active"),
  v.literal("Inactive")
);

export const contentStatus = v.union(
  v.literal("Published"),
  v.literal("Draft"),
  v.literal("Archived")
);

export const productStatus = v.union(
  v.literal("Active"),
  v.literal("Draft"),
  v.literal("Archived")
);

export const commentStatus = v.union(
  v.literal("Pending"),
  v.literal("Approved"),
  v.literal("Spam")
);

// Module category
export const moduleCategory = v.union(
  v.literal("content"),
  v.literal("commerce"),
  v.literal("user"),
  v.literal("system"),
  v.literal("marketing")
);

// Field types
export const fieldType = v.union(
  v.literal("text"),
  v.literal("textarea"),
  v.literal("richtext"),
  v.literal("number"),
  v.literal("price"),
  v.literal("boolean"),
  v.literal("image"),
  v.literal("gallery"),
  v.literal("select"),
  v.literal("date"),
  v.literal("email"),
  v.literal("phone"),
  v.literal("tags"),
  v.literal("password")
);

// Target type for polymorphic relations
export const targetType = v.union(v.literal("post"), v.literal("product"));

// Dependency type
export const dependencyType = v.union(v.literal("all"), v.literal("any"));

// ============================================================
// COMMON FIELD GROUPS
// ============================================================

// SEO fields
export const seoFields = {
  slug: v.string(),
  metaTitle: v.optional(v.string()),
  metaDescription: v.optional(v.string()),
};

// Timestamp fields (for manual tracking beyond _creationTime)
export const timestampFields = {
  publishedAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
};

// Ordering fields
export const orderingFields = {
  order: v.number(),
  active: v.boolean(),
};
