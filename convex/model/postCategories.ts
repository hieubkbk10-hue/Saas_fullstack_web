import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// ============================================================
// HELPER FUNCTIONS - Post Categories Model Layer
// ============================================================

const MAX_ITEMS_LIMIT = 100;

/**
 * Get category by ID with null check
 */
export async function getById(
  ctx: QueryCtx,
  { id }: { id: Id<"postCategories"> }
): Promise<Doc<"postCategories"> | null> {
  return await ctx.db.get(id);
}

/**
 * Get category by ID or throw error
 */
export async function getByIdOrThrow(
  ctx: QueryCtx,
  { id }: { id: Id<"postCategories"> }
): Promise<Doc<"postCategories">> {
  const category = await ctx.db.get(id);
  if (!category) throw new Error("Category not found");
  return category;
}

/**
 * Get category by slug
 */
export async function getBySlug(
  ctx: QueryCtx,
  { slug }: { slug: string }
): Promise<Doc<"postCategories"> | null> {
  return await ctx.db
    .query("postCategories")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

/**
 * Check if slug exists
 */
export async function isSlugExists(
  ctx: QueryCtx,
  { slug, excludeId }: { slug: string; excludeId?: Id<"postCategories"> }
): Promise<boolean> {
  const existing = await ctx.db
    .query("postCategories")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (!existing) return false;
  if (excludeId && existing._id === excludeId) return false;
  return true;
}

/**
 * List categories with limit
 */
export async function listWithLimit(
  ctx: QueryCtx,
  { limit = MAX_ITEMS_LIMIT }: { limit?: number } = {}
): Promise<Doc<"postCategories">[]> {
  return await ctx.db
    .query("postCategories")
    .take(Math.min(limit, MAX_ITEMS_LIMIT));
}

/**
 * List active categories
 */
export async function listActive(
  ctx: QueryCtx,
  { limit = MAX_ITEMS_LIMIT }: { limit?: number } = {}
): Promise<Doc<"postCategories">[]> {
  return await ctx.db
    .query("postCategories")
    .withIndex("by_active", (q) => q.eq("active", true))
    .take(Math.min(limit, MAX_ITEMS_LIMIT));
}

/**
 * List categories by parent
 */
export async function listByParent(
  ctx: QueryCtx,
  { parentId }: { parentId?: Id<"postCategories"> }
): Promise<Doc<"postCategories">[]> {
  if (parentId === undefined) {
    return await ctx.db
      .query("postCategories")
      .withIndex("by_parent", (q) => q.eq("parentId", undefined))
      .collect();
  }
  return await ctx.db
    .query("postCategories")
    .withIndex("by_parent", (q) => q.eq("parentId", parentId))
    .collect();
}

/**
 * Count categories
 */
export async function countWithLimit(
  ctx: QueryCtx,
  { limit = 1000 }: { limit?: number } = {}
): Promise<{ count: number; hasMore: boolean }> {
  const items = await ctx.db.query("postCategories").take(limit + 1);
  return {
    count: Math.min(items.length, limit),
    hasMore: items.length > limit,
  };
}

/**
 * Check if category has children
 */
export async function hasChildren(
  ctx: QueryCtx,
  { id }: { id: Id<"postCategories"> }
): Promise<boolean> {
  const child = await ctx.db
    .query("postCategories")
    .withIndex("by_parent", (q) => q.eq("parentId", id))
    .first();
  return child !== null;
}

/**
 * Check if category has posts
 */
export async function hasPosts(
  ctx: QueryCtx,
  { id }: { id: Id<"postCategories"> }
): Promise<boolean> {
  const post = await ctx.db
    .query("posts")
    .withIndex("by_category_status", (q) => q.eq("categoryId", id))
    .first();
  return post !== null;
}

/**
 * Get next order value
 */
export async function getNextOrder(ctx: QueryCtx): Promise<number> {
  const lastCategory = await ctx.db.query("postCategories").order("desc").first();
  return lastCategory ? lastCategory.order + 1 : 0;
}

/**
 * Create category
 */
export async function create(
  ctx: MutationCtx,
  args: {
    name: string;
    slug: string;
    parentId?: Id<"postCategories">;
    description?: string;
    thumbnail?: string;
    order?: number;
    active?: boolean;
  }
): Promise<Id<"postCategories">> {
  if (await isSlugExists(ctx, { slug: args.slug })) {
    throw new Error("Slug already exists");
  }

  const order = args.order ?? (await getNextOrder(ctx));

  return await ctx.db.insert("postCategories", {
    name: args.name,
    slug: args.slug,
    parentId: args.parentId,
    description: args.description,
    thumbnail: args.thumbnail,
    order,
    active: args.active ?? true,
  });
}

/**
 * Update category
 */
export async function update(
  ctx: MutationCtx,
  args: {
    id: Id<"postCategories">;
    name?: string;
    slug?: string;
    parentId?: Id<"postCategories">;
    description?: string;
    thumbnail?: string;
    order?: number;
    active?: boolean;
  }
): Promise<void> {
  const category = await getByIdOrThrow(ctx, { id: args.id });

  if (args.slug && args.slug !== category.slug) {
    if (await isSlugExists(ctx, { slug: args.slug, excludeId: args.id })) {
      throw new Error("Slug already exists");
    }
  }

  const { id, ...updates } = args;
  await ctx.db.patch(id, updates);
}

/**
 * Delete category (with validation) - FIX HIGH-005: Better error messages
 */
export async function remove(
  ctx: MutationCtx,
  { id }: { id: Id<"postCategories"> }
): Promise<void> {
  const children = await ctx.db
    .query("postCategories")
    .withIndex("by_parent", (q) => q.eq("parentId", id))
    .take(100);
  if (children.length > 0) {
    throw new Error(`Không thể xóa danh mục có ${children.length} danh mục con. Vui lòng xóa hoặc di chuyển danh mục con trước.`);
  }
  
  const posts = await ctx.db
    .query("posts")
    .withIndex("by_category_status", (q) => q.eq("categoryId", id))
    .take(100);
  if (posts.length > 0) {
    throw new Error(`Không thể xóa danh mục có ${posts.length} bài viết. Vui lòng xóa hoặc di chuyển bài viết trước.`);
  }
  
  await ctx.db.delete(id);
}

/**
 * FIX HIGH-005: Get delete info for cascade warning
 */
export async function getDeleteInfo(
  ctx: QueryCtx,
  { id }: { id: Id<"postCategories"> }
): Promise<{ childrenCount: number; postsCount: number; canDelete: boolean }> {
  const children = await ctx.db
    .query("postCategories")
    .withIndex("by_parent", (q) => q.eq("parentId", id))
    .take(100);
  
  const posts = await ctx.db
    .query("posts")
    .withIndex("by_category_status", (q) => q.eq("categoryId", id))
    .take(100);
  
  return {
    childrenCount: children.length,
    postsCount: posts.length,
    canDelete: children.length === 0 && posts.length === 0,
  };
}

/**
 * Reorder categories
 */
export async function reorder(
  ctx: MutationCtx,
  { items }: { items: { id: Id<"postCategories">; order: number }[] }
): Promise<void> {
  for (const item of items) {
    await ctx.db.patch(item.id, { order: item.order });
  }
}
