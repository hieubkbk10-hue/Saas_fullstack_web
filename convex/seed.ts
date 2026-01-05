import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedModules = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("adminModules").first();
    if (existing) {
      console.log("Modules already seeded");
      return null;
    }

    const modules = [
      { key: "posts", name: "Bài viết & Danh mục", description: "Quản lý bài viết, tin tức, blog và danh mục bài viết", icon: "FileText", category: "content" as const, enabled: true, isCore: false, order: 1 },
      { key: "comments", name: "Bình luận", description: "Bình luận cho bài viết và đánh giá sản phẩm", icon: "MessageSquare", category: "content" as const, enabled: true, isCore: false, dependencies: ["posts", "products"], dependencyType: "any" as const, order: 2 },
      { key: "media", name: "Thư viện Media", description: "Quản lý hình ảnh, video, tài liệu", icon: "Image", category: "content" as const, enabled: true, isCore: false, order: 3 },
      
      { key: "products", name: "Sản phẩm & Danh mục", description: "Quản lý sản phẩm, danh mục sản phẩm, kho hàng", icon: "Package", category: "commerce" as const, enabled: true, isCore: false, order: 4 },
      { key: "orders", name: "Đơn hàng", description: "Quản lý đơn hàng, vận chuyển", icon: "ShoppingBag", category: "commerce" as const, enabled: true, isCore: false, dependencies: ["products", "customers"], dependencyType: "all" as const, order: 5 },
      { key: "cart", name: "Giỏ hàng", description: "Chức năng giỏ hàng cho khách", icon: "ShoppingCart", category: "commerce" as const, enabled: true, isCore: false, dependencies: ["products"], dependencyType: "all" as const, order: 6 },
      { key: "wishlist", name: "Sản phẩm yêu thích", description: "Danh sách sản phẩm yêu thích của khách", icon: "Heart", category: "commerce" as const, enabled: false, isCore: false, dependencies: ["products"], dependencyType: "all" as const, order: 7 },
      
      { key: "customers", name: "Khách hàng", description: "Quản lý thông tin khách hàng", icon: "Users", category: "user" as const, enabled: true, isCore: true, order: 8 },
      { key: "users", name: "Người dùng Admin", description: "Quản lý tài khoản admin", icon: "UserCog", category: "user" as const, enabled: true, isCore: true, order: 9 },
      { key: "roles", name: "Vai trò & Quyền", description: "Phân quyền và quản lý vai trò", icon: "Shield", category: "user" as const, enabled: true, isCore: true, order: 10 },
      
      { key: "settings", name: "Cài đặt hệ thống", description: "Cấu hình website và hệ thống", icon: "Settings", category: "system" as const, enabled: true, isCore: true, order: 11 },
      { key: "menus", name: "Menu điều hướng", description: "Quản lý menu header, footer", icon: "Menu", category: "system" as const, enabled: true, isCore: false, order: 12 },
      { key: "homepage", name: "Trang chủ", description: "Cấu hình components trang chủ", icon: "LayoutGrid", category: "system" as const, enabled: true, isCore: false, order: 13 },
      
      { key: "notifications", name: "Thông báo", description: "Gửi thông báo cho người dùng", icon: "Bell", category: "marketing" as const, enabled: true, isCore: false, order: 14 },
      { key: "promotions", name: "Khuyến mãi", description: "Quản lý mã giảm giá, voucher", icon: "Megaphone", category: "marketing" as const, enabled: false, isCore: false, dependencies: ["products", "orders"], dependencyType: "all" as const, order: 15 },
      { key: "analytics", name: "Thống kê", description: "Báo cáo và phân tích dữ liệu", icon: "BarChart3", category: "marketing" as const, enabled: true, isCore: false, order: 16 },
    ];

    for (const mod of modules) {
      await ctx.db.insert("adminModules", mod);
    }

    console.log("Seeded", modules.length, "modules");
    return null;
  },
});

export const seedPresets = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("systemPresets").first();
    if (existing) {
      console.log("Presets already seeded");
      return null;
    }

    const presets = [
      {
        key: "blog",
        name: "Blog / News",
        description: "Blog với bài viết và bình luận",
        enabledModules: ["posts", "comments", "media", "customers", "users", "roles", "settings", "menus", "homepage", "analytics"],
        isDefault: false,
      },
      {
        key: "landing",
        name: "Landing Page",
        description: "Trang giới thiệu đơn giản",
        enabledModules: ["posts", "media", "users", "roles", "settings", "menus", "homepage"],
        isDefault: false,
      },
      {
        key: "catalog",
        name: "Catalog",
        description: "Trưng bày sản phẩm không giỏ hàng",
        enabledModules: ["products", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"],
        isDefault: false,
      },
      {
        key: "ecommerce-basic",
        name: "eCommerce Basic",
        description: "Shop đơn giản với giỏ hàng",
        enabledModules: ["products", "orders", "cart", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"],
        isDefault: false,
      },
      {
        key: "ecommerce-full",
        name: "eCommerce Full",
        description: "Shop đầy đủ: giỏ hàng, wishlist, khuyến mãi",
        enabledModules: ["posts", "comments", "media", "products", "orders", "cart", "wishlist", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "promotions", "analytics"],
        isDefault: true,
      },
    ];

    for (const preset of presets) {
      await ctx.db.insert("systemPresets", preset);
    }

    console.log("Seeded", presets.length, "presets");
    return null;
  },
});

