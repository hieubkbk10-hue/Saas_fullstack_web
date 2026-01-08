import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedModules = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("adminModules").first();
    if (existing) {
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

    return null;
  },
});

// ============ ANALYTICS MODULE ============
export const seedAnalyticsModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "analytics")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "analytics", featureKey: "enableSales", name: "Báo cáo doanh thu", description: "Thống kê đơn hàng, doanh thu theo thời gian", enabled: true },
        { moduleKey: "analytics", featureKey: "enableCustomers", name: "Báo cáo khách hàng", description: "Khách mới, khách quay lại, phân khúc", enabled: true },
        { moduleKey: "analytics", featureKey: "enableProducts", name: "Báo cáo sản phẩm", description: "Sản phẩm bán chạy, tồn kho, xu hướng", enabled: true },
        { moduleKey: "analytics", featureKey: "enableTraffic", name: "Báo cáo lượt truy cập", description: "Pageviews, sessions, nguồn traffic", enabled: false },
        { moduleKey: "analytics", featureKey: "enableExport", name: "Xuất báo cáo", description: "Export CSV, Excel, PDF", enabled: true, linkedFieldKey: "exportFormat" },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }
    // 2. Seed fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "analytics")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "analytics", fieldKey: "dateRange", name: "Khoảng thời gian", type: "daterange" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "analytics", fieldKey: "revenue", name: "Doanh thu", type: "number" as const, required: false, enabled: true, isSystem: true, linkedFeature: "enableSales", order: 1 },
        { moduleKey: "analytics", fieldKey: "orders", name: "Số đơn hàng", type: "number" as const, required: false, enabled: true, isSystem: true, linkedFeature: "enableSales", order: 2 },
        { moduleKey: "analytics", fieldKey: "avgOrderValue", name: "Giá trị đơn TB", type: "number" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableSales", order: 3 },
        { moduleKey: "analytics", fieldKey: "newCustomers", name: "Khách mới", type: "number" as const, required: false, enabled: true, isSystem: true, linkedFeature: "enableCustomers", order: 4 },
        { moduleKey: "analytics", fieldKey: "returningCustomers", name: "Khách quay lại", type: "number" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableCustomers", order: 5 },
        { moduleKey: "analytics", fieldKey: "topProducts", name: "SP bán chạy", type: "json" as const, required: false, enabled: true, isSystem: true, linkedFeature: "enableProducts", order: 6 },
        { moduleKey: "analytics", fieldKey: "lowStock", name: "SP sắp hết", type: "json" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableProducts", order: 7 },
        { moduleKey: "analytics", fieldKey: "pageviews", name: "Lượt xem trang", type: "number" as const, required: false, enabled: false, isSystem: false, linkedFeature: "enableTraffic", order: 8 },
        { moduleKey: "analytics", fieldKey: "sessions", name: "Phiên truy cập", type: "number" as const, required: false, enabled: false, isSystem: false, linkedFeature: "enableTraffic", order: 9 },
        { moduleKey: "analytics", fieldKey: "exportFormat", name: "Định dạng xuất", type: "select" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableExport", order: 10 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }
    // 3. Seed settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "analytics")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "analytics", settingKey: "defaultPeriod", value: "30d" });
      await ctx.db.insert("moduleSettings", { moduleKey: "analytics", settingKey: "autoRefresh", value: true });
      await ctx.db.insert("moduleSettings", { moduleKey: "analytics", settingKey: "refreshInterval", value: 300 });
    }
    return null;
  },
});

// Alias for backward compatibility
export const seedAnalyticsFeatures = seedAnalyticsModule;

// Clear analytics module CONFIG
export const clearAnalyticsConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "analytics")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "analytics")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "analytics")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
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

// Seed Comments (for both posts and products)
export const seedComments = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("comments").first();
    if (existing) return null;

    // Get posts and products to link comments
    const posts = await ctx.db.query("posts").collect();
    const products = await ctx.db.query("products").collect();

    // Post comments
    if (posts.length > 0) {
      const postComments = [
        { content: "Bài viết rất hay và hữu ích! Cảm ơn admin.", authorName: "Nguyễn Văn A", authorEmail: "nguyenvana@gmail.com", authorIp: "192.168.1.100", targetType: "post" as const, targetId: posts[0]?._id, status: "Approved" as const },
        { content: "Mình đã áp dụng và thấy hiệu quả ngay. Tuyệt vời!", authorName: "Trần Thị B", authorEmail: "tranthib@gmail.com", authorIp: "192.168.1.101", targetType: "post" as const, targetId: posts[0]?._id, status: "Approved" as const },
        { content: "Có thể viết thêm về chủ đề này được không ạ?", authorName: "Lê Văn C", authorEmail: "levanc@gmail.com", authorIp: "192.168.1.102", targetType: "post" as const, targetId: posts[1]?._id, status: "Pending" as const },
        { content: "Hướng dẫn chi tiết quá, thank admin!", authorName: "Phạm Thị D", authorEmail: "phamthid@gmail.com", authorIp: "192.168.1.103", targetType: "post" as const, targetId: posts[1]?._id, status: "Approved" as const },
        { content: "Khuyến mãi này còn hiệu lực không ạ?", authorName: "Hoàng Văn E", authorEmail: "hoangvane@gmail.com", authorIp: "192.168.1.104", targetType: "post" as const, targetId: posts[2]?._id, status: "Pending" as const },
        { content: "Spam link quảng cáo", authorName: "Spammer", authorEmail: "spam@spam.com", authorIp: "10.0.0.1", targetType: "post" as const, targetId: posts[0]?._id, status: "Spam" as const },
      ];
      for (const comment of postComments) {
        if (comment.targetId) {
          await ctx.db.insert("comments", comment);
        }
      }
    }

    // Product reviews
    if (products.length > 0) {
      const productReviews = [
        { content: "Sản phẩm chất lượng, đóng gói cẩn thận. Giao hàng nhanh!", authorName: "Trần Minh Tuấn", authorEmail: "tuantran@gmail.com", authorIp: "192.168.1.110", targetType: "product" as const, targetId: products[0]?._id, status: "Approved" as const },
        { content: "Máy đẹp, pin trâu, camera chụp rõ nét. 5 sao!", authorName: "Nguyễn Thị Hoa", authorEmail: "hoanguyen@gmail.com", authorIp: "192.168.1.111", targetType: "product" as const, targetId: products[0]?._id, status: "Approved" as const },
        { content: "Đã dùng được 2 tuần, rất hài lòng với sản phẩm.", authorName: "Lê Văn Hùng", authorEmail: "hungle@gmail.com", authorIp: "192.168.1.112", targetType: "product" as const, targetId: products[1]?._id, status: "Approved" as const },
        { content: "Sản phẩm như mô tả, shop tư vấn nhiệt tình.", authorName: "Phạm Thanh Mai", authorEmail: "maipham@gmail.com", authorIp: "192.168.1.113", targetType: "product" as const, targetId: products[2]?._id, status: "Approved" as const },
        { content: "Vải đẹp, form chuẩn, mặc thoải mái. Sẽ mua thêm màu khác.", authorName: "Hoàng Anh Dũng", authorEmail: "dunghoang@gmail.com", authorIp: "192.168.1.114", targetType: "product" as const, targetId: products[3]?._id, status: "Approved" as const },
        { content: "Giao hàng hơi chậm nhưng sản phẩm ok.", authorName: "Vũ Thị Lan", authorEmail: "lanvu@gmail.com", authorIp: "192.168.1.115", targetType: "product" as const, targetId: products[4]?._id, status: "Pending" as const },
        { content: "Nồi chiên rất tốt, tiết kiệm dầu. Recommend!", authorName: "Đỗ Văn Bình", authorEmail: "binhdo@gmail.com", authorIp: "192.168.1.116", targetType: "product" as const, targetId: products[5]?._id, status: "Approved" as const },
        { content: "Robot hút sạch, app điều khiển dễ dùng.", authorName: "Ngô Thị Hạnh", authorEmail: "hanhngo@gmail.com", authorIp: "192.168.1.117", targetType: "product" as const, targetId: products[6]?._id, status: "Pending" as const },
        { content: "Quảng cáo spam - không liên quan sản phẩm", authorName: "Fake Reviewer", authorEmail: "fake@spam.com", authorIp: "10.0.0.2", targetType: "product" as const, targetId: products[0]?._id, status: "Spam" as const },
      ];
      for (const review of productReviews) {
        if (review.targetId) {
          await ctx.db.insert("comments", review);
        }
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
    // Delete images in posts and posts-content folders
    const postImages = await ctx.db.query("images").withIndex("by_folder", q => q.eq("folder", "posts")).collect();
    for (const img of postImages) {
      await ctx.storage.delete(img.storageId);
      await ctx.db.delete(img._id);
    }
    const contentImages = await ctx.db.query("images").withIndex("by_folder", q => q.eq("folder", "posts-content")).collect();
    for (const img of contentImages) {
      await ctx.storage.delete(img.storageId);
      await ctx.db.delete(img._id);
    }
    
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

// ============ PRODUCTS MODULE ============

export const seedProductsModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed product categories
    const existingCategories = await ctx.db.query("productCategories").first();
    if (!existingCategories) {
      const categories = [
        { name: "Điện tử", slug: "dien-tu", description: "Thiết bị điện tử, công nghệ", order: 0, active: true },
        { name: "Thời trang", slug: "thoi-trang", description: "Quần áo, phụ kiện thời trang", order: 1, active: true },
        { name: "Gia dụng", slug: "gia-dung", description: "Đồ dùng gia đình", order: 2, active: true },
        { name: "Sách & Văn phòng phẩm", slug: "sach-van-phong-pham", description: "Sách, vở, dụng cụ văn phòng", order: 3, active: true },
        { name: "Thể thao", slug: "the-thao", description: "Dụng cụ, trang phục thể thao", order: 4, active: false },
      ];
      for (const cat of categories) {
        await ctx.db.insert("productCategories", cat);
      }
    }

    // 2. Seed products
    const existingProducts = await ctx.db.query("products").first();
    if (!existingProducts) {
      const dienTuCat = await ctx.db.query("productCategories").withIndex("by_slug", q => q.eq("slug", "dien-tu")).first();
      const thoiTrangCat = await ctx.db.query("productCategories").withIndex("by_slug", q => q.eq("slug", "thoi-trang")).first();
      const giaDungCat = await ctx.db.query("productCategories").withIndex("by_slug", q => q.eq("slug", "gia-dung")).first();
      
      if (dienTuCat && thoiTrangCat && giaDungCat) {
        const products = [
          { name: "iPhone 15 Pro Max", sku: "IP15PM-256", slug: "iphone-15-pro-max", categoryId: dienTuCat._id, price: 34990000, salePrice: 32990000, stock: 50, status: "Active" as const, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400", sales: 125, description: "iPhone 15 Pro Max 256GB chính hãng Apple", order: 0 },
          { name: "Samsung Galaxy S24 Ultra", sku: "SS-S24U-512", slug: "samsung-galaxy-s24-ultra", categoryId: dienTuCat._id, price: 33990000, stock: 35, status: "Active" as const, image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400", sales: 89, description: "Samsung Galaxy S24 Ultra 512GB", order: 1 },
          { name: "MacBook Pro M3", sku: "MBP-M3-14", slug: "macbook-pro-m3", categoryId: dienTuCat._id, price: 49990000, stock: 20, status: "Active" as const, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", sales: 45, description: "MacBook Pro 14 inch chip M3", order: 2 },
          { name: "Áo Polo Nam Premium", sku: "POLO-NAM-001", slug: "ao-polo-nam-premium", categoryId: thoiTrangCat._id, price: 450000, salePrice: 350000, stock: 200, status: "Active" as const, image: "https://images.unsplash.com/photo-1625910513413-5fc5f8b9920b?w=400", sales: 320, description: "Áo polo nam cao cấp, chất liệu cotton", order: 3 },
          { name: "Quần Jean Nam Slim Fit", sku: "JEAN-NAM-001", slug: "quan-jean-nam-slim-fit", categoryId: thoiTrangCat._id, price: 650000, stock: 150, status: "Active" as const, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", sales: 180, description: "Quần jean nam form slim fit", order: 4 },
          { name: "Nồi chiên không dầu Philips", sku: "AF-PHILIPS-01", slug: "noi-chien-khong-dau-philips", categoryId: giaDungCat._id, price: 3500000, salePrice: 2990000, stock: 80, status: "Active" as const, image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400", sales: 95, description: "Nồi chiên không dầu Philips 4.1L", order: 5 },
          { name: "Robot hút bụi Xiaomi", sku: "ROBOT-XIAOMI-01", slug: "robot-hut-bui-xiaomi", categoryId: giaDungCat._id, price: 8500000, stock: 5, status: "Active" as const, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", sales: 42, description: "Robot hút bụi lau nhà Xiaomi", order: 6 },
          { name: "Tai nghe AirPods Pro 2", sku: "APP2-2024", slug: "tai-nghe-airpods-pro-2", categoryId: dienTuCat._id, price: 6990000, stock: 0, status: "Draft" as const, image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400", sales: 0, description: "Tai nghe AirPods Pro thế hệ 2", order: 7 },
          { name: "Váy đầm nữ dự tiệc", sku: "DRESS-NU-001", slug: "vay-dam-nu-du-tiec", categoryId: thoiTrangCat._id, price: 890000, stock: 60, status: "Archived" as const, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400", sales: 75, description: "Váy đầm nữ sang trọng dự tiệc", order: 8 },
        ];
        for (const product of products) {
          await ctx.db.insert("products", product);
        }
      }
    }

    // 3. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "products")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "products", featureKey: "enableSalePrice", name: "Giá khuyến mãi", description: "Hiển thị giá khuyến mãi cho sản phẩm", enabled: true, linkedFieldKey: "salePrice" },
        { moduleKey: "products", featureKey: "enableGallery", name: "Thư viện ảnh", description: "Cho phép nhiều ảnh sản phẩm", enabled: true, linkedFieldKey: "images" },
        { moduleKey: "products", featureKey: "enableSKU", name: "Mã SKU", description: "Quản lý mã SKU sản phẩm", enabled: true, linkedFieldKey: "sku" },
        { moduleKey: "products", featureKey: "enableStock", name: "Quản lý kho", description: "Theo dõi số lượng tồn kho", enabled: true, linkedFieldKey: "stock" },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 4. Seed module fields for products
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "products")).first();
    if (!existingFields) {
      const productFields = [
        { moduleKey: "products", fieldKey: "name", name: "Tên sản phẩm", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "products", fieldKey: "slug", name: "Slug", type: "text" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "products", fieldKey: "sku", name: "Mã SKU", type: "text" as const, required: true, enabled: true, isSystem: false, linkedFeature: "enableSKU", order: 2 },
        { moduleKey: "products", fieldKey: "price", name: "Giá bán", type: "price" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "products", fieldKey: "salePrice", name: "Giá khuyến mãi", type: "price" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableSalePrice", order: 4 },
        { moduleKey: "products", fieldKey: "stock", name: "Tồn kho", type: "number" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableStock", order: 5 },
        { moduleKey: "products", fieldKey: "status", name: "Trạng thái", type: "select" as const, required: true, enabled: true, isSystem: true, order: 6 },
        { moduleKey: "products", fieldKey: "categoryId", name: "Danh mục", type: "select" as const, required: true, enabled: true, isSystem: true, order: 7 },
        { moduleKey: "products", fieldKey: "description", name: "Mô tả", type: "richtext" as const, required: false, enabled: true, isSystem: false, order: 8 },
        { moduleKey: "products", fieldKey: "image", name: "Ảnh đại diện", type: "image" as const, required: false, enabled: true, isSystem: false, order: 9 },
        { moduleKey: "products", fieldKey: "images", name: "Thư viện ảnh", type: "gallery" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableGallery", order: 10 },
      ];
      for (const field of productFields) {
        await ctx.db.insert("moduleFields", field);
      }

      // Category fields
      const categoryFields = [
        { moduleKey: "productCategories", fieldKey: "name", name: "Tên danh mục", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "productCategories", fieldKey: "slug", name: "Slug", type: "text" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "productCategories", fieldKey: "order", name: "Thứ tự", type: "number" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "productCategories", fieldKey: "active", name: "Trạng thái", type: "boolean" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "productCategories", fieldKey: "description", name: "Mô tả", type: "textarea" as const, required: false, enabled: true, isSystem: false, order: 4 },
        { moduleKey: "productCategories", fieldKey: "image", name: "Hình ảnh", type: "image" as const, required: false, enabled: false, isSystem: false, order: 5 },
      ];
      for (const field of categoryFields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 5. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "products")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "products", settingKey: "productsPerPage", value: 12 });
      await ctx.db.insert("moduleSettings", { moduleKey: "products", settingKey: "defaultStatus", value: "Draft" });
      await ctx.db.insert("moduleSettings", { moduleKey: "products", settingKey: "lowStockThreshold", value: 10 });
    }

    // 6. Initialize product stats (counter table)
    const existingStats = await ctx.db.query("productStats").first();
    if (!existingStats) {
      const products = await ctx.db.query("products").collect();
      const counts = { total: 0, Active: 0, Draft: 0, Archived: 0 };
      let maxOrder = 0;
      for (const p of products) {
        counts.total++;
        counts[p.status as keyof typeof counts]++;
        if (p.order > maxOrder) maxOrder = p.order;
      }
      await Promise.all([
        ctx.db.insert("productStats", { key: "total", count: counts.total, lastOrder: maxOrder }),
        ctx.db.insert("productStats", { key: "Active", count: counts.Active, lastOrder: 0 }),
        ctx.db.insert("productStats", { key: "Draft", count: counts.Draft, lastOrder: 0 }),
        ctx.db.insert("productStats", { key: "Archived", count: counts.Archived, lastOrder: 0 }),
      ]);
    }

    return null;
  },
});

// Clear products DATA only (products, categories, stats) - keeps config
export const clearProductsData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    await Promise.all(products.map((p) => ctx.db.delete(p._id)));
    
    const categories = await ctx.db.query("productCategories").collect();
    await Promise.all(categories.map((cat) => ctx.db.delete(cat._id)));
    
    // Also clear product stats
    const stats = await ctx.db.query("productStats").collect();
    await Promise.all(stats.map((s) => ctx.db.delete(s._id)));
    
    return null;
  },
});

// Clear products module CONFIG (features, fields, settings)
export const clearProductsConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "products")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "products")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const catFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "productCategories")).collect();
    for (const f of catFields) {
      await ctx.db.delete(f._id);
    }
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "products")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// ============ COMMENTS MODULE ============

