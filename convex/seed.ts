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

export const seedAnalyticsFeatures = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("moduleFeatures")
      .withIndex("by_module", (q) => q.eq("moduleKey", "analytics"))
      .first();
    if (existing) return null;

    const features = [
      { moduleKey: "analytics", featureKey: "enableSales", name: "Báo cáo doanh thu", description: "Thống kê đơn hàng, doanh thu", enabled: true },
      { moduleKey: "analytics", featureKey: "enableCustomers", name: "Báo cáo khách hàng", description: "Khách mới, khách quay lại", enabled: true },
      { moduleKey: "analytics", featureKey: "enableProducts", name: "Báo cáo sản phẩm", description: "SP bán chạy, tồn kho", enabled: true },
      { moduleKey: "analytics", featureKey: "enableTraffic", name: "Báo cáo lượt truy cập", description: "Pageviews, sessions", enabled: false },
    ];

    for (const feature of features) {
      await ctx.db.insert("moduleFeatures", feature);
    }

    // Seed default settings
    await ctx.db.insert("moduleSettings", { moduleKey: "analytics", settingKey: "defaultPeriod", value: "30d" });
    await ctx.db.insert("moduleSettings", { moduleKey: "analytics", settingKey: "autoRefresh", value: true });

    return null;
  },
});

