import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================
// DATA MANAGER - Quản lý seed và clear data cho hệ thống
// Best practices: Batch processing, async operations, safe deletion
// ============================================================

// Danh sách các bảng trong hệ thống
const ALL_TABLES = [
  "adminModules",
  "moduleFields", 
  "moduleFeatures",
  "moduleSettings",
  "systemPresets",
  "convexDashboard",
  "users",
  "roles",
  "customers",
  "productCategories",
  "products",
  "postCategories",
  "posts",
  "comments",
  "images",
  "menus",
  "menuItems",
  "homeComponents",
  "settings",
  "activityLogs",
] as const;

type TableName = typeof ALL_TABLES[number];

// ============================================================
// QUERIES - Đếm số lượng records trong các bảng
// ============================================================

export const getTableStats = query({
  args: {},
  returns: v.array(v.object({
    table: v.string(),
    count: v.number(),
    category: v.string(),
  })),
  handler: async (ctx) => {
    const stats: { table: string; count: number; category: string }[] = [];
    
    const tableCategories: Record<string, string> = {
      adminModules: "system",
      moduleFields: "system",
      moduleFeatures: "system",
      moduleSettings: "system",
      systemPresets: "system",
      convexDashboard: "system",
      users: "user",
      roles: "user",
      customers: "user",
      productCategories: "commerce",
      products: "commerce",
      postCategories: "content",
      posts: "content",
      comments: "content",
      images: "media",
      menus: "website",
      menuItems: "website",
      homeComponents: "website",
      settings: "config",
      activityLogs: "logs",
    };
    
    for (const table of ALL_TABLES) {
      const records = await ctx.db.query(table as TableName).collect();
      stats.push({
        table,
        count: records.length,
        category: tableCategories[table] || "other",
      });
    }
    
    return stats;
  },
});

// ============================================================
// CLEAR FUNCTIONS - Xóa data theo bảng hoặc category
// ============================================================

export const clearTable = mutation({
  args: { table: v.string() },
  returns: v.object({ deleted: v.number() }),
  handler: async (ctx, args) => {
    const tableName = args.table as TableName;
    if (!ALL_TABLES.includes(tableName)) {
      throw new Error(`Invalid table: ${args.table}`);
    }
    
    const records = await ctx.db.query(tableName).collect();
    let deleted = 0;
    
    // Batch delete để tránh timeout
    for (const record of records) {
      await ctx.db.delete(record._id);
      deleted++;
    }
    
    return { deleted };
  },
});

export const clearAllData = mutation({
  args: { 
    excludeSystem: v.optional(v.boolean()),
  },
  returns: v.object({ 
    totalDeleted: v.number(),
    tables: v.array(v.object({ table: v.string(), deleted: v.number() })),
  }),
  handler: async (ctx, args) => {
    const systemTables = ["adminModules", "moduleFields", "moduleFeatures", "moduleSettings", "systemPresets", "convexDashboard"];
    const tablesToClear = args.excludeSystem 
      ? ALL_TABLES.filter(t => !systemTables.includes(t))
      : [...ALL_TABLES];
    
    const results: { table: string; deleted: number }[] = [];
    let totalDeleted = 0;
    
    for (const table of tablesToClear) {
      const records = await ctx.db.query(table as TableName).collect();
      for (const record of records) {
        await ctx.db.delete(record._id);
      }
      results.push({ table, deleted: records.length });
      totalDeleted += records.length;
    }
    
    return { totalDeleted, tables: results };
  },
});

// ============================================================
// SEED FUNCTIONS - Tạo data mẫu
// ============================================================