export const seedCommentsModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "comments")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "comments", featureKey: "enableLikes", name: "Lượt thích", description: "Cho phép like/dislike bình luận", enabled: false, linkedFieldKey: "likesCount" },
        { moduleKey: "comments", featureKey: "enableReplies", name: "Trả lời", description: "Cho phép reply bình luận", enabled: true, linkedFieldKey: "parentId" },
        { moduleKey: "comments", featureKey: "enableModeration", name: "Kiểm duyệt", description: "Yêu cầu duyệt bình luận trước khi hiển thị", enabled: true },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 2. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "comments")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "comments", fieldKey: "content", name: "Nội dung", type: "textarea" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "comments", fieldKey: "authorName", name: "Tên người bình luận", type: "text" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "comments", fieldKey: "authorEmail", name: "Email", type: "email" as const, required: false, enabled: true, isSystem: false, order: 2 },
        { moduleKey: "comments", fieldKey: "targetType", name: "Loại đối tượng", type: "select" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "comments", fieldKey: "targetId", name: "ID đối tượng", type: "text" as const, required: true, enabled: true, isSystem: true, order: 4 },
        { moduleKey: "comments", fieldKey: "status", name: "Trạng thái", type: "select" as const, required: true, enabled: true, isSystem: true, order: 5 },
        { moduleKey: "comments", fieldKey: "parentId", name: "Bình luận cha", type: "select" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableReplies", order: 6 },
        { moduleKey: "comments", fieldKey: "authorIp", name: "IP", type: "text" as const, required: false, enabled: false, isSystem: false, order: 7 },
        { moduleKey: "comments", fieldKey: "likesCount", name: "Số lượt thích", type: "number" as const, required: false, enabled: false, isSystem: false, linkedFeature: "enableLikes", order: 8 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 3. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "comments")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "comments", settingKey: "commentsPerPage", value: 20 });
      await ctx.db.insert("moduleSettings", { moduleKey: "comments", settingKey: "defaultStatus", value: "Pending" });
      await ctx.db.insert("moduleSettings", { moduleKey: "comments", settingKey: "autoApprove", value: false });
    }

    return null;
  },
});

// Clear comments module CONFIG (features, fields, settings)
export const clearCommentsConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "comments")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "comments")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "comments")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// ============ ORDERS MODULE ============