export const seedAll = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Seed modules
    const existingModules = await ctx.db.query("adminModules").first();
    if (!existingModules) {
      const modules = [
        { key: "posts", name: "Bài viết & Danh mục", description: "Quản lý bài viết, tin tức, blog và danh mục bài viết", icon: "FileText", category: "content" as const, enabled: true, isCore: false, order: 1 },
        { key: "comments", name: "Bình luận", description: "Bình luận cho bài viết và đánh giá sản phẩm", icon: "MessageSquare", category: "content" as const, enabled: true, isCore: false, dependencies: ["posts", "products"], dependencyType: "any" as const, order: 2 },
        { key: "media", name: "Thư viện Media", description: "Quản lý hình ảnh, video, tài liệu", icon: "Image", category: "content" as const, enabled: true, isCore: false, order: 3 },
        { key: "products", name: "Sản phẩm & Danh mục", description: "Quản lý sản phẩm, danh mục sản phẩm, kho hàng", icon: "Package", category: "commerce" as const, enabled: true, isCore: false, order: 4 },
        { key: "orders", name: "Đơn hàng", description: "Quản lý đơn hàng, vận chuyển", icon: "ShoppingBag", category: "commerce" as const, enabled: true, isCore: false, dependencies: ["products", "customers"], dependencyType: "all" as const, order: 5 },
        { key: "cart", name: "Giỏ hàng", description: "Chức năng giỏ hàng cho khách", icon: "ShoppingCart", category: "commerce" as const, enabled: true, isCore: false, dependencies: ["products"], dependencyType: "all" as const, order: 6 },
        { key: "wishlist", name: "Sản phẩm yêu thích", description: "Danh sách sản phẩm yêu thích của khách", icon: "Heart", category: "commerce" as const, enabled: false, isCore: false, dependencies: ["products"], dependencyType: "all" as const, order: 7 },
        { key: "customers", name: "Khách hàng", description: "Quản lý thông tin khách hàng", icon: "Users", category: "user" as const, enabled: true, isCore: true, order: 8 },
        { key: "users", name: "Người dùng Admin", description: "Quản lý tài khoản admin", icon: "UserCog", category: "user" as const, enabled: true, isCore: true, order: 9 },
        { key: "roles", name: "Vai trò & Quyền", description: "Phân quyền và quản lý vai trò", icon: "Shield", category: "user" as const, enabled: true, isCore: true, order: 10 },
        { key: "settings", name: "Cài đặt hệ thống", description: "Cấu hình website và hệ thống", icon: "Settings", category: "system" as const, enabled: true, isCore: true, order: 11 },
        { key: "menus", name: "Menu điều hướng", description: "Quản lý menu header, footer", icon: "Menu", category: "system" as const, enabled: true, isCore: false, order: 12 },
        { key: "homepage", name: "Trang chủ", description: "Cấu hình components trang chủ", icon: "LayoutGrid", category: "system" as const, enabled: true, isCore: false, order: 13 },
        { key: "notifications", name: "Thông báo", description: "Gửi thông báo cho người dùng", icon: "Bell", category: "marketing" as const, enabled: true, isCore: false, order: 14 },
        { key: "promotions", name: "Khuyến mãi", description: "Quản lý mã giảm giá, voucher", icon: "Megaphone", category: "marketing" as const, enabled: false, isCore: false, dependencies: ["products", "orders"], dependencyType: "all" as const, order: 15 },
        { key: "analytics", name: "Thống kê", description: "Báo cáo và phân tích dữ liệu", icon: "BarChart3", category: "marketing" as const, enabled: true, isCore: false, order: 16 },
      ];
      for (const mod of modules) {
        await ctx.db.insert("adminModules", mod);
      }
    }

    // Seed presets
    const existingPresets = await ctx.db.query("systemPresets").first();
    if (!existingPresets) {
      const presets = [
        { key: "blog", name: "Blog / News", description: "Blog với bài viết và bình luận", enabledModules: ["posts", "comments", "media", "customers", "users", "roles", "settings", "menus", "homepage", "analytics"], isDefault: false },
        { key: "landing", name: "Landing Page", description: "Trang giới thiệu đơn giản", enabledModules: ["posts", "media", "users", "roles", "settings", "menus", "homepage"], isDefault: false },
        { key: "catalog", name: "Catalog", description: "Trưng bày sản phẩm không giỏ hàng", enabledModules: ["products", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"], isDefault: false },
        { key: "ecommerce-basic", name: "eCommerce Basic", description: "Shop đơn giản với giỏ hàng", enabledModules: ["products", "orders", "cart", "media", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "analytics"], isDefault: false },
        { key: "ecommerce-full", name: "eCommerce Full", description: "Shop đầy đủ: giỏ hàng, wishlist, khuyến mãi", enabledModules: ["posts", "comments", "media", "products", "orders", "cart", "wishlist", "customers", "users", "roles", "settings", "menus", "homepage", "notifications", "promotions", "analytics"], isDefault: true },
      ];
      for (const preset of presets) {
        await ctx.db.insert("systemPresets", preset);
      }
    }

    return null;
  },
});