// Seed Posts module: categories, posts, features, fields, settings
export const seedPostsModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed roles if not exist (needed for authorId)
    let adminRoleId = (await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Admin")).first())?._id;
    if (!adminRoleId) {
      adminRoleId = await ctx.db.insert("roles", {
        name: "Admin",
        description: "Quản trị viên hệ thống",
        color: "#3b82f6",
        isSystem: true,
        isSuperAdmin: true,
        permissions: { "*": ["*"] },
      });
    }

    // 2. Seed users if not exist
    let adminUserId = (await ctx.db.query("users").withIndex("by_email", q => q.eq("email", "admin@example.com")).first())?._id;
    if (!adminUserId) {
      adminUserId = await ctx.db.insert("users", {
        name: "Admin User",
        email: "admin@example.com",
        roleId: adminRoleId,
        status: "Active",
      });
    }

    // 3. Seed post categories
    const existingCategories = await ctx.db.query("postCategories").first();
    if (!existingCategories) {
      const categories = [
        { name: "Tin tức", slug: "tin-tuc", description: "Tin tức mới nhất", order: 0, active: true },
        { name: "Hướng dẫn", slug: "huong-dan", description: "Các bài hướng dẫn chi tiết", order: 1, active: true },
        { name: "Khuyến mãi", slug: "khuyen-mai", description: "Thông tin khuyến mãi", order: 2, active: true },
        { name: "Sự kiện", slug: "su-kien", description: "Các sự kiện sắp diễn ra", order: 3, active: true },
        { name: "Công nghệ", slug: "cong-nghe", description: "Tin công nghệ", order: 4, active: false },
      ];
      for (const cat of categories) {
        await ctx.db.insert("postCategories", cat);
      }
    }

    // 4. Seed posts
    const existingPosts = await ctx.db.query("posts").first();
    if (!existingPosts) {
      const tinTucCat = await ctx.db.query("postCategories").withIndex("by_slug", q => q.eq("slug", "tin-tuc")).first();
      const huongDanCat = await ctx.db.query("postCategories").withIndex("by_slug", q => q.eq("slug", "huong-dan")).first();
      const khuyenMaiCat = await ctx.db.query("postCategories").withIndex("by_slug", q => q.eq("slug", "khuyen-mai")).first();
      
      if (tinTucCat && huongDanCat && khuyenMaiCat) {
        const posts = [
          { title: "Ra mắt sản phẩm mới tháng 1/2025", slug: "ra-mat-san-pham-moi-thang-1-2025", content: "<p>Chúng tôi vui mừng giới thiệu dòng sản phẩm mới nhất với nhiều tính năng đột phá...</p>", excerpt: "Khám phá dòng sản phẩm mới với công nghệ tiên tiến", thumbnail: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", categoryId: tinTucCat._id, authorId: adminUserId, status: "Published" as const, views: 1250, publishedAt: Date.now() - 86400000, order: 0 },
          { title: "Hướng dẫn sử dụng ứng dụng di động", slug: "huong-dan-su-dung-ung-dung-di-dong", content: "<p>Bài viết này sẽ hướng dẫn bạn từng bước cách sử dụng ứng dụng di động của chúng tôi...</p>", excerpt: "Hướng dẫn chi tiết từ A-Z", thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400", categoryId: huongDanCat._id, authorId: adminUserId, status: "Published" as const, views: 890, publishedAt: Date.now() - 172800000, order: 1 },
          { title: "Giảm giá 50% nhân dịp năm mới", slug: "giam-gia-50-nhan-dip-nam-moi", content: "<p>Chương trình khuyến mãi đặc biệt giảm giá lên đến 50% cho tất cả sản phẩm...</p>", excerpt: "Ưu đãi khủng mừng năm mới 2025", thumbnail: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400", categoryId: khuyenMaiCat._id, authorId: adminUserId, status: "Published" as const, views: 2100, publishedAt: Date.now() - 259200000, order: 2 },
          { title: "Cập nhật chính sách bảo hành mới", slug: "cap-nhat-chinh-sach-bao-hanh-moi", content: "<p>Chính sách bảo hành mới sẽ có hiệu lực từ ngày 01/02/2025 với nhiều cải tiến...</p>", excerpt: "Thông tin chính sách bảo hành", thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400", categoryId: tinTucCat._id, authorId: adminUserId, status: "Draft" as const, views: 0, order: 3 },
          { title: "Hướng dẫn thanh toán online", slug: "huong-dan-thanh-toan-online", content: "<p>Các phương thức thanh toán online được hỗ trợ và hướng dẫn chi tiết...</p>", excerpt: "Thanh toán nhanh chóng, an toàn", thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400", categoryId: huongDanCat._id, authorId: adminUserId, status: "Published" as const, views: 650, publishedAt: Date.now() - 345600000, order: 4 },
          { title: "Top 10 sản phẩm bán chạy nhất 2024", slug: "top-10-san-pham-ban-chay-nhat-2024", content: "<p>Điểm lại những sản phẩm được yêu thích nhất trong năm qua...</p>", excerpt: "Những sản phẩm hot nhất năm", thumbnail: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400", categoryId: tinTucCat._id, authorId: adminUserId, status: "Archived" as const, views: 3200, publishedAt: Date.now() - 604800000, order: 5 },
        ];
        for (const post of posts) {
          await ctx.db.insert("posts", post);
        }
      }
    }

    // 5. Seed posts module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "posts")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "posts", featureKey: "enableTags", name: "Tags", description: "Gắn thẻ cho bài viết", enabled: true, linkedFieldKey: "tags" },
        { moduleKey: "posts", featureKey: "enableFeatured", name: "Nổi bật", description: "Đánh dấu bài viết nổi bật", enabled: true, linkedFieldKey: "featured" },
        { moduleKey: "posts", featureKey: "enableScheduling", name: "Hẹn giờ", description: "Hẹn giờ xuất bản bài viết", enabled: true, linkedFieldKey: "publish_date" },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 6. Seed posts module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "posts")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "posts", fieldKey: "title", name: "Tiêu đề", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "posts", fieldKey: "content", name: "Nội dung", type: "richtext" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "posts", fieldKey: "order", name: "Thứ tự", type: "number" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "posts", fieldKey: "active", name: "Trạng thái", type: "boolean" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "posts", fieldKey: "excerpt", name: "Mô tả ngắn", type: "textarea" as const, required: false, enabled: true, isSystem: false, order: 4 },
        { moduleKey: "posts", fieldKey: "thumbnail", name: "Ảnh đại diện", type: "image" as const, required: false, enabled: true, isSystem: false, order: 5 },
        { moduleKey: "posts", fieldKey: "category_id", name: "Danh mục", type: "select" as const, required: false, enabled: true, isSystem: false, order: 6 },
        { moduleKey: "posts", fieldKey: "tags", name: "Tags", type: "tags" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableTags", order: 7 },
        { moduleKey: "posts", fieldKey: "featured", name: "Nổi bật", type: "boolean" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableFeatured", order: 8 },
        { moduleKey: "posts", fieldKey: "publish_date", name: "Ngày xuất bản", type: "date" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableScheduling", order: 9 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }

      // Category fields
      const categoryFields = [
        { moduleKey: "postCategories", fieldKey: "name", name: "Tên", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "postCategories", fieldKey: "order", name: "Thứ tự", type: "number" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "postCategories", fieldKey: "active", name: "Trạng thái", type: "boolean" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "postCategories", fieldKey: "description", name: "Mô tả", type: "textarea" as const, required: false, enabled: true, isSystem: false, order: 3 },
        { moduleKey: "postCategories", fieldKey: "thumbnail", name: "Ảnh đại diện", type: "image" as const, required: false, enabled: false, isSystem: false, order: 4 },
      ];
      for (const field of categoryFields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 7. Seed posts module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "posts")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "posts", settingKey: "postsPerPage", value: 10 });
      await ctx.db.insert("moduleSettings", { moduleKey: "posts", settingKey: "defaultStatus", value: "draft" });
    }

    return null;
  },
});

// Seed Comments
export const seedComments = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("comments").first();
    if (existing) return null;

    // Get some posts to link comments
    const posts = await ctx.db.query("posts").collect();
    if (posts.length === 0) return null;

    const comments = [
      { content: "Bài viết rất hay và hữu ích! Cảm ơn admin.", authorName: "Nguyễn Văn A", authorEmail: "nguyenvana@gmail.com", authorIp: "192.168.1.100", targetType: "post" as const, targetId: posts[0]?._id, status: "Approved" as const },
      { content: "Mình đã áp dụng và thấy hiệu quả ngay. Tuyệt vời!", authorName: "Trần Thị B", authorEmail: "tranthib@gmail.com", authorIp: "192.168.1.101", targetType: "post" as const, targetId: posts[0]?._id, status: "Approved" as const },
      { content: "Có thể viết thêm về chủ đề này được không ạ?", authorName: "Lê Văn C", authorEmail: "levanc@gmail.com", authorIp: "192.168.1.102", targetType: "post" as const, targetId: posts[1]?._id, status: "Pending" as const },
      { content: "Hướng dẫn chi tiết quá, thank admin!", authorName: "Phạm Thị D", authorEmail: "phamthid@gmail.com", authorIp: "192.168.1.103", targetType: "post" as const, targetId: posts[1]?._id, status: "Approved" as const },
      { content: "Khuyến mãi này còn hiệu lực không ạ?", authorName: "Hoàng Văn E", authorEmail: "hoangvane@gmail.com", authorIp: "192.168.1.104", targetType: "post" as const, targetId: posts[2]?._id, status: "Pending" as const },
      { content: "Spam link quảng cáo", authorName: "Spammer", authorEmail: "spam@spam.com", authorIp: "10.0.0.1", targetType: "post" as const, targetId: posts[0]?._id, status: "Spam" as const },
    ];

    for (const comment of comments) {
      if (comment.targetId) {
        await ctx.db.insert("comments", comment);
      }
    }

    return null;
  },
});