export const seedOrdersModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Ensure customers exist
    let customers = await ctx.db.query("customers").collect();
    if (customers.length === 0) {
      const customerData = [
        { name: "Nguyễn Văn An", email: "nguyenvanan@gmail.com", phone: "0901234567", status: "Active" as const, ordersCount: 0, totalSpent: 0, address: "123 Nguyễn Huệ, Q.1", city: "Hồ Chí Minh" },
        { name: "Trần Thị Bình", email: "tranthibinh@gmail.com", phone: "0912345678", status: "Active" as const, ordersCount: 0, totalSpent: 0, address: "456 Lê Lợi, Q.3", city: "Hồ Chí Minh" },
        { name: "Lê Văn Cường", email: "levancuong@gmail.com", phone: "0923456789", status: "Active" as const, ordersCount: 0, totalSpent: 0, address: "789 Trần Hưng Đạo, Q.5", city: "Hà Nội" },
      ];
      for (const c of customerData) {
        await ctx.db.insert("customers", c);
      }
      customers = await ctx.db.query("customers").collect();
    }

    // 2. Ensure products exist
    const products = await ctx.db.query("products").collect();
    if (products.length === 0) {
      console.log("No products found. Please seed products first.");
      return null;
    }

    // 3. Seed orders
    const existingOrders = await ctx.db.query("orders").first();
    if (!existingOrders) {
      const ordersData = [
        {
          orderNumber: "ORD-20250101-1001",
          customerId: customers[0]._id,
          items: [
            { productId: products[0]._id, productName: products[0].name, quantity: 1, price: products[0].price },
            { productId: products[1] ? products[1]._id : products[0]._id, productName: products[1] ? products[1].name : products[0].name, quantity: 2, price: products[1] ? products[1].price : products[0].price },
          ],
          subtotal: products[0].price + (products[1] ? products[1].price * 2 : products[0].price * 2),
          shippingFee: 30000,
          totalAmount: products[0].price + (products[1] ? products[1].price * 2 : products[0].price * 2) + 30000,
          status: "Delivered" as const,
          paymentMethod: "COD" as const,
          paymentStatus: "Paid" as const,
          shippingAddress: "123 Nguyễn Huệ, Q.1, TP.HCM",
          trackingNumber: "VN123456789",
        },
        {
          orderNumber: "ORD-20250102-1002",
          customerId: customers[1]._id,
          items: [
            { productId: products[2] ? products[2]._id : products[0]._id, productName: products[2] ? products[2].name : products[0].name, quantity: 1, price: products[2] ? products[2].price : products[0].price },
          ],
          subtotal: products[2] ? products[2].price : products[0].price,
          shippingFee: 25000,
          totalAmount: (products[2] ? products[2].price : products[0].price) + 25000,
          status: "Shipped" as const,
          paymentMethod: "BankTransfer" as const,
          paymentStatus: "Paid" as const,
          shippingAddress: "456 Lê Lợi, Q.3, TP.HCM",
          trackingNumber: "VN987654321",
        },
        {
          orderNumber: "ORD-20250103-1003",
          customerId: customers[2]._id,
          items: [
            { productId: products[0]._id, productName: products[0].name, quantity: 1, price: products[0].price },
          ],
          subtotal: products[0].price,
          shippingFee: 35000,
          totalAmount: products[0].price + 35000,
          status: "Processing" as const,
          paymentMethod: "CreditCard" as const,
          paymentStatus: "Paid" as const,
          shippingAddress: "789 Trần Hưng Đạo, Q.5, Hà Nội",
        },
        {
          orderNumber: "ORD-20250104-1004",
          customerId: customers[0]._id,
          items: [
            { productId: products[3] ? products[3]._id : products[0]._id, productName: products[3] ? products[3].name : products[0].name, quantity: 3, price: products[3] ? products[3].price : products[0].price },
          ],
          subtotal: (products[3] ? products[3].price : products[0].price) * 3,
          shippingFee: 0,
          totalAmount: (products[3] ? products[3].price : products[0].price) * 3,
          status: "Pending" as const,
          paymentMethod: "EWallet" as const,
          paymentStatus: "Pending" as const,
          shippingAddress: "123 Nguyễn Huệ, Q.1, TP.HCM",
          note: "Giao giờ hành chính",
        },
        {
          orderNumber: "ORD-20250105-1005",
          customerId: customers[1]._id,
          items: [
            { productId: products[4] ? products[4]._id : products[0]._id, productName: products[4] ? products[4].name : products[0].name, quantity: 1, price: products[4] ? products[4].price : products[0].price },
          ],
          subtotal: products[4] ? products[4].price : products[0].price,
          shippingFee: 20000,
          totalAmount: (products[4] ? products[4].price : products[0].price) + 20000,
          status: "Cancelled" as const,
          paymentMethod: "COD" as const,
          paymentStatus: "Refunded" as const,
          shippingAddress: "456 Lê Lợi, Q.3, TP.HCM",
          note: "Khách hủy đơn",
        },
      ];
      for (const order of ordersData) {
        await ctx.db.insert("orders", order);
      }
    }

    // 4. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "orders")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "orders", featureKey: "enablePayment", name: "Thanh toán", description: "Phương thức & trạng thái thanh toán", enabled: true, linkedFieldKey: "paymentMethod" },
        { moduleKey: "orders", featureKey: "enableShipping", name: "Vận chuyển", description: "Phí ship, địa chỉ giao hàng", enabled: true, linkedFieldKey: "shippingAddress" },
        { moduleKey: "orders", featureKey: "enableTracking", name: "Theo dõi vận đơn", description: "Mã vận đơn, tracking", enabled: true, linkedFieldKey: "trackingNumber" },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 5. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "orders")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "orders", fieldKey: "orderNumber", name: "Mã đơn hàng", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "orders", fieldKey: "customerId", name: "Khách hàng", type: "select" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "orders", fieldKey: "status", name: "Trạng thái đơn", type: "select" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "orders", fieldKey: "totalAmount", name: "Tổng tiền", type: "price" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "orders", fieldKey: "note", name: "Ghi chú", type: "textarea" as const, required: false, enabled: true, isSystem: false, order: 4 },
        { moduleKey: "orders", fieldKey: "paymentMethod", name: "Phương thức TT", type: "select" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enablePayment", order: 5 },
        { moduleKey: "orders", fieldKey: "paymentStatus", name: "Trạng thái TT", type: "select" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enablePayment", order: 6 },
        { moduleKey: "orders", fieldKey: "subtotal", name: "Tạm tính", type: "price" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableShipping", order: 7 },
        { moduleKey: "orders", fieldKey: "shippingFee", name: "Phí vận chuyển", type: "price" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableShipping", order: 8 },
        { moduleKey: "orders", fieldKey: "shippingAddress", name: "Địa chỉ giao", type: "textarea" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableShipping", order: 9 },
        { moduleKey: "orders", fieldKey: "trackingNumber", name: "Mã vận đơn", type: "text" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableTracking", order: 10 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 6. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "orders")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "orders", settingKey: "ordersPerPage", value: 20 });
      await ctx.db.insert("moduleSettings", { moduleKey: "orders", settingKey: "defaultStatus", value: "Pending" });
    }

    return null;
  },
});

// Clear orders DATA only
export const clearOrdersData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    for (const order of orders) {
      await ctx.db.delete(order._id);
    }
    return null;
  },
});

// Clear orders module CONFIG
export const clearOrdersConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "orders")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "orders")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "orders")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// ============ MEDIA MODULE ============

export const seedMediaModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "media")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "media", featureKey: "enableFolders", name: "Thư mục", description: "Tổ chức media theo thư mục", enabled: true, linkedFieldKey: "folder" },
        { moduleKey: "media", featureKey: "enableAltText", name: "Alt Text", description: "Mô tả thay thế cho hình ảnh (SEO)", enabled: true, linkedFieldKey: "alt" },
        { moduleKey: "media", featureKey: "enableDimensions", name: "Kích thước ảnh", description: "Lưu width/height của ảnh", enabled: true, linkedFieldKey: "dimensions" },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 2. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "media")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "media", fieldKey: "filename", name: "Tên file", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "media", fieldKey: "mimeType", name: "Loại file", type: "text" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "media", fieldKey: "size", name: "Kích thước", type: "number" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "media", fieldKey: "storageId", name: "Storage ID", type: "text" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "media", fieldKey: "folder", name: "Thư mục", type: "select" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableFolders", order: 4 },
        { moduleKey: "media", fieldKey: "alt", name: "Alt Text", type: "text" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableAltText", order: 5 },
        { moduleKey: "media", fieldKey: "width", name: "Chiều rộng", type: "number" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableDimensions", order: 6 },
        { moduleKey: "media", fieldKey: "height", name: "Chiều cao", type: "number" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableDimensions", order: 7 },
        { moduleKey: "media", fieldKey: "uploadedBy", name: "Người upload", type: "select" as const, required: false, enabled: false, isSystem: false, order: 8 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 3. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "media")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "media", settingKey: "itemsPerPage", value: 24 });
      await ctx.db.insert("moduleSettings", { moduleKey: "media", settingKey: "maxFileSize", value: 5 });
      await ctx.db.insert("moduleSettings", { moduleKey: "media", settingKey: "allowedTypes", value: "image/*,video/*,application/pdf" });
    }

    return null;
  },
});

// Clear media DATA only (images table)
export const clearMediaData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const images = await ctx.db.query("images").collect();
    for (const img of images) {
      try {
        await ctx.storage.delete(img.storageId);
      } catch {
        // Storage file might already be deleted
      }
      await ctx.db.delete(img._id);
    }
    // Clear counter tables
    const stats = await ctx.db.query("mediaStats").collect();
    for (const s of stats) await ctx.db.delete(s._id);
    const folders = await ctx.db.query("mediaFolders").collect();
    for (const f of folders) await ctx.db.delete(f._id);
    return null;
  },
});

// Sync media counters from existing data (run once after migration)
export const syncMediaCounters = mutation({
  args: {},
  returns: v.object({ stats: v.any(), folders: v.any() }),
  handler: async (ctx) => {
    // Clear existing counters
    const existingStats = await ctx.db.query("mediaStats").collect();
    for (const s of existingStats) await ctx.db.delete(s._id);
    const existingFolders = await ctx.db.query("mediaFolders").collect();
    for (const f of existingFolders) await ctx.db.delete(f._id);

    // Scan all images and aggregate
    const images = await ctx.db.query("images").collect();
    
    const stats: Record<string, { count: number; totalSize: number }> = {
      total: { count: 0, totalSize: 0 },
      image: { count: 0, totalSize: 0 },
      video: { count: 0, totalSize: 0 },
      document: { count: 0, totalSize: 0 },
      other: { count: 0, totalSize: 0 },
    };
    const folders: Record<string, number> = {};

    for (const img of images) {
      stats.total.count++;
      stats.total.totalSize += img.size;

      // Determine type
      let typeKey: "image" | "video" | "document" | "other" = "other";
      if (img.mimeType.startsWith("image/")) typeKey = "image";
      else if (img.mimeType.startsWith("video/")) typeKey = "video";
      else if (img.mimeType === "application/pdf" || img.mimeType.includes("document") || img.mimeType.includes("spreadsheet")) {
        typeKey = "document";
      }
      stats[typeKey].count++;
      stats[typeKey].totalSize += img.size;

      // Count folder
      if (img.folder) {
        folders[img.folder] = (folders[img.folder] || 0) + 1;
      }
    }

    // Insert stats
    for (const [key, { count, totalSize }] of Object.entries(stats)) {
      if (count > 0) {
        await ctx.db.insert("mediaStats", { key, count, totalSize });
      }
    }

    // Insert folders
    for (const [name, count] of Object.entries(folders)) {
      await ctx.db.insert("mediaFolders", { name, count });
    }

    return { stats, folders };
  },
});

// Clear media module CONFIG (features, fields, settings)
export const clearMediaConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "media")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "media")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "media")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// ============ CUSTOMERS MODULE ============

