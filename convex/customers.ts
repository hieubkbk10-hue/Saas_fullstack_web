import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { customerStatus } from "./lib/validators";

const customerDoc = v.object({
  _id: v.id("customers"),
  _creationTime: v.number(),
  name: v.string(),
  email: v.string(),
  phone: v.string(),
  avatar: v.optional(v.string()),
  status: customerStatus,
  ordersCount: v.number(),
  totalSpent: v.number(),
  address: v.optional(v.string()),
  city: v.optional(v.string()),
  notes: v.optional(v.string()),
});

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(customerDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db.query("customers").paginate(args.paginationOpts);
  },
});

export const getById = query({
  args: { id: v.id("customers") },
  returns: v.union(customerDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  returns: v.union(customerDoc, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getByStatus = query({
  args: { status: customerStatus, paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(customerDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .paginate(args.paginationOpts);
  },
});

export const getTopSpenders = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(customerDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_status_totalSpent", (q) => q.eq("status", "Active"))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getByCity = query({
  args: { city: v.string(), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(customerDoc),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_city_status", (q) => q.eq("city", args.city))
      .paginate(args.paginationOpts);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    avatar: v.optional(v.string()),
    status: v.optional(customerStatus),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.id("customers"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) throw new Error("Email already exists");
    return await ctx.db.insert("customers", {
      ...args,
      status: args.status ?? "Active",
      ordersCount: 0,
      totalSpent: 0,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("customers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
    status: v.optional(customerStatus),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const customer = await ctx.db.get(id);
    if (!customer) throw new Error("Customer not found");
    await ctx.db.patch(id, updates);
    return null;
  },
});

export const updateStats = mutation({
  args: {
    id: v.id("customers"),
    addOrdersCount: v.optional(v.number()),
    addTotalSpent: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.id);
    if (!customer) throw new Error("Customer not found");
    await ctx.db.patch(args.id, {
      ordersCount: customer.ordersCount + (args.addOrdersCount ?? 0),
      totalSpent: customer.totalSpent + (args.addTotalSpent ?? 0),
    });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("customers") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});