// Clear Comments
export const clearComments = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const comments = await ctx.db.query("comments").collect();
    for (const c of comments) {
      await ctx.db.delete(c._id);
    }
    return null;
  },
});

// Clear posts DATA only (posts, categories) - keeps config (features, fields, settings)
export const clearPostsData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Delete posts
    const posts = await ctx.db.query("posts").collect();
    for (const post of posts) {
      await ctx.db.delete(post._id);
    }

    // Delete post categories
    const categories = await ctx.db.query("postCategories").collect();
    for (const cat of categories) {
      await ctx.db.delete(cat._id);
    }

    return null;
  },
});

// Clear posts module CONFIG (features, fields, settings) - for full reset
export const clearPostsConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Delete posts module features
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "posts")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }

    // Delete posts module fields
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "posts")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const catFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "postCategories")).collect();
    for (const f of catFields) {
      await ctx.db.delete(f._id);
    }

    // Delete posts module settings
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "posts")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }

    return null;
  },
});

// Clear ALL posts module (data + config) - legacy, use clearPostsData + clearPostsConfig instead
export const clearPostsModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Delete posts
    const posts = await ctx.db.query("posts").collect();
    for (const post of posts) {
      await ctx.db.delete(post._id);
    }

    // Delete post categories
    const categories = await ctx.db.query("postCategories").collect();
    for (const cat of categories) {
      await ctx.db.delete(cat._id);
    }

    // Delete posts module features
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "posts")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }

    // Delete posts module fields
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "posts")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const catFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "postCategories")).collect();
    for (const f of catFields) {
      await ctx.db.delete(f._id);
    }

    // Delete posts module settings
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "posts")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }

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