export const seedCustomersModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed customers data if not exists
    const existingCustomers = await ctx.db.query("customers").first();
    if (!existingCustomers) {
      const customers = [
        { name: "Nguyễn Văn An", email: "nguyenvanan@gmail.com", phone: "0901234567", status: "Active" as const, ordersCount: 5, totalSpent: 15000000, address: "123 Nguyễn Huệ, Q.1", city: "Hồ Chí Minh" },
        { name: "Trần Thị Bình", email: "tranthibinh@gmail.com", phone: "0912345678", status: "Active" as const, ordersCount: 3, totalSpent: 8500000, address: "456 Lê Lợi, Q.3", city: "Hồ Chí Minh" },
        { name: "Lê Văn Cường", email: "levancuong@gmail.com", phone: "0923456789", status: "Active" as const, ordersCount: 8, totalSpent: 25000000, address: "789 Trần Hưng Đạo", city: "Hà Nội" },
        { name: "Phạm Thị Dung", email: "phamthidung@gmail.com", phone: "0934567890", status: "Active" as const, ordersCount: 2, totalSpent: 4200000, address: "321 Hai Bà Trưng", city: "Đà Nẵng" },
        { name: "Hoàng Văn Em", email: "hoangvanem@gmail.com", phone: "0945678901", status: "Inactive" as const, ordersCount: 1, totalSpent: 1500000, address: "654 Phan Đình Phùng", city: "Cần Thơ" },
        { name: "Vũ Thị Phương", email: "vuthiphuong@gmail.com", phone: "0956789012", status: "Active" as const, ordersCount: 12, totalSpent: 45000000, address: "987 Nguyễn Trãi, Q.5", city: "Hồ Chí Minh", notes: "VIP Customer" },
        { name: "Đỗ Văn Giang", email: "dovangiang@gmail.com", phone: "0967890123", status: "Active" as const, ordersCount: 0, totalSpent: 0, address: "147 Lý Thường Kiệt", city: "Hà Nội" },
        { name: "Ngô Thị Hạnh", email: "ngothihanh@gmail.com", phone: "0978901234", status: "Inactive" as const, ordersCount: 4, totalSpent: 12000000, address: "258 Trần Phú", city: "Nha Trang" },
      ];
      for (const c of customers) {
        await ctx.db.insert("customers", c);
      }
    }

    // 2. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "customers")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "customers", featureKey: "enableLogin", name: "Đăng nhập KH", description: "Cho phép khách hàng tạo tài khoản và đăng nhập", enabled: false, linkedFieldKey: "password" },
        { moduleKey: "customers", featureKey: "enableAddresses", name: "Sổ địa chỉ", description: "Lưu nhiều địa chỉ giao hàng cho khách", enabled: true, linkedFieldKey: "addresses" },
        { moduleKey: "customers", featureKey: "enableAvatar", name: "Ảnh đại diện", description: "Cho phép khách hàng có ảnh đại diện", enabled: false, linkedFieldKey: "avatar" },
        { moduleKey: "customers", featureKey: "enableNotes", name: "Ghi chú", description: "Thêm ghi chú nội bộ cho khách hàng", enabled: true, linkedFieldKey: "notes" },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 3. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "customers")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "customers", fieldKey: "name", name: "Họ và tên", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "customers", fieldKey: "email", name: "Email", type: "email" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "customers", fieldKey: "phone", name: "Số điện thoại", type: "phone" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "customers", fieldKey: "status", name: "Trạng thái", type: "select" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "customers", fieldKey: "address", name: "Địa chỉ", type: "textarea" as const, required: false, enabled: true, isSystem: false, order: 4 },
        { moduleKey: "customers", fieldKey: "city", name: "Thành phố", type: "text" as const, required: false, enabled: true, isSystem: false, order: 5 },
        { moduleKey: "customers", fieldKey: "avatar", name: "Ảnh đại diện", type: "image" as const, required: false, enabled: false, isSystem: false, linkedFeature: "enableAvatar", order: 6 },
        { moduleKey: "customers", fieldKey: "password", name: "Mật khẩu", type: "password" as const, required: false, enabled: false, isSystem: false, linkedFeature: "enableLogin", order: 7 },
        { moduleKey: "customers", fieldKey: "notes", name: "Ghi chú", type: "textarea" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableNotes", order: 8 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 4. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "customers")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "customers", settingKey: "customersPerPage", value: 20 });
      await ctx.db.insert("moduleSettings", { moduleKey: "customers", settingKey: "defaultStatus", value: "Active" });
    }

    return null;
  },
});

// CUST-002 FIX: Clear customers DATA only - using Promise.all
export const clearCustomersData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const customers = await ctx.db.query("customers").collect();
    await Promise.all(customers.map(c => ctx.db.delete(c._id)));
    return null;
  },
});

// CUST-002 FIX: Clear customers module CONFIG - using Promise.all
export const clearCustomersConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const [features, fields, settings] = await Promise.all([
      ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "customers")).collect(),
      ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "customers")).collect(),
      ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "customers")).collect(),
    ]);
    await Promise.all([
      ...features.map(f => ctx.db.delete(f._id)),
      ...fields.map(f => ctx.db.delete(f._id)),
      ...settings.map(s => ctx.db.delete(s._id)),
    ]);
    return null;
  },
});

// ============ WISHLIST MODULE ============

export const seedWishlistModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Ensure customers exist
    const customers = await ctx.db.query("customers").collect();
    if (customers.length === 0) {
      console.log("No customers found. Please seed customers first.");
      return null;
    }

    // 2. Ensure products exist
    const products = await ctx.db.query("products").collect();
    if (products.length === 0) {
      console.log("No products found. Please seed products first.");
      return null;
    }

    // 3. Seed wishlist items
    const existingWishlist = await ctx.db.query("wishlist").first();
    if (!existingWishlist) {
      const wishlistData = [];
      
      // Customer 1: 3 products
      if (customers[0] && products[0]) {
        wishlistData.push({ customerId: customers[0]._id, productId: products[0]._id });
      }
      if (customers[0] && products[2]) {
        wishlistData.push({ customerId: customers[0]._id, productId: products[2]._id });
      }
      if (customers[0] && products[4]) {
        wishlistData.push({ customerId: customers[0]._id, productId: products[4]._id, note: "Chờ giảm giá" });
      }
      
      // Customer 2: 2 products
      if (customers[1] && products[1]) {
        wishlistData.push({ customerId: customers[1]._id, productId: products[1]._id });
      }
      if (customers[1] && products[3]) {
        wishlistData.push({ customerId: customers[1]._id, productId: products[3]._id, note: "Mua làm quà" });
      }
      
      // Customer 3: 1 product
      if (customers[2] && products[5]) {
        wishlistData.push({ customerId: customers[2]._id, productId: products[5]._id });
      }

      for (const item of wishlistData) {
        await ctx.db.insert("wishlist", item);
      }
    }

    // 4. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "wishlist")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "wishlist", featureKey: "enableNote", name: "Ghi chú", description: "Cho phép khách thêm ghi chú cho SP yêu thích", enabled: true, linkedFieldKey: "note" },
        { moduleKey: "wishlist", featureKey: "enableNotification", name: "Thông báo", description: "Thông báo khi SP giảm giá/có hàng", enabled: false },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 5. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "wishlist")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "wishlist", fieldKey: "customerId", name: "Khách hàng", type: "select" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "wishlist", fieldKey: "productId", name: "Sản phẩm", type: "select" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "wishlist", fieldKey: "note", name: "Ghi chú", type: "textarea" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableNote", order: 2 },
        { moduleKey: "wishlist", fieldKey: "createdAt", name: "Ngày thêm", type: "date" as const, required: false, enabled: true, isSystem: true, order: 3 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 6. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "wishlist")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "wishlist", settingKey: "maxItemsPerCustomer", value: 50 });
      await ctx.db.insert("moduleSettings", { moduleKey: "wishlist", settingKey: "itemsPerPage", value: 20 });
    }

    return null;
  },
});

// WL-009 FIX: Clear wishlist DATA only - sử dụng Promise.all
export const clearWishlistData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const items = await ctx.db.query("wishlist").collect();
    await Promise.all(items.map(item => ctx.db.delete(item._id)));
    return null;
  },
});

// WL-009 FIX: Clear wishlist module CONFIG - sử dụng Promise.all
export const clearWishlistConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const [features, fields, settings] = await Promise.all([
      ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "wishlist")).collect(),
      ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "wishlist")).collect(),
      ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "wishlist")).collect(),
    ]);
    await Promise.all([
      ...features.map(f => ctx.db.delete(f._id)),
      ...fields.map(f => ctx.db.delete(f._id)),
      ...settings.map(s => ctx.db.delete(s._id)),
    ]);
    return null;
  },
});

// ============ CART MODULE ============

export const seedCartModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Ensure products exist
    const products = await ctx.db.query("products").collect();
    if (products.length === 0) {
      console.log("No products found. Please seed products first.");
      return null;
    }

    // 2. Ensure customers exist
    let customers = await ctx.db.query("customers").collect();
    if (customers.length === 0) {
      const customerData = [
        { name: "Nguyễn Văn An", email: "nguyenvanan@gmail.com", phone: "0901234567", status: "Active" as const, ordersCount: 0, totalSpent: 0, address: "123 Nguyễn Huệ, Q.1", city: "Hồ Chí Minh" },
        { name: "Trần Thị Bình", email: "tranthibinh@gmail.com", phone: "0912345678", status: "Active" as const, ordersCount: 0, totalSpent: 0, address: "456 Lê Lợi, Q.3", city: "Hồ Chí Minh" },
      ];
      for (const c of customerData) {
        await ctx.db.insert("customers", c);
      }
      customers = await ctx.db.query("customers").collect();
    }

    // 3. Seed carts and cart items
    const existingCarts = await ctx.db.query("carts").first();
    if (!existingCarts) {
      // Active cart with items
      const cart1Id = await ctx.db.insert("carts", {
        customerId: customers[0]._id,
        status: "Active",
        itemsCount: 3,
        totalAmount: products[0].price + (products[1] ? products[1].price * 2 : products[0].price * 2),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });
      await ctx.db.insert("cartItems", {
        cartId: cart1Id,
        productId: products[0]._id,
        productName: products[0].name,
        productImage: products[0].image,
        quantity: 1,
        price: products[0].price,
        subtotal: products[0].price,
      });
      if (products[1]) {
        await ctx.db.insert("cartItems", {
          cartId: cart1Id,
          productId: products[1]._id,
          productName: products[1].name,
          productImage: products[1].image,
          quantity: 2,
          price: products[1].price,
          subtotal: products[1].price * 2,
        });
      }

      // Guest cart (session-based)
      const cart2Id = await ctx.db.insert("carts", {
        sessionId: "session_abc123xyz",
        status: "Active",
        itemsCount: 1,
        totalAmount: products[2] ? products[2].price : products[0].price,
        expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
      });
      await ctx.db.insert("cartItems", {
        cartId: cart2Id,
        productId: products[2] ? products[2]._id : products[0]._id,
        productName: products[2] ? products[2].name : products[0].name,
        productImage: products[2] ? products[2].image : products[0].image,
        quantity: 1,
        price: products[2] ? products[2].price : products[0].price,
        subtotal: products[2] ? products[2].price : products[0].price,
      });

      // Abandoned cart
      await ctx.db.insert("carts", {
        customerId: customers[1] ? customers[1]._id : customers[0]._id,
        status: "Abandoned",
        itemsCount: 2,
        totalAmount: (products[3] ? products[3].price : products[0].price) * 2,
        expiresAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
      });

      // Converted cart
      await ctx.db.insert("carts", {
        customerId: customers[0]._id,
        status: "Converted",
        itemsCount: 1,
        totalAmount: products[4] ? products[4].price : products[0].price,
      });
    }

    // 4. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "cart")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "cart", featureKey: "enableExpiry", name: "Hết hạn giỏ hàng", description: "Tự động đánh dấu abandoned sau N ngày", enabled: true, linkedFieldKey: "expiresAt" },
        { moduleKey: "cart", featureKey: "enableGuestCart", name: "Giỏ hàng khách", description: "Cho phép khách chưa đăng nhập thêm giỏ hàng", enabled: true, linkedFieldKey: "sessionId" },
        { moduleKey: "cart", featureKey: "enableNote", name: "Ghi chú", description: "Cho phép thêm ghi chú vào giỏ hàng", enabled: false, linkedFieldKey: "note" },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 5. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "cart")).first();
    if (!existingFields) {
      const cartFields = [
        { moduleKey: "cart", fieldKey: "customerId", name: "Khách hàng", type: "select" as const, required: false, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "cart", fieldKey: "sessionId", name: "Session ID", type: "text" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableGuestCart", order: 1 },
        { moduleKey: "cart", fieldKey: "status", name: "Trạng thái", type: "select" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "cart", fieldKey: "itemsCount", name: "Số lượng SP", type: "number" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "cart", fieldKey: "totalAmount", name: "Tổng tiền", type: "price" as const, required: true, enabled: true, isSystem: true, order: 4 },
        { moduleKey: "cart", fieldKey: "expiresAt", name: "Thời gian hết hạn", type: "date" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableExpiry", order: 5 },
        { moduleKey: "cart", fieldKey: "note", name: "Ghi chú", type: "textarea" as const, required: false, enabled: false, isSystem: false, linkedFeature: "enableNote", order: 6 },
      ];
      for (const field of cartFields) {
        await ctx.db.insert("moduleFields", field);
      }

      const cartItemFields = [
        { moduleKey: "cartItems", fieldKey: "productId", name: "Sản phẩm", type: "select" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "cartItems", fieldKey: "productName", name: "Tên sản phẩm", type: "text" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "cartItems", fieldKey: "quantity", name: "Số lượng", type: "number" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "cartItems", fieldKey: "price", name: "Đơn giá", type: "price" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "cartItems", fieldKey: "subtotal", name: "Thành tiền", type: "price" as const, required: true, enabled: true, isSystem: true, order: 4 },
        { moduleKey: "cartItems", fieldKey: "productImage", name: "Ảnh sản phẩm", type: "image" as const, required: false, enabled: true, isSystem: false, order: 5 },
      ];
      for (const field of cartItemFields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 6. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "cart")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "cart", settingKey: "cartsPerPage", value: 20 });
      await ctx.db.insert("moduleSettings", { moduleKey: "cart", settingKey: "expiryDays", value: 7 });
      await ctx.db.insert("moduleSettings", { moduleKey: "cart", settingKey: "maxItemsPerCart", value: 50 });
      await ctx.db.insert("moduleSettings", { moduleKey: "cart", settingKey: "autoCleanupAbandoned", value: true });
    }

    return null;
  },
});

