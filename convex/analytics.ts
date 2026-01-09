import { query } from "./_generated/server";
import { v } from "convex/values";

// Helper: Calculate period timestamps
function getPeriodTimestamps(period: string) {
  const now = Date.now();
  const periodMs = {
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
    "90d": 90 * 24 * 60 * 60 * 1000,
    "1y": 365 * 24 * 60 * 60 * 1000,
  }[period] || 30 * 24 * 60 * 60 * 1000;
  
  return {
    now,
    periodMs,
    startDate: now - periodMs,
    prevStartDate: now - periodMs * 2,
  };
}

// Helper: Valid order statuses for revenue calculations
const VALID_ORDER_STATUSES = ["Delivered", "Shipped", "Processing"] as const;

// Get revenue statistics from orders - OPTIMIZED: filter by status index + limit
export const getRevenueStats = query({
  args: {
    period: v.optional(v.string()),
  },
  returns: v.object({
    totalRevenue: v.number(),
    totalOrders: v.number(),
    avgOrderValue: v.number(),
    revenueChange: v.number(),
    ordersChange: v.number(),
  }),
  handler: async (ctx, args) => {
    const period = args.period || "30d";
    const { startDate, prevStartDate } = getPeriodTimestamps(period);
    
    // OPTIMIZED: Query by status index instead of fetching ALL
    // Fetch orders for each valid status with limit (max 1000 per status)
    const ordersByStatus = await Promise.all(
      VALID_ORDER_STATUSES.map(status =>
        ctx.db.query("orders")
          .withIndex("by_status", q => q.eq("status", status))
          .take(1000)
      )
    );
    const validOrders = ordersByStatus.flat();
    
    // Filter by period client-side (but on much smaller dataset)
    const currentOrders = validOrders.filter(o => o._creationTime >= startDate);
    const prevOrders = validOrders.filter(o => 
      o._creationTime >= prevStartDate && o._creationTime < startDate
    );
    
    const totalRevenue = currentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = currentOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const prevOrdersCount = prevOrders.length;
    
    const revenueChange = prevRevenue > 0 
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) 
      : (totalRevenue > 0 ? 100 : 0);
    const ordersChange = prevOrdersCount > 0 
      ? Math.round(((totalOrders - prevOrdersCount) / prevOrdersCount) * 100) 
      : (totalOrders > 0 ? 100 : 0);
    
    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      revenueChange,
      ordersChange,
    };
  },
});

// Get customer statistics - OPTIMIZED: use status index
export const getCustomerStats = query({
  args: {
    period: v.optional(v.string()),
  },
  returns: v.object({
    totalCustomers: v.number(),
    newCustomers: v.number(),
    activeCustomers: v.number(),
    newCustomersChange: v.number(),
  }),
  handler: async (ctx, args) => {
    const period = args.period || "30d";
    const { startDate, prevStartDate } = getPeriodTimestamps(period);
    
    // OPTIMIZED: Query by status index with limits
    const [activeCustomers, inactiveCustomers] = await Promise.all([
      ctx.db.query("customers")
        .withIndex("by_status", q => q.eq("status", "Active"))
        .take(5000),
      ctx.db.query("customers")
        .withIndex("by_status", q => q.eq("status", "Inactive"))
        .take(5000),
    ]);
    
    const allCustomers = [...activeCustomers, ...inactiveCustomers];
    const totalCustomers = allCustomers.length;
    
    // New customers in current period
    const newCustomers = allCustomers.filter(c => c._creationTime >= startDate).length;
    const prevNewCustomers = allCustomers.filter(c => 
      c._creationTime >= prevStartDate && c._creationTime < startDate
    ).length;
    
    const newCustomersChange = prevNewCustomers > 0
      ? Math.round(((newCustomers - prevNewCustomers) / prevNewCustomers) * 100)
      : (newCustomers > 0 ? 100 : 0);
    
    return {
      totalCustomers,
      newCustomers,
      activeCustomers: activeCustomers.length,
      newCustomersChange,
    };
  },
});

// Get top selling products
export const getTopProducts = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    id: v.string(),
    name: v.string(),
    sales: v.number(),
    revenue: v.number(),
    image: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    
    const products = await ctx.db
      .query("products")
      .withIndex("by_status_sales")
      .order("desc")
      .collect();
    
    // Filter active products and sort by sales
    const activeProducts = products
      .filter(p => p.status === "Active")
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
    
    return activeProducts.map(p => ({
      id: p._id,
      name: p.name,
      sales: p.sales,
      revenue: p.sales * (p.salePrice || p.price),
      image: p.image,
    }));
  },
});

// Get low stock products
export const getLowStockProducts = query({
  args: {
    threshold: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    id: v.string(),
    name: v.string(),
    stock: v.number(),
    sku: v.string(),
  })),
  handler: async (ctx, args) => {
    const threshold = args.threshold || 10;
    const limit = args.limit || 10;
    
    const products = await ctx.db
      .query("products")
      .collect();
    
    const lowStock = products
      .filter(p => p.status === "Active" && p.stock <= threshold)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, limit);
    
    return lowStock.map(p => ({
      id: p._id,
      name: p.name,
      stock: p.stock,
      sku: p.sku,
    }));
  },
});

