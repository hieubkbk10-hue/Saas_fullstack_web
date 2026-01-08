import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Track a page view
export const track = mutation({
  args: {
    path: v.string(),
    sessionId: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    device: v.optional(v.union(v.literal("mobile"), v.literal("desktop"), v.literal("tablet"))),
    os: v.optional(v.string()),
    browser: v.optional(v.string()),
  },
  returns: v.id("pageViews"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("pageViews", {
      path: args.path,
      sessionId: args.sessionId,
      referrer: args.referrer,
      userAgent: args.userAgent,
      device: args.device,
      os: args.os,
      browser: args.browser,
    });
  },
});

// Get traffic summary stats
export const getTrafficStats = query({
  args: {
    period: v.optional(v.string()),
  },
  returns: v.object({
    totalPageviews: v.number(),
    uniqueVisitors: v.number(),
    pageviewsChange: v.number(),
    visitorsChange: v.number(),
  }),
  handler: async (ctx, args) => {
    const period = args.period || "30d";
    const now = Date.now();
    
    const periodMs = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      "1y": 365 * 24 * 60 * 60 * 1000,
    }[period] || 30 * 24 * 60 * 60 * 1000;
    
    const startDate = now - periodMs;
    const prevStartDate = startDate - periodMs;
    
    const allPageViews = await ctx.db.query("pageViews").collect();
    
    // Current period
    const currentViews = allPageViews.filter(pv => pv._creationTime >= startDate);
    const currentSessions = new Set(currentViews.map(pv => pv.sessionId));
    
    // Previous period
    const prevViews = allPageViews.filter(pv => 
      pv._creationTime >= prevStartDate && pv._creationTime < startDate
    );
    const prevSessions = new Set(prevViews.map(pv => pv.sessionId));
    
    // Calculate changes
    const pageviewsChange = prevViews.length > 0
      ? Math.round(((currentViews.length - prevViews.length) / prevViews.length) * 100)
      : (currentViews.length > 0 ? 100 : 0);
      
    const visitorsChange = prevSessions.size > 0
      ? Math.round(((currentSessions.size - prevSessions.size) / prevSessions.size) * 100)
      : (currentSessions.size > 0 ? 100 : 0);
    
    return {
      totalPageviews: currentViews.length,
      uniqueVisitors: currentSessions.size,
      pageviewsChange,
      visitorsChange,
    };
  },
});