// Clear cart DATA only
export const clearCartData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const cartItems = await ctx.db.query("cartItems").collect();
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }
    const carts = await ctx.db.query("carts").collect();
    for (const cart of carts) {
      await ctx.db.delete(cart._id);
    }
    return null;
  },
});

// Clear cart module CONFIG
export const clearCartConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "cart")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const cartFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "cart")).collect();
    for (const f of cartFields) {
      await ctx.db.delete(f._id);
    }
    const cartItemFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "cartItems")).collect();
    for (const f of cartItemFields) {
      await ctx.db.delete(f._id);
    }
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "cart")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// ============ USERS MODULE ============

export const seedUsersModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed roles if not exist
    const existingRoles = await ctx.db.query("roles").first();
    if (!existingRoles) {
      const roles: Array<{ name: string; description: string; color: string; isSystem: boolean; isSuperAdmin?: boolean; permissions: Record<string, string[]> }> = [
        { name: "Super Admin", description: "Toàn quyền truy cập hệ thống", color: "#ef4444", isSystem: true, isSuperAdmin: true, permissions: { "*": ["*"] } },
        { name: "Admin", description: "Quản trị viên hệ thống", color: "#3b82f6", isSystem: true, permissions: { posts: ["read", "create", "update", "delete"], products: ["read", "create", "update", "delete"], orders: ["read", "update"], customers: ["read", "update"], users: ["read"], settings: ["read"] } },
        { name: "Editor", description: "Biên tập viên nội dung", color: "#22c55e", isSystem: false, permissions: { posts: ["read", "create", "update"], products: ["read"], media: ["read", "create"] } },
        { name: "Moderator", description: "Kiểm duyệt viên", color: "#f59e0b", isSystem: false, permissions: { posts: ["read"], products: ["read"], comments: ["read", "update", "delete"], customers: ["read"] } },
      ];
      for (const role of roles) {
        await ctx.db.insert("roles", role);
      }
    }

    // 2. Get roles for users
    const superAdminRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Super Admin")).first();
    const adminRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Admin")).first();
    const editorRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Editor")).first();
    const moderatorRole = await ctx.db.query("roles").withIndex("by_name", q => q.eq("name", "Moderator")).first();

    // 3. Seed users if not exist
    const existingUsers = await ctx.db.query("users").first();
    if (!existingUsers && superAdminRole && adminRole && editorRole && moderatorRole) {
      const users = [
        { name: "Super Admin", email: "superadmin@example.com", phone: "0901234567", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin", roleId: superAdminRole._id, status: "Active" as const, lastLogin: Date.now() - 3600000 },
        { name: "Admin User", email: "admin@example.com", phone: "0912345678", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin", roleId: adminRole._id, status: "Active" as const, lastLogin: Date.now() - 7200000 },
        { name: "Nguyễn Văn Editor", email: "editor@example.com", phone: "0923456789", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=editor", roleId: editorRole._id, status: "Active" as const, lastLogin: Date.now() - 86400000 },
        { name: "Trần Thị Moderator", email: "mod@example.com", phone: "0934567890", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mod", roleId: moderatorRole._id, status: "Active" as const },
        { name: "Lê Văn Test", email: "test@example.com", phone: "0945678901", roleId: editorRole._id, status: "Inactive" as const },
        { name: "Banned User", email: "banned@example.com", roleId: moderatorRole._id, status: "Banned" as const },
      ];
      for (const user of users) {
        await ctx.db.insert("users", user);
      }
    }

    // 4. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "users")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "users", featureKey: "enableAvatar", name: "Ảnh đại diện", description: "Cho phép user có ảnh đại diện", enabled: true, linkedFieldKey: "avatar" },
        { moduleKey: "users", featureKey: "enablePhone", name: "Số điện thoại", description: "Lưu số điện thoại của user", enabled: true, linkedFieldKey: "phone" },
        { moduleKey: "users", featureKey: "enableLastLogin", name: "Đăng nhập cuối", description: "Theo dõi lần đăng nhập cuối", enabled: true, linkedFieldKey: "lastLogin" },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 5. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "users")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "users", fieldKey: "name", name: "Họ và tên", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "users", fieldKey: "email", name: "Email", type: "email" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "users", fieldKey: "roleId", name: "Vai trò", type: "select" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "users", fieldKey: "status", name: "Trạng thái", type: "select" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "users", fieldKey: "phone", name: "Số điện thoại", type: "phone" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enablePhone", order: 4 },
        { moduleKey: "users", fieldKey: "avatar", name: "Ảnh đại diện", type: "image" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableAvatar", order: 5 },
        { moduleKey: "users", fieldKey: "lastLogin", name: "Đăng nhập cuối", type: "date" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableLastLogin", order: 6 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 6. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "users")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "users", settingKey: "usersPerPage", value: 20 });
      await ctx.db.insert("moduleSettings", { moduleKey: "users", settingKey: "sessionTimeout", value: 30 });
      await ctx.db.insert("moduleSettings", { moduleKey: "users", settingKey: "maxLoginAttempts", value: 5 });
    }

    // 7. Initialize counter tables (userStats, roleStats)
    const existingUserStats = await ctx.db.query("userStats").first();
    if (!existingUserStats) {
      const users = await ctx.db.query("users").collect();
      const roles = await ctx.db.query("roles").collect();
      
      // Count users by status
      const statusCounts: Record<string, number> = { Active: 0, Inactive: 0, Banned: 0 };
      users.forEach(u => { statusCounts[u.status] = (statusCounts[u.status] || 0) + 1; });
      
      // Count roles
      let systemCount = 0, superAdminCount = 0;
      roles.forEach(r => {
        if (r.isSystem) systemCount++;
        if (r.isSuperAdmin) superAdminCount++;
      });
      
      await Promise.all([
        ctx.db.insert("userStats", { key: "total", count: users.length }),
        ctx.db.insert("userStats", { key: "Active", count: statusCounts.Active }),
        ctx.db.insert("userStats", { key: "Inactive", count: statusCounts.Inactive }),
        ctx.db.insert("userStats", { key: "Banned", count: statusCounts.Banned }),
        ctx.db.insert("roleStats", { key: "total", count: roles.length }),
        ctx.db.insert("roleStats", { key: "system", count: systemCount }),
        ctx.db.insert("roleStats", { key: "superAdmin", count: superAdminCount }),
      ]);
    }

    return null;
  },
});

// USR-008 FIX: Clear users DATA with parallel deletion + reset counters
export const clearUsersData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const [users, roles, userStats, roleStats] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("roles").collect(),
      ctx.db.query("userStats").collect(),
      ctx.db.query("roleStats").collect(),
    ]);
    
    // Delete all in parallel
    await Promise.all([
      ...users.map((u) => ctx.db.delete(u._id)),
      ...roles.map((r) => ctx.db.delete(r._id)),
      ...userStats.map((s) => ctx.db.delete(s._id)),
      ...roleStats.map((s) => ctx.db.delete(s._id)),
    ]);
    
    return null;
  },
});

// Clear users module CONFIG (features, fields, settings)
export const clearUsersConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "users")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "users")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "users")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// ============ ROLES MODULE ============

export const seedRolesModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed roles data if not exists
    const existingRoles = await ctx.db.query("roles").first();
    if (!existingRoles) {
      const roles: Array<{
        name: string;
        description: string;
        color: string;
        isSystem: boolean;
        isSuperAdmin: boolean;
        permissions: Record<string, string[]>;
      }> = [
        { 
          name: "Super Admin", 
          description: "Toàn quyền hệ thống", 
          color: "#ef4444", 
          isSystem: true, 
          isSuperAdmin: true, 
          permissions: { "*": ["*"] } 
        },
        { 
          name: "Admin", 
          description: "Quản trị viên hệ thống", 
          color: "#3b82f6", 
          isSystem: true, 
          isSuperAdmin: false, 
          permissions: { 
            posts: ["view", "create", "edit", "delete"],
            products: ["view", "create", "edit", "delete"],
            orders: ["view", "create", "edit"],
            customers: ["view", "create", "edit"],
            media: ["view", "create", "delete"],
            users: ["view"],
            roles: ["view"],
            settings: ["view", "edit"],
          } 
        },
        { 
          name: "Editor", 
          description: "Biên tập viên nội dung", 
          color: "#10b981", 
          isSystem: false, 
          isSuperAdmin: false, 
          permissions: { 
            posts: ["view", "create", "edit"],
            products: ["view", "edit"],
            media: ["view", "create"],
            comments: ["view", "edit"],
          } 
        },
        { 
          name: "Sales", 
          description: "Nhân viên bán hàng", 
          color: "#f59e0b", 
          isSystem: false, 
          isSuperAdmin: false, 
          permissions: { 
            orders: ["view", "create", "edit"],
            customers: ["view", "create", "edit"],
            products: ["view"],
          } 
        },
        { 
          name: "Viewer", 
          description: "Chỉ xem dữ liệu", 
          color: "#6b7280", 
          isSystem: false, 
          isSuperAdmin: false, 
          permissions: { 
            posts: ["view"],
            products: ["view"],
            orders: ["view"],
            customers: ["view"],
          } 
        },
      ];
      for (const r of roles) {
        await ctx.db.insert("roles", r);
      }
    }

    // 2. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "roles")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "roles", featureKey: "enableDescription", name: "Mô tả vai trò", description: "Thêm mô tả chi tiết cho vai trò", enabled: true, linkedFieldKey: "description" },
        { moduleKey: "roles", featureKey: "enableColor", name: "Màu sắc", description: "Gán màu để phân biệt vai trò", enabled: true, linkedFieldKey: "color" },
        { moduleKey: "roles", featureKey: "enableHierarchy", name: "Phân cấp", description: "Cho phép vai trò có cấp bậc", enabled: false },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 3. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "roles")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "roles", fieldKey: "name", name: "Tên vai trò", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "roles", fieldKey: "permissions", name: "Quyền hạn", type: "text" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "roles", fieldKey: "isSystem", name: "Vai trò hệ thống", type: "boolean" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "roles", fieldKey: "description", name: "Mô tả", type: "textarea" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableDescription", order: 3 },
        { moduleKey: "roles", fieldKey: "color", name: "Màu sắc", type: "text" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableColor", order: 4 },
        { moduleKey: "roles", fieldKey: "isSuperAdmin", name: "Super Admin", type: "boolean" as const, required: false, enabled: true, isSystem: false, order: 5 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 4. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "roles")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "roles", settingKey: "maxRolesPerUser", value: 1 });
      await ctx.db.insert("moduleSettings", { moduleKey: "roles", settingKey: "defaultRole", value: "Viewer" });
      await ctx.db.insert("moduleSettings", { moduleKey: "roles", settingKey: "rolesPerPage", value: 10 });
    }

    return null;
  },
});

