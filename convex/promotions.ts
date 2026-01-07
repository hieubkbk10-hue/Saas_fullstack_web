import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

export const listAll = query({
  args: {},
  returns: v.array(promotionDoc),
  handler: async (ctx) => {
    return await ctx.db.query("promotions").collect();
  },
});

export const listActive = query({
  args: {},
  returns: v.array(promotionDoc),
  handler: async (ctx) => {
    return await ctx.db
      .query("promotions")
      .withIndex("by_status", (q) => q.eq("status", "Active"))
      .collect();
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

export const listByStatus = query({
  args: { status: promotionStatus },
  returns: v.array(promotionDoc),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promotions")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

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
    const code = args.code.toUpperCase();
    const existing = await ctx.db
      .query("promotions")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (existing) throw new Error("Mã voucher đã tồn tại");
    
    const count = (await ctx.db.query("promotions").collect()).length;
    return await ctx.db.insert("promotions", {
      ...args,
      code,
      status: args.status ?? "Active",
      usedCount: 0,
      order: count,
    });
  },
});

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
    return null;
  },
});

export const incrementUsage = mutation({
  args: { id: v.id("promotions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const promotion = await ctx.db.get(args.id);
    if (!promotion) throw new Error("Promotion not found");
    await ctx.db.patch(args.id, { usedCount: promotion.usedCount + 1 });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("promotions") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

export const count = query({
  args: { status: v.optional(promotionStatus) },
  returns: v.number(),
  handler: async (ctx, args) => {
    if (args.status) {
      const promotions = await ctx.db
        .query("promotions")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
      return promotions.length;
    }
    const promotions = await ctx.db.query("promotions").collect();
    return promotions.length;
  },
});

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
    const promotions = await ctx.db.query("promotions").collect();
    let activeCount = 0;
    let expiredCount = 0;
    let scheduledCount = 0;
    let totalUsed = 0;
    let percentTypeCount = 0;
    let fixedTypeCount = 0;

    for (const p of promotions) {
      if (p.status === "Active") activeCount++;
      else if (p.status === "Expired") expiredCount++;
      else if (p.status === "Scheduled") scheduledCount++;
      totalUsed += p.usedCount;
      if (p.discountType === "percent") percentTypeCount++;
      else fixedTypeCount++;
    }

    return {
      totalCount: promotions.length,
      activeCount,
      expiredCount,
      scheduledCount,
      totalUsed,
      percentTypeCount,
      fixedTypeCount,
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
