import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

const MAX_ITEMS_LIMIT = 100;

export async function getById(
  ctx: QueryCtx,
  { id }: { id: Id<"services"> }
): Promise<Doc<"services"> | null> {
  return await ctx.db.get(id);
}

export async function getByIdOrThrow(
  ctx: QueryCtx,
  { id }: { id: Id<"services"> }
): Promise<Doc<"services">> {
  const service = await ctx.db.get(id);
  if (!service) throw new Error("Service not found");
  return service;
}

export async function getBySlug(
  ctx: QueryCtx,
  { slug }: { slug: string }
): Promise<Doc<"services"> | null> {
  return await ctx.db
    .query("services")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

export async function isSlugExists(
  ctx: QueryCtx,
  { slug, excludeId }: { slug: string; excludeId?: Id<"services"> }
): Promise<boolean> {
  const existing = await ctx.db
    .query("services")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  if (!existing) return false;
  if (excludeId && existing._id === excludeId) return false;
  return true;
}

export async function listWithLimit(
  ctx: QueryCtx,
  { limit = MAX_ITEMS_LIMIT }: { limit?: number } = {}
): Promise<Doc<"services">[]> {
  return await ctx.db
    .query("services")
    .order("desc")
    .take(Math.min(limit, MAX_ITEMS_LIMIT));
}

export async function listByStatus(
  ctx: QueryCtx,
  { status, limit = MAX_ITEMS_LIMIT }: { status: Doc<"services">["status"]; limit?: number }
): Promise<Doc<"services">[]> {
  return await ctx.db
    .query("services")
    .withIndex("by_status_publishedAt", (q) => q.eq("status", status))
    .order("desc")
    .take(Math.min(limit, MAX_ITEMS_LIMIT));
}

export async function listByCategory(
  ctx: QueryCtx,
  { categoryId, limit = MAX_ITEMS_LIMIT }: { categoryId: Id<"serviceCategories">; limit?: number }
): Promise<Doc<"services">[]> {
  return await ctx.db
    .query("services")
    .withIndex("by_category_status", (q) => q.eq("categoryId", categoryId))
    .take(Math.min(limit, MAX_ITEMS_LIMIT));
}

export async function countWithLimit(
  ctx: QueryCtx,
  { status, limit = 1000 }: { status?: Doc<"services">["status"]; limit?: number } = {}
): Promise<{ count: number; hasMore: boolean }> {
  const query = status
    ? ctx.db.query("services").withIndex("by_status_publishedAt", (q) => q.eq("status", status))
    : ctx.db.query("services");
  
  const items = await query.take(limit + 1);
  return {
    count: Math.min(items.length, limit),
    hasMore: items.length > limit,
  };
}

export async function countByCategory(
  ctx: QueryCtx,
  { categoryId }: { categoryId: Id<"serviceCategories"> }
): Promise<number> {
  const services = await ctx.db
    .query("services")
    .withIndex("by_category_status", (q) => q.eq("categoryId", categoryId))
    .take(1000);
  return services.length;
}

export async function getNextOrder(ctx: QueryCtx): Promise<number> {
  const lastService = await ctx.db.query("services").order("desc").first();
  return lastService ? lastService.order + 1 : 0;
}

export async function create(
  ctx: MutationCtx,
  args: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    thumbnail?: string;
    categoryId: Id<"serviceCategories">;
    price?: number;
    duration?: string;
    status?: Doc<"services">["status"];
    order?: number;
    featured?: boolean;
  }
): Promise<Id<"services">> {
  if (await isSlugExists(ctx, { slug: args.slug })) {
    throw new Error("Slug already exists");
  }

  const order = args.order ?? (await getNextOrder(ctx));
  const status = args.status ?? "Draft";

  return await ctx.db.insert("services", {
    title: args.title,
    slug: args.slug,
    content: args.content,
    excerpt: args.excerpt,
    thumbnail: args.thumbnail,
    categoryId: args.categoryId,
    price: args.price,
    duration: args.duration,
    status,
    views: 0,
    publishedAt: status === "Published" ? Date.now() : undefined,
    order,
    featured: args.featured,
  });
}

export async function update(
  ctx: MutationCtx,
  args: {
    id: Id<"services">;
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    thumbnail?: string;
    categoryId?: Id<"serviceCategories">;
    price?: number;
    duration?: string;
    status?: Doc<"services">["status"];
    order?: number;
    featured?: boolean;
  }
): Promise<void> {
  const service = await getByIdOrThrow(ctx, { id: args.id });

  if (args.slug && args.slug !== service.slug) {
    if (await isSlugExists(ctx, { slug: args.slug, excludeId: args.id })) {
      throw new Error("Slug already exists");
    }
  }

  const { id, ...updates } = args;
  const patchData: Record<string, unknown> = { ...updates };

  if (args.status === "Published" && service.status !== "Published") {
    patchData.publishedAt = Date.now();
  }

  await ctx.db.patch(id, patchData);
}

/**
 * SVC-011: Delete service and related comments (like posts.remove)
 */
export async function remove(
  ctx: MutationCtx,
  { id }: { id: Id<"services"> }
): Promise<void> {
  // Delete related comments (targetType = "service")
  const comments = await ctx.db
    .query("comments")
    .withIndex("by_target_status", (q) =>
      q.eq("targetType", "service").eq("targetId", id as string)
    )
    .collect();

  for (const comment of comments) {
    await ctx.db.delete(comment._id);
  }

  await ctx.db.delete(id);
}

export async function incrementViews(
  ctx: MutationCtx,
  { id }: { id: Id<"services"> }
): Promise<void> {
  const service = await getByIdOrThrow(ctx, { id });
  await ctx.db.patch(id, { views: service.views + 1 });
}