// Clear roles DATA only
export const clearRolesData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const roles = await ctx.db.query("roles").collect();
    for (const r of roles) {
      if (!r.isSystem) {
        await ctx.db.delete(r._id);
      }
    }
    return null;
  },
});

// Clear roles module CONFIG
export const clearRolesConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "roles")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "roles")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "roles")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// ============ SETTINGS MODULE ============

export const seedSettingsModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed settings DATA (key-value pairs grouped by category)
    const existingSettings = await ctx.db.query("settings").first();
    if (!existingSettings) {
      const settingsData = [
        // Site settings
        { key: "site_name", value: "VietAdmin", group: "site" },
        { key: "site_tagline", value: "Hệ thống quản trị website", group: "site" },
        { key: "site_logo", value: "", group: "site" },
        { key: "site_favicon", value: "", group: "site" },
        { key: "site_timezone", value: "Asia/Ho_Chi_Minh", group: "site" },
        { key: "site_language", value: "vi", group: "site" },
        { key: "site_brand_color", value: "#3b82f6", group: "site" },
        
        // Contact settings
        { key: "contact_email", value: "contact@vietadmin.com", group: "contact" },
        { key: "contact_phone", value: "0901234567", group: "contact" },
        { key: "contact_address", value: "123 Nguyễn Huệ, Quận 1, TP.HCM", group: "contact" },
        { key: "contact_hotline", value: "1900 1234", group: "contact" },
        
        // SEO settings
        { key: "seo_title", value: "VietAdmin - Hệ thống quản trị website", group: "seo" },
        { key: "seo_description", value: "VietAdmin là hệ thống quản trị website hiện đại, dễ sử dụng", group: "seo" },
        { key: "seo_keywords", value: "admin, quản trị, website, cms", group: "seo" },
        { key: "seo_og_image", value: "", group: "seo" },
        
        // Social settings
        { key: "social_facebook", value: "", group: "social" },
        { key: "social_instagram", value: "", group: "social" },
        { key: "social_youtube", value: "", group: "social" },
        { key: "social_tiktok", value: "", group: "social" },
        { key: "social_zalo", value: "", group: "social" },
        
        // Mail settings
        { key: "mail_from_name", value: "VietAdmin", group: "mail" },
        { key: "mail_from_email", value: "noreply@vietadmin.com", group: "mail" },
        { key: "mail_driver", value: "smtp", group: "mail" },
        { key: "mail_host", value: "", group: "mail" },
        { key: "mail_port", value: 587, group: "mail" },
        { key: "mail_encryption", value: "tls", group: "mail" },
      ];
      for (const s of settingsData) {
        await ctx.db.insert("settings", s);
      }
    }

    // 2. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "settings")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "settings", featureKey: "enableContact", name: "Thông tin liên hệ", description: "Quản lý email, phone, địa chỉ", enabled: true },
        { moduleKey: "settings", featureKey: "enableSEO", name: "SEO cơ bản", description: "Meta title, description, keywords", enabled: true },
        { moduleKey: "settings", featureKey: "enableSocial", name: "Mạng xã hội", description: "Links Facebook, Instagram, Youtube...", enabled: true },
        { moduleKey: "settings", featureKey: "enableMail", name: "Cấu hình Email", description: "SMTP settings để gửi email", enabled: false },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 3. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "settings")).first();
    if (!existingFields) {
      const fields = [
        // Site fields
        { moduleKey: "settings", fieldKey: "site_name", name: "Tên website", type: "text" as const, required: true, enabled: true, isSystem: true, group: "site", order: 0 },
        { moduleKey: "settings", fieldKey: "site_tagline", name: "Slogan", type: "text" as const, required: false, enabled: true, isSystem: false, group: "site", order: 1 },
        { moduleKey: "settings", fieldKey: "site_logo", name: "Logo", type: "image" as const, required: false, enabled: true, isSystem: true, group: "site", order: 2 },
        { moduleKey: "settings", fieldKey: "site_favicon", name: "Favicon", type: "image" as const, required: false, enabled: true, isSystem: true, group: "site", order: 3 },
        { moduleKey: "settings", fieldKey: "site_timezone", name: "Múi giờ", type: "select" as const, required: false, enabled: true, isSystem: false, group: "site", order: 4 },
        { moduleKey: "settings", fieldKey: "site_language", name: "Ngôn ngữ", type: "select" as const, required: false, enabled: true, isSystem: false, group: "site", order: 5 },
        { moduleKey: "settings", fieldKey: "site_brand_color", name: "Màu thương hiệu", type: "color" as const, required: false, enabled: true, isSystem: false, group: "site", order: 6 },
        // Contact fields
        { moduleKey: "settings", fieldKey: "contact_email", name: "Email", type: "email" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableContact", group: "contact", order: 6 },
        { moduleKey: "settings", fieldKey: "contact_phone", name: "Số điện thoại", type: "phone" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableContact", group: "contact", order: 7 },
        { moduleKey: "settings", fieldKey: "contact_address", name: "Địa chỉ", type: "textarea" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableContact", group: "contact", order: 8 },
        { moduleKey: "settings", fieldKey: "contact_hotline", name: "Hotline", type: "text" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableContact", group: "contact", order: 9 },
        // SEO fields
        { moduleKey: "settings", fieldKey: "seo_title", name: "Meta Title", type: "text" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableSEO", group: "seo", order: 10 },
        { moduleKey: "settings", fieldKey: "seo_description", name: "Meta Description", type: "textarea" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableSEO", group: "seo", order: 11 },
        { moduleKey: "settings", fieldKey: "seo_keywords", name: "Keywords", type: "tags" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableSEO", group: "seo", order: 12 },
        { moduleKey: "settings", fieldKey: "seo_og_image", name: "OG Image", type: "image" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableSEO", group: "seo", order: 13 },
        // Social fields
        { moduleKey: "settings", fieldKey: "social_facebook", name: "Facebook", type: "text" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableSocial", group: "social", order: 14 },
        { moduleKey: "settings", fieldKey: "social_instagram", name: "Instagram", type: "text" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableSocial", group: "social", order: 15 },
        { moduleKey: "settings", fieldKey: "social_youtube", name: "Youtube", type: "text" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableSocial", group: "social", order: 16 },
        { moduleKey: "settings", fieldKey: "social_tiktok", name: "TikTok", type: "text" as const, required: false, enabled: false, isSystem: false, linkedFeature: "enableSocial", group: "social", order: 17 },
        { moduleKey: "settings", fieldKey: "social_zalo", name: "Zalo", type: "text" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableSocial", group: "social", order: 18 },
        // Mail fields
        { moduleKey: "settings", fieldKey: "mail_from_name", name: "Tên người gửi", type: "text" as const, required: false, enabled: false, isSystem: false, linkedFeature: "enableMail", group: "mail", order: 19 },
        { moduleKey: "settings", fieldKey: "mail_from_email", name: "Email gửi", type: "email" as const, required: false, enabled: false, isSystem: false, linkedFeature: "enableMail", group: "mail", order: 20 },
        { moduleKey: "settings", fieldKey: "mail_host", name: "SMTP Host", type: "text" as const, required: false, enabled: false, isSystem: false, linkedFeature: "enableMail", group: "mail", order: 21 },
        { moduleKey: "settings", fieldKey: "mail_port", name: "SMTP Port", type: "number" as const, required: false, enabled: false, isSystem: false, linkedFeature: "enableMail", group: "mail", order: 22 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 4. Seed module settings
    const existingModuleSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "settings")).first();
    if (!existingModuleSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "settings", settingKey: "cacheEnabled", value: true });
      await ctx.db.insert("moduleSettings", { moduleKey: "settings", settingKey: "cacheDuration", value: 3600 });
    }

    return null;
  },
});

// Clear settings DATA only
export const clearSettingsData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// Clear settings module CONFIG
export const clearSettingsConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "settings")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "settings")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const moduleSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "settings")).collect();
    for (const s of moduleSettings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// ============ MENUS MODULE ============

export const seedMenusModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed menus
    const existingMenus = await ctx.db.query("menus").first();
    if (!existingMenus) {
      const menusData = [
        { name: "Header Menu", location: "header" },
        { name: "Footer Menu", location: "footer" },
        { name: "Sidebar Menu", location: "sidebar" },
      ];
      
      const menuIds: Record<string, any> = {};
      for (const menu of menusData) {
        const id = await ctx.db.insert("menus", menu);
        menuIds[menu.location] = id;
      }

      // 2. Seed menu items for Header
      const headerItems = [
        { menuId: menuIds.header, label: "Trang chủ", url: "/", order: 0, depth: 0, active: true },
        { menuId: menuIds.header, label: "Sản phẩm", url: "/products", order: 1, depth: 0, active: true },
        { menuId: menuIds.header, label: "Điện tử", url: "/products?category=dien-tu", order: 2, depth: 1, active: true },
        { menuId: menuIds.header, label: "Thời trang", url: "/products?category=thoi-trang", order: 3, depth: 1, active: true },
        { menuId: menuIds.header, label: "Gia dụng", url: "/products?category=gia-dung", order: 4, depth: 1, active: true },
        { menuId: menuIds.header, label: "Bài viết", url: "/posts", order: 5, depth: 0, active: true },
        { menuId: menuIds.header, label: "Tin tức", url: "/posts?category=tin-tuc", order: 6, depth: 1, active: true },
        { menuId: menuIds.header, label: "Hướng dẫn", url: "/posts?category=huong-dan", order: 7, depth: 1, active: true },
        { menuId: menuIds.header, label: "Giới thiệu", url: "/about", order: 8, depth: 0, active: true },
        { menuId: menuIds.header, label: "Liên hệ", url: "/contact", order: 9, depth: 0, active: true },
      ];
      for (const item of headerItems) {
        await ctx.db.insert("menuItems", item);
      }

      // 3. Seed menu items for Footer
      const footerItems = [
        { menuId: menuIds.footer, label: "Về chúng tôi", url: "/about", order: 0, depth: 0, active: true },
        { menuId: menuIds.footer, label: "Điều khoản sử dụng", url: "/terms", order: 1, depth: 0, active: true },
        { menuId: menuIds.footer, label: "Chính sách bảo mật", url: "/privacy", order: 2, depth: 0, active: true },
        { menuId: menuIds.footer, label: "Chính sách đổi trả", url: "/return-policy", order: 3, depth: 0, active: true },
        { menuId: menuIds.footer, label: "Hướng dẫn mua hàng", url: "/guide", order: 4, depth: 0, active: true },
        { menuId: menuIds.footer, label: "Liên hệ", url: "/contact", order: 5, depth: 0, active: true },
      ];
      for (const item of footerItems) {
        await ctx.db.insert("menuItems", item);
      }

      // 4. Seed menu items for Sidebar
      const sidebarItems = [
        { menuId: menuIds.sidebar, label: "Dashboard", url: "/admin/dashboard", order: 0, depth: 0, icon: "LayoutDashboard", active: true },
        { menuId: menuIds.sidebar, label: "Sản phẩm", url: "/admin/products", order: 1, depth: 0, icon: "Package", active: true },
        { menuId: menuIds.sidebar, label: "Đơn hàng", url: "/admin/orders", order: 2, depth: 0, icon: "ShoppingBag", active: true },
        { menuId: menuIds.sidebar, label: "Khách hàng", url: "/admin/customers", order: 3, depth: 0, icon: "Users", active: true },
      ];
      for (const item of sidebarItems) {
        await ctx.db.insert("menuItems", item);
      }
    }

    // 5. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "menus")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "menus", featureKey: "enableNested", name: "Menu lồng nhau", description: "Cho phép tạo menu con nhiều cấp", enabled: true, linkedFieldKey: "parentId" },
        { moduleKey: "menus", featureKey: "enableNewTab", name: "Mở tab mới", description: "Cho phép mở link trong tab mới", enabled: true, linkedFieldKey: "openInNewTab" },
        { moduleKey: "menus", featureKey: "enableIcon", name: "Icon menu", description: "Cho phép gán icon cho menu item", enabled: true, linkedFieldKey: "icon" },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 6. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "menus")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "menus", fieldKey: "label", name: "Tiêu đề", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "menus", fieldKey: "url", name: "URL", type: "text" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "menus", fieldKey: "location", name: "Vị trí menu", type: "select" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "menus", fieldKey: "order", name: "Thứ tự", type: "number" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "menus", fieldKey: "active", name: "Trạng thái", type: "boolean" as const, required: true, enabled: true, isSystem: true, order: 4 },
        { moduleKey: "menus", fieldKey: "parentId", name: "Menu cha", type: "select" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableNested", order: 5 },
        { moduleKey: "menus", fieldKey: "openInNewTab", name: "Mở tab mới", type: "boolean" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableNewTab", order: 6 },
        { moduleKey: "menus", fieldKey: "icon", name: "Icon", type: "text" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableIcon", order: 7 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 7. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "menus")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "menus", settingKey: "maxDepth", value: 3 });
      await ctx.db.insert("moduleSettings", { moduleKey: "menus", settingKey: "defaultLocation", value: "header" });
      await ctx.db.insert("moduleSettings", { moduleKey: "menus", settingKey: "menusPerPage", value: 10 });
    }

    return null;
  },
});

// Clear menus DATA only
export const clearMenusData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const menuItems = await ctx.db.query("menuItems").collect();
    for (const item of menuItems) {
      await ctx.db.delete(item._id);
    }
    const menus = await ctx.db.query("menus").collect();
    for (const menu of menus) {
      await ctx.db.delete(menu._id);
    }
    return null;
  },
});

