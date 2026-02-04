import { mutation, query } from "./_generated/server";
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
  activityLogs: "logs",
  adminModules: "system",
  comments: "content",
  convexDashboard: "system",
  customers: "user",
  homeComponents: "website",
  images: "media",
  menuItems: "website",
  menus: "website",
  moduleFeatures: "system",
  moduleFields: "system",
  moduleSettings: "system",
  postCategories: "content",
  posts: "content",
  productCategories: "commerce",
  products: "commerce",
  roles: "user",
  settings: "config",
  systemPresets: "system",
  users: "user",
};

const SYSTEM_TABLES = new Set(["adminModules", "moduleFields", "moduleFeatures", "moduleSettings", "systemPresets", "convexDashboard"]);

// === SEED DATA CONSTANTS (DRY - Single source of truth) ===
const SEED_MODULES = [
  { category: "content" as const, description: "Quản lý bài viết, tin tức, blog", enabled: true, icon: "FileText", isCore: false, key: "posts", name: "Bài viết & Danh mục", order: 1 },
  { category: "content" as const, dependencies: ["posts", "products"], dependencyType: "any" as const, description: "Bình luận cho bài viết và sản phẩm", enabled: true, icon: "MessageSquare", isCore: false, key: "comments", name: "Bình luận", order: 2 },
  { category: "content" as const, description: "Quản lý hình ảnh, video, tài liệu", enabled: true, icon: "Image", isCore: false, key: "media", name: "Thư viện Media", order: 3 },
  { category: "commerce" as const, description: "Quản lý sản phẩm, kho hàng", enabled: true, icon: "Package", isCore: false, key: "products", name: "Sản phẩm & Danh mục", order: 4 },
  { category: "commerce" as const, dependencies: ["products", "customers"], dependencyType: "all" as const, description: "Quản lý đơn hàng, vận chuyển", enabled: true, icon: "ShoppingBag", isCore: false, key: "orders", name: "Đơn hàng", order: 5 },
  { category: "commerce" as const, dependencies: ["products"], dependencyType: "all" as const, description: "Chức năng giỏ hàng", enabled: true, icon: "ShoppingCart", isCore: false, key: "cart", name: "Giỏ hàng", order: 6 },
  { category: "commerce" as const, dependencies: ["products"], dependencyType: "all" as const, description: "Wishlist của khách", enabled: false, icon: "Heart", isCore: false, key: "wishlist", name: "Sản phẩm yêu thích", order: 7 },
  { category: "user" as const, description: "Quản lý thông tin khách hàng", enabled: true, icon: "Users", isCore: true, key: "customers", name: "Khách hàng", order: 8 },
  { category: "user" as const, description: "Quản lý tài khoản admin", enabled: true, icon: "UserCog", isCore: true, key: "users", name: "Người dùng Admin", order: 9 },
  { category: "user" as const, description: "Phân quyền và quản lý vai trò", enabled: true, icon: "Shield", isCore: true, key: "roles", name: "Vai trò & Quyền", order: 10 },
  { category: "system" as const, description: "Cấu hình website", enabled: true, icon: "Settings", isCore: true, key: "settings", name: "Cài đặt hệ thống", order: 11 },
  { category: "system" as const, description: "Quản lý menu header, footer", enabled: true, icon: "Menu", isCore: false, key: "menus", name: "Menu điều hướng", order: 12 },
  { category: "system" as const, description: "Cấu hình components trang chủ", enabled: true, icon: "LayoutGrid", isCore: false, key: "homepage", name: "Trang chủ", order: 13 },
  { category: "marketing" as const, description: "Gửi thông báo cho người dùng", enabled: true, icon: "Bell", isCore: false, key: "notifications", name: "Thông báo", order: 14 },
  { category: "marketing" as const, dependencies: ["products", "orders"], dependencyType: "all" as const, description: "Quản lý mã giảm giá, voucher", enabled: false, icon: "Megaphone", isCore: false, key: "promotions", name: "Khuyến mãi", order: 15 },
  { category: "marketing" as const, description: "Báo cáo và phân tích dữ liệu", enabled: true, icon: "BarChart3", isCore: false, key: "analytics", name: "Thống kê", order: 16 },
];

