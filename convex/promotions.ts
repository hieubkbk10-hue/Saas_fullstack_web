import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// HIGH-004 FIX: Helper function to update promotionStats counter
async function updatePromotionStats(
  ctx: { db: any },
  key: string,
  delta: number
) {
  const stats = await ctx.db
    .query("promotionStats")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .unique();
  if (stats) {
    await ctx.db.patch(stats._id, { count: Math.max(0, stats.count + delta) });
  } else {
    await ctx.db.insert("promotionStats", { key, count: Math.max(0, delta) });
  }
}

const promotionStatus = v.union(
  v.literal("Active"),
  v.literal("Inactive"),
  v.literal("Expired"),
  v.literal("Scheduled")
);

const discountType = v.union(v.literal("percent"), v.literal("fixed"));

const promotionDoc = v.object({
  _id: v.id("promotions"),
  _creationTime: v.number(),
  name: v.string(),
  code: v.string(),
  description: v.optional(v.string()),
  discountType: discountType,
  discountValue: v.number(),
  minOrderAmount: v.optional(v.number()),
  maxDiscountAmount: v.optional(v.number()),
  usageLimit: v.optional(v.number()),
  usedCount: v.number(),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  status: promotionStatus,
  applicableTo: v.optional(
    v.union(v.literal("all"), v.literal("products"), v.literal("categories"))
  ),
  applicableIds: v.optional(v.array(v.string())),
  order: v.number(),
});

// HIGH-004 FIX: Thêm limit
export const listAll = query({
  args: {},
  returns: v.array(promotionDoc),
  handler: async (ctx) => {
    return await ctx.db.query("promotions").take(500);
  },
});

// HIGH-004 FIX: Thêm limit
export const listActive = query({
  args: {},
  returns: v.array(promotionDoc),
  handler: async (ctx) => {
    return await ctx.db
      .query("promotions")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .take(200);
  },
});

export const getById = query({
  args: { id: v.id("promotions") },
  returns: v.union(promotionDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByCode = query({
  args: { code: v.string() },
  returns: v.union(promotionDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promotions")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .unique();
  },
});

// HIGH-004 FIX: Thêm limit
export const listByStatus = query({
  args: { status: promotionStatus },
  returns: v.array(promotionDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promotions")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .take(200);
  },
});

// MED-001 FIX: Thêm validation discountValue + HIGH-004: Update counters
export const create = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    description: v.optional(v.string()),
    discountType: discountType,
    discountValue: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxDiscountAmount: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(promotionStatus),
    applicableTo: v.optional(
      v.union(v.literal("all"), v.literal("products"), v.literal("categories"))
    ),
    applicableIds: v.optional(v.array(v.string())),
  },
  returns: v.id("promotions"),
  handler: async (ctx, args) => {
    // MED-001: Validate discountValue
    if (args.discountValue <= 0) {
      throw new Error("Giá trị giảm phải lớn hơn 0");
    }
    if (args.discountType === "percent" && args.discountValue > 100) {
      throw new Error("Phần trăm giảm không được lớn hơn 100%");
    }
    
    const code = args.code.toUpperCase();
    const existing = await ctx.db
      .query("promotions")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (existing) throw new Error("Mã voucher đã tồn tại");
    
    // Get order from last item
    const lastItem = await ctx.db.query("promotions").order("desc").first();
    const newOrder = lastItem ? lastItem.order + 1 : 0;
    const status = args.status ?? "Active";
    
    const id = await ctx.db.insert("promotions", {
      ...args,
      code,
      status,
      usedCount: 0,
      order: newOrder,
    });
    
    // Update counters
    await Promise.all([
      updatePromotionStats(ctx, "total", 1),
      updatePromotionStats(ctx, status, 1),
      updatePromotionStats(ctx, args.discountType, 1),
    ]);
    
    return id;
  },
});

