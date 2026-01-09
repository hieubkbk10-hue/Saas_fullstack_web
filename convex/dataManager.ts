import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================================
// DATA MANAGER - Quản lý seed và clear data cho hệ thống
// Best practices: Batch processing, async operations, safe deletion
// ============================================================

// === CONSTANTS ===
const MAX_COUNT_LIMIT = 1000; // Max records to count (show "1000+" if exceeded)
const BATCH_DELETE_LIMIT = 500; // Records per delete batch to avoid timeout
const SEED_BATCH_LIMIT = 500; // Records per seed batch

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

// === TABLE CATEGORIES ===
const TABLE_CATEGORIES: Record<string, string> = {
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

const SYSTEM_TABLES = ["adminModules", "moduleFields", "moduleFeatures", "moduleSettings", "systemPresets", "convexDashboard"];

// === SEED DATA CONSTANTS (DRY - Single source of truth) ===
const SEED_MODULES = [
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

const SEED_PRESETS = [
  { key: "blog", name: "Blog / News", description: "Blog với bài viết và bình luận", enabledModules: ["posts", "comments", "media", "customers", "users", "roles", "settings", "menus", "homepage", "analytics"], isDefault: false },
  { key: "landing", name: "Landing Page", description: "Trang giới thiệu đơn giản", enabledModules: ["posts", "media", "users", "roles", "settings", "menus", "homepage"], isDefault: false },
  { key: "catalog", name: "Catalog", description: "Trưng bày sản phẩm không giỏ hàng", enabledModules: ["products", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"], isDefault: false },
  { key: "ecommerce-basic", name: "eCommerce Basic", description: "Shop đơn giản với giỏ hàng", enabledModules: ["products", "orders", "cart", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"], isDefault: false },
  { key: "ecommerce-full", name: "eCommerce Full", description: "Shop đầy đủ tính năng", enabledModules: ["posts", "comments", "media", "products", "orders", "cart", "wishlist", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "promotions", "analytics"], isDefault: true },
];

const SEED_ROLES = [
  { name: "Super Admin", description: "Toàn quyền hệ thống", color: "#ef4444", isSystem: true, isSuperAdmin: true, permissions: { "*": ["*"] } as Record<string, string[]> },
  { name: "Admin", description: "Quản trị viên", color: "#8b5cf6", isSystem: true, permissions: { posts: ["read", "create", "update", "delete"], products: ["read", "create", "update", "delete"], users: ["read"], settings: ["read", "update"] } as Record<string, string[]> },
  { name: "Editor", description: "Biên tập viên nội dung", color: "#3b82f6", isSystem: false, permissions: { posts: ["read", "create", "update"], products: ["read"], comments: ["read", "update", "delete"] } as Record<string, string[]> },
  { name: "Moderator", description: "Kiểm duyệt viên", color: "#22c55e", isSystem: false, permissions: { comments: ["read", "update", "delete"], posts: ["read"] } as Record<string, string[]> },
];

const SEED_POST_CATEGORIES = [
  { name: "Tin tức", slug: "tin-tuc", description: "Tin tức mới nhất", order: 1, active: true },
  { name: "Hướng dẫn", slug: "huong-dan", description: "Các bài hướng dẫn", order: 2, active: true },
  { name: "Khuyến mãi", slug: "khuyen-mai", description: "Thông tin khuyến mãi", order: 3, active: true },
];

const SEED_PRODUCT_CATEGORIES = [
  { name: "Điện thoại", slug: "dien-thoai", description: "Điện thoại di động", order: 1, active: true },
  { name: "Laptop", slug: "laptop", description: "Máy tính xách tay", order: 2, active: true },
  { name: "Phụ kiện", slug: "phu-kien", description: "Phụ kiện công nghệ", order: 3, active: true },
  { name: "Tablet", slug: "tablet", description: "Máy tính bảng", order: 4, active: true },
];

const SEED_CUSTOMERS = [
  { name: "Trần Văn A", email: "trana@gmail.com", phone: "0901111111", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tranvana", status: "Active" as const, ordersCount: 5, totalSpent: 15000000, city: "Hồ Chí Minh" },
  { name: "Nguyễn Thị B", email: "nguyenb@gmail.com", phone: "0902222222", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nguyenthib", status: "Active" as const, ordersCount: 3, totalSpent: 8500000, city: "Hà Nội" },
  { name: "Lê Văn C", email: "lec@gmail.com", phone: "0903333333", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=levanc", status: "Inactive" as const, ordersCount: 1, totalSpent: 2000000, city: "Đà Nẵng" },
];

const SEED_SETTINGS = [
  // Site settings (key prefix: site_)
  { key: "site_name", value: "VietAdmin Shop", group: "site" },
  { key: "site_description", value: "Hệ thống quản trị website chuyên nghiệp", group: "site" },
  { key: "site_brand_color", value: "#3b82f6", group: "site" },
  { key: "site_timezone", value: "Asia/Ho_Chi_Minh", group: "site" },
  { key: "site_language", value: "vi", group: "site" },
  // Contact settings (key prefix: contact_)
  { key: "contact_email", value: "contact@vietadmin.com", group: "contact" },
  { key: "contact_phone", value: "1900 1234", group: "contact" },
  { key: "contact_address", value: "123 Nguyễn Huệ, Q.1, TP.HCM", group: "contact" },
  // SEO settings (key prefix: seo_)
  { key: "seo_title", value: "VietAdmin - Hệ thống quản trị chuyên nghiệp", group: "seo" },
  { key: "seo_description", value: "VietAdmin cung cấp giải pháp quản trị website toàn diện", group: "seo" },
];

// ============================================================
// QUERIES - Đếm số lượng records trong các bảng
// ============================================================

export const getTableStats = query({
  args: {},
  returns: v.array(v.object({
    table: v.string(),
    count: v.number(),
    category: v.string(),
    isApproximate: v.boolean(),
  })),
  handler: async (ctx) => {
    const results = await Promise.all(
      ALL_TABLES.map(async (table) => {
        const records = await ctx.db.query(table as TableName).take(MAX_COUNT_LIMIT);
        return {
          table,
          count: records.length,
          category: TABLE_CATEGORIES[table] || "other",
          isApproximate: records.length === MAX_COUNT_LIMIT,
        };
      })
    );
    
    return results;
  },
});

// ============================================================
// CLEAR FUNCTIONS - Xóa data theo bảng hoặc category
// ============================================================

export const clearTable = mutation({
  args: { table: v.string() },
  returns: v.object({ deleted: v.number(), hasMore: v.boolean() }),
  handler: async (ctx, args) => {
    const tableName = args.table as TableName;
    if (!ALL_TABLES.includes(tableName)) {
      throw new Error(`Invalid table: ${args.table}`);
    }
    
    const records = await ctx.db.query(tableName).take(BATCH_DELETE_LIMIT);
    await Promise.all(records.map(record => ctx.db.delete(record._id)));
    
    const remaining = await ctx.db.query(tableName).first();
    return { deleted: records.length, hasMore: remaining !== null };
  },
});

export const clearAllData = mutation({
  args: { 
    excludeSystem: v.optional(v.boolean()),
  },
  returns: v.object({ 
    totalDeleted: v.number(),
    tables: v.array(v.object({ table: v.string(), deleted: v.number() })),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const tablesToClear = args.excludeSystem 
      ? ALL_TABLES.filter(t => !SYSTEM_TABLES.includes(t))
      : [...ALL_TABLES];
    
    const results: { table: string; deleted: number }[] = [];
    let totalDeleted = 0;
    let totalBatchSize = 0;
    
    for (const table of tablesToClear) {
      if (totalBatchSize >= BATCH_DELETE_LIMIT) break;
      
      const batchLimit = Math.min(BATCH_DELETE_LIMIT, BATCH_DELETE_LIMIT - totalBatchSize);
      const records = await ctx.db.query(table as TableName).take(batchLimit);
      
      await Promise.all(records.map(record => ctx.db.delete(record._id)));
      
      if (records.length > 0) {
        results.push({ table, deleted: records.length });
        totalDeleted += records.length;
        totalBatchSize += records.length;
      }
    }
    
    let hasMore = false;
    for (const table of tablesToClear) {
      const remaining = await ctx.db.query(table as TableName).first();
      if (remaining) {
        hasMore = true;
        break;
      }
    }
    
    return { totalDeleted, tables: results, hasMore };
  },
});

// ============================================================
// SEED FUNCTIONS - Tạo data mẫu (DRY - Use constants)
// ============================================================

// Helper: Batch delete with limit to avoid timeout
async function batchDelete(
  ctx: { db: { query: (table: string) => { take: (n: number) => Promise<{ _id: string }[]> }; delete: (id: string) => Promise<void> } },
  table: string,
  limit = SEED_BATCH_LIMIT
): Promise<boolean> {
  const records = await ctx.db.query(table).take(limit) as { _id: string }[];
  await Promise.all(records.map(r => ctx.db.delete(r._id)));
  return records.length === limit;
}

export const seedSystemData = mutation({
  args: { force: v.optional(v.boolean()) },
  returns: v.object({ seeded: v.array(v.string()) }),
  handler: async (ctx, args) => {
    const seeded: string[] = [];
    const force = args.force ?? false;
    
    const existingModules = await ctx.db.query("adminModules").first();
    if (!existingModules || force) {
      if (force && existingModules) await batchDelete(ctx as never, "adminModules");
      await Promise.all(SEED_MODULES.map(mod => ctx.db.insert("adminModules", mod)));
      seeded.push("adminModules");
    }
    
    const existingPresets = await ctx.db.query("systemPresets").first();
    if (!existingPresets || force) {
      if (force && existingPresets) await batchDelete(ctx as never, "systemPresets");
      await Promise.all(SEED_PRESETS.map(preset => ctx.db.insert("systemPresets", preset)));
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
    const force = args.force ?? false;
    
    const existingRoles = await ctx.db.query("roles").first();
    if (!existingRoles || force) {
      if (force && existingRoles) await batchDelete(ctx as never, "roles");
      await Promise.all(SEED_ROLES.map(role => ctx.db.insert("roles", role)));
      seeded.push("roles");
    }
    
    const existingUsers = await ctx.db.query("users").first();
    if (!existingUsers || force) {
      if (force && existingUsers) await batchDelete(ctx as never, "users");
      
      const adminRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Super Admin")).first();
      const editorRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Editor")).first();
      
      if (adminRole && editorRole) {
        const users = [
          { name: "Admin User", email: "admin@vietadmin.com", phone: "0901234567", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=adminuser", roleId: adminRole._id, status: "Active" as const, lastLogin: Date.now() },
          { name: "Nguyễn Văn Editor", email: "editor@vietadmin.com", phone: "0912345678", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nguyenvaneditor", roleId: editorRole._id, status: "Active" as const, lastLogin: Date.now() - 86400000 },
        ];
        await Promise.all(users.map(user => ctx.db.insert("users", user)));
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
    const force = args.force ?? false;
    
    const existingPostCats = await ctx.db.query("postCategories").first();
    if (!existingPostCats || force) {
      if (force && existingPostCats) await batchDelete(ctx as never, "postCategories");
      await Promise.all(SEED_POST_CATEGORIES.map(cat => ctx.db.insert("postCategories", cat)));
      seeded.push("postCategories");
    }
    
    const existingProdCats = await ctx.db.query("productCategories").first();
    if (!existingProdCats || force) {
      if (force && existingProdCats) await batchDelete(ctx as never, "productCategories");
      await Promise.all(SEED_PRODUCT_CATEGORIES.map(cat => ctx.db.insert("productCategories", cat)));
      seeded.push("productCategories");
    }
    
    const existingCustomers = await ctx.db.query("customers").first();
    if (!existingCustomers || force) {
      if (force && existingCustomers) await batchDelete(ctx as never, "customers");
      await Promise.all(SEED_CUSTOMERS.map(customer => ctx.db.insert("customers", customer)));
      seeded.push("customers");
    }
    
    const existingSettings = await ctx.db.query("settings").first();
    if (!existingSettings || force) {
      if (force && existingSettings) await batchDelete(ctx as never, "settings");
      await Promise.all(SEED_SETTINGS.map(setting => ctx.db.insert("settings", setting)));
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
    const force = args.force ?? false;
    
    // 1. Admin Modules
    const existingModules = await ctx.db.query("adminModules").first();
    if (!existingModules || force) {
      if (force && existingModules) await batchDelete(ctx as never, "adminModules");
      await Promise.all(SEED_MODULES.map(mod => ctx.db.insert("adminModules", mod)));
      allSeeded.push("adminModules");
    }
    
    // 2. System Presets
    const existingPresets = await ctx.db.query("systemPresets").first();
    if (!existingPresets || force) {
      if (force && existingPresets) await batchDelete(ctx as never, "systemPresets");
      await Promise.all(SEED_PRESETS.map(preset => ctx.db.insert("systemPresets", preset)));
      allSeeded.push("systemPresets");
    }
    
    // 3. Roles
    const existingRoles = await ctx.db.query("roles").first();
    if (!existingRoles || force) {
      if (force && existingRoles) await batchDelete(ctx as never, "roles");
      await Promise.all(SEED_ROLES.map(role => ctx.db.insert("roles", role)));
      allSeeded.push("roles");
    }
    
    // 4. Users (depends on roles)
    const existingUsers = await ctx.db.query("users").first();
    if (!existingUsers || force) {
      if (force && existingUsers) await batchDelete(ctx as never, "users");
      
      const adminRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Super Admin")).first();
      const editorRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Editor")).first();
      
      if (adminRole && editorRole) {
        const users = [
          { name: "Admin User", email: "admin@vietadmin.com", phone: "0901234567", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=adminuser", roleId: adminRole._id, status: "Active" as const, lastLogin: Date.now() },
          { name: "Nguyễn Văn Editor", email: "editor@vietadmin.com", phone: "0912345678", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nguyenvaneditor", roleId: editorRole._id, status: "Active" as const, lastLogin: Date.now() - 86400000 },
        ];
        await Promise.all(users.map(user => ctx.db.insert("users", user)));
        allSeeded.push("users");
      }
    }
    
    // 5. Post Categories
    const existingPostCats = await ctx.db.query("postCategories").first();
    if (!existingPostCats || force) {
      if (force && existingPostCats) await batchDelete(ctx as never, "postCategories");
      await Promise.all(SEED_POST_CATEGORIES.map(cat => ctx.db.insert("postCategories", cat)));
      allSeeded.push("postCategories");
    }
    
    // 6. Product Categories
    const existingProdCats = await ctx.db.query("productCategories").first();
    if (!existingProdCats || force) {
      if (force && existingProdCats) await batchDelete(ctx as never, "productCategories");
      await Promise.all(SEED_PRODUCT_CATEGORIES.map(cat => ctx.db.insert("productCategories", cat)));
      allSeeded.push("productCategories");
    }
    
    // 7. Customers
    const existingCustomers = await ctx.db.query("customers").first();
    if (!existingCustomers || force) {
      if (force && existingCustomers) await batchDelete(ctx as never, "customers");
      await Promise.all(SEED_CUSTOMERS.map(customer => ctx.db.insert("customers", customer)));
      allSeeded.push("customers");
    }
    
    // 8. Settings
    const existingSettings = await ctx.db.query("settings").first();
    if (!existingSettings || force) {
      if (force && existingSettings) await batchDelete(ctx as never, "settings");
      await Promise.all(SEED_SETTINGS.map(setting => ctx.db.insert("settings", setting)));
      allSeeded.push("settings");
    }
    
    return { 
      seeded: allSeeded,
      message: allSeeded.length > 0 ? `Đã seed ${allSeeded.length} bảng` : "Tất cả dữ liệu đã tồn tại"
    };
  },
});