export const seedSystemData = mutation({
  args: { force: v.optional(v.boolean()) },
  returns: v.object({ seeded: v.array(v.string()) }),
  handler: async (ctx, args) => {
    const seeded: string[] = [];
    
    // Seed Admin Modules
    const existingModules = await ctx.db.query("adminModules").first();
    if (!existingModules || args.force) {
      if (args.force && existingModules) {
        const allModules = await ctx.db.query("adminModules").collect();
        for (const m of allModules) await ctx.db.delete(m._id);
      }
      
      const modules = [
        { key: "posts", name: "Bài viết & Danh mục", description: "Quản lý bài viết, tin tức, blog", icon: "FileText", category: "content" as const, enabled: true, isCore: false, order: 1 },
        { key: "comments", name: "Bình luận", description: "Bình luận cho bài viết và sản phẩm", icon: "MessageSquare", category: "content" as const, enabled: true, isCore: false, dependencies: ["posts", "products"], dependencyType: "any" as const, order: 2 },
        { key: "media", name: "Thư viện Media", description: "Quản lý hình ảnh, video, tài liệu", icon: "Image", category: "content" as const, enabled: true, isCore: false, order: 3 },
        { key: "products", name: "Sản phẩm & Danh mục", description: "Quản lý sản phẩm, kho hàng", icon: "Package", category: "commerce" as const, enabled: true, isCore: false, order: 4 },
        { key: "orders", name: "Đơn hàng", description: "Quản lý đơn hàng, vận chuyển", icon: "ShoppingBag", category: "commerce" as const, enabled: true, isCore: false, dependencies: ["products", "customers"], dependencyType: "all" as const, order: 5 },
        { key: "cart", name: "Giỏ hàng", description: "Chức năng giỏ hàng", icon: "ShoppingCart", category: "commerce" as const, enabled: true, isCore: false, dependencies: ["products"], dependencyType: "all" as const, order: 6 },
        { key: "wishlist", name: "Sản phẩm yêu thích", description: "Wishlist của khách", icon: "Heart", category: "commerce" as const, enabled: false, isCore: false, dependencies: ["products"], dependencyType: "all" as const, order: 7 },
        { key: "customers", name: "Khách hàng", description: "Quản lý thông tin khách hàng", icon: "Users", category: "user" as const, enabled: true, isCore: true, order: 8 },
        { key: "users", name: "Người dùng Admin", description: "Quản lý tài khoản admin", icon: "UserCog", category: "user" as const, enabled: true, isCore: true, order: 9 },
        { key: "roles", name: "Vai trò & Quyền", description: "Phân quyền và quản lý vai trò", icon: "Shield", category: "user" as const, enabled: true, isCore: true, order: 10 },
        { key: "settings", name: "Cài đặt hệ thống", description: "Cấu hình website", icon: "Settings", category: "system" as const, enabled: true, isCore: true, order: 11 },
        { key: "menus", name: "Menu điều hướng", description: "Quản lý menu header, footer", icon: "Menu", category: "system" as const, enabled: true, isCore: false, order: 12 },
        { key: "homepage", name: "Trang chủ", description: "Cấu hình components trang chủ", icon: "LayoutGrid", category: "system" as const, enabled: true, isCore: false, order: 13 },
        { key: "notifications", name: "Thông báo", description: "Gửi thông báo cho người dùng", icon: "Bell", category: "marketing" as const, enabled: true, isCore: false, order: 14 },
        { key: "promotions", name: "Khuyến mãi", description: "Quản lý mã giảm giá, voucher", icon: "Megaphone", category: "marketing" as const, enabled: false, isCore: false, dependencies: ["products", "orders"], dependencyType: "all" as const, order: 15 },
        { key: "analytics", name: "Thống kê", description: "Báo cáo và phân tích dữ liệu", icon: "BarChart3", category: "marketing" as const, enabled: true, isCore: false, order: 16 },
      ];
      
      for (const mod of modules) {
        await ctx.db.insert("adminModules", mod);
      }
      seeded.push("adminModules");
    }
    
    // Seed System Presets
    const existingPresets = await ctx.db.query("systemPresets").first();
    if (!existingPresets || args.force) {
      if (args.force && existingPresets) {
        const allPresets = await ctx.db.query("systemPresets").collect();
        for (const p of allPresets) await ctx.db.delete(p._id);
      }
      
      const presets = [
        { key: "blog", name: "Blog / News", description: "Blog với bài viết và bình luận", enabledModules: ["posts", "comments", "media", "customers", "users", "roles", "settings", "menus", "homepage", "analytics"], isDefault: false },
        { key: "landing", name: "Landing Page", description: "Trang giới thiệu đơn giản", enabledModules: ["posts", "media", "users", "roles", "settings", "menus", "homepage"], isDefault: false },
        { key: "catalog", name: "Catalog", description: "Trưng bày sản phẩm không giỏ hàng", enabledModules: ["products", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"], isDefault: false },
        { key: "ecommerce-basic", name: "eCommerce Basic", description: "Shop đơn giản với giỏ hàng", enabledModules: ["products", "orders", "cart", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"], isDefault: false },
        { key: "ecommerce-full", name: "eCommerce Full", description: "Shop đầy đủ tính năng", enabledModules: ["posts", "comments", "media", "products", "orders", "cart", "wishlist", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "promotions", "analytics"], isDefault: true },
      ];
      
      for (const preset of presets) {
        await ctx.db.insert("systemPresets", preset);
      }
      seeded.push("systemPresets");
    }
    
    return { seeded };
  },
});

export const seedRolesAndUsers = mutation({
  args: { force: v.optional(v.boolean()) },
  returns: v.object({ seeded: v.array(v.string()) }),
  handler: async (ctx, args) => {
    const seeded: string[] = [];
    
    // Seed Roles
    const existingRoles = await ctx.db.query("roles").first();
    if (!existingRoles || args.force) {
      if (args.force && existingRoles) {
        const allRoles = await ctx.db.query("roles").collect();
        for (const r of allRoles) await ctx.db.delete(r._id);
      }
      
      await ctx.db.insert("roles", { name: "Super Admin", description: "Toàn quyền hệ thống", color: "#ef4444", isSystem: true, isSuperAdmin: true, permissions: { "*": ["*"] } as Record<string, string[]> });
      await ctx.db.insert("roles", { name: "Admin", description: "Quản trị viên", color: "#8b5cf6", isSystem: true, permissions: { posts: ["read", "create", "update", "delete"], products: ["read", "create", "update", "delete"], users: ["read"], settings: ["read", "update"] } as Record<string, string[]> });
      await ctx.db.insert("roles", { name: "Editor", description: "Biên tập viên nội dung", color: "#3b82f6", isSystem: false, permissions: { posts: ["read", "create", "update"], products: ["read"], comments: ["read", "update", "delete"] } as Record<string, string[]> });
      await ctx.db.insert("roles", { name: "Moderator", description: "Kiểm duyệt viên", color: "#22c55e", isSystem: false, permissions: { comments: ["read", "update", "delete"], posts: ["read"] } as Record<string, string[]> });
      seeded.push("roles");
    }
    
    // Seed Users
    const existingUsers = await ctx.db.query("users").first();
    if (!existingUsers || args.force) {
      if (args.force && existingUsers) {
        const allUsers = await ctx.db.query("users").collect();
        for (const u of allUsers) await ctx.db.delete(u._id);
      }
      
      const adminRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Super Admin")).first();
      const editorRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Editor")).first();
      
      if (adminRole && editorRole) {
        const users = [
          { name: "Admin User", email: "admin@vietadmin.com", phone: "0901234567", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=adminuser", roleId: adminRole._id, status: "Active" as const, lastLogin: Date.now() },
          { name: "Nguyễn Văn Editor", email: "editor@vietadmin.com", phone: "0912345678", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nguyenvaneditor", roleId: editorRole._id, status: "Active" as const, lastLogin: Date.now() - 86400000 },
        ];
        
        for (const user of users) {
          await ctx.db.insert("users", user);
        }
        seeded.push("users");
      }
    }
    
    return { seeded };
  },
});

export const seedSampleContent = mutation({
  args: { force: v.optional(v.boolean()) },
  returns: v.object({ seeded: v.array(v.string()) }),
  handler: async (ctx, args) => {
    const seeded: string[] = [];
    
    // Seed Post Categories
    const existingPostCats = await ctx.db.query("postCategories").first();
    if (!existingPostCats || args.force) {
      if (args.force && existingPostCats) {
        const all = await ctx.db.query("postCategories").collect();
        for (const item of all) await ctx.db.delete(item._id);
      }
      
      const categories = [
        { name: "Tin tức", slug: "tin-tuc", description: "Tin tức mới nhất", order: 1, active: true },
        { name: "Hướng dẫn", slug: "huong-dan", description: "Các bài hướng dẫn", order: 2, active: true },
        { name: "Khuyến mãi", slug: "khuyen-mai", description: "Thông tin khuyến mãi", order: 3, active: true },
      ];
      
      for (const cat of categories) {
        await ctx.db.insert("postCategories", cat);
      }
      seeded.push("postCategories");
    }
    
    // Seed Product Categories
    const existingProdCats = await ctx.db.query("productCategories").first();
    if (!existingProdCats || args.force) {
      if (args.force && existingProdCats) {
        const all = await ctx.db.query("productCategories").collect();
        for (const item of all) await ctx.db.delete(item._id);
      }
      
      const categories = [
        { name: "Điện thoại", slug: "dien-thoai", description: "Điện thoại di động", order: 1, active: true },
        { name: "Laptop", slug: "laptop", description: "Máy tính xách tay", order: 2, active: true },
        { name: "Phụ kiện", slug: "phu-kien", description: "Phụ kiện công nghệ", order: 3, active: true },
        { name: "Tablet", slug: "tablet", description: "Máy tính bảng", order: 4, active: true },
      ];
      
      for (const cat of categories) {
        await ctx.db.insert("productCategories", cat);
      }
      seeded.push("productCategories");
    }
    
    // Seed Customers
    const existingCustomers = await ctx.db.query("customers").first();
    if (!existingCustomers || args.force) {
      if (args.force && existingCustomers) {
        const all = await ctx.db.query("customers").collect();
        for (const item of all) await ctx.db.delete(item._id);
      }
      
      const customers = [
        { name: "Trần Văn A", email: "trana@gmail.com", phone: "0901111111", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tranvana", status: "Active" as const, ordersCount: 5, totalSpent: 15000000, city: "Hồ Chí Minh" },
        { name: "Nguyễn Thị B", email: "nguyenb@gmail.com", phone: "0902222222", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nguyenthib", status: "Active" as const, ordersCount: 3, totalSpent: 8500000, city: "Hà Nội" },
        { name: "Lê Văn C", email: "lec@gmail.com", phone: "0903333333", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=levanc", status: "Inactive" as const, ordersCount: 1, totalSpent: 2000000, city: "Đà Nẵng" },
      ];
      
      for (const customer of customers) {
        await ctx.db.insert("customers", customer);
      }
      seeded.push("customers");
    }
    
    // Seed Settings
    const existingSettings = await ctx.db.query("settings").first();
    if (!existingSettings || args.force) {
      if (args.force && existingSettings) {
        const all = await ctx.db.query("settings").collect();
        for (const item of all) await ctx.db.delete(item._id);
      }
      
      const settings = [
        { key: "siteName", value: "VietAdmin Shop", group: "general" },
        { key: "siteDescription", value: "Hệ thống quản trị website chuyên nghiệp", group: "general" },
        { key: "timezone", value: "GMT+07:00", group: "general" },
        { key: "brandColor", value: "#3b82f6", group: "general" },
        { key: "email", value: "contact@vietadmin.com", group: "contact" },
        { key: "hotline", value: "1900 1234", group: "contact" },
        { key: "address", value: "123 Nguyễn Huệ, Q.1, TP.HCM", group: "contact" },
        { key: "metaTitle", value: "VietAdmin - Hệ thống quản trị chuyên nghiệp", group: "seo" },
        { key: "metaDescription", value: "VietAdmin cung cấp giải pháp quản trị website toàn diện", group: "seo" },
      ];
      
      for (const setting of settings) {
        await ctx.db.insert("settings", setting);
      }
      seeded.push("settings");
    }
    
    return { seeded };
  },
});

export const seedAll = mutation({
  args: { force: v.optional(v.boolean()) },
  returns: v.object({ 
    seeded: v.array(v.string()),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const allSeeded: string[] = [];
    
    // 1. Seed System Data
    const existingModules = await ctx.db.query("adminModules").first();
    if (!existingModules || args.force) {
      if (args.force && existingModules) {
        const all = await ctx.db.query("adminModules").collect();
        for (const item of all) await ctx.db.delete(item._id);
      }
      
      const modules = [
        { key: "posts", name: "Bài viết & Danh mục", description: "Quản lý bài viết, tin tức, blog", icon: "FileText", category: "content" as const, enabled: true, isCore: false, order: 1 },
        { key: "comments", name: "Bình luận", description: "Bình luận cho bài viết và sản phẩm", icon: "MessageSquare", category: "content" as const, enabled: true, isCore: false, dependencies: ["posts", "products"], dependencyType: "any" as const, order: 2 },
        { key: "media", name: "Thư viện Media", description: "Quản lý hình ảnh, video, tài liệu", icon: "Image", category: "content" as const, enabled: true, isCore: false, order: 3 },
        { key: "products", name: "Sản phẩm & Danh mục", description: "Quản lý sản phẩm, kho hàng", icon: "Package", category: "commerce" as const, enabled: true, isCore: false, order: 4 },
        { key: "orders", name: "Đơn hàng", description: "Quản lý đơn hàng, vận chuyển", icon: "ShoppingBag", category: "commerce" as const, enabled: true, isCore: false, dependencies: ["products", "customers"], dependencyType: "all" as const, order: 5 },
        { key: "cart", name: "Giỏ hàng", description: "Chức năng giỏ hàng", icon: "ShoppingCart", category: "commerce" as const, enabled: true, isCore: false, dependencies: ["products"], dependencyType: "all" as const, order: 6 },
        { key: "wishlist", name: "Sản phẩm yêu thích", description: "Wishlist của khách", icon: "Heart", category: "commerce" as const, enabled: false, isCore: false, dependencies: ["products"], dependencyType: "all" as const, order: 7 },
        { key: "customers", name: "Khách hàng", description: "Quản lý thông tin khách hàng", icon: "Users", category: "user" as const, enabled: true, isCore: true, order: 8 },
        { key: "users", name: "Người dùng Admin", description: "Quản lý tài khoản admin", icon: "UserCog", category: "user" as const, enabled: true, isCore: true, order: 9 },
        { key: "roles", name: "Vai trò & Quyền", description: "Phân quyền và quản lý vai trò", icon: "Shield", category: "user" as const, enabled: true, isCore: true, order: 10 },
        { key: "settings", name: "Cài đặt hệ thống", description: "Cấu hình website", icon: "Settings", category: "system" as const, enabled: true, isCore: true, order: 11 },
        { key: "menus", name: "Menu điều hướng", description: "Quản lý menu header, footer", icon: "Menu", category: "system" as const, enabled: true, isCore: false, order: 12 },
        { key: "homepage", name: "Trang chủ", description: "Cấu hình components trang chủ", icon: "LayoutGrid", category: "system" as const, enabled: true, isCore: false, order: 13 },
        { key: "notifications", name: "Thông báo", description: "Gửi thông báo cho người dùng", icon: "Bell", category: "marketing" as const, enabled: true, isCore: false, order: 14 },
        { key: "promotions", name: "Khuyến mãi", description: "Quản lý mã giảm giá, voucher", icon: "Megaphone", category: "marketing" as const, enabled: false, isCore: false, dependencies: ["products", "orders"], dependencyType: "all" as const, order: 15 },
        { key: "analytics", name: "Thống kê", description: "Báo cáo và phân tích dữ liệu", icon: "BarChart3", category: "marketing" as const, enabled: true, isCore: false, order: 16 },
      ];
      for (const mod of modules) await ctx.db.insert("adminModules", mod);
      allSeeded.push("adminModules");
    }
    
    // 2. Seed Presets
    const existingPresets = await ctx.db.query("systemPresets").first();
    if (!existingPresets || args.force) {
      if (args.force && existingPresets) {
        const all = await ctx.db.query("systemPresets").collect();
        for (const item of all) await ctx.db.delete(item._id);
      }
      
      const presets = [
        { key: "blog", name: "Blog / News", description: "Blog với bài viết và bình luận", enabledModules: ["posts", "comments", "media", "customers", "users", "roles", "settings", "menus", "homepage", "analytics"], isDefault: false },
        { key: "landing", name: "Landing Page", description: "Trang giới thiệu đơn giản", enabledModules: ["posts", "media", "users", "roles", "settings", "menus", "homepage"], isDefault: false },
        { key: "catalog", name: "Catalog", description: "Trưng bày sản phẩm không giỏ hàng", enabledModules: ["products", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"], isDefault: false },
        { key: "ecommerce-basic", name: "eCommerce Basic", description: "Shop đơn giản với giỏ hàng", enabledModules: ["products", "orders", "cart", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"], isDefault: false },
        { key: "ecommerce-full", name: "eCommerce Full", description: "Shop đầy đủ tính năng", enabledModules: ["posts", "comments", "media", "products", "orders", "cart", "wishlist", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "promotions", "analytics"], isDefault: true },
      ];
      for (const preset of presets) await ctx.db.insert("systemPresets", preset);
      allSeeded.push("systemPresets");
    }
    
    // 3. Seed Roles
    const existingRoles = await ctx.db.query("roles").first();
    if (!existingRoles || args.force) {
      if (args.force && existingRoles) {
        const all = await ctx.db.query("roles").collect();
        for (const item of all) await ctx.db.delete(item._id);
      }
      
      await ctx.db.insert("roles", { name: "Super Admin", description: "Toàn quyền hệ thống", color: "#ef4444", isSystem: true, isSuperAdmin: true, permissions: { "*": ["*"] } as Record<string, string[]> });
      await ctx.db.insert("roles", { name: "Admin", description: "Quản trị viên", color: "#8b5cf6", isSystem: true, permissions: { posts: ["read", "create", "update", "delete"], products: ["read", "create", "update", "delete"], users: ["read"], settings: ["read", "update"] } as Record<string, string[]> });
      await ctx.db.insert("roles", { name: "Editor", description: "Biên tập viên nội dung", color: "#3b82f6", isSystem: false, permissions: { posts: ["read", "create", "update"], products: ["read"], comments: ["read", "update", "delete"] } as Record<string, string[]> });
      await ctx.db.insert("roles", { name: "Moderator", description: "Kiểm duyệt viên", color: "#22c55e", isSystem: false, permissions: { comments: ["read", "update", "delete"], posts: ["read"] } as Record<string, string[]> });
      allSeeded.push("roles");
    }
    
    // 4. Seed Users
    const existingUsers = await ctx.db.query("users").first();
    if (!existingUsers || args.force) {
      if (args.force && existingUsers) {
        const all = await ctx.db.query("users").collect();
        for (const item of all) await ctx.db.delete(item._id);
      }
      
      const adminRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Super Admin")).first();
      const editorRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Editor")).first();
      
      if (adminRole && editorRole) {
        await ctx.db.insert("users", { name: "Admin User", email: "admin@vietadmin.com", phone: "0901234567", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=adminuser", roleId: adminRole._id, status: "Active" as const, lastLogin: Date.now() });
        await ctx.db.insert("users", { name: "Nguyễn Văn Editor", email: "editor@vietadmin.com", phone: "0912345678", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nguyenvaneditor", roleId: editorRole._id, status: "Active" as const, lastLogin: Date.now() - 86400000 });
        allSeeded.push("users");
      }
    }
    
    // 5. Seed Content Categories
    const existingPostCats = await ctx.db.query("postCategories").first();
    if (!existingPostCats || args.force) {
      if (args.force && existingPostCats) {
        const all = await ctx.db.query("postCategories").collect();
        for (const item of all) await ctx.db.delete(item._id);
      }
      
      await ctx.db.insert("postCategories", { name: "Tin tức", slug: "tin-tuc", description: "Tin tức mới nhất", order: 1, active: true });
      await ctx.db.insert("postCategories", { name: "Hướng dẫn", slug: "huong-dan", description: "Các bài hướng dẫn", order: 2, active: true });
      await ctx.db.insert("postCategories", { name: "Khuyến mãi", slug: "khuyen-mai", description: "Thông tin khuyến mãi", order: 3, active: true });
      allSeeded.push("postCategories");
    }
    
    // 6. Seed Product Categories
    const existingProdCats = await ctx.db.query("productCategories").first();
    if (!existingProdCats || args.force) {
      if (args.force && existingProdCats) {
        const all = await ctx.db.query("productCategories").collect();
        for (const item of all) await ctx.db.delete(item._id);
      }
      
      await ctx.db.insert("productCategories", { name: "Điện thoại", slug: "dien-thoai", description: "Điện thoại di động", order: 1, active: true });
      await ctx.db.insert("productCategories", { name: "Laptop", slug: "laptop", description: "Máy tính xách tay", order: 2, active: true });
      await ctx.db.insert("productCategories", { name: "Phụ kiện", slug: "phu-kien", description: "Phụ kiện công nghệ", order: 3, active: true });
      await ctx.db.insert("productCategories", { name: "Tablet", slug: "tablet", description: "Máy tính bảng", order: 4, active: true });
      allSeeded.push("productCategories");
    }
    
    // 7. Seed Customers
    const existingCustomers = await ctx.db.query("customers").first();
    if (!existingCustomers || args.force) {
      if (args.force && existingCustomers) {
        const all = await ctx.db.query("customers").collect();
        for (const item of all) await ctx.db.delete(item._id);
      }
      
      await ctx.db.insert("customers", { name: "Trần Văn A", email: "trana@gmail.com", phone: "0901111111", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tranvana", status: "Active" as const, ordersCount: 5, totalSpent: 15000000, city: "Hồ Chí Minh" });
      await ctx.db.insert("customers", { name: "Nguyễn Thị B", email: "nguyenb@gmail.com", phone: "0902222222", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nguyenthib", status: "Active" as const, ordersCount: 3, totalSpent: 8500000, city: "Hà Nội" });
      await ctx.db.insert("customers", { name: "Lê Văn C", email: "lec@gmail.com", phone: "0903333333", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=levanc", status: "Inactive" as const, ordersCount: 1, totalSpent: 2000000, city: "Đà Nẵng" });
      allSeeded.push("customers");
    }
    
    // 8. Seed Settings
    const existingSettings = await ctx.db.query("settings").first();
    if (!existingSettings || args.force) {
      if (args.force && existingSettings) {
        const all = await ctx.db.query("settings").collect();
        for (const item of all) await ctx.db.delete(item._id);
      }
      
      const settings = [
        { key: "siteName", value: "VietAdmin Shop", group: "general" },
        { key: "siteDescription", value: "Hệ thống quản trị website chuyên nghiệp", group: "general" },
        { key: "timezone", value: "GMT+07:00", group: "general" },
        { key: "brandColor", value: "#3b82f6", group: "general" },
        { key: "email", value: "contact@vietadmin.com", group: "contact" },
        { key: "hotline", value: "1900 1234", group: "contact" },
        { key: "address", value: "123 Nguyễn Huệ, Q.1, TP.HCM", group: "contact" },
        { key: "metaTitle", value: "VietAdmin - Hệ thống quản trị chuyên nghiệp", group: "seo" },
        { key: "metaDescription", value: "VietAdmin cung cấp giải pháp quản trị website toàn diện", group: "seo" },
      ];
      for (const s of settings) await ctx.db.insert("settings", s);
      allSeeded.push("settings");
    }
    
    return { 
      seeded: allSeeded,
      message: allSeeded.length > 0 ? `Đã seed ${allSeeded.length} bảng` : "Tất cả dữ liệu đã tồn tại"
    };
  },
});
