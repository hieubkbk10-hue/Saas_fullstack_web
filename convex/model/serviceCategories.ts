import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

const MAX_ITEMS_LIMIT = 100;

export async function getById(
  ctx: QueryCtx,
  { id }: { id: Id<"serviceCategories"> }
): Promise<Doc<"serviceCategories"> | null> {
  return await ctx.db.get(id);
}

export async function getByIdOrThrow(
  ctx: QueryCtx,
  { id }: { id: Id<"serviceCategories"> }
): Promise<Doc<"serviceCategories">> {
  const category = await ctx.db.get(id);
  if (!category) throw new Error("Service category not found");
  return category;
}

export async function getBySlug(
  ctx: QueryCtx,
  { slug }: { slug: string }
): Promise<Doc<"serviceCategories"> | null> {
  return await ctx.db
    .query("serviceCategories")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

export async function isSlugExists(
  ctx: QueryCtx,
  { slug, excludeId }: { slug: string; excludeId?: Id<"serviceCategories"> }
): Promise<boolean> {
  const existing = await ctx.db
    .query("serviceCategories")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (!existing) return false;
  if (excludeId && existing._id === excludeId) return false;
  return true;
}

export async function listWithLimit(
  ctx: QueryCtx,
  { limit = MAX_ITEMS_LIMIT }: { limit?: number } = {}
): Promise<Doc<"serviceCategories">[]> {
  return await ctx.db
    .query("serviceCategories")
    .order("asc")
    .take(Math.min(limit, MAX_ITEMS_LIMIT));
}

export async function listActive(
  ctx: QueryCtx,
  { limit = MAX_ITEMS_LIMIT }: { limit?: number } = {}
): Promise<Doc<"serviceCategories">[]> {
  return await ctx.db
    .query("serviceCategories")
    .withIndex("by_active", (q) => q.eq("active", true))
    .take(Math.min(limit, MAX_ITEMS_LIMIT));
}

export async function listByParent(
  ctx: QueryCtx,
  { parentId }: { parentId?: Id<"serviceCategories"> }
): Promise<Doc<"serviceCategories">[]> {
  return await ctx.db
    .query("serviceCategories")
    .withIndex("by_parent", (q) => q.eq("parentId", parentId))
    .collect();
}

export async function countWithLimit(
  ctx: QueryCtx,
  { limit = 1000 }: { limit?: number } = {}
): Promise<{ count: number; hasMore: boolean }> {
  const items = await ctx.db.query("serviceCategories").take(limit + 1);
  return {
    count: Math.min(items.length, limit),
    hasMore: items.length > limit,
  };
}

export async function getNextOrder(ctx: QueryCtx): Promise<number> {
  const lastCategory = await ctx.db.query("serviceCategories").order("desc").first();
  return lastCategory ? lastCategory.order + 1 : 0;
}

export async function create(
  ctx: MutationCtx,
  args: {
    name: string;
    slug: string;
    parentId?: Id<"serviceCategories">;
    description?: string;
    thumbnail?: string;
    order?: number;
    active?: boolean;
  }
): Promise<Id<"serviceCategories">> {
  if (await isSlugExists(ctx, { slug: args.slug })) {
    throw new Error("Slug already exists");
  }

  const order = args.order ?? (await getNextOrder(ctx));

  return await ctx.db.insert("serviceCategories", {
    name: args.name,
    slug: args.slug,
    parentId: args.parentId,
    description: args.description,
    thumbnail: args.thumbnail,
    order,
    active: args.active ?? true,
  });
}

export async function update(
  ctx: MutationCtx,
  args: {
    id: Id<"serviceCategories">;
    name?: string;
    slug?: string;
    parentId?: Id<"serviceCategories">;
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

export async function remove(
  ctx: MutationCtx,
  { id }: { id: Id<"serviceCategories"> }
): Promise<void> {
  const services = await ctx.db
    .query("services")
    .withIndex("by_category_status", (q) => q.eq("categoryId", id))
    .take(1);
  
  if (services.length > 0) {
    throw new Error("Cannot delete category with services. Please move or delete services first.");
  }

  const children = await ctx.db
    .query("serviceCategories")
    .withIndex("by_parent", (q) => q.eq("parentId", id))
    .take(1);
  
  if (children.length > 0) {
    throw new Error("Cannot delete category with sub-categories. Please delete sub-categories first.");
  }

  await ctx.db.delete(id);
}

export async function reorder(
  ctx: MutationCtx,
  { items }: { items: { id: Id<"serviceCategories">; order: number }[] }
): Promise<void> {
  for (const item of items) {
    await ctx.db.patch(item.id, { order: item.order });
  }
}