// MED-001 FIX: Thêm validation + HIGH-004: Update counters khi status thay đổi
export const update = mutation({
  args: {
    id: v.id("promotions"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    discountType: v.optional(discountType),
    discountValue: v.optional(v.number()),
    minOrderAmount: v.optional(v.number()),
    maxDiscountAmount: v.optional(v.number()),
    usageLimit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(promotionStatus),
    applicableTo: v.optional(
      v.union(v.literal("all"), v.literal("products"), v.literal("categories"))
    ),
    applicableIds: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const promotion = await ctx.db.get(id);
    if (!promotion) throw new Error("Promotion not found");
    
    // MED-001: Validate discountValue nếu được cập nhật
    if (args.discountValue !== undefined) {
      if (args.discountValue <= 0) {
        throw new Error("Giá trị giảm phải lớn hơn 0");
      }
      const type = args.discountType ?? promotion.discountType;
      if (type === "percent" && args.discountValue > 100) {
        throw new Error("Phần trăm giảm không được lớn hơn 100%");
      }
    }
    
    if (args.code && args.code.toUpperCase() !== promotion.code) {
      const code = args.code.toUpperCase();
      const existing = await ctx.db
        .query("promotions")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique();
      if (existing) throw new Error("Mã voucher đã tồn tại");
      updates.code = code;
    }
    
    await ctx.db.patch(id, updates);
    
    // Update counters nếu status thay đổi
    if (args.status && args.status !== promotion.status) {
      await Promise.all([
        updatePromotionStats(ctx, promotion.status, -1),
        updatePromotionStats(ctx, args.status, 1),
      ]);
    }
    
    // Update counters nếu discountType thay đổi
    if (args.discountType && args.discountType !== promotion.discountType) {
      await Promise.all([
        updatePromotionStats(ctx, promotion.discountType, -1),
        updatePromotionStats(ctx, args.discountType, 1),
      ]);
    }
    
    return null;
  },
});

// HIGH-004 FIX: Update totalUsed counter
export const incrementUsage = mutation({
  args: { id: v.id("promotions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const promotion = await ctx.db.get(args.id);
    if (!promotion) throw new Error("Promotion not found");
    await ctx.db.patch(args.id, { usedCount: promotion.usedCount + 1 });
    
    // Update totalUsed counter
    await updatePromotionStats(ctx, "totalUsed", 1);
    
    return null;
  },
});

// HIGH-004 FIX: Update counters khi remove
export const remove = mutation({
  args: { id: v.id("promotions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const promotion = await ctx.db.get(args.id);
    if (!promotion) throw new Error("Promotion not found");
    
    await ctx.db.delete(args.id);
    
    // Update counters
    await Promise.all([
      updatePromotionStats(ctx, "total", -1),
      updatePromotionStats(ctx, promotion.status, -1),
      updatePromotionStats(ctx, promotion.discountType, -1),
      updatePromotionStats(ctx, "totalUsed", -promotion.usedCount),
    ]);
    
    return null;
  },
});

// HIGH-004 FIX: Dùng counter table thay vì fetch ALL
export const count = query({
  args: { status: v.optional(promotionStatus) },
  returns: v.number(),
  handler: async (ctx, args) => {
    const key = args.status ?? "total";
    const stats = await ctx.db
      .query("promotionStats")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    return stats?.count ?? 0;
  },
});

// HIGH-004 FIX: Dùng counter table thay vì fetch ALL
export const getStats = query({
  args: {},
  returns: v.object({
    totalCount: v.number(),
    activeCount: v.number(),
    expiredCount: v.number(),
    scheduledCount: v.number(),
    totalUsed: v.number(),
    percentTypeCount: v.number(),
    fixedTypeCount: v.number(),
  }),
  handler: async (ctx) => {
    // Fetch tất cả stats 1 lần
    const allStats = await ctx.db.query("promotionStats").take(100);
    const statsMap = new Map(allStats.map(s => [s.key, s.count]));

    return {
      totalCount: statsMap.get("total") ?? 0,
      activeCount: statsMap.get("Active") ?? 0,
      expiredCount: statsMap.get("Expired") ?? 0,
      scheduledCount: statsMap.get("Scheduled") ?? 0,
      totalUsed: statsMap.get("totalUsed") ?? 0,
      percentTypeCount: statsMap.get("percent") ?? 0,
      fixedTypeCount: statsMap.get("fixed") ?? 0,
    };
  },
});

export const validateCode = query({
  args: { code: v.string(), orderAmount: v.optional(v.number()) },
  returns: v.object({
    valid: v.boolean(),
    message: v.string(),
    promotion: v.union(promotionDoc, v.null()),
    discountAmount: v.number(),
  }),
  handler: async (ctx, args) => {
    const promotion = await ctx.db
      .query("promotions")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .unique();

    if (!promotion) {
      return { valid: false, message: "Mã voucher không tồn tại", promotion: null, discountAmount: 0 };
    }

    if (promotion.status !== "Active") {
      return { valid: false, message: "Mã voucher không còn hiệu lực", promotion: null, discountAmount: 0 };
    }

    const now = Date.now();
    if (promotion.startDate && now < promotion.startDate) {
      return { valid: false, message: "Mã voucher chưa đến thời gian sử dụng", promotion: null, discountAmount: 0 };
    }
    if (promotion.endDate && now > promotion.endDate) {
      return { valid: false, message: "Mã voucher đã hết hạn", promotion: null, discountAmount: 0 };
    }

    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return { valid: false, message: "Mã voucher đã hết lượt sử dụng", promotion: null, discountAmount: 0 };
    }

    const orderAmount = args.orderAmount ?? 0;
    if (promotion.minOrderAmount && orderAmount < promotion.minOrderAmount) {
      return { 
        valid: false, 
        message: `Đơn hàng tối thiểu ${promotion.minOrderAmount.toLocaleString()}đ`, 
        promotion: null, 
        discountAmount: 0 
      };
    }

    let discountAmount = 0;
    if (promotion.discountType === "percent") {
      discountAmount = Math.round(orderAmount * promotion.discountValue / 100);
      if (promotion.maxDiscountAmount && discountAmount > promotion.maxDiscountAmount) {
        discountAmount = promotion.maxDiscountAmount;
      }
    } else {
      discountAmount = promotion.discountValue;
    }

    return { valid: true, message: "Áp dụng thành công", promotion, discountAmount };
  },
});
