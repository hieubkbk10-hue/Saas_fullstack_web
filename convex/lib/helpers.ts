import { GenericQueryCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";

// Helper để check document tồn tại
export async function getOrThrow<T extends keyof DataModel>(
  ctx: GenericQueryCtx<DataModel>,
  table: T,
  id: Id<T>
): Promise<DataModel[T]["document"]> {
  const doc = await ctx.db.get(id);
  if (!doc) {
    throw new Error(`${String(table)} not found: ${id}`);
  }
  return doc;
}

// Helper pagination options
export const DEFAULT_PAGE_SIZE = 20;