const SEED_PRESETS = [
  { description: "Blog với bài viết và bình luận", enabledModules: ["posts", "comments", "media", "customers", "users", "roles", "settings", "menus", "homepage", "analytics"], isDefault: false, key: "blog", name: "Blog / News" },
  { description: "Trang giới thiệu đơn giản", enabledModules: ["posts", "media", "users", "roles", "settings", "menus", "homepage"], isDefault: false, key: "landing", name: "Landing Page" },
  { description: "Trưng bày sản phẩm không giỏ hàng", enabledModules: ["products", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"], isDefault: false, key: "catalog", name: "Catalog" },
  { description: "Shop đơn giản với giỏ hàng", enabledModules: ["products", "orders", "cart", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"], isDefault: false, key: "ecommerce-basic", name: "eCommerce Basic" },
  { description: "Shop đầy đủ tính năng", enabledModules: ["posts", "comments", "media", "products", "orders", "cart", "wishlist", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "promotions", "analytics"], isDefault: true, key: "ecommerce-full", name: "eCommerce Full" },
];

const SEED_ROLES = [
  { color: "#ef4444", description: "Toàn quyền hệ thống", isSuperAdmin: true, isSystem: true, name: "Super Admin", permissions: { "*": ["*"] } as Record<string, string[]> },
  { color: "#8b5cf6", description: "Quản trị viên", isSystem: true, name: "Admin", permissions: { posts: ["read", "create", "update", "delete"], products: ["read", "create", "update", "delete"], settings: ["read", "update"], users: ["read"] } as Record<string, string[]> },
  { color: "#3b82f6", description: "Biên tập viên nội dung", isSystem: false, name: "Editor", permissions: { comments: ["read", "update", "delete"], posts: ["read", "create", "update"], products: ["read"] } as Record<string, string[]> },
  { color: "#22c55e", description: "Kiểm duyệt viên", isSystem: false, name: "Moderator", permissions: { comments: ["read", "update", "delete"], posts: ["read"] } as Record<string, string[]> },
];

const SEED_POST_CATEGORIES = [
  { active: true, description: "Tin tức mới nhất", name: "Tin tức", order: 1, slug: "tin-tuc" },
  { active: true, description: "Các bài hướng dẫn", name: "Hướng dẫn", order: 2, slug: "huong-dan" },
  { active: true, description: "Thông tin khuyến mãi", name: "Khuyến mãi", order: 3, slug: "khuyen-mai" },
];

const SEED_PRODUCT_CATEGORIES = [
  { active: true, description: "Điện thoại di động", name: "Điện thoại", order: 1, slug: "dien-thoai" },
  { active: true, description: "Máy tính xách tay", name: "Laptop", order: 2, slug: "laptop" },
  { active: true, description: "Phụ kiện công nghệ", name: "Phụ kiện", order: 3, slug: "phu-kien" },
  { active: true, description: "Máy tính bảng", name: "Tablet", order: 4, slug: "tablet" },
];

const SEED_CUSTOMERS = [
  { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tranvana", city: "Hồ Chí Minh", email: "trana@gmail.com", name: "Trần Văn A", ordersCount: 5, phone: "0901111111", status: "Active" as const, totalSpent: 15_000_000 },
  { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nguyenthib", city: "Hà Nội", email: "nguyenb@gmail.com", name: "Nguyễn Thị B", ordersCount: 3, phone: "0902222222", status: "Active" as const, totalSpent: 8_500_000 },
  { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=levanc", city: "Đà Nẵng", email: "lec@gmail.com", name: "Lê Văn C", ordersCount: 1, phone: "0903333333", status: "Inactive" as const, totalSpent: 2_000_000 },
];

const SEED_SETTINGS = [
  // Site settings (key prefix: site_)
  { group: "site", key: "site_name", value: "VietAdmin Shop" },
  { group: "site", key: "site_description", value: "Hệ thống quản trị website chuyên nghiệp" },
  { group: "site", key: "site_brand_color", value: "#3b82f6" },
  { group: "site", key: "site_timezone", value: "Asia/Ho_Chi_Minh" },
  { group: "site", key: "site_language", value: "vi" },
  // Contact settings (key prefix: contact_)
  { group: "contact", key: "contact_email", value: "contact@vietadmin.com" },
  { group: "contact", key: "contact_phone", value: "1900 1234" },
  { group: "contact", key: "contact_address", value: "123 Nguyễn Huệ, Q.1, TP.HCM" },
  // SEO settings (key prefix: seo_)
  { group: "seo", key: "seo_title", value: "VietAdmin - Hệ thống quản trị chuyên nghiệp" },
  { group: "seo", key: "seo_description", value: "VietAdmin cung cấp giải pháp quản trị website toàn diện" },
  {
    group: "experience",
    key: "product_detail_ui",
    value: {
      layoutStyle: "classic",
      showAddToCart: true,
      showClassicHighlights: true,
      showRating: true,
      showWishlist: true,
      showBuyNow: true,
    },
  },
  {
    group: "experience",
    key: "wishlist_ui",
    value: {
      layoutStyle: "grid",
      showNote: true,
      showNotification: true,
      showWishlistButton: true,
    },
  },
  {
    group: "experience",
    key: "cart_ui",
    value: {
      layoutStyle: "drawer",
      showExpiry: false,
      showNote: false,
    },
  },
  {
    group: "experience",
    key: "checkout_ui",
    value: {
      flowStyle: "multi-step",
      showBuyNow: true,
      layouts: {
        "single-page": {
          orderSummaryPosition: "right",
          showPaymentMethods: true,
          showShippingOptions: true,
        },
        "multi-step": {
          orderSummaryPosition: "right",
          showPaymentMethods: true,
          showShippingOptions: true,
        },
      },
    },
  },
  {
    group: "experience",
    key: "comments_rating_ui",
    value: {
      commentsSortOrder: "newest",
      ratingDisplayStyle: "both",
      showLikes: true,
      showModeration: true,
      showReplies: true,
    },
  },
];

// ============================================================
// QUERIES - Đếm số lượng records trong các bảng
// ============================================================

export const getTableStats = query({
  args: {},
  handler: async (ctx) => {
    const results = await Promise.all(
      ALL_TABLES.map(async (table) => {
        const records = await ctx.db.query(table).take(MAX_COUNT_LIMIT);
        return {
          category: TABLE_CATEGORIES[table] || "other",
          count: records.length,
          isApproximate: records.length === MAX_COUNT_LIMIT,
          table,
        };
      })
    );
    
    return results;
  },
  returns: v.array(v.object({
    category: v.string(),
    count: v.number(),
    isApproximate: v.boolean(),
    table: v.string(),
  })),
});

// ============================================================
// CLEAR FUNCTIONS - Xóa data theo bảng hoặc category
// ============================================================

export const clearTable = mutation({
  args: { table: v.string() },
  handler: async (ctx, args) => {
    const tableName = args.table as TableName;
    if (!ALL_TABLES.includes(tableName)) {
      throw new Error(`Invalid table: ${args.table}`);
    }
    
    const records = await ctx.db.query(tableName).take(BATCH_DELETE_LIMIT);
    await Promise.all(records.map( async record => ctx.db.delete(record._id)));
    
    const remaining = await ctx.db.query(tableName).first();
    return { deleted: records.length, hasMore: remaining !== null };
  },
  returns: v.object({ deleted: v.number(), hasMore: v.boolean() }),
});

export const clearAllData = mutation({
  args: { 
    excludeSystem: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const tablesToClear = args.excludeSystem 
      ? ALL_TABLES.filter(t => !SYSTEM_TABLES.has(t))
      : [...ALL_TABLES];
    
    const results: { table: string; deleted: number }[] = [];
    let totalDeleted = 0;
    let totalBatchSize = 0;
    
    for (const table of tablesToClear) {
      if (totalBatchSize >= BATCH_DELETE_LIMIT) {break;}
      
      const batchLimit = Math.min(BATCH_DELETE_LIMIT, BATCH_DELETE_LIMIT - totalBatchSize);
      const records = await ctx.db.query(table).take(batchLimit);
      
      await Promise.all(records.map( async record => ctx.db.delete(record._id)));
      
      if (records.length > 0) {
        results.push({ deleted: records.length, table });
        totalDeleted += records.length;
        totalBatchSize += records.length;
      }
    }
    
    let hasMore = false;
    for (const table of tablesToClear) {
      const remaining = await ctx.db.query(table).first();
      if (remaining) {
        hasMore = true;
        break;
      }
    }
    
    return { hasMore, tables: results, totalDeleted };
  },
  returns: v.object({ 
    hasMore: v.boolean(),
    tables: v.array(v.object({ deleted: v.number(), table: v.string() })),
    totalDeleted: v.number(),
  }),
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
  await Promise.all(records.map( async r => ctx.db.delete(r._id)));
  return records.length === limit;
}

export const seedSystemData = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const seeded: string[] = [];
    const force = args.force ?? false;
    
    const existingModules = await ctx.db.query("adminModules").first();
    if (!existingModules || force) {
      if (force && existingModules) {await batchDelete(ctx as never, "adminModules");}
      await Promise.all(SEED_MODULES.map( async mod => ctx.db.insert("adminModules", mod)));
      seeded.push("adminModules");
    }
    
    const existingPresets = await ctx.db.query("systemPresets").first();
    if (!existingPresets || force) {
      if (force && existingPresets) {await batchDelete(ctx as never, "systemPresets");}
      await Promise.all(SEED_PRESETS.map( async preset => ctx.db.insert("systemPresets", preset)));
      seeded.push("systemPresets");
    }
    
    return { seeded };
  },
  returns: v.object({ seeded: v.array(v.string()) }),
});

export const seedRolesAndUsers = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const seeded: string[] = [];
    const force = args.force ?? false;
    
    const existingRoles = await ctx.db.query("roles").first();
    if (!existingRoles || force) {
      if (force && existingRoles) {await batchDelete(ctx as never, "roles");}
      await Promise.all(SEED_ROLES.map( async role => ctx.db.insert("roles", role)));
      seeded.push("roles");
    }
    
    const existingUsers = await ctx.db.query("users").first();
    if (!existingUsers || force) {
      if (force && existingUsers) {await batchDelete(ctx as never, "users");}
      
      const adminRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Super Admin")).first();
      const editorRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Editor")).first();
      
      if (adminRole && editorRole) {
        const users = [
          { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=adminuser", email: "admin@vietadmin.com", lastLogin: Date.now(), name: "Admin User", phone: "0901234567", roleId: adminRole._id, status: "Active" as const },
          { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nguyenvaneditor", email: "editor@vietadmin.com", lastLogin: Date.now() - 86_400_000, name: "Nguyễn Văn Editor", phone: "0912345678", roleId: editorRole._id, status: "Active" as const },
        ];
        await Promise.all(users.map( async user => ctx.db.insert("users", user)));
        seeded.push("users");
      }
    }
    
    return { seeded };
  },
  returns: v.object({ seeded: v.array(v.string()) }),
});

export const seedSampleContent = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const seeded: string[] = [];
    const force = args.force ?? false;
    
    const existingPostCats = await ctx.db.query("postCategories").first();
    if (!existingPostCats || force) {
      if (force && existingPostCats) {await batchDelete(ctx as never, "postCategories");}
      await Promise.all(SEED_POST_CATEGORIES.map( async cat => ctx.db.insert("postCategories", cat)));
      seeded.push("postCategories");
    }
    
    const existingProdCats = await ctx.db.query("productCategories").first();
    if (!existingProdCats || force) {
      if (force && existingProdCats) {await batchDelete(ctx as never, "productCategories");}
      await Promise.all(SEED_PRODUCT_CATEGORIES.map( async cat => ctx.db.insert("productCategories", cat)));
      seeded.push("productCategories");
    }
    
    const existingCustomers = await ctx.db.query("customers").first();
    if (!existingCustomers || force) {
      if (force && existingCustomers) {await batchDelete(ctx as never, "customers");}
      await Promise.all(SEED_CUSTOMERS.map( async customer => ctx.db.insert("customers", customer)));
      seeded.push("customers");
    }
    
    const existingSettings = await ctx.db.query("settings").first();
    if (!existingSettings || force) {
      if (force && existingSettings) {await batchDelete(ctx as never, "settings");}
      await Promise.all(SEED_SETTINGS.map( async setting => ctx.db.insert("settings", setting)));
      seeded.push("settings");
    }
    
    return { seeded };
  },
  returns: v.object({ seeded: v.array(v.string()) }),
});

export const seedAll = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const allSeeded: string[] = [];
    const force = args.force ?? false;
    
    // 1. Admin Modules
    const existingModules = await ctx.db.query("adminModules").first();
    if (!existingModules || force) {
      if (force && existingModules) {await batchDelete(ctx as never, "adminModules");}
      await Promise.all(SEED_MODULES.map( async mod => ctx.db.insert("adminModules", mod)));
      allSeeded.push("adminModules");
    }
    
    // 2. System Presets
    const existingPresets = await ctx.db.query("systemPresets").first();
    if (!existingPresets || force) {
      if (force && existingPresets) {await batchDelete(ctx as never, "systemPresets");}
      await Promise.all(SEED_PRESETS.map( async preset => ctx.db.insert("systemPresets", preset)));
      allSeeded.push("systemPresets");
    }
    
    // 3. Roles
    const existingRoles = await ctx.db.query("roles").first();
    if (!existingRoles || force) {
      if (force && existingRoles) {await batchDelete(ctx as never, "roles");}
      await Promise.all(SEED_ROLES.map( async role => ctx.db.insert("roles", role)));
      allSeeded.push("roles");
    }
    
    // 4. Users (depends on roles)
    const existingUsers = await ctx.db.query("users").first();
    if (!existingUsers || force) {
      if (force && existingUsers) {await batchDelete(ctx as never, "users");}
      
      const adminRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Super Admin")).first();
      const editorRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Editor")).first();
      
      if (adminRole && editorRole) {
        const users = [
          { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=adminuser", email: "admin@vietadmin.com", lastLogin: Date.now(), name: "Admin User", phone: "0901234567", roleId: adminRole._id, status: "Active" as const },
          { avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nguyenvaneditor", email: "editor@vietadmin.com", lastLogin: Date.now() - 86_400_000, name: "Nguyễn Văn Editor", phone: "0912345678", roleId: editorRole._id, status: "Active" as const },
        ];
        await Promise.all(users.map( async user => ctx.db.insert("users", user)));
        allSeeded.push("users");
      }
    }
    
    // 5. Post Categories
    const existingPostCats = await ctx.db.query("postCategories").first();
    if (!existingPostCats || force) {
      if (force && existingPostCats) {await batchDelete(ctx as never, "postCategories");}
      await Promise.all(SEED_POST_CATEGORIES.map( async cat => ctx.db.insert("postCategories", cat)));
      allSeeded.push("postCategories");
    }
    
    // 6. Product Categories
    const existingProdCats = await ctx.db.query("productCategories").first();
    if (!existingProdCats || force) {
      if (force && existingProdCats) {await batchDelete(ctx as never, "productCategories");}
      await Promise.all(SEED_PRODUCT_CATEGORIES.map( async cat => ctx.db.insert("productCategories", cat)));
      allSeeded.push("productCategories");
    }
    
    // 7. Customers
    const existingCustomers = await ctx.db.query("customers").first();
    if (!existingCustomers || force) {
      if (force && existingCustomers) {await batchDelete(ctx as never, "customers");}
      await Promise.all(SEED_CUSTOMERS.map( async customer => ctx.db.insert("customers", customer)));
      allSeeded.push("customers");
    }
    
    // 8. Settings
    const existingSettings = await ctx.db.query("settings").first();
    if (!existingSettings || force) {
      if (force && existingSettings) {await batchDelete(ctx as never, "settings");}
      await Promise.all(SEED_SETTINGS.map( async setting => ctx.db.insert("settings", setting)));
      allSeeded.push("settings");
    }
    
    return { 
      message: allSeeded.length > 0 ? `Đã seed ${allSeeded.length} bảng` : "Tất cả dữ liệu đã tồn tại",
      seeded: allSeeded
    };
  },
  returns: v.object({ 
    message: v.string(),
    seeded: v.array(v.string()),
  }),
});