// Get traffic chart data
export const getTrafficChartData = query({
  args: {
    period: v.optional(v.string()),
    groupBy: v.optional(v.union(v.literal("day"), v.literal("month"), v.literal("year"))),
  },
  returns: v.array(v.object({
    date: v.string(),
    pageviews: v.number(),
    visitors: v.number(),
  })),
  handler: async (ctx, args) => {
    const period = args.period || "30d";
    const groupBy = args.groupBy || "day";
    const now = Date.now();
    
    // For monthly/yearly views, extend the period
    let periodMs: number;
    if (groupBy === "year") {
      periodMs = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years
    } else if (groupBy === "month") {
      periodMs = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years
    } else {
      periodMs = {
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
        "90d": 90 * 24 * 60 * 60 * 1000,
        "1y": 365 * 24 * 60 * 60 * 1000,
      }[period] || 30 * 24 * 60 * 60 * 1000;
    }
    
    const startDate = now - periodMs;
    
    const allPageViews = await ctx.db.query("pageViews").collect();
    const filteredViews = allPageViews.filter(pv => pv._creationTime >= startDate);
    
    // Group by date/month/year
    const groupedData: Record<string, { pageviews: number; sessions: Set<string> }> = {};
    
    for (const view of filteredViews) {
      const date = new Date(view._creationTime);
      let key: string;
      
      if (groupBy === "year") {
        key = `${date.getFullYear()}`;
      } else if (groupBy === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        // Daily - use weekly grouping for longer periods
        const isWeekly = period === "90d" || period === "1y";
        if (isWeekly) {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay() + 1);
          key = weekStart.toISOString().split('T')[0];
        } else {
          key = date.toISOString().split('T')[0];
        }
      }
      
      if (!groupedData[key]) {
        groupedData[key] = { pageviews: 0, sessions: new Set() };
      }
      groupedData[key].pageviews += 1;
      groupedData[key].sessions.add(view.sessionId);
    }
    
    // Generate result based on groupBy
    const result: { date: string; pageviews: number; visitors: number }[] = [];
    
    if (groupBy === "year") {
      const currentYear = new Date(now).getFullYear();
      for (let year = currentYear - 4; year <= currentYear; year++) {
        const key = `${year}`;
        result.push({
          date: key,
          pageviews: groupedData[key]?.pageviews || 0,
          visitors: groupedData[key]?.sessions.size || 0,
        });
      }
    } else if (groupBy === "month") {
      const months = 24; // 2 years
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const displayDate = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(-2)}`;
        result.push({
          date: displayDate,
          pageviews: groupedData[key]?.pageviews || 0,
          visitors: groupedData[key]?.sessions.size || 0,
        });
      }
    } else {
      // Daily view
      const isWeekly = period === "90d" || period === "1y";
      const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 13 : 52;
      
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
          pageviews: groupedData[key]?.pageviews || 0,
          visitors: groupedData[key]?.sessions.size || 0,
        });
      }
    }
    
    return result;
  },
});

// Get top pages
export const getTopPages = query({
  args: {
    period: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    path: v.string(),
    views: v.number(),
    percentage: v.number(),
  })),
  handler: async (ctx, args) => {
    const period = args.period || "30d";
    const limit = args.limit || 10;
    const now = Date.now();
    
    const periodMs = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      "1y": 365 * 24 * 60 * 60 * 1000,
    }[period] || 30 * 24 * 60 * 60 * 1000;
    
    const startDate = now - periodMs;
    
    const allPageViews = await ctx.db.query("pageViews").collect();
    const filteredViews = allPageViews.filter(pv => pv._creationTime >= startDate);
    
    // Count by path
    const pathCounts: Record<string, number> = {};
    for (const view of filteredViews) {
      pathCounts[view.path] = (pathCounts[view.path] || 0) + 1;
    }
    
    const total = filteredViews.length;
    
    return Object.entries(pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([path, views]) => ({
        path,
        views,
        percentage: total > 0 ? Math.round((views / total) * 100) : 0,
      }));
  },
});

// Get traffic by referrer/source
export const getTrafficSources = query({
  args: {
    period: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.object({
    source: v.string(),
    views: v.number(),
    percentage: v.number(),
  })),
  handler: async (ctx, args) => {
    const period = args.period || "30d";
    const limit = args.limit || 10;
    const now = Date.now();
    
    const periodMs = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      "1y": 365 * 24 * 60 * 60 * 1000,
    }[period] || 30 * 24 * 60 * 60 * 1000;
    
    const startDate = now - periodMs;
    
    const allPageViews = await ctx.db.query("pageViews").collect();
    const filteredViews = allPageViews.filter(pv => pv._creationTime >= startDate);
    
    // Parse referrer to get source
    const sourceCounts: Record<string, number> = {};
    for (const view of filteredViews) {
      let source = "Trực tiếp";
      if (view.referrer) {
        try {
          const url = new URL(view.referrer);
          source = url.hostname.replace("www.", "");
        } catch {
          source = view.referrer;
        }
      }
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    }
    
    const total = filteredViews.length;
    
    return Object.entries(sourceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([source, views]) => ({
        source,
        views,
        percentage: total > 0 ? Math.round((views / total) * 100) : 0,
      }));
  },
});

// Get device stats
export const getDeviceStats = query({
  args: {
    period: v.optional(v.string()),
  },
  returns: v.object({
    devices: v.array(v.object({ device: v.string(), percentage: v.number() })),
    os: v.array(v.object({ os: v.string(), percentage: v.number() })),
    browsers: v.array(v.object({ browser: v.string(), percentage: v.number() })),
  }),
  handler: async (ctx, args) => {
    const period = args.period || "30d";
    const now = Date.now();
    
    const periodMs = {
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "90d": 90 * 24 * 60 * 60 * 1000,
      "1y": 365 * 24 * 60 * 60 * 1000,
    }[period] || 30 * 24 * 60 * 60 * 1000;
    
    const startDate = now - periodMs;
    
    const allPageViews = await ctx.db.query("pageViews").collect();
    const filteredViews = allPageViews.filter(pv => pv._creationTime >= startDate);
    const total = filteredViews.length;
    
    // Count devices
    const deviceCounts: Record<string, number> = {};
    const osCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};
    
    for (const view of filteredViews) {
      const device = view.device || "unknown";
      const os = view.os || "unknown";
      const browser = view.browser || "unknown";
      
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      osCounts[os] = (osCounts[os] || 0) + 1;
      browserCounts[browser] = (browserCounts[browser] || 0) + 1;
    }
    
    const toPercentageArray = (counts: Record<string, number>) =>
      Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, count]) => ({
          [key === Object.keys(counts).find(k => counts[k] === count) ? 'device' : 'item']: key,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }));
    
    return {
      devices: Object.entries(deviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([device, count]) => ({
          device,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        })),
      os: Object.entries(osCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([os, count]) => ({
          os,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        })),
      browsers: Object.entries(browserCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([browser, count]) => ({
          browser,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        })),
    };
  },
});