// Clear menus module CONFIG
export const clearMenusConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "menus")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "menus")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "menus")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// ============ HOMEPAGE MODULE ============

export const seedHomepageModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed home components if not exist
    const existingComponents = await ctx.db.query("homeComponents").first();
    if (!existingComponents) {
      const components = [
        {
          type: "hero",
          title: "Hero Banner",
          active: true,
          order: 0,
          config: {
            heading: "Chào mừng đến VietAdmin",
            subheading: "Hệ thống quản trị website chuyên nghiệp",
            backgroundImage: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920",
            buttonText: "Khám phá ngay",
            buttonLink: "/products",
          },
        },
        {
          type: "about",
          title: "Giới thiệu",
          active: true,
          order: 1,
          config: {
            heading: "Về chúng tôi",
            content: "VietAdmin là giải pháp quản trị website toàn diện, được thiết kế riêng cho doanh nghiệp Việt Nam.",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
          },
        },
        {
          type: "products",
          title: "Sản phẩm nổi bật",
          active: true,
          order: 2,
          config: {
            heading: "Sản phẩm nổi bật",
            subheading: "Những sản phẩm được yêu thích nhất",
            limit: 8,
            showPrice: true,
            showButton: true,
          },
        },
        {
          type: "posts",
          title: "Bài viết mới",
          active: true,
          order: 3,
          config: {
            heading: "Tin tức & Bài viết",
            subheading: "Cập nhật những thông tin mới nhất",
            limit: 6,
            showExcerpt: true,
            showDate: true,
          },
        },
        {
          type: "partners",
          title: "Đối tác",
          active: false,
          order: 4,
          config: {
            heading: "Đối tác của chúng tôi",
            logos: [],
          },
        },
        {
          type: "contact",
          title: "Liên hệ",
          active: true,
          order: 5,
          config: {
            heading: "Liên hệ với chúng tôi",
            subheading: "Chúng tôi luôn sẵn sàng hỗ trợ bạn",
            showForm: true,
            showMap: false,
          },
        },
      ];
      for (const c of components) {
        await ctx.db.insert("homeComponents", c);
      }
    }

    // 2. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "homepage")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "homepage", featureKey: "enableHero", name: "Hero Banner", description: "Banner chính đầu trang", enabled: true },
        { moduleKey: "homepage", featureKey: "enableAbout", name: "Giới thiệu", description: "Section giới thiệu công ty", enabled: true },
        { moduleKey: "homepage", featureKey: "enableProducts", name: "Sản phẩm nổi bật", description: "Hiển thị sản phẩm featured", enabled: true },
        { moduleKey: "homepage", featureKey: "enablePosts", name: "Bài viết mới", description: "Hiển thị bài viết gần đây", enabled: true },
        { moduleKey: "homepage", featureKey: "enablePartners", name: "Đối tác", description: "Logo đối tác/khách hàng", enabled: false },
        { moduleKey: "homepage", featureKey: "enableContact", name: "Liên hệ", description: "Form liên hệ nhanh", enabled: true },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 3. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "homepage")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "homepage", fieldKey: "title", name: "Tên section", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "homepage", fieldKey: "type", name: "Loại section", type: "select" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "homepage", fieldKey: "order", name: "Thứ tự", type: "number" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "homepage", fieldKey: "active", name: "Trạng thái", type: "boolean" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "homepage", fieldKey: "config", name: "Cấu hình JSON", type: "textarea" as const, required: false, enabled: true, isSystem: false, order: 4 },
        { moduleKey: "homepage", fieldKey: "background", name: "Ảnh nền", type: "image" as const, required: false, enabled: true, isSystem: false, order: 5 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 4. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "homepage")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "homepage", settingKey: "maxSections", value: 10 });
      await ctx.db.insert("moduleSettings", { moduleKey: "homepage", settingKey: "defaultSectionType", value: "hero" });
    }

    // 5. Initialize homeComponentStats counter table
    const existingStats = await ctx.db.query("homeComponentStats").first();
    if (!existingStats) {
      const components = await ctx.db.query("homeComponents").collect();
      const counts: Record<string, number> = { total: 0, active: 0, inactive: 0 };
      for (const c of components) {
        counts.total++;
        if (c.active) counts.active++; else counts.inactive++;
        counts[c.type] = (counts[c.type] || 0) + 1;
      }
      for (const [key, count] of Object.entries(counts)) {
        await ctx.db.insert("homeComponentStats", { key, count });
      }
    }

    return null;
  },
});

// Clear homepage DATA only
export const clearHomepageData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const components = await ctx.db.query("homeComponents").collect();
    for (const c of components) {
      await ctx.db.delete(c._id);
    }
    // Also clear stats
    const stats = await ctx.db.query("homeComponentStats").collect();
    for (const s of stats) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// Clear homepage module CONFIG
export const clearHomepageConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "homepage")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "homepage")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "homepage")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// ============ NOTIFICATIONS MODULE ============

export const seedNotificationsModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed notifications data
    const existingNotifications = await ctx.db.query("notifications").first();
    if (!existingNotifications) {
      const notifications = [
        { title: "Chào mừng đến với VietAdmin", content: "Cảm ơn bạn đã sử dụng hệ thống quản trị VietAdmin. Chúc bạn có trải nghiệm tuyệt vời!", type: "success" as const, targetType: "all" as const, status: "Sent" as const, sendEmail: false, sentAt: Date.now() - 86400000 * 7, readCount: 125, order: 0 },
        { title: "Cập nhật hệ thống v2.0", content: "Hệ thống đã được cập nhật lên phiên bản 2.0 với nhiều tính năng mới. Xem chi tiết tại trang cập nhật.", type: "info" as const, targetType: "users" as const, status: "Sent" as const, sendEmail: true, sentAt: Date.now() - 86400000 * 3, readCount: 42, order: 1 },
        { title: "Bảo trì hệ thống", content: "Hệ thống sẽ bảo trì vào 2:00 AM - 4:00 AM ngày mai. Vui lòng lưu công việc trước thời gian này.", type: "warning" as const, targetType: "all" as const, status: "Scheduled" as const, sendEmail: true, scheduledAt: Date.now() + 86400000, readCount: 0, order: 2 },
        { title: "Khuyến mãi đặc biệt tháng 1", content: "Giảm giá 30% toàn bộ sản phẩm từ ngày 01/01 đến 15/01. Đừng bỏ lỡ cơ hội này!", type: "info" as const, targetType: "customers" as const, status: "Sent" as const, sendEmail: true, sentAt: Date.now() - 86400000 * 2, readCount: 856, order: 3 },
        { title: "Lỗi thanh toán", content: "Đã phát hiện lỗi trong quá trình thanh toán. Đội ngũ kỹ thuật đang khắc phục.", type: "error" as const, targetType: "users" as const, status: "Sent" as const, sendEmail: false, sentAt: Date.now() - 86400000, readCount: 18, order: 4 },
        { title: "Thông báo nháp", content: "Đây là thông báo đang soạn, chưa gửi.", type: "info" as const, targetType: "all" as const, status: "Draft" as const, readCount: 0, order: 5 },
      ];
      for (const notif of notifications) {
        await ctx.db.insert("notifications", notif);
      }
    }

    // 2. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "notifications")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "notifications", featureKey: "enableEmail", name: "Gửi Email", description: "Gửi thông báo qua email", enabled: true, linkedFieldKey: "sendEmail" },
        { moduleKey: "notifications", featureKey: "enableScheduling", name: "Hẹn giờ gửi", description: "Lên lịch gửi thông báo", enabled: true, linkedFieldKey: "scheduledAt" },
        { moduleKey: "notifications", featureKey: "enableTargeting", name: "Nhắm đối tượng", description: "Gửi thông báo cho nhóm cụ thể", enabled: true, linkedFieldKey: "targetType" },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 3. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "notifications")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "notifications", fieldKey: "title", name: "Tiêu đề", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "notifications", fieldKey: "content", name: "Nội dung", type: "textarea" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "notifications", fieldKey: "type", name: "Loại", type: "select" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "notifications", fieldKey: "status", name: "Trạng thái", type: "select" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "notifications", fieldKey: "targetType", name: "Đối tượng", type: "select" as const, required: true, enabled: true, isSystem: false, linkedFeature: "enableTargeting", order: 4 },
        { moduleKey: "notifications", fieldKey: "sendEmail", name: "Gửi Email", type: "boolean" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableEmail", order: 5 },
        { moduleKey: "notifications", fieldKey: "scheduledAt", name: "Thời gian hẹn", type: "date" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableScheduling", order: 6 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 4. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "notifications")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "notifications", settingKey: "itemsPerPage", value: 20 });
      await ctx.db.insert("moduleSettings", { moduleKey: "notifications", settingKey: "defaultType", value: "info" });
      await ctx.db.insert("moduleSettings", { moduleKey: "notifications", settingKey: "autoSendEmail", value: false });
    }

    // 5. Initialize notificationStats counter table
    const existingStats = await ctx.db.query("notificationStats").first();
    if (!existingStats) {
      const notifications = await ctx.db.query("notifications").collect();
      const counts: Record<string, number> = { total: 0, Draft: 0, Scheduled: 0, Sent: 0, Cancelled: 0 };
      for (const n of notifications) {
        counts.total++;
        counts[n.status] = (counts[n.status] || 0) + 1;
        counts[n.type] = (counts[n.type] || 0) + 1;
      }
      for (const [key, count] of Object.entries(counts)) {
        await ctx.db.insert("notificationStats", { key, count });
      }
    }

    return null;
  },
});