// Get revenue chart data (daily/weekly aggregation) - OPTIMIZED: filter by status index
export const getRevenueChartData = query({
  args: {
    period: v.optional(v.string()),
  },
  returns: v.array(v.object({
    date: v.string(),
    revenue: v.number(),
    orders: v.number(),
  })),
  handler: async (ctx, args) => {
    const period = args.period || "30d";
    const { now, startDate } = getPeriodTimestamps(period);
    
    // OPTIMIZED: Query by status index with limit
    const ordersByStatus = await Promise.all(
      VALID_ORDER_STATUSES.map(status =>
        ctx.db.query("orders")
          .withIndex("by_status", q => q.eq("status", status))
          .take(2000)
      )
    );
    const filteredOrders = ordersByStatus.flat().filter(o => o._creationTime >= startDate);
    
    // Group by date
    const dailyData: Record<string, { revenue: number; orders: number }> = {};
    
    // Determine grouping (daily for <=30d, weekly for >30d)
    const isWeekly = period === "90d" || period === "1y";
    
    for (const order of filteredOrders) {
      const date = new Date(order._creationTime);
      let key: string;
      
      if (isWeekly) {
        // Get week start (Monday)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1);
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = date.toISOString().split('T')[0];
      }
      
      if (!dailyData[key]) {
        dailyData[key] = { revenue: 0, orders: 0 };
      }
      dailyData[key].revenue += order.totalAmount;
      dailyData[key].orders += 1;
    }
    
    // Fill missing dates and sort
    const result: { date: string; revenue: number; orders: number }[] = [];
    const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 13 : 52; // weeks for longer periods
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      if (isWeekly) {
        d.setDate(d.getDate() - (i * 7));
        d.setDate(d.getDate() - d.getDay() + 1);
      } else {
        d.setDate(d.getDate() - i);
      }
      const key = d.toISOString().split('T')[0];
      const displayDate = `${d.getDate()}/${d.getMonth() + 1}`;
      
      result.push({
        date: displayDate,
        revenue: dailyData[key]?.revenue || 0,
        orders: dailyData[key]?.orders || 0,
      });
    }
    
    return result;
  },
});

// Get order status distribution - OPTIMIZED: query by each status index
export const getOrderStatusDistribution = query({
  args: {},
  returns: v.array(v.object({
    status: v.string(),
    count: v.number(),
    percentage: v.number(),
  })),
  handler: async (ctx) => {
    const ALL_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
    
    // OPTIMIZED: Query count by status index (instead of fetching ALL)
    const statusCounts = await Promise.all(
      ALL_STATUSES.map(async status => {
        const orders = await ctx.db.query("orders")
          .withIndex("by_status", q => q.eq("status", status))
          .take(10000);
        return { status, count: orders.length };
      })
    );
    
    const total = statusCounts.reduce((sum, s) => sum + s.count, 0);
    if (total === 0) return [];
    
    return statusCounts
      .filter(s => s.count > 0)
      .map(({ status, count }) => ({
        status,
        count,
        percentage: Math.round((count / total) * 100),
      }));
  },
});

// Get summary stats (for dashboard cards) - OPTIMIZED: parallel queries with indexes
export const getSummaryStats = query({
  args: {
    period: v.optional(v.string()),
  },
  returns: v.object({
    revenue: v.object({ value: v.number(), change: v.number() }),
    orders: v.object({ value: v.number(), change: v.number() }),
    customers: v.object({ value: v.number(), change: v.number() }),
    products: v.object({ value: v.number(), lowStock: v.number() }),
  }),
  handler: async (ctx, args) => {
    const period = args.period || "30d";
    const { startDate, prevStartDate } = getPeriodTimestamps(period);
    
    // OPTIMIZED: Parallel queries with indexes
    const [
      deliveredOrders,
      shippedOrders,
      processingOrders,
      activeCustomers,
      inactiveCustomers,
      activeProducts,
    ] = await Promise.all([
      ctx.db.query("orders").withIndex("by_status", q => q.eq("status", "Delivered")).take(2000),
      ctx.db.query("orders").withIndex("by_status", q => q.eq("status", "Shipped")).take(2000),
      ctx.db.query("orders").withIndex("by_status", q => q.eq("status", "Processing")).take(2000),
      ctx.db.query("customers").withIndex("by_status", q => q.eq("status", "Active")).take(5000),
      ctx.db.query("customers").withIndex("by_status", q => q.eq("status", "Inactive")).take(5000),
      ctx.db.query("products").withIndex("by_status_stock", q => q.eq("status", "Active")).take(5000),
    ]);
    
    const validOrders = [...deliveredOrders, ...shippedOrders, ...processingOrders];
    const currentOrders = validOrders.filter(o => o._creationTime >= startDate);
    const prevOrders = validOrders.filter(o => 
      o._creationTime >= prevStartDate && o._creationTime < startDate
    );
    
    const currentRevenue = currentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    const revenueChange = prevRevenue > 0 
      ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
      : (currentRevenue > 0 ? 100 : 0);
    const ordersChange = prevOrders.length > 0
      ? Math.round(((currentOrders.length - prevOrders.length) / prevOrders.length) * 100)
      : (currentOrders.length > 0 ? 100 : 0);
    
    // Customers
    const allCustomers = [...activeCustomers, ...inactiveCustomers];
    const newCustomers = allCustomers.filter(c => c._creationTime >= startDate).length;
    const prevNewCustomers = allCustomers.filter(c => 
      c._creationTime >= prevStartDate && c._creationTime < startDate
    ).length;
    
    const customersChange = prevNewCustomers > 0
      ? Math.round(((newCustomers - prevNewCustomers) / prevNewCustomers) * 100)
      : (newCustomers > 0 ? 100 : 0);
    
    // Products - count low stock
    const lowStockCount = activeProducts.filter(p => p.stock <= 10).length;
    
    return {
      revenue: { value: currentRevenue, change: revenueChange },
      orders: { value: currentOrders.length, change: ordersChange },
      customers: { value: newCustomers, change: customersChange },
      products: { value: activeProducts.length, lowStock: lowStockCount },
    };
  },
});