// Clear notifications DATA only
export const clearNotificationsData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const notifications = await ctx.db.query("notifications").collect();
    for (const n of notifications) {
      await ctx.db.delete(n._id);
    }
    // Also clear stats
    const stats = await ctx.db.query("notificationStats").collect();
    for (const s of stats) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// Clear notifications module CONFIG
export const clearNotificationsConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const features = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "notifications")).collect();
    for (const f of features) {
      await ctx.db.delete(f._id);
    }
    const fields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "notifications")).collect();
    for (const f of fields) {
      await ctx.db.delete(f._id);
    }
    const settings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "notifications")).collect();
    for (const s of settings) {
      await ctx.db.delete(s._id);
    }
    return null;
  },
});

// ============ PROMOTIONS MODULE ============

export const seedPromotionsModule = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 1. Seed promotions data
    const existingPromotions = await ctx.db.query("promotions").first();
    if (!existingPromotions) {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const promotions = [
        {
          name: "Giảm 10% đơn hàng",
          code: "SALE10",
          description: "Giảm 10% cho tất cả đơn hàng",
          discountType: "percent" as const,
          discountValue: 10,
          maxDiscountAmount: 500000,
          usageLimit: 100,
          usedCount: 45,
          startDate: now - 30 * oneDay,
          endDate: now + 30 * oneDay,
          status: "Active" as const,
          applicableTo: "all" as const,
          order: 0,
        },
        {
          name: "Giảm 50K đơn từ 500K",
          code: "GIAM50K",
          description: "Giảm 50.000đ cho đơn từ 500.000đ",
          discountType: "fixed" as const,
          discountValue: 50000,
          minOrderAmount: 500000,
          usageLimit: 200,
          usedCount: 89,
          startDate: now - 15 * oneDay,
          endDate: now + 45 * oneDay,
          status: "Active" as const,
          applicableTo: "all" as const,
          order: 1,
        },
        {
          name: "Black Friday 20%",
          code: "BLACKFRIDAY",
          description: "Giảm 20% nhân dịp Black Friday",
          discountType: "percent" as const,
          discountValue: 20,
          maxDiscountAmount: 1000000,
          usageLimit: 500,
          usedCount: 0,
          startDate: now + 60 * oneDay,
          endDate: now + 63 * oneDay,
          status: "Scheduled" as const,
          applicableTo: "all" as const,
          order: 2,
        },
        {
          name: "Voucher hết hạn",
          code: "OLDCODE",
          description: "Voucher đã hết hạn",
          discountType: "percent" as const,
          discountValue: 15,
          usageLimit: 50,
          usedCount: 50,
          startDate: now - 60 * oneDay,
          endDate: now - 30 * oneDay,
          status: "Expired" as const,
          applicableTo: "all" as const,
          order: 3,
        },
        {
          name: "Freeship đơn 300K",
          code: "FREESHIP",
          description: "Miễn phí vận chuyển cho đơn từ 300K",
          discountType: "fixed" as const,
          discountValue: 30000,
          minOrderAmount: 300000,
          usedCount: 120,
          startDate: now - 10 * oneDay,
          status: "Active" as const,
          applicableTo: "all" as const,
          order: 4,
        },
        {
          name: "VIP 25% off",
          code: "VIP25",
          description: "Dành cho khách VIP",
          discountType: "percent" as const,
          discountValue: 25,
          maxDiscountAmount: 2000000,
          usageLimit: 20,
          usedCount: 5,
          status: "Active" as const,
          applicableTo: "all" as const,
          order: 5,
        },
      ];
      for (const p of promotions) {
        await ctx.db.insert("promotions", p);
      }
    }

    // 2. Seed module features
    const existingFeatures = await ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "promotions")).first();
    if (!existingFeatures) {
      const features = [
        { moduleKey: "promotions", featureKey: "enableUsageLimit", name: "Giới hạn lượt dùng", description: "Giới hạn số lần sử dụng voucher", enabled: true, linkedFieldKey: "usageLimit" },
        { moduleKey: "promotions", featureKey: "enableMinOrder", name: "Đơn tối thiểu", description: "Yêu cầu giá trị đơn hàng tối thiểu", enabled: true, linkedFieldKey: "minOrderAmount" },
        { moduleKey: "promotions", featureKey: "enableMaxDiscount", name: "Giảm tối đa", description: "Giới hạn số tiền giảm tối đa", enabled: true, linkedFieldKey: "maxDiscountAmount" },
        { moduleKey: "promotions", featureKey: "enableSchedule", name: "Hẹn giờ", description: "Đặt thời gian bắt đầu/kết thúc", enabled: true },
        { moduleKey: "promotions", featureKey: "enableApplicable", name: "Áp dụng có chọn lọc", description: "Chỉ áp dụng cho SP/danh mục cụ thể", enabled: false },
      ];
      for (const feature of features) {
        await ctx.db.insert("moduleFeatures", feature);
      }
    }

    // 3. Seed module fields
    const existingFields = await ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "promotions")).first();
    if (!existingFields) {
      const fields = [
        { moduleKey: "promotions", fieldKey: "name", name: "Tên khuyến mãi", type: "text" as const, required: true, enabled: true, isSystem: true, order: 0 },
        { moduleKey: "promotions", fieldKey: "code", name: "Mã voucher", type: "text" as const, required: true, enabled: true, isSystem: true, order: 1 },
        { moduleKey: "promotions", fieldKey: "discountType", name: "Loại giảm", type: "select" as const, required: true, enabled: true, isSystem: true, order: 2 },
        { moduleKey: "promotions", fieldKey: "discountValue", name: "Giá trị giảm", type: "number" as const, required: true, enabled: true, isSystem: true, order: 3 },
        { moduleKey: "promotions", fieldKey: "status", name: "Trạng thái", type: "select" as const, required: true, enabled: true, isSystem: true, order: 4 },
        { moduleKey: "promotions", fieldKey: "description", name: "Mô tả", type: "textarea" as const, required: false, enabled: true, isSystem: false, order: 5 },
        { moduleKey: "promotions", fieldKey: "usageLimit", name: "Giới hạn sử dụng", type: "number" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableUsageLimit", order: 6 },
        { moduleKey: "promotions", fieldKey: "minOrderAmount", name: "Đơn tối thiểu", type: "price" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableMinOrder", order: 7 },
        { moduleKey: "promotions", fieldKey: "maxDiscountAmount", name: "Giảm tối đa", type: "price" as const, required: false, enabled: true, isSystem: false, linkedFeature: "enableMaxDiscount", order: 8 },
        { moduleKey: "promotions", fieldKey: "startDate", name: "Ngày bắt đầu", type: "date" as const, required: false, enabled: true, isSystem: false, order: 9 },
        { moduleKey: "promotions", fieldKey: "endDate", name: "Ngày kết thúc", type: "date" as const, required: false, enabled: true, isSystem: false, order: 10 },
      ];
      for (const field of fields) {
        await ctx.db.insert("moduleFields", field);
      }
    }

    // 4. Seed module settings
    const existingSettings = await ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "promotions")).first();
    if (!existingSettings) {
      await ctx.db.insert("moduleSettings", { moduleKey: "promotions", settingKey: "promotionsPerPage", value: 20 });
      await ctx.db.insert("moduleSettings", { moduleKey: "promotions", settingKey: "defaultDiscountType", value: "percent" });
      await ctx.db.insert("moduleSettings", { moduleKey: "promotions", settingKey: "codeLength", value: 8 });
    }

    // 5. Initialize promotionStats counter table
    const existingStats = await ctx.db.query("promotionStats").first();
    if (!existingStats) {
      const promotions = await ctx.db.query("promotions").collect();
      const counts: Record<string, number> = { total: 0, Active: 0, Scheduled: 0, Expired: 0, Disabled: 0 };
      for (const p of promotions) {
        counts.total++;
        counts[p.status] = (counts[p.status] || 0) + 1;
      }
      for (const [key, count] of Object.entries(counts)) {
        await ctx.db.insert("promotionStats", { key, count });
      }
    }

    return null;
  },
});

// SYS-006 FIX: Clear promotions DATA only - với Promise.all
export const clearPromotionsData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const [promotions, stats] = await Promise.all([
      ctx.db.query("promotions").collect(),
      ctx.db.query("promotionStats").collect(),
    ]);
    await Promise.all([
      ...promotions.map(p => ctx.db.delete(p._id)),
      ...stats.map(s => ctx.db.delete(s._id)),
    ]);
    return null;
  },
});

// SYS-006 FIX: Clear promotions module CONFIG - với Promise.all
export const clearPromotionsConfig = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const [features, fields, settings] = await Promise.all([
      ctx.db.query("moduleFeatures").withIndex("by_module", q => q.eq("moduleKey", "promotions")).collect(),
      ctx.db.query("moduleFields").withIndex("by_module", q => q.eq("moduleKey", "promotions")).collect(),
      ctx.db.query("moduleSettings").withIndex("by_module", q => q.eq("moduleKey", "promotions")).collect(),
    ]);
    await Promise.all([
      ...features.map(f => ctx.db.delete(f._id)),
      ...fields.map(f => ctx.db.delete(f._id)),
      ...settings.map(s => ctx.db.delete(s._id)),
    ]);
    return null;
  },
});
